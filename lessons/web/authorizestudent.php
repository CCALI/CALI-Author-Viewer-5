<?php
//6/1/09 SJG Insert our student/lesson access authentication code here.
/*
 * this checks with Drupal to make sure nothing funny is going
 * on with hot links directly to Lessons.
 *
 */
$referer = $_SERVER['HTTP_REFERER'];
$referer_host = parse_url($referer, PHP_URL_HOST);
$link_path = $_SERVER['SCRIPT_URL'];
$path_pieces = explode('/', $link_path);
$lessonid1 = $path_pieces[3];
if ($referer_host != $_SERVER['HTTP_HOST']) {
  chdir("/vol/data/acquia-drupal");
  include_once("./includes/bootstrap.inc");
  drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
  global $user;
  if ($_SESSION['runid'] > 0 && $_SESSION['runtype'] == 'LessonLink'){
  	$lesson = node_load($_SESSION['runnid']);
  	$lessonid2 = strtolower($lesson->field_lessonid[0][value]);
  	if($lessonid1 != $lessonid2){
  		$nid = db_result(db_query("SELECT cfl.nid from {content_type_lesson} ctl INNER JOIN {content_field_lessonid} cfl ON  ctl.nid = cfl.nid  WHERE field_lessonid_value = '%s'", $lessonid1));
		header("Location: http://".$_SERVER['HTTP_HOST']."/lesson/".$nid);
  	}
  } else { 
  $path_pieces = explode('/', $link_path);
  $lessonid1 = $path_pieces[3];
  $nid = db_result(db_query("SELECT cfl.nid from {content_type_lesson} ctl INNER JOIN {content_field_lessonid} cfl ON  ctl.nid = cfl.nid  WHERE field_lessonid_value = '%s'", $lessonid1));
  header("Location: http://".$_SERVER['HTTP_HOST']."/lesson/".$nid);
  }
  
}     
?>