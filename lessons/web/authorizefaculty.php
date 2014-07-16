<?php header("Content-Type: text/html; charset=Windows-1252"); ?>
<?php
//06/01/2009 SJG Insert our Faculty/lesson access authentication code here.
//01/14/2010 SJG Hacked to return Windows-1252 charset override server's UTF-8 setting, for now.
//10/24/2013 SJG This checks with Drupal to make sure user is Faculty or Staff or CALI Staff. 
// Anyone else gets bounced to home page.

	chdir("/vol/data/drupal7-cali/");
	define('DRUPAL_ROOT_DIR','/vol/data/drupal7-cali');
	// Set the working directory to your Drupal root
	chdir(DRUPAL_ROOT_DIR);
	define('DRUPAL_ROOT', getcwd());
	require_once("./includes/bootstrap.inc");
	drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
	global $user;
	$roles = $user->roles;
	//print_r($roles);
	$maySeeLessonText = in_array('CALI Staff', $roles) || in_array('Facstaff', $roles) || $user->uid == 1;
	//print_r($maySeeLessonText);
	if ($maySeeLessonText == FALSE)
	{
		// Bounce to home page. 
		header("Location: http://".$_SERVER['HTTP_HOST']);
		return;
	}
	
echo "<!-- Faculty lesson authorization. -->";
?>
