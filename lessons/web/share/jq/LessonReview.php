<?php
// 04/13/2022 Generate Lesson Review for student.
// Load the lessonReview.html template, popuplate runid/user js variables.
// 
// Argument : runid
// Validate: runid exists, current user matches user record.

$template=file_get_contents("LessonReview.html");

$authmode=0;
//### 11/08/2016 Piwik collection: Get user/organization information for piwik
// Code copied from lesson.php.
if ( 1 ) {
	$runid="zz";//11812066"; // 88100188";
	$resumescore="/lessons/scoresavetest/LessonReview scoreSaveSample2.xml";//"/lesson/scoreload/".dechex($runid*47);
	$userid=203;
	$username="2StudentTestAccount";	$firstname = "2Local";	$lastname = "2Student Tester";$authmode=0; // no faculty permissions.
	$orgname ="2Center for Computer-Assisted Legal Tutorial Testers";
	$coursename='""';
	$teachername='""';
	$semester='""';
	$schoolname='""';
}
else
{
	global $user;
	// Set the working directory to your Drupal root
	chdir(DRUPAL_ROOT_DIR);
	define('DRUPAL_ROOT', getcwd());
	require_once("./includes/bootstrap.inc");
	drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
	$runid=$_SESSION['runid'];
	$resumescore="/lesson/scoreload/".dechex($runid*47);
	// Grab account info to get user and org info.
	$account = user_load($user->uid); 
	$org_title = get_organization_name($account); 
	$orgname = render($org_title);	
	$firstname_item = field_get_items('user', $account, 'field_first_name' );
	$lastname_item = field_get_items('user', $account, 'field_last_name' );
	$lastname_value = field_view_value('user', $account, 'field_last_name', $lastname_item[0]);
	$lastname = render($lastname_value);
	$firstname_value = field_view_value('user', $account, 'field_first_name', $firstname_item[0]);
	$firstname = render($firstname_value);
	$dispname= $firstname." ".$lastname;
	if (!isset($orgname)) {
		$orgname = '';
	}
	$coursename='""'; if (isset($_SESSION['coursename'])) {$coursename=json_encode($_SESSION['coursename']);unset($_SESSION['coursename']);}
	$teachername='""';if (isset($_SESSION['proflastname'])) {$teachername=json_encode($_SESSION['proflastname']);unset($_SESSION['proflastname']);}
	$semester='""';if (isset($_SESSION['semester'])) {$semester=json_encode($_SESSION['semester']);unset($_SESSION['semester']);}
	$schoolname='""';if (isset($_SESSION['schoolname'])) {$schoolname=json_encode($_SESSION['schoolname']);unset($_SESSION['schoolname']);}
		  
}

  // 11/09/2016 07/20/2016 SJG Add Piwik tracking organization name ($orgname) and user's full name ($dispname).
  // Group membership needs to be added as custom variable 1.
  echo '
<!-- Piwik -->
<script type="text/javascript">
  var _paq = _paq || [];
  _paq.push(["setDomains", ["*.www.cali.org"]]);
  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);
  (function() {
    var u="//analytics.cali.org/";
    _paq.push(["setTrackerUrl", u+"piwik.php"]);
    _paq.push(["setSiteId", 3]);
	 _paq.push(["setCustomVariable", 2, "Organization", "'.$orgname.'","visit"]);
	 _paq.push(["setCustomVariable", 3, "User Name", "'.$dispname.'","visit"]);
	  var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0];
    g.type="text/javascript"; g.async=true; g.defer=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
  })();
</script>
<noscript><p><img src="//analytics.cali.org/piwik.php?idsite=3" style="border:0;" alt="" /></p></noscript>
<!-- End Piwik Code -->
';

/**
 * get og ids that $account belongs to;
 * then gets first with a type of "organization"
 * uses that title for the $orgname
 */
function get_organization_name($account){
  $user_orgs = og_get_groups_by_user($account);
  if (!empty($user_orgs['node'])){
	foreach($user_orgs['node'] as $value){
	  $node = node_load($value);
	  if ($node->type == "organization"){
		$title = $node->title;
		//echo $title;
		return($title);
	  }
	}
  }
}
  $custom="<script>var _paq=false;\n var llMode=\"$llMode\";\n var userName=\"$username\";\n var runid=\"$runid\";\n var amode=$authmode;\n var llCourseName=$coursename; var llProfName=$teachername;\n var llSemester=$semester;\n var llSchoolName=$schoolname;\n var orgName=\"$orgname\";\n var dispName=\"$dispname\";\n var resumeScoreURL=\"$resumescore\";</script>";
  echo preg_replace('#\<!--Mode.BEGIN--\>(.+?)\<!--Mode.END--\>#s',$custom,$template);
?>
