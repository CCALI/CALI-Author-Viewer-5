// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, Version: 03/15/2012
// CALI Author Viewer - Scoring

var scoreSaveWarningCount=0;

function printScore()
{
	$('#ScoreReportCert').jqprint();
}

function curSeconds()
{
	var d = new Date();
	return d.getTime()/1000.0;
}

function changename()
{}
function qtag(txt,inner)
{
	return "<"+txt+">"+inner+"</"+txt+">";
}
function buildScoreSaveXML()
{	// make ScoreSave XML data
	var xml="";
	var qxml="";
	var sxml="";
	sxml=	qtag("FORMAT","05/05/2022")//"07/25/2011")
			+qtag("RUNID",runid)
			//+qtag("USERNAME", username)
			//+qtag("RUNDATE",new Date()) Warning! Adding date will cause it to CHANGE everytime and do constant uploading!
			// +qtag("VIEWER","07/25/2011") Original version
			+qtag("VIEWER","07/25/2018") // 2018 Refresh version
			+qtag("COMPLETE",scoreComplete ? "1":"0")
			//+(scoreComplete ? qtag("COMPLETE","1"):"")
			+qtag("VIEWERTYPE","JQ")
			+qtag("LESSON",book.lesson)
			+qtag("LESSONID",book.lesson)
			+qtag("LID","")
			+qtag("LESSONVERSION",book.version)
			+qtag("QCORRECT", ScoreCorrect)
			+qtag("QANSWERED", ScorePossible)
			+qtag("QTOTAL",  ScoreTotalQuestions)
			+qtag("SCOREPERCENT", ScorePercent)
			+qtag("PAGECOUNT", ScoreTotalPages)
			+qtag("PAGECURRENT",decodeHTML(page.name));
	for (var p in PagesList)
	{
		var pagep=PagesList[p];
		for (var part=0;part<pagep.scores.length;part++)
		{
			var score=pagep.scores[part];
			//<Q><NAME>Apparent Authority -- Hypo</NAME><TYPE>Multiple Choice/Choose MultiButtons</TYPE><TIME>0</TIME><SUBQ>1</SUBQ></Q
			//<Q><NAME>Apparent Authority -- General</NAME><TYPE>Book Page/</TYPE><TIME>0</TIME></Q>
			//<Q><NAME>Introduction</NAME><TYPE>Multiple Choice/Choose Buttons</TYPE><TIME>3</TIME><GRADE>MAYBE</GRADE><ID>2</ID><TEXT>Maybe</TEXT></Q>
			qxml+=qtag("Q",
				 qtag("NAME",decodeHTML(pagep.name))
				+qtag("TYPE",pagep.type+"/"+ (pagep.style==null ? "":pagep.style))
				+qtag("TIME",pagep.timeSpent)
				+qtag("TIMESTAMP",pagep.timeStamp?pagep.timeStamp:0)
				+(pagep.scores.length>1 ? qtag("SUBQ",part+1) : "")
				+(score==null ? "" : 
					qtag("GRADE",score.grade)
					+qtag("ID",score.id)
					+qtag("TEXT",decodeHTML(score.text))));
		}
	}	

	var hxml="";
	xml=qtag("PERFORMANCE",qtag("SUMMARY",sxml)+qtag("RESPONSES",qxml)+qtag("HISTORY",hxml));
	return xml; 
}
var resumeComplete=false;

function downloadScore()
{
	//trace("downloadScore ",resumeScoreURL);
	if (resumeScoreURL=="") return;
	$.ajax({
		url: resumeScoreURL,
		dataType: "xml",	
		timeout: 60000,
		error: function(data,textStatus,thrownError){
		  alert('Error occurred loading the XML from '+this.url+"\n"+textStatus);
		 },
		success: function(data){
			var scoreDataXML;
			scoreDataXML = data;
			scoreDataXML=$(scoreDataXML);
			var resumePageName=scoreDataXML.find("PAGECURRENT").xml();
			lessonReviewMode=parseInt(scoreDataXML.find("COMPLETE").xml())==1;
			//trace("Resume page ",resumePageName);
			scoreDataXML.find("Q").each(function() {
				var scoreXML = $(this);
				var name=scoreXML.find("NAME").xml();
				var subq=scoreXML.find("SUBQ").xml(); 
				if (subq=="") subq=0;else subq = parseInt(subq)-1;
				var page=book.pages[name];
				if (page!=null)
				{
					page.timeSpent=parseInt(scoreXML.find("TIME").xml());
					page.timeStamp=parseInt(scoreXML.find("TIMESTAMP").xml()); if (page.timeStamp==0) delete page.timeStamp;
					var grade=scoreXML.find("GRADE").xml();
					if (grade!="")
					{
						var score;
						if (page.scores[subq]==null) page.scores[subq]= new TScore(); 
						score=page.scores[subq];					
						score.grade=grade;
						score.id=parseInt(scoreXML.find("ID").xml());
						score.text=scoreXML.find("TEXT").xml();
					}
				}
				else
				{
					//trace("Page "+name+" no longer exists in this lesson");
				}
			});
			tallyScores();
			//trace("downloadScore lessonReviewMode="+lessonReviewMode);
			if (lessonReviewMode)
			{
				resumePageName='';
				$('.PageScore').html('<div style="text-align:center">Lesson Review Mode<br />Scoring disabled</div>');
				updateInstructions();
			}
			resumeComplete=true;
			if (bookMark=="" && resumePageName!="") gotoPage(resumePageName);
		}
	});
}

