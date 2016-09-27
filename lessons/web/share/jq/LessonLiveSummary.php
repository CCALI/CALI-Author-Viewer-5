<?php
/*	09/27/2016 A shell for the LessonLive aggregator.

	Opens the DB connection for the aggregator to parse LessonRun XML and returns its package.
	Likely this gets moved into a Drupal menu instead to use Drupal's more robust logging and security.
	
	Requires:  runid=#
	Optional:  lastupdate=#
*/

	require_once "LessonLiveAggregator.php";
	
//	### Full debugging.
//	ini_set('display_errors', 1);
//	ini_set('display_startup_errors', 1);
//	error_reporting(E_ALL);

	// ### Security check should be done to assure user getting this data is course teacher.
	/*
	global $user;
	define('DRUPAL_ROOT_DIR','/vol/data/drupal7-cali');
	// Set the working directory to your Drupal root
	chdir(DRUPAL_ROOT_DIR);
	define('DRUPAL_ROOT', getcwd());
	require_once("./includes/bootstrap.inc");
	drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
	$userid = $user->uid; 
	*/
	$userid=0;

	
	//### Connect to Drupal www.cali.org clone database (read only)
	$dbdatabase="";
	$dbname="";
	$dbhost="";
	$dbuser="";
	$dbpass="";
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
	
	//echo json_encode( array($runid,$lastUpdate,$courseID,$lessonID,$ownerID));
		
	if ($courseID>0 && $lessonID > 0){
		echo LessonLiveAggregateJSON($courseID,$lessonID,$lastUpdate);
	}
	else{
		echo "{error:'Missing course,lesson ids'}";
	}
?>

