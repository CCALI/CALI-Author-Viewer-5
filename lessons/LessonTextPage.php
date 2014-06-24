<?php
// 03/02/06 SJG Return one page of a lesson from LessonText.
// Used to show image context from image library.

// Input: lesson, page
//    e.g., LessonTextPage.php?lesson=arb01&page=p_004
//  Extracts page from lesson text and displays it.
// 10/12/09 Updated for new site
// TODO: add security model

$lessonid=strtolower($_REQUEST['lesson']);
$pageid=strtolower($_REQUEST['page']);

if (RunningOnProd())
{
	$reportFile=strtolower("web/$lessonid/LessonText.php");
}
else
{
	$reportFile="f:/www/www.cali.org/lessons/web/$lessonid/LessonText.php";
}


if (!file_exists($reportFile))
	echo "File $url for lesson '$lessonid' not found.";
else
{
	$html=file_get_contents($reportFile);
	$s=strpos($html,"<a name=".$pageid."></a>");//<a name=p_015></a>
	if($s==false)
	{
		echo "Page '$pageid' of lesson '$lessonid' not found.";
	}
	else
	{	//  extract portion from Report.html, add HTML body and a BASE HREF.
		$e=strpos($html,"<a name=",$s+1);
		echo "<html>";
		echo "<head>";
		echo "<base href=http://". $_SERVER['HTTP_HOST']."/lessons/web/$lessonid/report.html>";
		echo "<link rel=stylesheet href=../../styles.css type=text/css>";
		echo "</head>";
		echo "<body bgcolor=#ffffff>";
		echo substr($html,$s,$e-$s);
		echo "</body></html>";
	}
}

?>





<?php
function RunningOnProd()
{	// Return true if running on production.
	return $_SERVER['HTTP_HOST']=='www2.cali.org' || $_SERVER['HTTP_HOST']=='www.cali.org';
}
/* not required in PHP 5
function file_get_contents($filename)
{	// Prefer to use file_get_contents but that's only in newer PHP version.
	$buffer="";
	$handle = fopen ($filename, "r");
	if ($handle!=null)
	{
		while (!feof ($handle))
   		$buffer.=fgets($handle, 4096);
		fclose ($handle);
	}
	return $buffer;
}
*/
?>