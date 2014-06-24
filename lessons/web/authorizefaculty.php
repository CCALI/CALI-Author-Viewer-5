<?php header("Content-Type: text/html; charset=Windows-1252"); ?>
<?php
//06/01/2009 SJG Insert our Faculty/lesson access authentication code here.
//01/14/2010 SJG Hacked to return Windows-1252 charset override server's UTF-8 setting, for now.
//10/24/2013 SJG This checks with Drupal to make sure user is Faculty or Staff or CALI Staff. 
// Anyone else gets bounced to home page.

//$referer = $_SERVER['HTTP_REFERER'];
//$referer_host = parse_url($referer, PHP_URL_HOST);
//$link_path = $_SERVER['SCRIPT_URL'];
//$path_pieces = explode('/', $link_path);
//$lessonid1 = $path_pieces[3];
//if ($referer_host != $_SERVER['HTTP_HOST'])
{
	chdir("/vol/data/acquia-drupal");
	include_once("./includes/bootstrap.inc");
	drupal_bootstrap(DRUPAL_BOOTSTRAP_SESSION);
	global $user;
	$maySeeLessonText = in_array('CALI staff', array_values($user->roles)) || in_array('facstaff', array_values($user->roles));
	if (!$maySeeLessonText )
	{
		// Bounce to home page. 
		header("Location: http://".$_SERVER['HTTP_HOST']);
		return;
	}
	
}

echo "<!-- Faculty lesson authorization. -->";
?>