<?php
/** 
 *@file
 *
 * 7/22/2011, 4/5/2011 SJG this code is included by each lesson's 'lesson.php' home page for CALI's website.
 * It embeds JavaScript variables that the lesson can then manipulate.
 * 2012
 * 8/5/2015 Fixed to work with Drupal 7.
 * 07/20/2015 SJG Add Piwik tracking
 * 07/25/2016 SJG fix Facstaff role test
*/
  $template=file_get_contents("lesson.html");
  global $user;
  

{  
  define('DRUPAL_ROOT_DIR','/vol/data/drupal7-cali');
  // Set the working directory to your Drupal root
  chdir(DRUPAL_ROOT_DIR);
  define('DRUPAL_ROOT', getcwd());
  require_once("./includes/bootstrap.inc");
  drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
  $account = user_load($user->uid); 
  $roles = $user->roles;
  $org_title = get_organization_name($account); 
  $orgname = render($org_title);
  $runid=$_SESSION['runid'];
  $username= $user->name;
  $firstname_item = field_get_items('user', $account, 'field_first_name' );
  $lastname_item = field_get_items('user', $account, 'field_last_name' );
  $lastname_value = field_view_value('user', $account, 'field_last_name', $lastname_item[0]);
  $lastname = render($lastname_value);
  $firstname_value = field_view_value('user', $account, 'field_first_name', $firstname_item[0]);
  $firstname = render($firstname_value); 
  $authmode=(in_array('Facstaff', $roles)) ? 1 : 0;
  if (isset($_SESSION['resume']) && $_SESSION['resume']==1)
	  $resumescore="/lesson/scoreload/".dechex($runid*47);
  else
	  $resumescore="";
}

  $dispname= $firstname." ".$lastname;
  if (!isset($orgname)) {
	  $orgname = '';
  }
  
  $custom="<script>var userName=\"$username\"; var runid=\"$runid\"; var amode=$authmode;var orgName=\"$orgname\";var dispName=\"$dispname\";var resumeScoreURL=\"$resumescore\";</script>";

  
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
	 _paq.push(["setCustomVariable", 2, "Organization", "'.$orgname.'","page"]);
	 _paq.push(["setCustomVariable", 3, "User Name", "'.$dispname.'","page"]);
	 _paq.push(["setCustomVariable", 4, "Run ID", "'.$runid.'","page"]);
	  var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0];
    g.type="text/javascript"; g.async=true; g.defer=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
  })();
</script>
<noscript><p><img src="//analytics.cali.org/piwik.php?idsite=3" style="border:0;" alt="" /></p></noscript>
<!-- End Piwik Code -->
';
  
  echo preg_replace('#\<!--Mode.BEGIN--\>(.+?)\<!--Mode.END--\>#s',$custom,$template);
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
?>
