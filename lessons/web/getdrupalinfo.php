<?php
// 07/16/2024 This is called by authorizefaculty and the lesson viewer, and lesson link aggregator.
// It will set userid, email, username and fac/staff permission flag (or all blank if not logged in.)
require "config.php";

$userid=0;
$useremail='';
$username='';
$userisfacstaff=0;
//error_reporting(E_ALL);

// Find Drupal's session cookie.
$sid='';
foreach ($_COOKIE as $key => $value)
{	
	if (strpos($key,'SSESS')===0)
	{
		$sid=$value;
		break;
	}
}
if ($sid!='')
{	// Get Drupal session id from cookie, lookup user id and roles from Drupal db.
	$umysqli = new mysqli ( UDB_HOST,UDB_USER,UDB_PASSWORD,UDB_NAME,3306);
   $query = "SELECT uid FROM `sessions` WHERE sid = '$sid'";
	$result = $umysqli->query($query);
   $row = mysqli_fetch_assoc($result);
   $userid = $row['uid'];
   $query = "SELECT * FROM `users` WHERE uid=$userid";
	$result = $umysqli->query($query);
	$count = mysqli_num_rows($result);
	if ($count == 1)
	{
		$account = $result->fetch_object();	
		$username=$account->name;
		$useremail=$account->mail;
		$query = "SELECT rid FROM `users_roles` WHERE uid = $userid and rid in (5,6)";
		$result = $umysqli->query($query);
		$count = mysqli_num_rows($result);
		if ($count>=1)
		{
			$userisfacstaff=1;
		}
	}
}

?>