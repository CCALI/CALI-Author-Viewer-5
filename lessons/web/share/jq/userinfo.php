<?php
echo "User Info Test:  ";
// 7/27/11 4/5/2011 SJG this code is included by each lesson's 'lesson.php' home page.
// It embeds JavaScript variables that the lesson can then manipulate.
$template=file_get_contents("lesson.html");

if (  ($_SERVER['HTTP_HOST'] == "localhost") || ($_SERVER['HTTP_HOST'] == "aws01.cali.org") ){//Sam's local hack to simulate Drupal vars. NEVER RUN ON cali.org
	$runid="88100188";
	$username="FacultyTesterUserName";
  	$firstname = "Faculty";
	$lastname = "Tester";
	$orgname ="Center for Computer-Assisted Legal Tutorial Testers";
	$authmode=1;
	$resumescore="/lessons/scoresavetest/scoreload.php";
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
	$resumescore="";
}
echo "Length:".strlen($template).' '.$username;
$dispname= $firstname." ".$lastname;
$custom="<script>var userName=\"$username\"; var runid=\"$runid\"; var amode=$authmode;var orgName=\"$orgname\";var dispName=\"$dispname\";</script>";
echo htmlentities($custom);
?>
