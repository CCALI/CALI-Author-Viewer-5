<?php
/*
	09/23/2016 Generate summary report for specific course/lesson.

	This is a Helper .php which is called by another .php.
	
	Ensures for a particular course/lesson, user's first answer to a question.
	Return JSON with lesson meta info, pages with answer breakdown and user info.

	Call the function LessonLiveAggregateJSON(courseid,lessonid,lastupdate)
	and get back a JSON encoded string with aggregated data.
	
	lastupdate is optional and is normally forwarded from the Lesson Viewer's call off the query string.
	
	Any SQL errors bubble up as JSON object so the LessonViewer doesn't croak on a Drupal style error.
	Needs the flag the tells Drupal to return raw data, and not UI format.
	
	Efficieny issues: currently the JSON package contains everything needed to know.
	Could be broken into separate queries such as student info could be separate call since it's only needed if teacher choose to reveal student names.
	
	10/24/2016 WARNING: any UTF-8 or Windows 1252 characters will break JSON encoding. May need to run through utf8_encode
	11/16/2016 Added flag to load Text Essay and track all of a user's answers to a question.
	12/08/2016 Allow empty course for use with AutoPublish.
	05/17/2018 Updated to mysqli
*/

// 11/16/2016 Option to attach all answers given by each user for each run. Attached to question>user>rundate>text. Allows essays to be attached.
define('INCLUDE_ALL_USER_ANSWERS', 0 );
// Include full essays answers for each student and each run. Requires INCLUDE_ALL_USER_ANSWERS to work.
define('INCLUDE_ESSAYS', INCLUDE_ALL_USER_ANSWERS>0);
// If REDACTED is 1 real user info is redacted. Handy to give git repos as sample data.
define('REDACTED', 0 );

$connect_CALISQL;

function sortPageNameNatural($a, $b)
{	// Sort our page names sensibly so 'Question 2' appears before 'Question 10'.
	// 08/22/2017 GIT#47
	return strnatcmp($a,$b); //Case sensitive
};
	
