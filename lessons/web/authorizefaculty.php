<?php
	// 06/01/2009 SJG Insert our Faculty/lesson access authentication code here.
	// 04/15/2026 SJG If Drupal user is not CALI/staff/faculty, deny.
	require "getdrupalinfo.php";
	if ($userisfacstaff!=1)
	{	// 04/15/26 In case of missing session, see if user truly has no facstaff or CALI role.\
		$numrows=0;
		if($userid>0){// userid>0 in case of anon users
			$SQL = "SELECT roles_target_id FROM `user__roles` WHERE entity_id = $userid and roles_target_id in('facstaff','cali_staff')";
			$result = $umysqli->query($SQL);
			$numrows=mysqli_num_rows($result);
		}
      	if ($numrows==0){
			//header("Location: http://".$_SERVER['HTTP_HOST']);
			echo "<p>Only authorized users may see the Faculty View of a lesson.";
			exit();
			return;
		}
		$userisfacstaff=1;
	}
	echo "<!-- Faculty lesson authorization $userid. -->";
?>
