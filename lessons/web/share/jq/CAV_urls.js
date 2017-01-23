// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, Version: 03/15/2012
// CALI Author Viewer - Link config file 

var emailContact="dquentel@cali.org"
var emailTechSupportContact="calitech@cali.org"
var exit="http://www.cali.org/"

function CALILessonJump(LessonLink)
{ // LessonLink will be portion after lesson:// such as from lesson://BA08 or lesson://../../BA/BA08
	return lessonPath + ((isLocalFile()||lessonPath.indexOf('libdist')>=0) ? LessonLink + "/jq.html" : "../" + LessonLink.toLowerCase() + "/jq.php");
}
function LessonTextJump(PageName)
{
	return lessonPath + ( (isLocalFile()||lessonPath.indexOf('libdist')>=0)? 'LessonText.html':'lessontext.php') + '#' + escape(PageName);
}
function PerformanceUpload()
{
	return isLocalFile() ? null  :  "/lesson/scoresave";
}
function urlLessonRuns()
{
	return (isLocalFile() ? "http://www.cali.org" :"") + "/mylessonruns";
}
function urlSurvey()
{
	//return "https://www.surveymonkey.com/s/P8YBGGZ";
	return null;
}
function LessonLiveDownload()
{	// 08/25/2016 Download lesson scores to viewer: /lessonlink/live/runid/lastupdate
	return isLocalFile() ? null  :  "/lessonlink/live/";
}
//