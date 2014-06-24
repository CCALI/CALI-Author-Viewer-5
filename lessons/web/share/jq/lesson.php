<?php
// 7/22/2011, 4/5/2011 SJG this code is included by each lesson's 'lesson.php' home page for CALI's website.
// It embeds JavaScript variables that the lesson can then manipulate.
// 2012
$template=file_get_contents("lesson.html");
if (  ($_SERVER['HTTP_HOST'] == "localhost") || (strpos($_SERVER['HTTP_HOST'],"192.168.1.")===0) ){//Sam's local hack to simulate Drupal vars. NEVER RUN ON cali.org
	$runid="88100188";
	$username="FacultyTesterUserName";
  	$firstname = "Faculty";
	$lastname = "Tester";
	$orgname ="Center for Computer-Assisted Legal Tutorial Testers";
	$authmode=1;
	$resumescore="";//"/lessons/scoresavetest/scoreload.php"; 
}else
{
	if ($_SERVER['HTTP_HOST'] == "development.cali.org")
		chdir("/vol/data/development");
	else 
	if ($_SERVER['HTTP_HOST'] == "beta.cali.org")
		chdir("/vol/data/trunk");
	else
		chdir("/vol/data/acquia-drupal");

  	require_once("./includes/bootstrap.inc");
  	drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
  	global $user;
  	$roles = $user->roles; //get user roles array

  	$runid=$_SESSION['runid'];
	$username= $user->name;
  	$firstname = $user->profile_firstname;
	$lastname = $user->profile_lastname;
	$orgname = $user->profile_organizationname;
	$authmode=(in_array('facstaff', $roles)) ? 1 : 0;
	if ($_SESSION['resume']==1)
		$resumescore="/lesson/scoreload/".dechex($runid*47);
	else
		$resumescore="";
	//echo "<!-- RUNID=$runid -->";
}
$dispname= $firstname." ".$lastname;
$custom="<script>var userName=\"$username\"; var runid=\"$runid\"; var amode=$authmode;var orgName=\"$orgname\";var dispName=\"$dispname\";var resumeScoreURL=\"$resumescore\";</script>";
echo preg_replace('#\<!--Mode.BEGIN--\>(.+?)\<!--Mode.END--\>#s',$custom,$template);
?>
