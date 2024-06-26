// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, Version: 09/11/2014

// Global variables 
var book; // =new TBook();
var pageTextDIV;//ref to navigation DIV
var pageInteractionDIV;//ref to viewer DIV
var bookXML;
var bookInfoXML;
var PopupsList = [];//list of sorted popup pages
var PagesList = [];//list of sorted normal pages
var vertMinWidth = 500; // window narrower than this switches to vertical layout.
var vertical = false;// vertical layout (for narrow display)
//var pageHistory=[];//array of bookmark history - names of pages visited for use with Back/Next navigation.
/**
 * The message hex ID.
 * @type {TPage}
 */
var page = null;//pointer to current TPage();
var textBuffer = "";//any text we'd like to have appear at the top of the next page such as errors or feedbacks.
var ScorePossible = 0;// questions answered
var ScoreCorrect = 0;//questions got correct 
var ScorePercent = "";//correct/total
var ScoreTotalQuestions = 0;// count of all scored questions
var ScoreTotalPages = 0;//count of all score pages
var ScoreDetails = "";
var lessonReviewMode=false;//If true, Lesson Review mode, set true when resuming a lesson with a COMPLETE=1 in score data.
var doGrade = null;
var doReveal = null;
var pageInstructions="";//03/24
var globalToolbarLinks = [];// array of author defined toolbar links. form:  {text:'caption',url:'page name'}
var inCA = false;

var StartBook = "";
var StartPage = "";
var jqPath;//
var bookMark;//hash tag on lesson load




//###############################################
// CAV1.js 8/2010 CALI Author Viewer - Function set 1

var embed = 1;

function getHash(url)
{	// Return hash suitable as a page name
	var hash=url.hash.substr(1);
	if (hash==null) hash="";
	return unescape(hash);
}
function getPath(url)
{	// return path of url (minus the file name, querystring and hash)
	var p;
	p=url.lastIndexOf('#');
	if (p<0) p=url.lastIndexOf('?');
	if (p>=0) url=url.substr(0,p);
	p=url.lastIndexOf('/');
	if (p<0) p=url.lastIndexOf('\\');
	url = url.substr(0,p+1);
	//p=url.indexOf('://');
	//if (p>=0){ url=url.substr(p+3);url=url.substr(url.indexOf('/'));}
	return url;
}
function getHostname(url) 
{	// return only the hostname.
	url=url.toString().split("://");
	if (url.length==1) return url;
	else return url[1].substr(0,url[1].indexOf('/'));
//	var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
//	return str.match(re)[1].toString();
}
function isLocalFile()
{
	return false;//true;//location.href.match(/^[file|localhost]:\/\//)
}
function isLocalFF()
{	// local firefox security prevents use of parent.location.
	return false;//5/29/18 //$.browser.mozilla && isLocalFile();
}
function locationForHash()
{	// return location that we can SET (hack for FF)
	return (embed && isLocalFF()) ? location : parent.location;
}
function setHash(name)
{
	if (getHash(locationForHash())!=name)
		locationForHash().hash=escape(name);
}



function sortPageBySortName(a,b)
{
	return icaseCompare(a.sortName,b.sortName);
}
function showTOC(show)
{	// Required to allow programmatic toggling of TOC (such as going to page 'Contents')
	let collapsed=!$('#cl-hamburger').prop('checked');
	let shouldCollapse = (show===undefined) ? !collapsed : !show;
	//console.log({fnc:showTOC,show:show,collapsed:collapsed,shouldCollapse:shouldCollapse});
	$('#cl-hamburger').prop('checked',shouldCollapse);
	if (!shouldCollapse)
		$('#SliderControl').fadeIn(300);
	else
		$('#SliderControl').fadeOut(300);
	$('.toc-view').toggleClass("toc-view-close",shouldCollapse);
	$('.lesson-view').toggleClass("lesson-view-close",shouldCollapse);
}

function processBook()
{
	updatePageLists();
	tallyScores();
	
	$('#Assets').empty();
	if ( 0 )
		// Preload all images. Need a better image cacher that doesn't slow down the browser. 
		for (var a=0;a<book.assets.length;a++)
		{	// preload all normal images.
			$("<img>").attr( { src: book.assets[a]}).appendTo('#Assets');
		}
	
	$("#Loader").hide();
	$("#Viewer").show();
	if (!inCA)
	{
		book.SelfPublished=false;
		if ((book.qw) ||(lessonPath.indexOf('/ap/')>=0)||(lessonPath.indexOf('/publisher/')>=0))
		{
			book.SelfPublished=true;
			$('img.CL-logo').attr('src','img/APLessonLogo.gif').removeClass('CL-logo');
		}
		if (StartPage=='') StartPage=pageABOUT;//pageCONTENTS;//
		gotoPage(StartPage);
		doAutoNextTOC();
		downloadScore();
	
		// 5/2018 TOC revised.
		let page=book.pages[pageCONTENTS];
		$('#SliderControl ul:first').replaceWith('<ul class="nav nav-list-main">'+page.text+'</ul>');
		$('label.nav-toggle a').click(function () {
			$(this).parent().parent().children('ul.slider-left').toggle(300);
		});
		$('.toggle-icon').click(function(){// Expand/collapse sub level
			$(this).find('a').toggleClass('glyphicon-plus glyphicon-minus');
			return false;
		});
		$('.visited').click(function(){	//Flag TOC link as visited
			$(this).addClass('toc-visited');
		});
		$('.CL-hamburger').click(function () {//slider menu
			showTOC();
		});
		$('.toc-link').click(function () {// Jump to page, close TOC.
			showTOC(false);
			navHREF($(this).attr('href'));
			return false;
		});
		showTOC(StartPage==pageCONTENTS);
	}
}

