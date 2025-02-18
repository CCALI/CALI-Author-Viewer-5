<?php
	//	06/01/2009 SJG Insert our Faculty/lesson access authentication code here.
	// 07/17/2024 SJG If Drupal user is not staff/faculty, eject.
	require "getdrupalinfo.php";
	
	// 02/18/24 SJG Confirm user has perms to see.
	$userisfacstaff=0;
	if ($userid>0)
	{
		$query = "SELECT rid FROM users_roles where uid=$userid and rid in (5,6)";
		$result = $umysqli->query($query);
		if ($result->num_rows>0)
			$userisfacstaff=1;
		//	var_dump($query);
		//	var_dump($result);
	}
	//	var_dump($userisfacstaff);
	if ($userisfacstaff!=1)
	{
		header("Location: https://".$_SERVER['HTTP_HOST']);
		return;
	}
	echo "<!-- Faculty lesson authorization. -->";
?>
