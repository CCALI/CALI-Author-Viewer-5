<?php
/*
	09/23/2016 Generate summary report for specific course/lesson.
	Ensures for a particular course/lesson, user's first answer to a question.
	Return JSON with lesson meta info, pages with answer breakdown and user info.

	Call the function LessonLiveAggregateJSON(courseid,lessonid,lastupdate)
	and get back a JSON encoded string with aggregated data.
	
	lastupdate is optional and is normally forwarded from the Lesson Viewer's call off the query string.
	
	Any SQL errors bubble up as JSON object so the LessonViewer doesn't croak on a Drupal style error.
	Needs the flag the tells Drupal to return raw data, and not UI format.
	
	Efficieny issues: currently the JSON package contains everything needed to know.
	Could be broken into separate queries such as student info could be separate call since it's only needed if teacher choose to reveal student names.
	
*/


function LessonLiveAggregateJSON($courseID,$lessonID,$lastUpdate)
{	// courseid is course table's course id
	// lessonid is lesson's node id
	// lastupdate is optional.
	//		if blank, returns all JSON.
	//    if not blank, returns an empty JSON if NO new data has appeared since then.
	
	// If REDACTED is 1 generate sample JSON of real world data but without real user info to add to git repos as sample data.
	define('REDACTED', 0 );

	$courseid=intval($courseID); // Lesson link Course ID
	$nid=intval($lessonID); // Which lesson in the course
	$lastupdate=mysql_escape_string ($lastUpdate);
	$lesson=array();
	$comment=array();
	
	if ($courseid>0)
	{	// Grab and display course info like org name, faculty username, course name, semester.
		$SQL3="select nodeorg.title as orgname,orgid,name,users.uid,semester,createdate,course.courseid,coursename,node.title,node.nid
			from course,users , course_node, node, node as nodeorg
			where course.courseid =  $courseid  and node.nid = $nid
			and course.uid = users.uid 
			and course.courseid = course_node.courseid
			and course_node.nid = node.nid
			and course.orgid = nodeorg.nid";
			
		$q=new QueryMySQLSimple ($SQL3);
		$row=$q->fetchRow();
		
		$lesson['Organization']=$row['orgname'];
		$lesson['Semester']=$row['semester'];
		$lesson['Teacher Name']=$row['name'];
		$lesson['Teacher ID']=$row['uid'];
		$lesson['Course Name']=$row['coursename'];
		$lesson['Course ID']=$row['courseid'];
		$lesson['Course Created Date']=$row['createdate'];
		$lesson['Lesson Name']=$row['title'];
		$lesson['Lesson ID']=$row['nid'];
	}
	
	
	if ($lastupdate!='')
	{	// If last update filter, see if there are new/updated records after that date. If none, return no-op or {};
		$SQL="select count(*) as updated from LessonRun where nid=$nid and courseid=$courseid and scoredate > \"$lastupdate\" ";
		$query=new QueryMySQLSimple($SQL);
		$row=$query->fetchRow();
		if ($row['updated']==0)
		{
			echo '{}';
			return;
		}
	}

	// Extract all lesson runs for this course/lesson. 
	$SQL="select uid, nid,  scoredate, responses from LessonRun where nid=$nid and courseid=$courseid order by runid";
	$query=new QueryMySQLSimple($SQL);

	$lesson['Lesson Runs']=$query->getNumRecords();
	array_push($comment,"1. Only a student's first answer to any question is tallied. ","2. Discarding Text Essays and Text Selects.");
	
	
	$pages=array();
	$users=array();
	
	// Grab each lesson run's score save XML and parse for unique answers per user.
	$usercount=0;
	$bytes=0;
	$maxdate=''; // Get the most recent update - used for future filtering by client via 'lastupdate' paraemter.
	while($row=$query->fetchRow())
	{
		$uid=intval($row['uid']);
		$savedate=$row['scoredate'];
		if ($savedate>$maxdate){
			$maxdate=$savedate;
		}
		//echo $savedate.' ';
		
		$xml = $row['responses']; 
		$bytes += strlen($xml);// just info gathering
		
		// Map drupal user id to simpler user id.
		if (!isset($users[$uid]))
		{
			$users[$uid]= ($usercount++);
		}
		$uid = $users[$uid];
		
		$p = xml_parser_create();
		xml_parse_into_struct($p, $xml, $vals);// $index);
		
		for($i=0;$i<count($vals);$i++)
		{
			switch ($vals[$i]['tag'])
			{
				case 'NAME':
					$qname=$vals[$i]['value'];
					break;
				case 'SUBQ':
					$qsub=intval($vals[$i]['value']);
					break;
				case 'TYPE':
					$qtype=$vals[$i]['value'];
					break;
				case 'GRADE':
					$qgrade=strtolower($vals[$i]['value']);
					break;
				case 'TIME':
					//$qtime=intval($vals[$i]['value']);
					break;
				case 'TEXT':
					$qanswer=$vals[$i]['value'];
					break;
				case 'ID': // question answer id: for multiple choice then 0=A, 1=B, etc.
					$qaid=$vals[$i]['value'];
					break;
				case 'Q':
					if ($vals[$i]['type']=='open')
					{	// on opening <Q we clear values
						$qname='?';
						$qsub=1;
						$qgrade='';
						$qaid='';
						$qtype='?';
						$qanswer='';
					}
					else
					{	// on close /Q> we tally.
						
						if ($qtype!='Text Entry/Text Essay')// discard essay to avoid clutter for now.
						
						if ($qgrade!=''){// discard unscored questions
							
						$qnameActual=$qname;
						$qname = strtoupper($qname);// just incase a page name has case changed, use case-insentive name as index.
							
							
						if (empty($pages[$qname]))
						{	// add a unique lesson/page tuple
							$pages[$qname]=array('type'=> $qtype,'pagename'=>$qnameActual);
						}
							
						if (empty($pages[$qname][$qsub]))
						{
							$pages[$qname][$qsub] = array( 'users'=>array(), 'right'=>0, 'wrong'=>0,'total'=>0 );
						}
						
						if (!isset($pages[$qname][$qsub]['users'][$uid]))
						{	// collect only first attempt for this user/question/lesson/subquestion tuple
							$pages[$qname][$qsub]['users'][$uid]=1;
							
							if ($qtype == 'Text Entry/Text Select')
							{	// For now, discard text selections since it's rather big. 
								$qanswer='';
							}
								
							$text = trim($qanswer);// preserve textual answer like for short answer, essay.
	
							if ($qaid!='') // $qtype=='Multiple Choice/Choose List' || $qtype=='Multiple Choice/Choose Buttons')
							{	// Force multiple choice types to just have answer index
								if ($qtype =='Book Page/'){
									$qanswer =  $qaid; //book page hotspots are 1-based (oops)
								}
								else
								if  ($qtype=='Multiple Choice/Choose List' || $qtype=='Multiple Choice/Choose Buttons' || $qtype=='Multiple Choice/Choose MultiButtons')
								{ // other answers are 0-based.
									$qanswer = (1+$qaid);
								}
								elseif ( $qtype=='Text Entry/Text Short Answer')
								{// short answer are 1-based and index 0 are 'no matches'
									$qanswer = $qaid;
									$text= ''; // For now, don't include the user's actual Text Short Answers
								}
								else
								{	// For questions that are right/wrong like drag,checkboxes.
									if ($qgrade=="right")
										$qanswer=1;
									else
										$qanswer=2;
									//$qanswer="IF".$qgrade;
								}
							}
							else
							{
								$qanswer = 1;// not sure what this is, happens in non CALI lessons. 
							}
							
							
							if (!isset($pages[$qname][$qsub][$qanswer]))
							{	// add this answer
								$pages[$qname][$qsub][$qanswer] = array('grade'=>$qgrade,'users'=> array(),'text'=>array()); 
							}
							// tally user answers for this choice.
							$pages[$qname][$qsub][$qanswer]['users'][$uid]=1;
	
							// store unique answers
							$pages[$qname][$qsub][$qanswer]['text'][$text]=true;
							
							if ($qgrade!='') // ($qgrade=='RIGHT'||$qgrade=='WRONG')
							{
								$pages[$qname][$qsub]['total']++;
								$pages[$qname][$qsub][$qgrade]++;
								
							} 
						}
						}
					}
					break;
			}
		}
		xml_parser_free($p);
	}
	
	$lesson['LastUpdate']=$maxdate; // indicate last saved date so later queries can return NOOP if there's no new data.
	$lesson['XMLBytes']=$bytes; 
	
	
	// 09/09/2016 Gather user information
	$SQL='select mail, name, users.uid from users where   users.uid in ('.implode(",",array_keys($users)).')';
	$query=new QueryMySQLSimple($SQL);
	$shortusers=array();
	while($row=$query->fetchRow())
	{
		$shortid=$users[$row['uid']];
		//$users[$row['uid']] = array(/*'username'=>$row['name'],*/'email'=>$row['mail']);
		$shortusers[$shortid]= array('userid'=> REDACTED?'REDACTED':intval($row['uid']),/*'username'=>$row['name'],*/'email'=>REDACTED?'REDACTED@REDACTED.EDU':$row['mail']);
	}
	$users = $shortusers;
	ksort($users);
	
	
	
	function sortPageNameNatural($a, $b){ // Sort our page names sensibly so 'Question 2' appears before 'Question 10'.
		return strnatcmp($a,$b); //Case sensitive
	};
	uksort($pages, sortPageNameNatural);
	
	//var_dump($pages);return;
	
	$pagesFinal=array();
	foreach($pages as $pagei=>&$page)
	{	// Procss one page
		
		// get max users per question (for many multiple choice pick the highest user count)
		$maxusers=0;
		foreach ($page as $qi => &$q)
		{
			if (is_numeric($qi))
			{
				$maxusers = max($maxusers ,intval( $q['total']));
				//unset($q['total']);
			}
		}
		$realPageName=$page['pagename'];
		unset($page['pagename']);
		$page['total']= $maxusers;
		ksort($page);
		
		foreach ($page as $qi => &$q)
		{	// Process one subquestion (or the main page for most question types)
			if (is_numeric($qi))
			{ 
				//$q['users'] = array_keys($q['users']);
				unset($q['users']);
		
		
				ksort($q);
				
				foreach($q as $answeri=>&$answer )
				{
					if (is_numeric($answeri)) 
					{
						// Join all answers given into one field value
						//$text=join("<li>",array_keys($answer[TEXT]));
						//if ($text!='')$text='<ol>'."<li>".$text;
						// Access doesn't like html codes, use | for now.
						//$texts = array_keys($answer['text']);
						//natcasesort($texts);
						//$text=join(" | ",$texts); 
						
						$answer['text']=array_keys($answer['text']);
						
						/*
						$green = intval(100* $q['RIGHT']/ $maxusers );//($q['RIGHT']+$q['WRONG']));
						$bar = '<span><span style="height:12px; width:'.$green.'px; display:inline-block; background-color:#0f0"></span>'
								.'<span style="height:12px; width:'.(100-$green).'px; display:inline-block; background-color:#f00"></span></span>'
								.' '.$green.'% ';
						
						echo '<tr valign=top><td>'.$lessonID.'</td><td>'.$lessoni.'</td><td>'.$qnameActual.'</td><td>'.$qi.'</td><td>'.$answeri.'</td>'
						.'<td>'.$maxusers.'</td><td>'.$q[ANSWERED].'</td>'
						.'<td nowrap>'.$bar.'</td>'
						.'<td>'.$q['RIGHT'].'</td><td>'.$q['WRONG'].'</td>'
						.'<td>'.$answer['USERS'].'</td>'.'<td>'.$time.'</td>'.'<td>'.$text.'</td>'.'<td>'.$paget.'</td>'.'<td>'.$answer['GRADE'].'</td>';
						if ($IncludeTimesInReport) echo '<td>'.(($answeri==1 && $qi==1) ? join(', ',$times) : '"').'</td>';
						//<td>'.$answer['USER'].'</td>';
						//echo '<td>'.($page['TIME']/1000).'</td>';
						//echo '<td>'.count($page['users']).'</td>';
						echo '</tr>';
						*/
						$answer['users'] =array_keys($answer['users']);
					}
				}
			}
		}
		
		$pagesFinal[$realPageName]=$page;
	}

	return str_replace("],","],\n",
		json_encode(array(
			"_comment"=>$comment,
			"lesson"=>$lesson,
			"users"=>array_values($users),
			"pages"=>$pagesFinal
		)/*,JSON_PRETTY_PRINT*/));
}

class QueryMySQLSimple
{	// The MySQL SELECT version of Query (used by Oink but simplified to work in Drupal OR the oink test site. )
	function QueryMySQLSimple($SQL)
	{ 
		$result=mysql_query($SQL);
		if (!$result){
			//abort(json_encode(array("error"=>array("SQL"=>$SQL,"message"=>mysql_error()))));
		}
		$this->queryresult=$result;
	}
	function fetchRow()
	{
		return mysql_fetch_array($this->queryresult);
	}
	function getNumRecords()
	{
		return mysql_num_rows($this->queryresult);
	}
}

?>