function updatePageLists()
{
	PopupsList=[];
	PagesList=[];
	for (var p in book.pages)
	{	// while p is now the page name, might be the ID instead, so should use page.name for certain.
		var page=book.pages[p];
		if (page.name==pageCONTENTS)
		{
			$("#TOCList").html(page.text);
		}
		else
		{
			if (page.type==kPOPUP)
				PopupsList.push(page)
			else
				PagesList.push(page);
		}
	}
	PagesList.sort(sortPageBySortName);
	var txt="";
	for (var p in PagesList)
		txt+='<li class="NavPage">'+pageLink(PagesList[p].name,false);
	$("#PagesList").html(txt);
	
	PopupsList.sort(sortPageBySortName);
	var txt="";
	for (var p in PopupsList)
		txt+='<li class="NavPage">'+pageLink(PopupsList[p].name,true);
	$("#PopupsList").html(txt);
	
}
function addError(msg)
{
	textBuffer += msg;
}



//#######################################################
// CAV2.js 8/2010 CALI Author Viewer - Function set 2

var traceCount=0;
function trace()
{
	if (this["console"]!=null) console.log(Array.prototype.slice.call(arguments).join(", "));
//	$('#dataTrace > table >tbody tr:first').after('<tr class='+ (traceCount%2==0?"even":"odd") + '><td>'+ (traceCount++) +"</td><td class=info>" + Array.prototype.slice.call(arguments).join(", ")  +"</tr></tr>");
}

function iefix(url)
{
	//5/29/18 if ($.browser.msie && url.substr(url.length-1)=='/')
	//	url=url.substr(0,url.length-1);
	return url;
}

function icaseCompare(a,b)
{
	a = String(a).toUpperCase(); 
	b = String(b).toUpperCase(); 
	if (a > b) 
		return 1;
	if (a < b) 
		return -1;
	return 0; 
}

function showProps(name,thing)
{	// 10/13/10
	var v="";
	var val;
	for (var p in thing)
	{
		if (typeof(thing[p])=="function")
			val="function";
		else
			val=thing[p];
		v += name+"."+p+"=<b>"+val+"</b>, ";
	}
	return v;
}
function now()
{
	return new Date().toString()
}

