<?php

/**
 * @file
 * Get user info from Drupal session cookie.
 *
 * 07/16/2024 This is called by authorizefaculty, the lesson viewer,
 * and lesson link aggregator.
 *
 * It will set userid, email, username and fac/staff permission flag
 * (or all blank if not logged in.)
 */

require "config.php";

$userid = 0;
$username = '';
$orgname = '';
$firstname = '';
$lastname = '';
$dispname = '';
$userisfacstaff = 0;
$userisstaff = 0;
//error_reporting(E_ALL);

$umysqli = new mysqli(UDB_HOST, UDB_USER, UDB_PASSWORD, UDB_NAME, 3306);
// Find Drupal's session cookie.
$sid = '';
foreach ($_COOKIE as $key => $value) {
  if (strpos($key, 'SESS') === 0) {
    $hash = base64_encode(hash('sha256', $value, TRUE));
    // Modify the hash so it's safe to use in URLs.
    $sid = str_replace(['+', '/', '='], ['-', '_', ''], $hash);
    if ($sid != '') {
      // Get Drupal session id from cookie, load Drupal's session data which contains everything we need.
      $query = "SELECT uid,session FROM `sessions` WHERE sid = '$sid'";
      $result = $umysqli->query($query);
      if (mysqli_num_rows($result)==1)
      {
        $row = mysqli_fetch_assoc($result);
        $userid = $row['uid'];
        session_start();
        session_decode($row['session']);
        $username = $_SESSION['username'];
        $orgname = $_SESSION['orgname'];
        $firstname = $_SESSION['firstname'];
        $lastname = $_SESSION['lastname'];
        $roles = $_SESSION['roles'] ?? [];
        $dispname = $firstname . " " . $lastname;
        $userisfacstaff = in_array('facstaff', $roles) || in_array('cali_staff', $roles);
        $userisstaff = in_array('cali_staff', $roles);
        break;
      }
    }
  }
}
