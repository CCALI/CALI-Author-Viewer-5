<?php
/*	09/27/2016 A shell for the LessonLive aggregator.

	Called by JavaScript in LessonLive Viewer or LessonPast reporter.
	
	Opens the DB connection for the aggregator to parse LessonRun XML and returns its package.
	Likely this gets moved into a Drupal menu instead to use Drupal's more robust logging and security.
	
	Note: Run id used to determine course, lesson and if user is owner (teacher).
	
	Querystring Parameters:
	Requires:  runid=#
	Optional:  lastupdate=#
*/
	require "LessonLinkConfig.php";
	require_once "LessonLinkAggregator.php";
	
//	### Full debugging.
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);


	// ### Security check should be done to assure user getting this data is course teacher.
	$userID=0;
	global $user;
	// Set the working directory to your Drupal root
	chdir(DRUPAL_ROOT_DIR);
	define('DRUPAL_ROOT', getcwd());
	require_once("./includes/bootstrap.inc");
	drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
	$userID = $user->uid; 
	
	//### Connect to Drupal www.cali.org clone database (read only)
	$connect_CALISQL=mysql_connect($dbhost,$dbuser,$dbpass);
	$Database=mysql_select_db($dbdatabase,$connect_CALISQL);
	
	
	//### Gather query string parameters
	$runid=intval($_GET['runid']);
	//$courseID=intval($_GET['courseid']); // debugging only
	//$lessonID=intval($_GET['lessonid']); // debugging only
	$lastUpdate=mysql_escape_string ($_GET['lastupdate']);
	
	
	//### Lookup runid to extract user, course and lesson id.
	$SQL="select nid, uid, courseid from LessonRun where runid = $runid limit 1";
	$q=new QueryMySQLSimple ($SQL);
	$row=$q->fetchRow();
	$courseID=$row['courseid'];
	$lessonID=$row['nid'];
	$ownerID=$row['uid'];
	
	if ($courseID==0)
	{
		echo json_error("Unknown course");
	}
	else
	if (!in_array($userID,array($ownerID, 203)))
	{
		echo json_error("Only LessonLink owner may access this data");
	}
	else
	if ($courseID>0 && $lessonID > 0){
		//echo json_error("Got the course ");
		echo LessonLiveAggregateJSON($courseID,$lessonID,$lastUpdate);
	}
	else{
		echo json_error("Missing course,lesson ids");
	}
	
function json_error($errmsg) 
{
	return json_encode(array('error'=>$errmsg));
}
?>