function decodeHTML(html)
{
	return  html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
//#######################################################
// Language file loaded from lang variable in CAV_lang.js.
// 02/2011 CALI Author Viewer - Language traanslation.
lang.CALI='CALI';
function t(msg)
{	// e.g, alert(t("Do not mix {1} with {2}","apples","oranges") );
	for(var a=1;a<arguments.length;a++)
		msg=msg.replace("{"+a+"}",arguments[a]);
	return JSTextNoHTML(msg);
}
function thtml(msg)
{	// e.g, alert(t("Do not mix {1} with {2}","apples","oranges") );
	for(var a=1;a<arguments.length;a++)
		msg=msg.replace("{"+a+"}",arguments[a]);
	return msg;
}
 


function patchLink()
{	// todo jquery .live() handler instead

	$('#LessonControl a[href^="http"], #Lesson a[href^="https"]').unbind('click').click(function(e){
		e.preventDefault();
		window.open($(this).attr('href'));
	});//03/14/22 Open all question, choice and feedback links in new window.
	
	
	$('#LessonControl a[href^="jump"]').unbind('click').click(navClick);
	//$('#SliderControl a[href^="jump"]').unbind('click');//Bitovi 
	$('#Lesson a[href^="popup"]').unbind('click').click(navClick);
	$('#Lesson a[href^="choice"]').unbind('click').click(navClick);
	$('#Lesson a[href^="lesson"]').unbind('click').click(navClick);
	$('#Lesson .hotspots .hotspot,#zoomin .hotspots .hotspot').unbind('click').click(navClickSpot);
	$('#Lesson .zoomin, div.PageText * .picture #picture').unbind('click').click(function(){return lightbox($(this).attr('href'))});
	$('#Lesson a[href^="lesson"], #Lesson a[href^="http"], #Lesson a[href^="https"]').each(function()
	{
		if (!$(this).attr("target")) $(this).attr("target","_blank");
	});

	
	
	$('#Lesson a[href^="jump"], #Lesson a[href^="popup"]').each(function()
	{
	   var pagename = iefix( ($(this).attr('href').split('://')[1]));
	   if (pagename != pageTOC)
         if (book.pages[pagename] && (book.pages[pagename].timeSpent>0)) $(this).addClass('visited')
		//$(this).attr('href', (embed ? parent.location : location) + '#' + )	
	});

	
	$('.ReadText img').each(function()
	{	// Adjust embedded image width/heights. avoid zoom but also allow big images to be reduced to fit.
		var href=$(this).attr('src');
		if (href.indexOf('/')>=0 || href.indexOf('\\')>=0) return;
		href=fixMediaPath(href);
		$(this).attr('src',href);
		$(this).removeAttr('width');//width('100%');
		$(this).removeAttr('height');
		$(this).css('max-width','100%');
		$(this).css('max-height','100%');
		//$(this).wrap('<div class=picture><a class=externalLink target=_blank href="'+href+'"></a></div>');
		$(this).wrap('<div class=picture></div>');
	});
	
}

function gotoPage(pageName, skipCA)
{	// Load page with given id. 
	// null does nothing. blank, topic page, or missing page, always points to table of contents.
	if (pageName==null) return;
	if (pageName=="null") return;
	if (pageName=='')
		pageName="Contents"//"About this lesson";
	if (pageName==pageTOC)
		pageName="Contents";
		
	if (inCA && (skipCA!=true))
	{	// let CA handle navigation. 
		requestHostData("GOTOPAGE|"+pageName);
		return;
	}
	
	
	// Record how long we spent on the current page before switching to the next.
	if (page)
	{
		if (page.startSeconds) page.timeSpent += Math.ceil(curSeconds() - page.startSeconds);
	}
	
	
	
	//set hash below instead //top.location.hash=pageName;
	page = book.pages[pageName];
	
	$('#open-tudor').hide();
	$('#zoomin').remove();
	$('.PageBorder').show();
	if (page==null )
	{	//didn't find! 
		//trace('Page not found:'+pageName);
		addError(t(lang.PageMissingReturnTOC,pageName));
		page=book.pages[pageCONTENTS];
	}
	else
	if (page.type=="Topics")
	{
		// Possible with nested menus, so default TOC.
		// Bitovi - Slide TOC into view, use blank page.
		showTOC(true);
		page=book.pages[pageCONTENTS];
		doAutoNextTOC();
	}

	setHash(page.name);// Change hash to match this page. this allows browser navigation.

	
	// 8/31/2016 SJG Record lesson page visit to Piwik
  if (_paq) {
	 var lid=0;
	 var piwikURL ='/lesson/run/'+ book.lesson +'/'+lid+'/jq/page/'+escape(page.name);
	 _paq.push(['setCustomUrl', piwikURL]);
	 _paq.push(['setDocumentTitle',  book.lesson + ' | ' + escape(page.name)   /*+' | ' + parent.document.title*/]);
	 _paq.push(['trackPageView']); 
  }
	
		
	page.startSeconds = curSeconds();// remember when we've seen this page.
	page.destPage=null;// Clear setting to allow user to choose new feedback branch path if revisiting old question.


	renderPage();
	
	if (page.mapid ){
		focusNode($('.map > .node[rel="'+page.mapid+'"]'))
	}
				
	
	scrollIntoView($('#Viewer'));
	//if (!localFF()) parent.scrollTo(0,0);//Scroll back to top 
	//window.scrollTo(0,0);//Scroll back to top
	ScoreDirty();
	updateProgressCircle();
}


function note(msg)
{
	trace('note:'+msg);
	showFeedback(INFO,"Note","#fbText",msg);
}
function tryitonce()
{
	note(t(lang.TryOnce));
}
function gradeButton()
{
	//return '<a class=HyperButton href=# id=grade>'+t(lang.GradeAnswer)+'</a>';
	return '<a href="#" id=grade alt="Grade my answer button" class="xHyperButton"><button type="button" class="CL-btn CL-grade-btn shine">'+t(lang.GradeAnswer)+'</button></a>';
	//<a href="#" alt="Grade my answer button disabled"><button type="button" class="CL-btn CL-grade-btn btn-disabled">Grade my answer</button></a>
}
function reviewButton()
{
	//return '<a class=HyperButton href=# id=grade>'+t(lang.ReviewAnswer)+'</a>';
	return '<a href="#" id=grade alt="Grade my answer button" class="xHyperButton"><button type="button" class="CL-btn CL-grade-btn shine">'+t(lang.ReviewAnswer)+'</button></a>';
}
function resetButton()
{
	//Unused return '<a class=HyperButton href=# id=reset>'+t(lang.ResetAnswer)+'</a>';
	return '<a href="#" id=reset alt="Grade my answer button" class="xHyperButton"><button type="button" class="CL-btn CL-grade-btn shine">'+t(lang.ResetAnswer)+'</button></a>';
}
function revealButton()
{
	//return "<a class=HyperButton href=# id=reveal>"+t(lang.RevealAnswer)+'</a>';
	return '<a href="#" id=reveal alt="Grade my answer button" class="xHyperButton"><button type="button" class="CL-btn CL-grade-btn shine">'+t(lang.RevealAnswer)+'</button></a>';
}
function helpButton()
{
	return "<a class=HyperButton href=# id=help>"+t('?')+'</a>';
}

function hyperButton(caption,url)
{	// hyperlink styled as button
	return '<a class="HyperButton" href="' +  url + '">' + caption + '</a>';
}

function iButtonIcon(caption,id,icon)
{
	return '<a href="choice://'+id + '"><button class="CL-btn CL-next-btn shine icon-arrow-right">'+caption+'<span class="next-arrow"></span></button></a>';
}


function iNavPage(linkText,cmd,dest,tab,key,title)
{
	return '<A CLASS="choose" HREF="'+cmd+'://'+dest+'" >'+linkText+'</A> ';
}

function GetIcon(IsChecked)
{	// Return appropriate icon given state is checked or not.
	return jqPath+'img/'+(IsChecked?"br1":"br0")+".gif"
}
function helpTextWrapper(txt)
{
	return '<div class="helptext">'+txt+'</div>';
}

/*
function convertToNumber(val)
{	//Return a number by extracting $,%,',', etc.
	var result=""
	for (i=0;i<val.length;i++)
	{
		var ch=val.charAt(i)
		if ((ch>='0' && ch<='9') || (ch=='.') || (ch=='-')) //Allow only digit and period.
			result=result + (ch)
	}
	return result
}
*/

function HTMLReplaceMacros(html)
{	// replace macros in lesson's HTML text.
	return html;
}
function embedPopupHTML(alink,pageName)
{	// Embed after a popup hyperlink.
	var page = book.pages[pageName];
	var txt;
	var popupID
	var grade
	if (page==null)
	{ 	// Didn't find! possible with nested menus, so default TOC.
		//trace('Page not found:'+pageName);
		txt  = t(lang.PageMissing,pageName);
		popupID="popup_err";
		grade=INFO;
	}
	else
	{
		txt= HTMLReplaceMacros(page.text);
		if (page.pictureSrc!=null)
		{
			var imgtxt='<p><img class="fit" src="'+page.pictureSrc+'"/></p>';
			if (page.alignText=="RIGHT" || page.alignText=="BOTTOM")
				txt=txt + imgtxt;
			else
				txt=imgtxt + txt;
		}
		popupID="popup_"+page.id;
		grade=page.style;
		page.timeSpent++;
	}
	$('#'+popupID).hide('fast').remove();
	/*txt='<div id='+popupID+'  class="Feedback ' + grade + '">'
			+'<div class="Icon '+grade+'">&nbsp;</div>'
			+'<div class="Close"><a href="#">&nbsp;</a></div>'
			+'<div class="Title">'+pageName+'</div><br clear=all>'
			+'<div class="Text ReadText">'+txt + '</div>'	
			+'<div class="FeedbackButton">'+hyperButton(t(lang.ClosePopup),'#')+'</div>'
		+ '</div>';
	*/
	txt=popupAlertHTML(grade,popupID,pageName,txt);
	
		
	if ($(alink).hasClass('hotspot')){//add hotspots below media
		//$('.MediaPanel').
		$(alink).parent().parent().parent().after(txt).next().animate({},1,function(){
			scrollIntoView($('#'+popupID));
		}).fadeIn(250,function(){});
	}else{
		$(alink).after(txt).next().hide().animate({},1,function(){scrollIntoView($('#'+popupID).prev(),0);}).fadeIn(500,function(){});
	}
	//$('#'+popupID+' .FeedbackButton a, #'+popupID+' .Close a').unbind('click').click(function(){$(this).parent().parent().animate({},1,function(){scrollIntoView($(this).prev(),0)}).fadeOut(500,function(){$(this).remove()});return false;});
	$('#'+popupID+' button').unbind('click').click(function(){$(this).parent().parent().animate({},1,function(){scrollIntoView($(this).prev(),0)}).fadeOut(500,function(){$(this).remove()});return false;});
	patchLink();
}
function popupAlertHTML(grade,popupID,popupName,popupText)
{
	let bsClass={'RIGHT':'success','WRONG':'error','INFO':'description','MAYBE':'maybe'}[grade];
	return '<div class="panel panel-default" id="'+popupID+'">\
			<div class="panel-heading alert-'+bsClass+'-heading"><h4>'+popupName+'</h4>\
			  <button type="button" class="close" data-target="#'+popupID+'" data-dismiss="alert">\
			  <span aria-hidden="true" class="alert-'+bsClass+'-x">&times;</span><span class="sr-only">'+t(lang.ClosePopup)+'</span>\
				</button>\
			</div>\
			<div class="panel-body alert-'+bsClass+'-body Text ReadText">\
				'+popupText+'\
			</div>\
		  </div>';	
}

function embedHelpHTML(alink,txt)
{	// Embed after athe Help button
	var helpName='Help';
	var popupID="help_msg";
	var grade=INFO;
	$('#'+popupID).hide('fast').remove();
	txt='<div id='+popupID+'  class="Feedback ' + grade + '">'
			+'<div class="Icon '+grade+'">&nbsp;</div>'
			+'<div class="Close"><a href="#">&nbsp;</a></div>'
			+'<div class="Title">'+helpName+'</div><br clear=all>'
			+'<div class="Text ReadText">'+txt + '</div>'	
			+'<div class="FeedbackButton">'+hyperButton(t(lang.ClosePopup),'#')+'</div>'
		+ '</div>';
	$(alink).after(txt);
	$(alink).next().hide().animate({},1,function(){
		scrollIntoView($('#'+popupID).prev());
		}).fadeIn(500,function(){});
	$('#'+popupID+' .FeedbackButton a, #'+popupID+' .Close a').unbind('click').click(function(){
		$(this).parent().parent().animate({},1,function(){scrollIntoView($(this).prev())}).fadeOut(500,function(){$(this).remove()});return false;});
}
function showFeedback(grade,title,fbID, feedbackText,branch,branchChoice)
{	// show feedback with grade= right,wrong,maybe,info
	// fbID is the ID where we write feedback
	// feedbackText is the text to write
	// jumpdest, if specified, replaces Close with a Continue.	
	
	feedbackText = HTMLReplaceMacros(feedbackText);
	
	if (branch && feedbackText=="") 
	{	// Branch with no feedback, is immediate jump.
		navHREF('jump://'+branch);
		return;
	}
	if (feedbackText != "")
	{
		if (branch && page.destPage==null)
		{	// Change destination page to first branching feedback user selects for this page.
			page.destPage=branch;
			//trace(branchChoice+'>'+branch);
			$('.next-caption').text(lang.ContinuePage);
		}

		/*let txt='<div class="Feedback ' + grade + '">'
			+'<div class="Icon '+grade+'">&nbsp;</div>'
			+(
				(branch && page.destPage)? 
				  '<div class="Next"><a href="#">&nbsp;</a></div>'
				: '<div class="Close"><a href="#">&nbsp;</a></div>'
				)
			+'<div class="Title">'+title+'</div><br clear=all>'
			+'<div class="Text ReadText">'+feedbackText + '</div>'
			+'<div class="FeedbackButton">'+hyperButton(  (branch && page.destPage)? t(lang.NextPage):t(lang.ClosePopup),'#')+'</div>'
			+'</div>';
		*/
		let fbID2=(fbID.indexOf('#')==0)?fbID.substr(1):fbID;//03/14/22 Fix bad ID
		let txt=popupAlertHTML(grade,fbID2+'_alert',title,feedbackText);
		$(fbID).empty().append(txt).children('.Feedback').hide().animate({},1,function(){scrollIntoView($(this).parent())}).delay(100).fadeIn(500,function(){});
		patchLink();
		if (branch && page.destPage)
		{	//  If there's a branch, show a Next button.
			// Obsolete: $(".Feedback .FeedbackButton a, .Feedback .Next a").unbind('click').click(function(){$(this).parent().parent().slideToggle("fast",function(){navHREF('jump://'+page.destPage);});return false;});
		}
		else
		{
			$(".Feedback .FeedbackButton a, .Feedback .Close a").unbind('click').click(function(){$(this).parent().parent().animate({},1,function(){
					scrollIntoView($(this).parent().prev());
				}).fadeOut(500,function(){$(this).remove();});return false;});
		}
		if (page.discussion)
			addDiscussionFeedback();
	}
	// Change Skip to Next, if applicable
	//$("#gonext span").text(t('Next')).attr('title',"Next page is "+((page.destPage==null)?page.nextPage:page.destPage)).parent().show();
	
}

var linkAnchor;
var linkHREF;
function navClick()
{	// Any click on any hyperlink calls this first. We can intercept for page links or other.
	//console.log('navClick');
	linkAnchor=this;
	linkHREF=null;
	navClickDelay();
	return false;
}
function navClickSpot()
{
	var grade=$(this).attr('grade');
	var answerid=$(this).attr('hotspot');
	saveScore(grade,answerid,answerid,null);
	linkAnchor=this;
	linkHREF=null;
	navClickDelay();
	return false;
}
function navHREF(href)
{	// Navigate to the href, like 'popup://xyz' or 'jump://cyz'
	linkAnchor=null;
	linkHREF=href;
	navClickDelay();
}
function navClickDelay()
{	// Avoid timing issues by firing outside of this function
	setTimeout("navClickDelayFire()",1);
}
function navClickDelayFire()
{	// Perform actual navigation jump. 
	if (linkAnchor!=null)
		linkHREF=$(linkAnchor).attr("href");
	linkHREF=iefix(linkHREF);
	linkHREF=unescape(linkHREF);
	//console.log(linkHREF);
	var i=linkHREF.indexOf("://");
	var linkcmd;
	var linkurl;
	if (i<0) {linkcmd="";linkurl=linkHREF;}
	else{	linkcmd=linkHREF.substr(0,i);	linkurl=linkHREF.substr(i+3);}
	
	if (linkcmd=="popup")
	{
		embedPopupHTML(linkAnchor,linkurl);
	}
	else
	{
		if (linkcmd=="" && linkurl.substr(0,1)=='#')
		{
			linkcmd="jump";
			linkurl=linkurl.substr(1);
		}
		var pageName=linkurl;
		//if ($.browser.msie)//IE add as slash on the end!
		switch(linkcmd)
		{
			case "choice"://user clicked a choice like A or Yes.
				clickButton(linkurl);
				break;
			case "jump"://hyperlink jump to page
				//historySave(page.name);
				
				let page = book.pages[pageName];
				if (page!=null && page.type==kPOPUP)
				{
					//trace("Warning! Jump to a popup, treat as embed popup instead.");
					embedPopupHTML(linkAnchor,linkurl);
				}
				else
					gotoPage(pageName);
				break;
			case "popup"://hyperlink popup
				//gotoPage(pageName);
				break;
			case "lesson":
				window.open(CALILessonJump(linkurl),'');
				break;
			case "show":
				break;
			default:
		}
	}
}

// Navigation aids

function pageLink(pageName,isPopup)
{
	return "<a href=\"" + (isPopup? "popup" : "jump") + "://"+pageName+"\">"+pageName+"</a>";
}

function gradeIcon(grade)
{
	if (grade==null || grade=="")
		grade="blank";
	return "img/grade-"+(grade).toLowerCase()+".gif";
}

// External communications
function clickAnswer(answer)
{
}

//#######################################################
// CAV_shell.js
// 12/2010 CALI Author Viewer - Glue to run lesson with CALI Author
// Name: createXMLDocument
// Input: String
// Output: XML Document
jQuery.createXMLDocument = function(string)
{
	var browserName = navigator.appName;
	var doc;
	if (browserName == 'Microsoft Internet Explorer')
	{
		doc = new ActiveXObject('Microsoft.XMLDOM');
		doc.async = 'false'
		doc.loadXML(string);
	} else {
		doc = (new DOMParser()).parseFromString(string, 'text/xml');
	}
	return doc;
}



function requestHostData(data)
{
	trace("requestHostData",data);
	$('#dataOutput').html(data);
}

function processHostData(xml)
{	// parse data from CALI Author: Either entire book or a single page update.
	var pageXML = $.createXMLDocument("<data>"+xml+"</data>");
	pageXML=$(pageXML)
	var page;
	//window.onerror=function(msg,url,line){trace(msg,url,line);return true};
	if (pageXML.find("BOOK").xml() != "")
	{	// Received entire book.
		var bookXML=pageXML.first("BOOK");
		parseBookXML(bookXML);
		lessonPath =  bookXML.find('INFO > CBKLOCATION').text();
		var p=lessonPath.lastIndexOf("\\");
		lessonPath=lessonPath.substring(0,p+1);
		//trace(lessonPath);
		requestHostData("PAGE");
		return;
	}
	else
	{
		pageXML.find("PAGE").each(function() {
			page = parsePageXML($(this));
			book.pages[page.name] = page;
			page.id = pid++;
			gotoPage(page.name,true);
			return;
		});
	}
}
function checkForHostData()
{//&lt;PAGE ID=&quot;test&quot;&gt;&lt;/PAGE&gt;
	var xml=$('#dataInput').text();
	$('#dataInput').text('');
	if (xml!="")
		processHostData(xml);
}


var win;// window frame or window's parent.

function initialize()
{
	inCA = parent===self;
	//inCA=false;//debug
	
	if (!isLocalFF()) win=window.parent;else win=window;
	
	//console.log({amode:amode,runid:runid});
	if (amode==0 && (runid=="" || runid==0 || runid==null))
	{	// 11/19/20 To avoid loss of score data, exit lesson if no runid.
		win.onbeforeunload=null;
		parent.location = '/error/refresh';
		return;
	}

	//load language from lesson.html file
	$('#Languages div').each(function(){lang[$(this).attr('ref')]= $(this).html();});
	
	if (!isLocalFile())
	{
		win.onbeforeunload=function(){return t(lang.LeaveLesson,book.title);};
		//if (!$.browser.mozilla)
		//	window.onbeforeunload=function(){return t(lang.LeaveLesson,book.title);};
	}
	
	
	
	
	//5/29/18 if (embed && isLocalFF())
	//{	// firefox running locally can't access lesson folder (parent.location) or cookies without privileges
	//	netscape.security.PrivilegeManager.enablePrivilege( "UniversalBrowserRead");
	//}
	var bookFile="";
	lessonPath= getPath( (embed ? parent.location : location) +"");// retreive parent's location to extract hash
	jqPath = getPath($('#CAVjs').attr('src'));
	StartPage=getHash(embed ? parent.location : location);//get initial hash from main URL
	if (bookFile == "")
	{	// If bookFile not specified directly, assume a default path.
		bookFile=lessonPath + "jqBookData.xml";
	}
	bookMark=getHash(locationForHash());
	//trace('bookMark',bookMark);
	
	
	// if hash tag (representing current page) changes, we're likely going Back.
	win.onpopstate = function(event)
	{	// 09/11/2014 Back button for Chrome
		var anchor=getHash(locationForHash());
		//trace('History change',anchor);
		if (page!=null && anchor!="" && anchor!=page.name)
			gotoPage(anchor);
	};
	setInterval(function(){
		var anchor=getHash(locationForHash());
		//trace('Hash change',anchor);
		if (page!=null && anchor!="" && anchor!=page.name)
			gotoPage(anchor);
	},500 );

	if (PerformanceUpload()==null) runid=null;
 

	/*
	$(top).hashchange( function(){
		// Every time the hash changes!
	})
	*/
	$.isMobile=true;//(screen.width < 500 || navigator.userAgent.match(/(iPhone|iPod|iPad)/i));
	
	pageTextDIV= $(".PageText");
	pageInteractionDIV= $(".PageInteraction");
	$("#Options").hide();//hide Options
	
	$('a#Options-toggle').click(function() {
		$('#Options').toggle(400);
		return false;
  });
	$('a#Tracer-toggle').click(function() {
		$('.Trace').toggle();
		return false;
  });
  $('.UserName').text(dispName).attr('href',urlLessonRuns());
  $('.Copyright').append(' '+ViewerVersion);
  
  
	if (runid==null)
		$('.Exit').remove();
	else
  	if (urlSurvey()==null)
	{
	  $('.Exit').attr('href',urlLessonRuns());
	}
	else
	{
	  $('.Exit').attr('href','#');//urlLessonRuns());
	  $('.Exit').bind('click',function(){
		  $( "#dialog-survey" ).dialog({
				resizable: false,
				closable: false,
				height:175,
				width: 400,
				modal: true,
				buttons: {
					"Yes": function() {
						$( this ).dialog( "close" );
						parent.location=urlSurvey();
					},
					"No": function() {
						$( this ).dialog( "close" );
						parent.location=urlLessonRuns();
					}
				}
			});
		});
  }
  
  $('.OrgName').text(orgName);
  //$('#LessonNavigation').removeClass('hidestart').hide();
   //if (amode==1){// Activate author options
		//OLD $('#HeaderLessonBook').append(' | <a id="facoptions" class="NavClick" href="#">Faculty Options</a>');
		//OLD $('#facoptions').click(function(){$('#LessonNavigation').toggle()});
	//}
	$(window).resize(function()
	{ 
		updateHotSpots();
		// 9/1/10 idea- use window size to auto layout.
		/*var useVertical  = ($(window).width()<vertMinWidth)
		if(vertical!=useVertical)
		{
			vertical=useVertical
			renderPage();
		}*/
	});
	//vertical  = ($(window).width()<vertMinWidth)
	

	$('.ScoringButton').click(ScoreScreenToggle);
	
	$(".toggler").click(function(){$(this).next().slideToggle("fast");return false;}).next().hide();
	$(".togglerfade").click(function(){$(this).next().toggle();return false;}).next().hide();
	$("a.maptoggler").click(function(){$(this).next().toggle(0,function(){
		if (mapSize<0) mapsize(0);return false;
		});return false;}).next().hide();
	
	book = new TBook();
	page = null;
	
	// Load the book, if running outside of CALI Author.

	if (!inCA)
	{
		//trace('Loading '+bookFile);
		$.ajax({
			url: bookFile,
			dataType: "xml", //5/29/18 ($.browser.msie) ? "text" : "xml", // IE will only load XML file from local disk as text, not xml.
			timeout: 45000,
			error: function(data,textStatus,thrownError){
			  alert('Error occurred loading the XML from '+this.url+"\n"+textStatus);
			 },
			success: function(data){
				var bookDataXML;
				//5/29/18 if ($.browser.msie)
				//{	// convert text to XML. 
				//	bookDataXML = new ActiveXObject('Microsoft.XMLDOM');
				//	bookDataXML.async = false;
				//	bookDataXML.loadXML(data);
				//}
				//else
				{
					bookDataXML = data;
				}
				bookDataXML=$(bookDataXML);
				parseBookXML(bookDataXML);
			}
		});
	}
	else
	{	// No book specified, must be running from CALI Author.
		inCA=true;
		$('a[href="choice://goback"]').hide(); // 05/13/2014 Hide Back in CA.
		//$('.NavigationLesson').hide();
		setInterval(checkForHostData,1000);
		requestHostData("INIT");
	}
	
	$('span.t').each(function(){$(this).html(lang[$(this).attr('ref')]);});
	
	// Bitovi
	
	$('#submitFeedback').click(function(){
		//submit feedback
		let feedback = $('#feedbackComment').val();
		/*
		https://docs.google.com/forms/d/e/1FAIpQLSe_SDPlzoxjfthI-zJG-k_kvvHQYM4mlBZjKDU1sNVlFTqcdg/viewform?usp=pp_url
		&entry.1035788757=a&entry.337593368=b&entry.1796155339=c&entry.1297563432=uuuu&entry.632516465=ssss&entry.201134289=o
		&entry.2023326105=lv&entry.998620373=ri&entry.1164044685=ll
		*/
		// 4/4/23 include faculty flag: amode==1
		window.open('https://docs.google.com/forms/d/e/1FAIpQLSe_SDPlzoxjfthI-zJG-k_kvvHQYM4mlBZjKDU1sNVlFTqcdg/viewform?usp=pp_url'
			+'&entry.1035788757='+encodeURI(feedback)
			+'&entry.337593368='+encodeURI(book.lesson)
			+'&entry.1796155339='+encodeURI(page.name)
			+'&entry.1297563432='+encodeURI(userName)
			+'&entry.632516465='+encodeURI(dispName)
			+'&entry.201134289='+encodeURI(orgName)
			+'&entry.2023326105='+encodeURI(book.version)
			+'&entry.998620373='+encodeURI(runid)
			+'&entry.1164044685='+encodeURI(llMode)
			
		);
		$('#feedbackModal').modal('hide');
	});
}//end of load after document

/*
// as of 1.4.2 the mobile safari reports wrong values on offset()
// http://dev.jquery.com/ticket/6446
// remove once it's fixed
if ( /webkit.*mobile/i.test(navigator.userAgent)) {
  (function($) {
      $.fn.offsetOld = $.fn.offset;
      $.fn.offset = function() {
        var result = this.offsetOld();
        result.top -= window.scrollY;
        result.left -= window.scrollX;
        return result;
      };
  })(jQuery);
}
*/


// After page and all JS is loaded, we load the lesson.
$(document).ready(initialize);


function scrollIntoView(target,vertoffset)
{
	var y;
	if (vertoffset===undefined) vertoffset = -50;
	if (target.length==0)
		y=0;
	else
		y=$(target).offset().top;
	//trace(y,vertoffset,target.text().substr(0,50));
	y += vertoffset;//- 50;
	if ( (!isLocalFF()) && ($(parent).scrollTop()>0) && ($('html,body').offset().top==0))
		// scroll the parent instead of iFrame (like iPad)		
		parent.scrollTo(0,y);//WORKS for iPad
		//$('top,html,body').animate({ scrollTop: y  }, 500 );
	else
		$('html,body').animate({ scrollTop: y }, 500 );
}

function styleSheetSwitch(sheet)
{
	//<link href="cavmobile.css" title="cavmobile" media="screen" rel="stylesheet" type="text/css" />
	//trace('styleSheetSwitch='+sheet);
	vertical = sheet == 'cavmobile';
	$('link[title=style]').attr('href',sheet+".css");
}

var $nextTOC;
var AutoNextTOCTimer;
function doAutoNextTOC()
{	// 10/2020 Upon return to TOC, automatically HILITE the next unvisited topic.
	clearTimeout(AutoNextTOCTimer);
	AutoNextTOCTimer=setTimeout(function()
	{
		$('#SliderControl ul:first a').removeClass('toc-hilite');

		var $autoNextTOC;
		var path=[];// Gather nesting sections for next unvisited topic.
		var text='<p>Please use the table of contents to review any part of the lesson.</p>';
		function nest(index)
		{
			var $heading=$('a:first[href^="jump"]',this);
			path.push($heading);
			if (!$autoNextTOC)
				if (!$heading.hasClass('toc-visited'))
					if ($heading.attr('href')!='jump://#')
					{	// Found first heading leading to a page that's not visited yet. Build our nested section message.
						$autoNextTOC=$heading;
						text='';
						path.forEach(function($h,i){if(i<path.length-1)$h.addClass('toc-visited');text+='<ul><li>'+$h.text()});
						text='<p>Press Next to proceed to the next section:</p><p>'+text+'</ul></p>';// Level >1, bullet list.
					}
			
			$('ul:first',this).children('li').each(nest);
			path.pop();
		}
		$('#SliderControl ul:first').children('li').each(nest);
		
		
		
		//#####################
		/*
		$('#SliderControl ul:first a[href^="jump"]').each(function()
		{
			if (!$autoNextTOC)
				if (!$(this).hasClass('toc-visited'))
				{
					if ($(this).attr('href')!='jump://#')
						$autoNextTOC=$(this);
					path.push($(this).text());
				}
		});
		*/
		if ($autoNextTOC)
		{
			$autoNextTOC.addClass('toc-hilite');
			if (page.type=="Topics")
			{	// 11/16/21 Set Next page button for Topic page.
				var pagename = unescape(iefix( ($autoNextTOC.attr('href').split('://')[1])));
				page.destPage=pagename;
				$nextTOC=$autoNextTOC;// Allow Next to flag TOC as visited (same as if clicking in the TOC)
				//var text=path.join('<ul><li>');
				//text='<p>Press Next to proceed to the next section:</p><p><ul><li>'+text+'</ul></p>';// Level >1, bullet list.
				//$('.LinkNavBar').show();
			}
		}			// 12/13/21 What's next if all places visited?
		if (page.type=="Topics")
		{
			pageTextDIV.append('<div class="ReadText"><div style="width: 50%; margin-left: 20%;margin-right: 20%"><div style="display: inline-block;">'+text+'</div></div></div>');
		}
	},100);
}
