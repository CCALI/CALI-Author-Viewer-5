<?php
/*	4/22/26 SPL Support
	3/26/26 D10 Fixes 

	09/27/2016 A shell for the LessonLive aggregator.

	Called by JavaScript in LessonLive Viewer or LessonPast reporter.
	
	Opens the DB connection for the aggregator to parse LessonRun XML and returns its package.
	Likely this gets moved into a Drupal menu instead to use Drupal's more robust logging and security.
	
	Note: Run id used to determine course, lesson and if user is owner (teacher).
	
	Querystring Parameters:
	Requires:  runid=#
	Optional:  lastupdate=#

	05/17/2018 Updated to mysqli
	07/2024 Rely on LessonLinkConfig to setup database names and user info.
*/

	if (	0	){//	### Full debugging.
		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);
		//echo json_error("TESTING");exit();
		//echo "TESTING<br>1;";
	}//### End Full Debugging

	header('Content-Type: application/json; charset=utf-8');
	require "LessonLinkConfig.php";

	$userID = $userid;
	require_once "LessonLinkAggregator.php";
	

	
	//### Connect to Drupal www.cali.org clone database (read only)
	$connect_CALISQL=mysqli_connect($dbhost,$dbuser,$dbpass);
	$Database=mysqli_select_db($connect_CALISQL,$dbdatabase);
	
	//### Security check: only owner of course (userID=ownerID) or CALI staff can see data.
	$userisstaff=0;// If 1, is CALI Staff
	if ($userID>0)
	{	// See if user is CALI Staff and let them see report.
		$SQL = "SELECT * FROM `user__roles` WHERE entity_id = $userID and roles_target_id ='cali_staff'";
		$q=new QueryMySQLSimple ($SQL);
		$count = $q->getNumRecords();
		$userisstaff=($count>=1)?1:0;
	}
	//### Gather query string parameters
	$runID= intval($_GET['runid'] ?? 0);
	$courseID= intval($_GET['courseid'] ?? 0); // debugging only
	$lessonID= intval($_GET['lessonid'] ?? 0); // debugging only
	$lastUpdate= $_GET['lastupdate'] ??  ''; // Fix GIT#50
	
	$ownerID=0;
	if ($runID>0)
	{	// If runid is specified, lookup LessonRun by runid to find course and lesson id.
		$SQL="select nid, courseid from LessonRun where runid = $runID limit 1";
		$q=new QueryMySQLSimple ($SQL);
		traceSQL($SQL);
		$row=$q->fetchRow();
		$courseID=$row['courseid'];
		$lessonID=$row['nid'];
	}
	if ($courseID>0)
	{	// Given course id, lookup the owner so that only the Owner can actually load course data.
		$SQL="select uid from course where courseid = $courseID limit 1";
		$q=new QueryMySQLSimple ($SQL);
		traceSQL($SQL);
		$row=$q->fetchRow();
		$ownerID=$row['uid'];
	}
	if ($lessonID>0 && $courseID==0)
	{	// If lesson but no course see if the lesson author (node user) is current user) - an SPL lesson run without LessonLink.
		$SQL="select uid from node_field_data where nid=$lessonID";// Owner of lesson node (SPL author will be user).
		$q=new QueryMySQLSimple ($SQL);
		traceSQL($SQL);
		$row=$q->fetchRow();
		$ownerID=$row['uid'];
	}
	
	//var_dump(array($node->uid,$lessonID,$courseID,$userID,$user->uid,$ownerID));
	
	
	if ($courseID==0 && $lessonID==0 )
	{
		echo json_error("Unknown course");
	}
	else
	if (($userID==0) || (($userID!=$ownerID)&&(!$userisstaff)))
	{	// Anonymous user or not (owner of course or SPL lesson) or CALI staff.
		echo json_error(
			"Only LessonLink owner of this course may access this data"
			//"Only LessonLink owner of course $courseID may access this data: $userID<>$ownerID"
			);
	}
	else
	if ( $lessonID > 0){ //$courseID>0 &&
		//echo json_error("Got the course ");
		echo LessonLiveAggregateJSON($courseID,$lessonID,$lastUpdate);
	}
	else{
		echo json_error("Unknown lesson");
	}
	
function json_error($errmsg) 
{
	global $userID, $trace;
	return json_encode(array('error'=>$errmsg, 'user'=>$userID,'trace'=>$trace));
}
?>