function LessonLiveAggregateJSON($courseID,$lessonID,$lastUpdate)
{	// courseid is course db table's course id (if 0, assuming an AutoPublish lesson)
	// lessonid is lesson's node id
	// lastupdate is optional.
	//		if blank, returns all JSON.
	//    if not blank, returns an empty JSON if NO new data has appeared since then.
	global $trace,$connect_CALISQL;

	$courseid=intval($courseID); // Lesson link Course ID
	$nid=intval($lessonID); // Which lesson in the course
	$lastupdate=mysqli_real_escape_string($connect_CALISQL,$lastUpdate); // 08/22/2017 GIT#50
	$lesson=array();
	$comment=array();
	
	if ($courseid>0)
	{	// Grab and display course info like org name, faculty username, course name, semester.
		$SQL3="select nodeorg.title as orgname,orgid,name,users.uid,semester,createdate,course.courseid,coursename,node.title,node.type,node.nid
			from course,users , course_node, node, node as nodeorg
			where course.courseid =  $courseid  and node.nid = $nid
			and course.uid = users.uid 
			and course.courseid = course_node.courseid
			and course_node.nid = node.nid
			and course.orgid = nodeorg.nid";
			
		$q=new QueryMySQLSimple ($SQL3);
		traceSQL($SQL3);
		$row=$q->fetchRow();

		$lesson['Organization']=$row['orgname'];
		$lesson['Semester']=$row['semester'];
		$lesson['Teacher Name']=$row['name'];
		$lesson['Teacher ID']= $ownerid = $row['uid'];
		$lesson['Course Name']=utf8_encode($row['coursename']);
		$lesson['Course ID']=$row['courseid'];
		$lesson['Created Date']=$row['createdate'];
		$lesson['Lesson Name']=$row['title'];
		$lesson['Lesson Type']=$row['type'];
		$lesson['Lesson ID']=$row['nid'];
		
		// Extract CALI lesson code for lesson, e.g., EVD04.
		$SQL3="select field_lesson_id_value as code from field_data_field_lesson_id where entity_id = $nid"; 
		$q=new QueryMySQLSimple ($SQL3);
		traceSQL($SQL3);
		$row=$q->fetchRow();
		$lesson['Lesson Code']=isset($row['code']) ? $row['code'] : $lesson['Lesson ID'];
		$courseFilter = " and courseid=$courseid"; // If course specified, we filter on it.
	}
	else
	{
		$SQL3="select  lsn.type, lsn.title as title, lsn.uid, lsn.nid, lsn.created, u.name as name, u.mail
			from node as lsn , users as u where  
			lsn.nid = $nid and lsn.uid = u.uid ;";
		$q=new QueryMySQLSimple ($SQL3);
		traceSQL($SQL3);
		$row=$q->fetchRow();
		$lesson['Organization']='-';
		$lesson['Semester']='-';
		$lesson['Teacher Name']=$row['name'];
		$lesson['Teacher ID']= $ownerid = $row['uid'];
		$lesson['Course Name']='-';
		$lesson['Course ID']='-';
		$lesson['Created Date']=date("Y-m-d H:i:s",$row['created']);
		$lesson['Lesson Name']=utf8_encode($row['title']);
		$lesson['Lesson Type']=$row['type'];
		$lesson['Lesson ID']=$row['nid'];
		$lesson['Lesson Code']=$row['nid'];
		$courseFilter="";  // assumption is with no course, must be an AutoPublish, so include all runs.
	}
	
	
	if ($lastupdate!='')
	{	// If last update filter, see if there are new/updated records after that date. If none, return no-op or {};
		// 12/08/2016 Include course filter if defined.
		$SQL="select count(*) as updated from LessonRun where nid=$nid $courseFilter and scoredate > \"$lastupdate\" ";
		$query=new QueryMySQLSimple($SQL);
		traceSQL($SQL);
		$row=$query->fetchRow();
		$updatedCount = $row['updated'];
		if ($row['updated'] ==0)
		{
			$runDates=Array();
			if (0)
			{	// Debugging aid: list of all scoredates
				$SQL="select scoredate from LessonRun where nid=$nid and courseid=$courseid";
				$query=new QueryMySQLSimple($SQL);
				while($row=$query->fetchRow())
				{
					array_push($runDates, $row['scoredate']);
				}
			}
			
			return json_encode(array("lastUpdate" => $lastupdate,
										  "updatedCount"=> $updatedCount,
										  "date"=> date("Y-m-d H:i:s"),
										  "rundates"=>$runDates
										  ));
		}
	}

	// Extract all lesson runs for this course/lesson. 
	$SQL="select uid, nid,  scoredate, responses from LessonRun where nid=$nid $courseFilter order by runid limit 9999";
	$query=new QueryMySQLSimple($SQL);
	traceSQL($SQL);

	$lesson['Lesson Runs']=$query->getNumRecords();
	array_push($comment,"1. Only a student's first answer to any question is tallied. ","2. Discarding Text Essays and Text Selects.");
	
	$pages=array();
	$users=array();
	$scores=array();
	$rundates=array();
	// Grab each lesson run's score save XML and parse for unique answers per user.
	$usercount=0;
	$bytes=0;
	$maxdate=''; // Get the most recent update - used for future filtering by client via 'lastupdate' parameter.
	while($row=$query->fetchRow())
	{
		$uid=intval($row['uid']);
		if ($uid == $ownerid)
		{
			// skip owner id. ideally use query WHERE
		}
		else
		{
			$savedate=$row['scoredate'];
			if ($savedate>$maxdate){
				$maxdate=$savedate;
			}
			
			$xml = $row['responses']; 
			$bytes += strlen($xml);// just info gathering
			
			// Map drupal user id to simpler user id.
			if (!isset($users[$uid]))
			{
				$users[$uid]= $usercount;
				$usercount++; 
			}
			$uidx = $users[$uid];
			
			// 10/18/2016 Track user's run dates
			
			if (!isset($rundates[$uidx]))
			{
				$rundates[$uidx]=array();
			}
			if (isset($savedate)){
				$rundates[$uidx][$savedate]=1;
			}
			if (trim(''.$xml)<>'')
			{ 
				$p = xml_parser_create();
				$res=xml_parse_into_struct($p, $xml, $vals);
				if ($res==0)
				{	// Parse error such as weird character in the ScoreSave XML. TODO Need to solve this. 
					//echo '<hr>PARSE ERROR for '.$uid.' '.$savedate.' ';
				}
				if (1)
				{
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
								$qanswer=isset($vals[$i]['value']) ? $vals[$i]['value'] : '';
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
									if ((INCLUDE_ESSAYS) || ( (!INCLUDE_ESSAYS) && ($qtype!='Text Entry/Text Essay')))// discard essay to avoid clutter for now.
									
									if ($qgrade!='')// discard unscored questions 
								
									{	
									$qnameActual=$qname;
									$qname = strtoupper($qname);// just incase a page name has case changed, use case-insentive name as index. 
										
									if (empty($pages[$qname]))
									{	// add a unique lesson/page tuple
										$pages[$qname]=array('type'=> $qtype,'pagename'=>$qnameActual);
										//echo ('<hr>'.$qname);
									}
										
									if (empty($pages[$qname][$qsub]))
									{
										$pages[$qname][$qsub] = array( 'users'=>array(), 'right'=>0, 'wrong'=>0,'total'=>0 );
									}
									
									if (!isset($pages[$qname][$qsub]['users'][$uidx]))
									{	// collect only first attempt for this user/question/lesson/subquestion tuple
										$pages[$qname][$qsub]['users'][$uidx]=1;
										
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
										$pages[$qname][$qsub][$qanswer]['users'][$uidx]=1;
										if (INCLUDE_ALL_USER_ANSWERS)
										{	// Attach this user's unique answer per run. 
											$pages[$qname][$qsub]['user'][$uidx][$savedate]=$text;
										}		
										// Store unique answers
										$pages[$qname][$qsub][$qanswer]['text'][$text]=true;
										
										if ($qgrade!='') // ($qgrade=='RIGHT'||$qgrade=='WRONG')
										{
											$pages[$qname][$qsub]['total']++;
											if (!isset($pages[$qname][$qsub][$qgrade])) $pages[$qname][$qsub][$qgrade]=0;
											$pages[$qname][$qsub][$qgrade]++;
											//$pages[$qname][$qsub][$qanswer]['users'][$uid]=1;
											// GIT#48 Ensure user index slots are allocated.
											if (!isset($scores[$qgrade])) $scores[$qgrade]=array();
											if (!isset($scores[$qgrade][$uidx])) $scores[$qgrade][$uidx] = 0;
											$scores[$qgrade][$uidx]++; // tally this user's total scores
										} 
									}
									}
								}
								break;
						}
					}//for
					xml_parser_free($p);
				}
			}
		}
	}
