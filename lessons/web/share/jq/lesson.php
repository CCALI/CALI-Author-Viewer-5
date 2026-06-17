<?php
// *** PRODUCTION * THIS IS FOR www.cali.org
/** 
 *@file
 *
 * 7/22/2011, 4/5/2011 SJG this code is included by each lesson's 'lesson.php' home page for CALI's website.
 * It embeds JavaScript variables that the lesson can then manipulate.
 * 2012
 * 8/5/2015 Fixed to work with Drupal 7.
 * 07/20/2015 SJG Add Piwik tracking
 * 07/25/2016 SJG fix Facstaff role test
 * 09/12/2016 SJG add CALI Staff as faculty role test
 * 09/27/2016 SJG add LessonLive link info
 * 10/07/2016 SJG add betatester role
 * 10/26/2016 SJG on production site
 * 10/20/2020 ERM unset($_SESSION['runid'] to foil browser bookmark
 * 11/12/2020 SJG course info
 * 06/27/2024 SJG replace drupal bootstrap calls with query cookie.
*/
	require('../../getdrupalinfo.php');
	$template=file_get_contents("lesson.html");

	$runid=$_SESSION['runid']??0;
	$runnid=$_SESSION['runnid']??0;
	$llMode=$_SESSION['llmode']??'';
	$resume=$_SESSION['resume']??0;
	$coursename=$_SESSION['coursename']??'';
	$teachername=$_SESSION['proflastname']??'';
	$schoolname=$_SESSION['schoolname']??'';
	$semester=$_SESSION['semester']??'';
	$authmode=$userisfacstaff ? 1 : 0;
	
  /*
	$sess=[];
	// Since we're in a frameset lesson.php has no querystring. We rely on the Referrer string to get it.
	parse_str($_SERVER["HTTP_REFERER"],$sess); // this will eventually be decrypting something instead of raw. 

	// Grab info we need  
	$starttime=$sess['starttime']??0;// TODO add the 10 second ejection.
	$runid=$sess['runid']??0;
	$runnid=$sess['runnid']??0;
	$username=$sess['username']??'';
	$firstname=$sess['firstname']??'';
	$lastname=$sess['lastname']??'';
	$orgname=$sess['orgname']??'';
	$roles=$sess['roles']??[];
	$llMode=$sess['llmode']??'';
	$resume=$sess['resume']??0;
	$coursename=$sess['coursename']??'';
	$teachername=$sess['profname']??'';
	$schoolname=$sess['schoolname']??'';
	$semester=$sess['semester']??'';
	 $dispname= $firstname." ".$lastname;
  // 09/12/2016 Show Faculty options for Facstaff or CALI Staff
  $authmode=(in_array('Facstaff', $roles) || in_array('CALI Staff', $roles)) ? 1 : 0;
  */
  
  //$betamode=(in_array('betatester', $roles)) ? 1 : 0;
  if ($resume==1)  
	  $resumescore="/lesson/scoreload/".dechex($runid*47);
  else
	  $resumescore="";
	if ($llMode=='go')
		$llMode='';


//	if ($betamode!=1)
//	{	// If not in beta mode, deactivate any beta features like LessonLive for Teacher.
//		if ($llMode=="own")
//			$llMode='';
//	}

  $custom="<script>var _paq=false;\n var llMode=\"$llMode\";\n var userName=\"$username\";\n var runid=\"$runid\";\n var amode=$authmode;\n var llCourseName=\"$coursename\";\n var llProfName=\"$teachername\";\n var llSemester=\"$semester\";\n var llSchoolName=\"$schoolname\";\n var orgName=\"$orgname\";\n var dispName=\"$dispname\";\n var resumeScoreURL=\"$resumescore\";</script>";

  
  // 07/20/2016 SJG Add Piwik tracking including user id ($user->uid), organization name ($orgname) and user's full name ($dispname).
  // Group membership needs to be added as custom variable 1.
  $custom.='
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
	 _paq.push(["setCustomVariable", 4, "Run ID", "'.$runid.'","visit"]);
	  var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0];
    g.type="text/javascript"; g.async=true; g.defer=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
  })();
</script>
<noscript><p><img src="//analytics.cali.org/piwik.php?idsite=3" style="border:0;" alt="" /></p></noscript>
<!-- End Piwik Code -->
';
  echo preg_replace('#\<!--Mode.BEGIN--\>(.+?)\<!--Mode.END--\>#s',$custom,$template);

?>