function uploadScoreDone(success,msg)
{	// Called when Score has been saved or failed. 
	$(".UploadScore1").show();
	$(".UploadScore2").hide();
	$(".UploadScore3").show();
	$(".UploadScore3 .message").html(msg);
	$('.UploadScore.Ask').hide().prev().show();
}

// Auto Save Score
var uploadScoreSilentInterval=null;
var newScoreData=null;
var lastSavedData=null;
var uploadingScore=false;
var scoreComplete=false;

function uploadScoreYN(){
	if (runid==null) return;
	 $( "#dialog-finalize" ).dialog({
			resizable: false,
			height:250,
			width: 400,
			modal: true,
			buttons: {
				"Yes": function() {
					$( this ).dialog( "close" );
					uploadScore();
				},
				"No": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	//$('.UploadScore.Ask').show().prev().hide();
	//$(".UploadScore3").hide();
	//$('.UploadScore.Ask .Yes').unbind('click').click(uploadScore);
	//$('.UploadScore.Ask .No').unbind('click').click(function(){$('.UploadScore.Ask').hide().prev().show();});
}
function uploadScore()
{	// Upload score as 'completed'.
	scoreComplete=true;
	if (runid == null) return;
	$(".UploadScore1").hide();
	$(".UploadScore2").show();
	$(".UploadScore3").hide();
	var xmlDocument = newScoreData = buildScoreSaveXML();
	//trace("uploadScore "+xmlDocument.length+" bytes to "+PerformanceUpload());
	$.ajax({
		cache: false,
		type: "POST",
   	url: PerformanceUpload(),
	   processData: false,
	   data: xmlDocument,
		dataType: "xml",
		error: function(data,textStatus,thrownError){
			uploadScoreDone(false,t(lang.ScoreSaveError,this.url),"");
		},
	   success: function(data,textStatus,jqXHR) {
			lastSavedData=newScoreData;
			var resultDataXML;
			resultDataXML = data;
			resultDataXML=$(resultDataXML);
			var url=$(resultDataXML).find('URL').text();
			if (url=="")
				uploadScoreDone(false,t(lang.ScoreSaveFail))
			else
			{
				uploadScoreDone(true,t(lang.ScoreSaveSaved));
				
				win.onbeforeunload=null;//if (!$.browser.mozilla)window.onbeforeunload=null;
				
				if (urlSurvey()==null){
					parent.location=url;
				}
				else
				$( "#dialog-survey" ).dialog({
					resizable: false,
					height:175,
					width: 400,
					modal: true,
					buttons: {
						"Yes": function() {
							$( this ).dialog( "close" );
							parent.open(urlSurvey(),'_blank');
							win.location=url; 
						},
						"No": function() {
							$( this ).dialog( "close" ); 
							win.location=url; 
						}
					},
					close: function() {
							win.location=url; 
					}
				});
			}
	  	}
	});
	return false;
}
function uploadScoreSilent()
{	// Upload score data ignoring any error/success responses. 
	// Upload only if actual data changed and we're not currently uploading right now. 
	if (runid==null || newScoreData == lastSavedData || uploadingScore) return;
	if (resumeScoreURL!="" && !resumeComplete){
		//trace("uploadScoreSilent Wait for resume to load")
		return;
	}
	if (lessonReviewMode) return;
	var xmlDocument = newScoreData;
	uploadingScore=true;
	//trace("uploadScoreSilent "+xmlDocument.length+" bytes to "+PerformanceUpload()+" lessonReviewMode="+lessonReviewMode);
	$.ajax({
		cache: false,
		type: "POST",
   	url: PerformanceUpload(),
	   processData: false,
	   data: xmlDocument,
		//dataType: "xml",
		error: function(data,textStatus,thrownError)
		{	// 03/02/2015 On failure, display prompt, slow down upload rate. 
			uploadingScore=false;
			$('#ScoreSaveError').removeClass('hidestart');
			trace("upload error:"+textStatus+","+thrownError);
			// Silent error message?
			clearInterval(uploadScoreSilentInterval);
			uploadScoreSilentInterval=setInterval("uploadScoreSilent()", 30000);
			
			scoreSaveWarningCount++;
			//trace(scoreSaveWarningCount);
			if (scoreSaveWarningCount>5)
			{	// After 5 failed attempts to save score data, exit lesson. 
				win.onbeforeunload=null;//if (!$.browser.mozilla)window.onbeforeunload=null;
				parent.location = 'https://www.cali.org/mylessonruns';
			}
			
			
		},
	   success: function(data)
		{	// 03/02/2015 On success, reset upload rate to 5 seconds.
			uploadingScore=false;
			//trace("upload success:");
			$('#ScoreSaveError').addClass('hidestart');
			lastSavedData=xmlDocument;// remember data uploaded, in case newScoreData changed during upload;
			// Success
			clearInterval(uploadScoreSilentInterval);
			uploadScoreSilentInterval=setInterval("uploadScoreSilent()", 5000);
			scoreSaveWarningCount=0;
	  	}
	});
	return false;
}
function ScoreDirty()
{	// Call when we need score to be saved.
	if (runid==null) return;// do nothing if we have no runid
	if (lessonReviewMode) return;// no saving score in Review mode.
	//trace("ScoreDirty "+"lessonReviewMode="+lessonReviewMode);
	newScoreData=buildScoreSaveXML();
	if (uploadScoreSilentInterval==null)
	{	// 03/02/2015 Upload check every 5 seconds. 
		uploadScoreSilentInterval=setInterval("uploadScoreSilent()", 5000);
	}
}

function ScoreScreenUpdate()
{
	if (runid==null)
		$('.UploadScore1').text(t(lang.ScoreSaveOff));
		
	var ScoreDate=new Date()
	$('.ScoreDate').text(ScoreDate.toDateString());
	$('.ScoreTime').text(ScoreDate.toTimeString());
	$('.ScoreURL').text(lessonPath);
	$('.ScoreCorrect').text(ScoreCorrect);
	$('.ScoreTotal').text(ScorePossible);
	$('.ScorePercent').text(ScorePercent);
	
	makeScoreDetails();
	$('#ScoreReportDetails TR:gt(0)').remove();
	$('#ScoreReportDetails TBODY').append(ScoreDetails);
	$('#ScoreReportDetails TR TD:nth-child(1)').addClass('ScoreReportCol1');
}

function ScoreScreenToggle()
{	// show the ScoreScreen
	if ($('#ScoreReport').is(':hidden'))
	{	
		ScoreScreenUpdate();
	}
	$("#ScoreReport").slideToggle("slow");
}

function updateProgressCircle()
{	// Bitovi Tally visited pages for progress circle
	let visited=0;
	for (var p in PagesList)//book.pages)
	{
		if (PagesList[p].timeSpent>0) visited++
	}
	let progressNum = 1+ Math.floor(visited / PagesList.length*99);// Progress from 1 to 100.
	$('#progress-circle').removeClass().addClass('score-circle progress-'+progressNum);
	//trace(progressNum);
}


function tallyScores()
{
	ScoreCorrect=0;
	ScorePossible=0;
	ScoreTotalQuestions=0;
	ScoreTotalPages=0;
	ScoreDetails = "";
	for (var p in PagesList)//book.pages)
	{
		var page=PagesList[p];//p//book.pages[p];
		if (page.scoredQuestion)
		{
			for (var part=0;part<page.scores.length;part++)
			{
				ScoreTotalQuestions++;
				var score=page.scores[part];
				if (score!=null)
				{
					ScorePossible++;
					if (score.grade==RIGHT)
						ScoreCorrect++;
				}
			}
			ScoreTotalPages++;
		}
	}
	
	if (ScorePossible>0)
	{
		ScorePercent=Math.floor(ScoreCorrect*100/ScorePossible);
		ScorePercent=ScorePercent+"%"
	}
	else
	{	// no score, no percent
		ScorePercent="-";
	}
	
	// Update score display: right, wrong and progress.	
	$('.right-txt').text(ScoreCorrect);
	$('.wrong-txt').text(ScorePossible-ScoreCorrect);
	updateProgressCircle();	
	$(".UploadScore3").hide();
}

function answerLoad()
{	// return text of page's last text entry.
	if (page.scores[0]==null)
		return "";
	else
		return page.scores[0].text;
}

function saveScore(grade,id,text,part)
{	// attach score to page, but only record 1st answer.
	if (lessonReviewMode)
		return;
	if (part==null) part=0;
	part=parseInt(part)
	if (page.scores[part]==null)
	{
		score= new TScore();
		score.grade=grade;
		score.id=id;
		score.text=text;
		page.scores[part] = score;
		tallyScores();
		ScoreDirty();
	}
}

function niceTime(secs)
{
	if (secs==0) return 0;
	else
	if (secs<60) return "< 1";
	else return Math.floor(secs/60);
}
function makeScoreDetails()
{
	var row="";
	var pagetypes=["",""];
	for (var p in PagesList)
	{	// show uer list of graded/answerable questions
		var page=PagesList[p]; 
		for (var part=0;part<page.scores.length;part++)
		{
			var score=page.scores[part];
			var row="<tr><td>"+page.name+ (page.scores.length>1 ? "#"+(part+1) : "")  /*+page.scoring*/ + "</td>";
			if (page.scoredQuestion || page.style=="Text Essay")
				if (score==null)
					row+= '<td>'+niceTime(page.timeSpent)+'</td>' +'<td>-</td>' +'<td>-</td>' +'<td>&nbsp;</td>';
				else
					row+=  '<td>'+niceTime(page.timeSpent)+'</td>' +'<td>'+page.attempts+'</td>'  +'<td>'+score.grade+'</td>' +'<td>'+score.text+'</td>';
			else
				row+= '<td>'+niceTime(page.timeSpent)+'</td>' +'<td>&nbsp;</td>' +'<td>&nbsp;</td>' +'<td>&nbsp;</td>';
			row += "</tr>";
			pagetypes[page.scoredQuestion?0:1]+=row;
		}				
	}
	ScoreDetails = pagetypes[0]+pagetypes[1];
}

function scoreAndShowFeedback(grade,answerid,answerText,partid, fbID, feedbackText,branch)
{	// save score, display feedback at specified location with Jump button activated, if applicable. 
	saveScore(grade,answerid,answerText,partid);
	showFeedback(grade,answerText,fbID,feedbackText,branch,answerText); //(answertext.length<30 ? answertext : answertext.substr(0,30)+"...")
}





function joinQuotes(matches, join)
{
	var phrases="";
	for (var m=0;m<matches.length;m++)
	{
		if (m>0) phrases += join;
		//phrases += "\""+matches[m]+"\"";
		phrases += "&ldquo;"+matches[m]+"&rdquo;";
	}
	return phrases;
}




function cleanString(str)
{	// 9/27/04 Remove line breaks and extra white space.
	// 09/24/04 replace paragraph breaks-replaced with single white spaces
	// TODO regex this!
	for (var i=0;i<str.length;i++)
		if (str.charCodeAt(i)<32)
			str=str.substring(0,i)+" "+str.substring(i+1);
			
	// 05/06/2005 strip off leading spaces
	while (str.length>0 && str.charCodeAt(0)==32)
		str=str.substring(1,str.length)
	
	// strip off white space at the end
	while (str.length>0 && str.charCodeAt(str.length-1)<=32)
		str=str.substring(0,str.length-1)

	// convert all multispaces into a single space
	while (str.indexOf("  ")>0)
		str=str.replace("  "," ");
	return str;
}


function TextEssay_report()
{
	return [
		trow("Question",page.text),
		trow("Sample text", page.initialText!="" ? page.initialText : 'Unused'),
		trow('Correct text',page.correctText!="" ? page.correctText : 'Unused'),
		trow('Feedback',page.feedbackShared)];
}



function Sliders_ShowText(val)//Return caption for slider
{
	var txt
	if (page.style==STYLE_NUMBER) 	  txt= "&nbsp;" +val
	else if (page.style==STYLE_DOLLAR) txt= "$&nbsp;" +val
	else if (page.style==STYLE_PERCENT) txt= val+"&nbsp;%"
	else
	{
		if (val<0 || val>=page.phrases.length) val=0;
		txt= page.phrases[val];
	}
	return "<font color=green><b>" + txt + "</b></font>"
}
//