//	var_dump($pages);
	
	$lesson['LastUpdate']=$maxdate; // indicate last saved date so later queries can return NOOP if there's no new data.
	$lesson['XMLBytes']=$bytes; 
	
	
	// 09/09/2016 Gather user information
	//$SQL='select mail, name, users.uid from users where   users.uid in ('.implode(",",array_keys($users)).')';
	if (count($users)>0)
	{	
		$SQL = 'select uid,field_first_name_value as firstname,field_last_name_value as lastname
				from users,field_data_field_first_name,field_data_field_last_name 
				where (field_data_field_first_name.entity_id = uid and field_data_field_last_name.entity_id=uid) and 
				users.uid in ('.implode(",",array_keys($users)).')';
		$query=new QueryMySQLSimple($SQL);
		traceSQL($SQL);
		$shortusers=array();
		//	var_dump($scores);
		while($row=$query->fetchRow())
		{
			$shortid=$users[$row['uid']];
			//$users[$row['uid']] = array(/*'username'=>$row['name'],*/'email'=>$row['mail']);
			$shortusers[$shortid]= array(
				'userid'=> REDACTED?'REDACTED':intval($row['uid'])
				,'name'=>REDACTED?'REDACTED':  $row['lastname'].', '.$row['firstname'] 
				,'right'=>isset($scores['right'][$shortid]) ? intval ($scores['right'][$shortid]) : 0
				,'wrong'=>isset($scores['wrong'][$shortid]) ? intval ($scores['wrong'][$shortid]) : 0 // in case of null where user didn't get any right or any wrong.
				,'rundates'=> array_keys($rundates[$shortid])
				//,'email'=>REDACTED?'REDACTED@REDACTED.EDU':$row['mail']
				);
		}
		$users = $shortusers;
		ksort($users);
	}

	
	uksort($pages, 'sortPageNameNatural');
	
	//var_dump($pages);return;
	
	// Aggregate all pages into JSON friendly structure.
	$pagesFinal=array();
	foreach($pages as $pagei=>&$page)
	{	// Process one page
		//var_dump($page);return;	
		// Get max users per question (for many multiple choice pick the highest user count)
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
		//var_dump(array_values($page));
		
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
	/*
	//echo'<hr>$comment ';var_dump($comment);
	echo'<hr>$lesson ';var_dump($lesson);
	//echo'<hr>$users ';var_dump($users);
	//echo'<hr>array_values($users) ';var_dump(array_values($users));
	//echo'<hr>$pagesFinal ';var_dump($pagesFinal);
	echo'<hr>';echo json_encode($comment);
	echo'<hr>';echo json_encode($lesson);
	echo'<hr>';echo json_encode(array_values($users));
	echo'<hr>';echo json_encode($pagesFinal);
	echo'<hr>';
	*/
	$ar =array(
			"_comment"=>$comment,
			"lesson"=>$lesson,
			"users"=>array_values($users),
			"pages"=>$pagesFinal,
			"trace"=>$trace
		);
	$json= //str_replace("],","],\n",
		json_encode($ar); 
	if ($json===FALSE)
	{
		echo '{JSONError:'. json_last_error().'}' ;
		var_dump($ar);
	}
 //var_dump($ar);
	return $json;
}


$trace=array();
function traceSQL($SQL='')
{	// 08/22/2017 Specify default argument value GIT#46
	global $trace,$connect_CALISQL;
	if ($SQL!=''){
		$trace[]=$SQL;
	}
	$trace[]=mysqli_error($connect_CALISQL);
}

class QueryMySQLSimple
{	// The MySQL SELECT version of Query (used by Oink but simplified to work in Drupal OR the oink test site. )
	function QueryMySQLSimple($SQL)
	{
		global $connect_CALISQL;
		$result=mysqli_query($connect_CALISQL,$SQL);
		//echo '<hr>'.$SQL.'<hr>';
		if (!$result){
			//abort(json_encode(array("error"=>array("SQL"=>$SQL,"message"=>mysql_error()))));
		}
		$this->queryresult=$result;
	}
	function fetchRow()
	{
		return mysqli_fetch_array($this->queryresult);
	}
	function getNumRecords()
	{
		return mysqli_num_rows($this->queryresult);
	}
}

?>
