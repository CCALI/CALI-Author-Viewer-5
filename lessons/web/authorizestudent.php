<?php
//6/1/09 SJG Insert our student/lesson access authentication code here.
/*
 * this checks with Drupal to make sure nothing funny is going
 * on with hot links directly to Lessons.
 *
 * 7/14 ERM update to really work with D7
 * This is the version that is currently running in production.
 *
 */
$referer = $_SERVER['HTTP_REFERER'];
$referer_host = parse_url($referer, PHP_URL_HOST);
$link_path = $_SERVER['SCRIPT_FILENAME'];
$path_pieces = explode('/', $link_path);
$lessonid1 = $path_pieces[5];
if ($referer_host != $_SERVER['HTTP_HOST']) {
  chdir("/vol/data/drupal7-cali/");
  define('DRUPAL_ROOT_DIR','/vol/data/drupal7-cali');
  // Set the working directory to your Drupal root
  chdir(DRUPAL_ROOT_DIR);
  define('DRUPAL_ROOT', getcwd());
  require_once("./includes/bootstrap.inc");
  drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
  global $user;
  if ($_SESSION['runid'] > 0 && $_SESSION['runtype'] == 'LessonLink'){
        $lesson = node_load($_SESSION['runnid']);
        $lessonid2 = strtolower($lesson->field_lesson_id[und][0][value]);
        if($lessonid1 != $lessonid2){
                $nid = db_query("SELECT entity_id from {field_data_field_lesson_id} WHERE field_lesson_id_value = :lid", array(':lid' => $lessonid1))->fetchfield(0);
                header("Location: http://".$_SERVER['HTTP_HOST']."/lesson/".$nid);
        }
  } else {
  $path_pieces = explode('/', $link_path);
  $lessonid1 = $path_pieces[5];
  $nid = db_query("SELECT entity_id from {field_data_field_lesson_id} WHERE field_lesson_id_value = :lid", array(':lid' => $lessonid1))->fetchfield(0);
  header("Location: http://".$_SERVER['HTTP_HOST']."/lesson/".$nid);
  }

}
?>
