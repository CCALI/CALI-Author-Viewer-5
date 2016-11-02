<?php
/*	11/01/2016 Allow student to sync to teacher's page in LessonLive.
	Ideally this could be a WebSocket app for performance.
	Hack Alert! Currently, just takes a lesson run id and return the teacher's current page.
	Ick! 3 queries are run: runid>course, course>teacher, teacher>current page.
	
	Querystring Parameters:
	Requires:  runid=#
*/
	require "LessonLinkConfig.php"; // Config for Drupal/database for current website.
	require "XMLFunctions.php"; // Quick xml extractor. TODO: use the one in Drupal codeset.

	
//	### Full debugging.
//	ini_set('display_errors', 1);
//	ini_set('display_startup_errors', 1);
//	error_reporting(E_ALL);


	//### Connect to database, per Config.
	$connect_CALISQL=mysql_connect($dbhost,$dbuser,$dbpass);
	$Database=mysql_select_db($dbdatabase,$connect_CALISQL);
	
	// ### No security check
	
	//### Gather query string parameters
	$runID=intval($_GET['runid']);
	//$courseID=intval($_GET['courseid']); // debugging only
	//$lessonID=intval($_GET['lessonid']); // debugging only
	
	$info=array();
	$info['Run ID']=$runID;
	
	if ($runID>0)
	{	//### If runid is specified, lookup LessonRun by runid to find course and lesson id.
		$SQL="select uid,nid,courseid from LessonRun where runid = $runID limit 1";
		$q=new QueryMySQLSimple ($SQL);
		$row=$q->fetchRow();
		$courseID=$row['courseid'];
		$lessonID=$row['nid'];
		$userID=$row['uid'];
		$info['Course ID']=$courseID;
		$info['Lesson ID']=$lessonID;
		//$info['Student ID']=$userID;
	}
	
	if ($courseID>0)
	{	//### Given course id, lookup the teacher (owner)
		$SQL="select uid from course where courseid = $courseID limit 1";
		$q=new QueryMySQLSimple ($SQL);
		$row=$q->fetchRow();
		$ownerID=$row['uid'];
		//$info['Teacher ID']=$ownerID;
	}
	
	if ($ownerID > 0 && $courseID>0 && $lessonID > 0)
	{	// Once we have course, lesson and teacher, find teacher's most recent entry to get his current page.
		// Note: teacher could create link and never run it: in that case current page will just be emptry string (last update is also null);
		$SQL="select scoredate,summary from LessonRun where uid = $ownerID and nid=$lessonID and courseid=$courseID order by scoredate desc limit 1";
		$query=new QueryMySQLSimple($SQL);
		$row=$query->fetchRow();
		$info['Last Update']=$row['scoredate']; // just so we know how recent this data is, maybe teacher hasn't run the lesson in a year?
		$summary = $row['summary'];
		$currentPage= XMLTagExtract($summary,'PAGECURRENT');
		echo json_encode(array('info'=>$info, 'Current Page'=>$currentPage));
	}
	elseif ($courseID==0)
	{
		echo json_error("Unknown course");
	}
	elseif ($ownerID==0)
	{
		echo json_error("Unknown owner");		
	}
	else{
		echo json_error("Unknown lesson");
	}

	
function json_error($errmsg) 
{
	global $info;
	return json_encode(array('error'=>$errmsg,'info'=>$info));
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

