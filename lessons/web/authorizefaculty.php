<?php
	//	06/01/2009 SJG Insert our Faculty/lesson access authentication code here.
	// 07/17/2024 SJG If Drupal user is not staff/faculty, eject.
	require "getdrupalinfo.php";
	if ($userisfacstaff!=1)
	{
		header("Location: https://".$_SERVER['HTTP_HOST']);
		return;
	}
	echo "<!-- Faculty lesson authorization. -->";
?>
