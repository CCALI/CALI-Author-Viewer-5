// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, Version: 08/31/2016    09/12/2014 

// Constants 
var ViewerVersion="08/31/2016"; 
var kPOPUP="Pop-up page";
var pageCONTENTS='Contents';//The First page of the book.
var pageABOUT="About this lesson";
var pageTOC="Table of Contents";
var pageLessonCompleted="Lesson Completed";
var RIGHT="RIGHT";
var WRONG="WRONG";
var INFO="INFO";

// Classess

/** 
 * @constructor
 * @struct
 * @this {TPage}
 */
function TPage()
{	// This represents a single page within the lesson book.
	this.id="";//unique id
	this.name="";//unique but author chosen name
	this.type="";//type of page interaction
	this.style="";//subtype of page interaction
	this.text="";//text of question
	this.nextPage="";//default for next page
	this.nextPageDisabled=false;//boolean - if true, next page button is disabled.
	this.destPage=null;
	this.columns=0;
	this.details=[];
	this.captions=[];
	this.feedbacks=[];
	this.feedbackShared="";
	this.attempts=0;//number of attempts to answer this question
	this.scores=[];//array of TScore.
	this.scorePoints="";// point value for the current page
	this.xml=null;
	this.textMatches=null;//array of TextMatch
	this.sortName="";
	this.alignText="";
	this.subq=null;//
	this.timeSpent=0;//seconds spent on this page
	return this;
}
function TBook()
{	// This is the Book representing a lesson.
	this.description="";
	this.pages={};// associative array of pages TPage() by page name. E.g., pages["Contents"] = TPage()
	this.mapids=[];// array of mapids indices	
	this.assets=[];//array of images for preloading.
	return this;
}
function TScore()
{	// Grade recording - 
	// multiple choice:  id=1,2,3, text="A","B","C", grade="RIGHT","WRONG","MAYBE"
	// short text: id=1,2,NOMATCH; text="hearsay","evidence","blah"
	this.grade="";//RIGHT,WRONG,MAYBE
	this.id=""; // 1,2,3
	this.text=""; // "A", "Yes", "hearsay", "my essay answer"
	//this.part=""; // Optional: for ManyMultiple choice: 1-6
	this.page=null;//pointer to TPage.
}

var DEL="{tab}";
function TextMatch(matchstyle,matches,feedback,grade,dest)
{
	this.matchstyle=matchstyle
	this.matchlist=matches
	this.feedback=feedback
	this.grade=grade
	this.dest=dest
}
//
