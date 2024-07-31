<?php
	// 06/27/24 SJG If we are linked outside of our server and there's no runid, bail.
	// If we do have a runid or we're running in our server (linked from LessonText) then proceed.
	$referer = $_SERVER['HTTP_REFERER']??'';
	$referer_host = parse_url($referer, PHP_URL_HOST);
	if (($referer_host != $_SERVER['HTTP_HOST']) || (!isset($referer_host))) {
		require "getdrupalinfo.php";
		$runid=$_SESSION['runid']??0;
		if ($runid==0)
			header("Location: https://www.cali.org/error/bookmark");
    }
?>

