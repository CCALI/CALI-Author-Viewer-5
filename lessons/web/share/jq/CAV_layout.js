// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, Version: 09/11/2014


function stickyHeader()
{	// Bitovi
	return;
/*	window.onscroll = function() {myFunction()};
	var header = document.getElementById("stickyHeader");
	var sticky = header.offsetTop;  
	function myFunction() {
	  if (window.pageYOffset >= sticky) {
		 header.classList.add("sticky");
	  } else {
		 header.classList.remove("sticky");
	  }
	}
*/
}


function clickButton(id)
{ 
	if (id=="return")
	{
	}
	else 
	if (id=="TOC")
	{
		gotoPage(pageCONTENTS);
	}
	else
	if (id.indexOf("closefb")>=0)
	{
		return false;
	}
	else
	if (id=="gonext")
	{
		if (page.type=="Topics")
		{	// Find next incomplete topic.
			/*
			page.destPage=null;
			var firstPage=null;
			$('#SliderControl ul:first a[href^="jump"]').each(function()
			{
			   var pagename = iefix( ($(this).attr('href').split('://')[1]));
			   if (pagename != pageTOC)
				{
					if (!firstPage) firstPage=pagename;
					if (!page.destPage && book.pages[pagename] && (book.pages[pagename].timeSpent == 0)) page.destPage=pagename;
				}
			});
			if (!page.destPage) page.destPage=firstPage;
			*/
			if ($nextTOC)
			{	
				$nextTOC.addClass('toc-visited');
			}
			showTOC(false);
		}
				
				
		if (page.destPage)
			gotoPage(page.destPage);
		else
		if (page.nextPageDisabled)
			note(t(lang.NextPageDisabled));
		else
			gotoPage(page.nextPage);
	}
	else
	if (id=="goback")
	{
		win.history.go(-1);//if (!isLocalFF()) parent.history.back();else window.history.back();
	}
	else
	if (page.type=="Multiple Choice"  && (page.style=="Choose List" || page.style=="Choose MultiButtons" || page.style=="Choose Buttons"))
	{
		MulipleChoice_grade(id);
	}
	return false;
}
var imageResize;
function textWithMedia(pageText, page)
{	// Added default question text and any applicable media elements like picture, hotspots, sound, video, animation/slides. 

	var media="";
	var text=HTMLReplaceMacros(page.text);
		
	// Build any media widgets
	if (page.animationSlideSrcs.length>0)
	{	// Slide show
		media += '<div id="slideshow"><ul class="">';
		for (var s=0;s<page.animationSlideSrcs.length; s++)
		{
			media += '<li class=""><IMG SRC="' + (page.animationSlideSrcs[s])+'"/></li>';
			//sample:	<li><a href="http://templatica.com/preview/30"><img src="images/01.jpg" alt="Css Template Preview" /></a></li>
		}
		media+="</ul></div>";
	}
	if (page.pictureSrc!=null)
	{	// Picture with possible hotspots.
		media+='<div class="picture"><img id="picture"  /><div class="hotspots"></div></div>';
		//media +='<a class="zoomin HyperButton Small" href="'+page.pictureSrc+'" title="'+'Image'+'">Zoom</a> ';
		media += '<div class="row">\
			  <span id="zoom" class="zoom zoomin" aria-label="Zoom icon button"><span class="sr-only">Zoom icon button.</span></span>\
			  <span class="description" aria-label="Description icon button"><span class="sr-only">Description icon button.</span></span>\
			  </div><div class="gap"></div>';
		
		if (page.ada!="" || page.hotspots.length>0)
		{
			let hotspots="";
			let hotspotsMap="";
			for (let h=0;h<page.hotspots.length;h++)
			{
				let hotspot=page.hotspots[h];
				if (typeof  hotspot.href=='undefined')
				{
					hotspot.href='#';
					hotspots+='<li>'+ hotspot.ada+'</li>';
				}else
				{
					let pageName=hotspot.href.split('://')[1];
					if (pageName===undefined) pageName=hotspot;
					hotspots+='<li>'+'<a href="'+hotspot.href+'">'+hotspot.ada+' '+pageName+'</a></li>';
				}
			}			
			
			//media +='<a href=# class="togglervert HyperButton Small">'+t(lang.HotSpotDescription)+'</a>'+
			media += '<div class="Transcript">'+ page.ada + '<div class="HotspotList"><ol>'+hotspots+'</ol></div>' +'</div>';
		}
	}
	
	if(page.soundSrc!=null)
	{
		//media+='<div class="sound"><a class=externalLink target=_blank href="'+(page.soundSrc)+'">Play this audio file</a></div>';
		media+='<div class="sound"><audio src="'+(page.soundSrc)+'" controls="controls">'+
			'<a class=externalLink target=_blank href="'+(page.soundSrc)+'">'+t(lang.PlayAudio)+'</a>'+
			'</audio></div>';
		if (page.transcript!="")
		{
			media+='<div class="row"><span class="description" aria-label="Description icon button"><span class="sr-only">Description icon button.</span></span></div>';
			//media+='<a href=# class=togglervert>'+t(lang.AudioTranscription)+':</a>
			media+='<div class="Transcript">'+ page.transcript + '</div>';
		}
	}
	
	var addflowplayer=0;
	if (page.videoEmbedCode!=null)
	{	// Support embedding external video HTML code. Should include the IFRAME portion.
		// 09/13/2016 Ensure youtube embeds are https.
		media+=(page.videoEmbedCode).replace('http://www.youtube.com','https://www.youtube.com');
	}
	else
	if (page.videoSrc!=null)
	{	// HTML5 only. Need flash player for non-iPad.
		var video=page.videoSrc;
		video = video.replace(".flv",".avi");
		//media+='<div class="video"><video width=640 height=320 src="'+video+'" controls="controls"></video>'+'<br><a target=_blank href="'+(video)+'">'+t(lang.playVideo)+'</a></div>';
		var w=480;
		var h=320;
		if ($.browser.webkit)
		{
			video = video.replace(".avi",".mp4");
			media+='<video id=videoplayer controls="controls" tabindex="0" preload="auto"><source src="'+video+'"/>'+'</video>';
		}
		else
		{
			video = video.replace(".avi",".flv");
			media+='<span href="'+video+'" style="display:block;width:'+w+'px;height:'+h+'px"  id="videoplayer"> </span>';
			addflowplayer=1;
		}
		//trace("Video",video);
	}
	
	var html="";
	if (media!="") media = '<div class=MediaPanel>'+media+'</div>';
	if (text!="") text = '<div class=ReadText>'+text+'</div>';
	
	if (text!="" && media != "")
	{	// layout using alignText if has both text and media,
		if (vertical)
				html ="<div class=TextCols1>"+ text+"<HR>"+ '<div style="width:90%;">'+media + '</div></div>';
		else
		switch (page.alignText)
		{
			case "TOP": // text on top
				html ="<div class=TextCols1>"+ text+"<HR>"+media +"</div>";
				break
			case "BOTTOM": // text on bottom
				html ="<div class=TextCols1>"+ media+"<HR>"+text +"</div>";
				break
			case "RIGHT": // text on the right
				html="<table class=TextCols2 cellpadding=15><tr><td width=50%>"+ media +"</td><td>"+text+"</td></tr></table>";//warning - convert to CSS to support narrow screens
				break
			case "AUTO": // text on the left
			case "LEFT":
			default:
				if (text.indexOf('popup://')>=0)
					html="<table class=TextCols2 cellpadding=15><tr><td>"+text+"</td><td width=50%>"+ media +"</td></tr></table>";				
				else
					html= '<div style="width:50%; padding: 15px; float:right; ">'+media +'</div>' +text +'<span style="float: none; width:100%; height: 25px; display: inline-block; clear: both;"></span>';
		}
	}
	else
		html ="<div class=TextCols1>"+ text+ media +"</div>";
	$(pageText).append(html);
	if (addflowplayer) flowplayer("videoplayer", "jQuery/flowplayer/flowplayer-3.2.7.swf");
	
	page.picWidth=0;
	lastSC=0;
	clearInterval(imageResize);
	if (page.pictureSrc!=null){
		var src=page.pictureSrc;
		//if ($.browser.msie) src+= "?"+Math.random(); 
		//trace('attaching image '+src);
		$('#picloader').attr('src','img/ajax-loader.gif').unbind('load');
		$('#picloader').load(pictureLoaded).attr('src',src);
	}

	if (page.discussion && page.type=="Book Page")
	{
		if (page.discussion.layout && page.discussion.layout=='INTRO') // 04/23 Only INTRO style discussion go to top. Others behind Discussion button.
		{	// 4/22 Discussions on book pages are at the top, 75% width.
			var vid='<div ><div style="padding: 10px; width: 75%; height: auto;margin-left: auto;margin-right: auto;"> <video id="videotutor" autoplay controls width="100%"><source src="'+page.discussion.src+'" type="video/mp4"/ ></video> '+discussionVideoTranscriptHTML(page.discussion)+'</div></div>';
			$(pageText).prepend(vid);
		}
	}
}
function discussionVideoTranscriptHTML(discussion)
{	// 7/22 If discussion has trranscript, provide link to expand text.
	if (discussion && discussion.transcript && discussion.transcript!="")
		return '<details><summary aria-controls="transcript_content" tabindex="0" aria-expanded="false" id="show-hide-transcript" > Transcript </summary><div style="max-height:300px;overflow: scroll;" id="transcript_content" aria-live="off" aria-atomic="true" aria-relevant="all" tabindex="0" aria-expanded="false" role="article">'+discussion.transcript+'</div></details>';
	else
		return '';
}

function addDiscussionFeedback()
{	// 01/06/22
	var src=page.discussion.src;
	if ($('#open-tudor').length==0)
	{	// Add a Discussion button next to Next, after first feedback attempt.
		pageInteractionDIV.append('<div id=fbTextDiscussion></div>');
		$('.PageSpecificNav a:first').parent().prepend('<button id="open-tudor" class="CL-btn CL-next-btn shine"><span class="next-caption">Discussion</span></button>');
		$('#open-tudor').click(function(){
			var vid='<div style="width: 100%; height: auto">\
				<video id="videotutor" autoplay controls width="100%"  xwidth="640" xheight="480"><source src="'+page.discussion.src+'" type="video/mp4"/ ></video>'+discussionVideoTranscriptHTML(page.discussion)+'</div>';
			showFeedback(INFO,"Discussion","#fbTextDiscussion",vid);
			$('#fbTextDiscussion').addClass('VideoPopup')
			});
	}
}



function pictureLoaded()
{	// When picture finally loads (and we have width/height), attach hotspots.
	page.picWidth=this.width;
	if (this.width==16)
	{
		return;
	}
	//trace("pictureLoaded :" + $(this).attr('src') + ", "+this.width+"x"+this.height+" xml="+page.srcPicWidth);

	$('#picture').css({'width':'100%' }).attr('src',$(this).attr('src'));
	$('#picture').parent().css({'max-width':this.width,'max-height':this.height});
	imageResize=setInterval(updateHotSpots,1000);
	updateHotSpots();
}
var lastSC=0;
function updateHotSpots()
{	//  Attach hotspots scaled corretly after initial load or window resize event.
	var img=$('#picture');
	if (img.length==0) return;
	var scaledWidth=img[0].offsetWidth;//document.getElementById('picture').offsetWidth;
	var SC=scaledWidth/page.picWidth;
	if (lastSC==SC) return;
	//trace("image size",img[0].offsetWidth,img[0].offsetHeight);
	//trace("updateHotSpots",scaledWidth,page.picWidth,lastSC,SC);
	//if (SC>1) $(img).removeAttr('width');
	lastSC=SC;
	if (SC<.95) $('.zoomin').show(); else $('.zoomin').hide();
	
	if (page.hotspots && (page.hotspots.length>0))
	{	
		$('.hotspots').empty();
		for (var h=0;h<page.hotspots.length;h++)
		{
			var hotspot=page.hotspots[h];
			var coords=hotspot.bounds.split(",");
			if (page.srcPicWidth!=undefined) SC = scaledWidth/page.srcPicWidth; // fix for iPad, use original image size
			coords='left:'+Math.floor(SC*coords[0])+'px; top:'+Math.floor(SC*coords[1])+'px; width:'+Math.floor(SC*(coords[2]-coords[0]))+'px; height:'+Math.floor(SC*(coords[3]-coords[1]))+'px;';
			var div='<div '
				+'id="hotspot'+h+'" '
				+'href="'+hotspot.href+'" '
				+'class="ui-wrapper hotspot hotspot_transparent" '
				+'grade="'+hotspot.grade+'" '
				+'hotspot="'+(h+1)+'" '
				+'style="position: absolute; '+coords+'"></div>';
			$('.hotspots').append(div);
		}
		patchLink();
	}
}





function lightbox(url)
{	// clone existing image/hotspots into full width popup
	$('#Lesson, .PageBorder').hide(); 
	$('#zoomin').remove();
	let txt;
	//txt='<div id=zoomin class="img-frame-modal xFeedback"  style="display:block"><div class="Close"><span class="img-close">×</span></div><div class="Text ReadText"></div><div class="FeedbackButton">'+hyperButton(t(lang.ClosePopup),'#')+'</div></div>';
	txt='<div id=zoomin class="img-frame-modal xFeedback xINFO" style="padding:10px;">'
			+'<div class="Icon Info">&nbsp;</div>'
			+'<span class="img-close">×</span>'
			//+'<div class="Close"><a href="#">&nbsp;</a></div>'
			//+'<div class="Title">'+(page.name)+' Image</div><br clear=all>'
			+'<div class="Text ReadText"></div>'	
			//+'<div class="FeedbackButton">'+hyperButton(t(lang.ClosePopup),'#')+'</div>'
		+ '</div>';

	//txt='<div id="zoominx" class="img-frame-modal"><span class="img-close">×</span><div class="ReadText"><div id="caption"></div></div></div>';
	$(txt).prependTo('#Viewer');
	$('.MediaPanel').clone(true,true).appendTo('#zoomin .ReadText');
	$('#zoomin * .zoomin').remove();
	$('#zoomin * .picture #picture').unbind('click').dblclick(lightbox_unzoom);
	$('#zoomin * .picture #picture').css({width:'100%' });
	$('#zoomin .FeedbackButton a, #zoomin .Close a,#zoomin .img-close').unbind('click').click(lightbox_unzoom)
	$('#zoomin').show();
	updateHotSpots();
	return false;
}
function lightbox_unzoom()
{
	$('#zoomin').remove();
	$('#Lesson, .PageBorder').show();
	updateHotSpots();
	scrollIntoView($('#picture'),0);
	return false;
}










function doReset()
{	// Reset the answer, just redraw the question.
	renderPage();
}
function addNextButton(url,disabled)
{
	disabled=false;// leave it always on for now. 
	$(".PageSpecificNav").append('<div class="container-fluid"><div class="row"><div class="text-center">\
		<a href="'+url+'"><button class="CL-btn CL-next-btn shine icon-arrow-right '+(disabled==true?'btn-disabled':'')+'"><span class="next-caption">'+t(lang.NextPage)+'</span><span class="next-arrow"/ ></button></a>\
		</div></div></div>');
}

function renderPage()
{	// Navbar elements:  back,next,grade,reveal
	doGrade=null;
	doReveal=null;
	doHelp=null;
	pageInstructions="";//03/2024
	page.answered=(page.scores && page.scores.length>0 && page.scores[0])!==null;
	//console.log({name:page.name,timeSpent:page.timeSpent,answered:page.answered});
	pageInteractionDIV.text('');
	pageInteractionDIV.prepend((lessonLive.isTeacher? '<div class="llPageInfo"/>':''));
	$(".PageSpecificGrade").empty();
	$(".PageSpecificNav").empty();
	pageTextDIV.hide().text('');





	if (0)
	{	console.log('Auto Show Answers');
		lessonReviewMode=true;
		page.answered=true;
		page.nextPageDisabled=false;
	}
	

	if (textBuffer!="")
	{
		pageTextDIV.text(textBuffer);
		textBuffer="";
	}
	$(".PageName").text(page.name);//.append('<span class="Trace">(Type='+page.type+', Style='+page.style+')</span>');
	if (amode==1)
	{
		$('.faculty-view').html('<a target="LessonText" href="'+LessonTextJump(page.name)+'" class="faculty-link">'+t(lang.FacultyView)+'</a>');
	}

	if (!page.timeStamp)
	{	// 05/22 Record first visit to a page.
		page.timeStamp=Date.now();
	}
		
	// Page type specific layout	
	if (page.type=="Topics")
	{
		pageInstructions="<p>You can use the Table of Contents to go to any section of the lesson. <p>You can also just use the Next button which will automatically guide you through all the sections.</p>";
		$(".PageName").text('');//Continue lesson');
		addNextButton('choice://gonext',false);
	}
	else
	if (page.name==pageABOUT)
	{
		pageInstructions="<p>This help bubble will provide instructions on how to answer different question types as you encounter them. </p>";
		if (llMode!='' || book.SelfPublished)
		{
			var llPrompt='';
			var llTitle='';
			if (llProfName=='')
			{
				llTitle='Self-Published Lesson';
				llPrompt='<p><b>The author of this lesson will be able to see your score.</b></p>';
			}
			else
			{
				llTitle='LessonLink';
				llPrompt='<p>'+ 'Prof. '+llProfName+'<br />'+llCourseName+'<br /> '+llSemester+'<br />'+llSchoolName +'</p>'+'<p><b>This is a LessonLink lesson. Your score for this lesson will be visible to Prof. '+llProfName+'</b></p>';
			}
			pageTextDIV.append('<div class="panel panel-default"><div class="panel-heading alert-description-heading"><h4>'+llTitle+'</h4></div><div class="ReadText panel-body alert-description-body">'+llPrompt+'</div></div>');
		 }
		pageTextDIV.append('<div class="ReadText">'+page.text+'</div>');
		if (runid == null)
		{
			pageTextDIV.append('<div class="Feedback INFO"><div class="Text ReadText">'+thtml(lang.ScoreSaveOffNote)+'</div></div>');
		}

		pageTextDIV.append('<div class="panel panel-default"><div class="panel-heading alert-description-heading"><h4>Instructions</h4></div><div class="panel-body alert-description-body Text ReadText" id="aboutInstructions"></div></div>');
		//$(".PageSpecificNav").append(hyperButton(t(lang.TOC),'jump://'+pageTOC));
		updateInstructions()
		addNextButton('jump://Table of Contents');
	}
	else
	if (page.name==pageLessonCompleted)
	{
		LessonCompleted_layout();
	}
	else
	if (page.type==kPOPUP)
	{	
		//pageTextDIV.append('<div class="TextCols1 ReadText">'+page.text+'</div>');
		textWithMedia(pageTextDIV,page);
	}
	else
	{
		if (page.answered)
		{
			pageTextDIV.append('<div class="Text ReadText grade-fb grade-'+INFO+'"><p><i>Your response has already been recorded for this run.</i></p></div>');
		}

		textWithMedia(pageTextDIV,page);
		if (page.type == "Book Page")
		{
			pageInstructions="<p>Review the material and use the Next button to continue. </p>";
			//$(".PageSpecificNav").append(iButton(t(lang.NextPage),'gonext'));
		}
		else
		{
			if (lessonReviewMode)
			{
				if (!page.visits)
					page.visits=1;
				else
					page.visits+=1;
			}
			if (lessonReviewMode && !page.answered)
			{
				page.nextPageDisabled=false;
				pageLessonReviewReport('<div class="grade-fb grade-'+INFO+'"><p>You did not answer this question before reviewing. Unanswered questions cannot be answered in Lesson Review.</p></div>');
			}
			else

			if (page.type=="Multiple Choice" && page.style=="Choose Buttons")					Buttons_layout();
			else if (page.type=="Multiple Choice" && page.style=="Choose List") 				ButtonList_layout();
			else if (page.type=="Multiple Choice" && page.style=="Choose MultiButtons")	MultiButtonList_layout();
			else if (page.type=="Multiple Choice" && page.style=="Radio Buttons") 			RadioButtons_layout();
			else if (page.type=="Multiple Choice" && page.style=="Check Boxes")				CheckBoxes_layout()
			else if (page.type=="Multiple Choice" && page.style=="Check Boxes Set")			CheckBoxesSet_layout()
			else if (page.type=="Text Entry" && page.style=="Text Short Answer")				ShortAnswer_layout();
			else if (page.type=="Text Entry" && page.style=="Text Select")						TextSelect_layout();
			else if (page.type=="Text Entry" && page.style=="Text Essay")						TextEssay_layout();
			else if (page.type=="Prioritize" && page.style=="PDrag")								DragBox_layout();
			else if (page.type=="Prioritize" && page.style=="PMatch")							DrawLines_layout();
			else if (page.type=="Slider")																	Sliders_layout();
			else if (page.type=="GAME" && page.style=="FLASHCARD")								FlashCards_layout();
			else if (page.type=="GAME" && page.style=="HANGMAN")									Hangman_layout();
			else
			{
				pageInteractionDIV.prepend(t(lang.PageTypeUnsupported));
			}
			
			if (doGrade!=null) $("#grade").click(doGrade);
			//if (!page.nextPageDisabled)	$(".PageSpecificNav").append("<P>"+iButton(page.attempts==0 ? t('Skip') : t('Next'),'gonext'));
			if (doReset!=null) $("#reset").click(doReset);
			if (doReveal!=null) $("#reveal").click(doReveal).hide();
			if (doHelp!=null) $("#help").click(doHelp);

		}
		addNextButton('choice://gonext',page.nextPageDisabled);
	}

	$('#pageInstructions').html(pageInstructions);

	var unscored=(page.scorePoints == 0);
	var pageScoreTitle="";
	if (page.scorePoints==="")
		pageScoreTitle='This page does not affect your score.';
	else
	if (page.scorePoints===0)
		pageScoreTitle='Your answer to this question is recorded but does not affect your score.';
	else
	if (page.scorePoints==1)
		pageScoreTitle='This question is worth 1 point.';
	else
		pageScoreTitle='These questions are worth '+page.scorePoints+' points.';
	$('.ScorePoints').text(page.scorePoints).hide();//toggle(!unscored);
	if (!unscored) {
		$('.ScorePoints').delay(500).fadeIn(500);
	}
	$('.PageScore').toggleClass('unscored',unscored).attr('title', pageScoreTitle);
	
	$(".toggler").unbind('click').click(function() {
		$(this).next().toggle('fast');
		return false;
	  });
	$(".description").unbind('click').click(function() {
		$('.transcript').slideToggle('fast');//$(this).next()
		return false;
	});	
	
	$('.PageBorder,.TextCols1,.TextCols2').removeClass('TableWide');
	if ($('.ReadText > TABLE').length > 0)
	{	// for embedded tables, give full width. 
		$('.PageBorder,.TextCols1,.TextCols2').addClass('TableWide');
	}
	
	pageTextDIV.show();
	$("#slideshow").easySlider();
	
	// Add custom toolbars
	if (page.toolbarLinks!=null)
	{
		if (page.toolbarMode=="CLEAR")
			globalToolbarLinks=[];
		for (var tbl in page.toolbarLinks)
		{	// Merge page's toolbar links into global, replace those with same text.
			var tb=page.toolbarLinks[tbl];
			var found=false;
			for (var g in globalToolbarLinks)
				if (globalToolbarLinks[g].text == tb.text)
				{
					globalToolbarLinks[g]=tb;
					found=true;
				}
			if (!found)
			{
				globalToolbarLinks.push(tb);
				tb.fresh=true;
			}
		}
		$('.LinkNavBar').show().html('&nbsp;');
		var newButtonCount=0;
		for (var g=0;g<globalToolbarLinks.length;g++)
		{
			var tb=globalToolbarLinks[g];
			//Bitovi <button class="btn btn-default toolbar-button" type="button"><p>Defined Benefits Plan</p></button>
			$('.LinkNavBar').append('<a class="btn btn-default toolbar-button" type="button" href="'+tb.url+'">'+tb.text+'</a> ');
			//$('.LinkNavBar').append('<a href="'+tb.url+'">'+tb.text+'</a> ');
			if (tb.fresh)
			{	// newly seen toolbars are hilited for the user.
				newButtonCount++;
				$('.LinkNavBar>a:last-child').clearQueue().hide().delay(newButtonCount*250).addClass('hilite').toggle(500).delay(500).queue(function(){$(this).removeClass('hilite')});
				tb.fresh=false;
			}
		}
		$('.LinkNavBar:first:not(:has(a))').hide();
	}
	

	if (page.discussion && ((lessonReviewMode && page.answered)))
		addDiscussionFeedback();
	if (page.discussion && page.type=="Book Page" && (!(page.discussion.layout && page.discussion.layout=='INTRO')))
		addDiscussionFeedback();
	
		
	patchLink();
	stickyHeader();//bitovi
	attachLessonLiveReportToPage();
}

// Handle custom layouts for different page types.

jQuery.fn.outerhtml = function() {
	return $( $('<div></div>').html(this.clone()) ).html();
}
function LessonCompleted_layout()
{
	//oldPageTypeWarning();
//	pageTextDIV.append($('#ScoreReportCert').outerhtml());
	pageTextDIV.append($('.ScoreReport').outerhtml());
	//<span class="ScoreCorrect">correct</span> correct answers out of <span class="ScoreTotal">total</span> questions attempted (<span class="ScorePercent">percent</span>)</td>
	//$(".PageSpecificNav").append(hyperButton(t(lang.TOC),'jump://'+pageTOC));
	$(".PageText .ScoreReport .ScoreButtons").removeClass('hidestart');
	ScoreScreenUpdate();
	if (ScorePossible==0 || lessonReviewMode)
	{
		pageInstructions="<p>You cannot finalize your score until you answer at least one question. </p><p>If you are in Review mode your score cannot be changed.</p>";
		$(".PageText .ScoreReport .ScoreButtons").hide();
	}
	else
	{
		pageInstructions="<p>Follow the instructions provided about finalizing your score. </p>";
	}
}



function MulipleChoice_grade(id)
{
	page.attempts++;
	$('#chooseBtnGrade'+id).fadeIn().css('display','inline-block');

	var fb=page.feedbacks[id];
	var text=fb.text + page.feedbackShared;
	if (!(fb.next && text==""))
	{	// if not a direct branch, show grade icon/color.
		$("#grade"+id).attr("src",gradeIcon(fb.grade));
		$("#"+id).addClass(fb.grade);
	}
	if (page.style=="Choose MultiButtons")
	{
		$("#grade"+fb.detail).attr("src",gradeIcon(fb.grade));
	}
		
	scoreAndShowFeedback(fb.grade,
		(page.style=="Choose List"? fb.detail : fb.button), 
		(page.style=="Choose List"? page.details[fb.detail].letter : page.captions[fb.button]), 
		(page.style=="Choose MultiButtons"? fb.detail : null),
	 	"#fbText"+id, text,fb.next);
	//trace(page.subq+','+fb.detail);
	if (page.style=="Choose MultiButtons")
	{
		if (fb.detail >= page.subq)
		{	// Reveal next subquestion
			page.subq = fb.detail+1;
			$('#subq'+page.subq).delay(1000).fadeIn('slow');
		}
	}
}



let gradeGlyphIconMap={
	RIGHT:'glyphicon glyphicon-ok',
	WRONG:'glyphicon glyphicon-remove',
	MAYBE:'question-symbol',//'btn btn-default CL-choose-btn-maybe',
	INFO:'info-symbol' //'btn btn-default CL-choose-btn'
};

function iButton2(caption,id,grade)
{	// Button like 'Yes' which gets a grade icon and error message.
	return '<div class="btn-group"><label id="'+id+'" for="grade'+id+'" class="btn btn-default CL-choose-btn-'+grade.toLowerCase()+' spacer"><input id="grade'+id+'" name="grade'+id+'" autocomplete="off" type="checkbox">'+caption+'</label><div class="hint"><span id="chooseBtnGrade'+id+'" class="'+gradeGlyphIconMap[grade]+' un-spacer" aria-live="polite" role="definition" aria-labelledby="correctAnswer'+id+'"><p id="correctAnswer'+id+'">'+lang[grade]+'</p></span></div></div>';
}





function Buttons_layout()
{	// Page type: Just Buttons like Yes, No, Maybe.

	pageInstructions="<p>Choose the best answer for the question.</p><p>Only your first response is scored. </p>";// Multiple Choice Short

	if (lessonReviewMode && page.answered)
	{	// 05/05/22 Lesson Review version
		var html='';
		var score=page.scores[0];
		var correctid=-1;
		var buttonList="";
		for (var c in page.captions)
		{
			let fb=page.feedbacks[fbIndex(c,0)];
			fb.letter=page.captions[c];
			if (fb.grade==RIGHT) correctid=c;
			var showGrade=score && (c==score.id);
			if (showGrade)
			{	// Ensure Next button follows their answer's feedback branch.
				page.destPage=fb.next;
			}
			buttonList += '<td>'+imgGradeReviewIcon(showGrade?fb.grade:'')+'</td><td><p>'+  fb.letter+'</p></td>';
		}
		html+='<table><tr>'+buttonList+'</td></tr></table>';
		if (score && score.grade==RIGHT)
		{
			html+=textReviewFeedback('<div>Your answer <b>'+page.captions[score.id]+'</b> was correct and the response was: </div>',fbIndex(score.id,0));
		}
		else
		{
			if ((correctid>=0) && ((page.nextPageDisabled && !page.destPage)) || page.visits>1)
			{	// Next page disabled but dest page wasn't set (student's answer didn't have a branch), grab it from correct answer.
				//console.log({fbIndex:fbIndex(0,correctid),fb:page.feedbacks});
				page.destPage=page.feedbacks[fbIndex(correctid,0)].next;
			}
			if (score)
				html+=textReviewFeedback('<div>You answered <b>'+page.captions[score.id]+'</b> and the response was:</div>',fbIndex(score.id,0));
			if (correctid>=0)
				html+=textReviewFeedback('<div>The correct answer was <b>'+page.captions[correctid]+'</b> and the response was: </div>',fbIndex(correctid,0),false);
		}
		if (page.visits>1)
			html=lessonReviewBranchNotice()+html;
		pageLessonReviewReport(html);
	}
	else
	{
		let choicesText="";
		let ll='';
		let fbText="";
		for (let c in page.captions)
		{
			let fb=page.feedbacks[fbIndex(c,0)];
			fb.letter=page.captions[c];
			choicesText +=  iButton2(fb.letter, fb.id,fb.grade);
			ll+= (lessonLive.isTeacher? '<div class=llButton>':'' )+ (lessonLive.isTeacher ? '<div class="llChoice" id="llChoice'+fb.id+'"></div>': '')+(lessonLive.isTeacher? '</div>':'' )+' ';
			fbText += '<div id=fbText'+fb.id+'></div>';
		}
		pageInteractionDIV.append('<div class="btn-group" data-toggle="buttons">' + choicesText+ '</div>\
			<div class="gap"></div><div class="gap"></div><div class="gap">\
			</div><div class=llButton>'+ll+'</div><div id=fbText>'+fbText+'</div>');
		 $('label',pageInteractionDIV).click(function(){MulipleChoice_grade($(this).attr('id'))});
	}
} 


function ButtonList_layout()
{	// Page type: Multiple choice style A,B,C,...
	pageInstructions="<p>Choose the best answer for the question.</p><p>Only your first response is scored. </p>";//Multiple Choice
	var detailsText="";
	if (lessonReviewMode && page.answered)
	{	// 05/05/22 Lesson Review version
		var html='';
		var score=page.scores[0];
		var correctid=-1;
		for (var d in page.details)
		{
			var fbid=fbIndex(0,d);
			var fb=page.feedbacks[fbid];
			fb.letter=page.details[d].letter;
			if (fb.grade==RIGHT) correctid=d;
			var showGrade=score && (d==score.id);
			if (showGrade)
			{	// Ensure Next button follows their answer's feedback branch.
				page.destPage=fb.next;
			}
			detailsText +='<tr valign=top><td>'+imgGradeReviewIcon(showGrade?fb.grade:'')+'</td><td><p>'+  fb.letter+'</p></td><td><div>'+page.details[d].text+'</div></td><tr>';
		}
		html+=('<table>'+detailsText +'</table>');
		if (score && score.grade==RIGHT)
		{
			html+=textReviewFeedback('<div>Your answer <b>'+page.details[score.id].letter+'</b> was correct and the response was: </div>',fbIndex(0,score.id));
		}
		else
		{
			if ((correctid>=0) && ((page.nextPageDisabled && !page.destPage)) || page.visits>1)
			{	// Next page disabled but dest page wasn't set (student's answer didn't have a branch), grab it from correct answer.
				page.destPage=page.feedbacks[fbIndex(0,correctid)].next;
			}
			if (score)
				html+=textReviewFeedback('<div>You answered <b>'+page.details[score.id].letter+'</b> and the response was:</div>',fbIndex(0,score.id));
			if (correctid>=0)
				html+=textReviewFeedback('<div>The correct answer was <b>'+page.details[correctid].letter+'</b> and that response is: </div>',fbIndex(0,correctid),false);
			else
				html+='<div>There was no correct answer for this question. ';//https://www.cali.org/lessons/web/trt32/lessontext.php#Says%209%20of%2011
		}
		if (page.visits>1)
			html=lessonReviewBranchNotice()+html;
		pageLessonReviewReport(html);
	}
	else
	{
		function iButton3(caption,id,grade,text)
		{	// A button like 'A' or 'B' next to paragraph(s) of text with coloring and icon/error text appearing below the paragraph(s).
			return '<div class="btn-group"><label id="'+id+'" for="grade'+id+'" class="btn btn-default CL-choose-btn-'+grade.toLowerCase()+'"><input id="grade'+id+'" name="grade'+id+'" autocomplete="off" type="checkbox">'+caption+'</label><div class="multi-btn-txt">'+text+'</div><div class="hint"><span id="chooseBtnGrade'+id+'" class="'+gradeGlyphIconMap[grade]+'" aria-live="polite" role="definition" aria-labelledby="correctAnswer'+id+'"><p id="correctAnswer'+id+'">'+lang[grade]+'</p></span></div></div><div class="gap"></div>';
		}
		for (var d in page.details)
		{
			var fb=page.feedbacks[fbIndex(0,d)];
			fb.letter=page.details[d].letter;
			detailsText +=  iButton3(fb.letter, fb.id,fb.grade,page.details[d].text)
						//+'<p class="multi-btn-txt">'+'The highlighting means that this is linked to some other page or Pop-up page in the lesson. Creating such pages and pop-up boxes can be very useful to deliver more information to students. Such links can be created in any of your questions or feedback. How these links, pages, and pop-up boxes are created is discussed elsewhere in this lesson. Click on the highlighted word to see where this link takes you'
						+(lessonLive.isTeacher ? '<div class="llChoice" id="llChoice'+fb.id+'"></div>' : '')
						+'<div id=fbText'+fb.id+'></div>';
		}
		pageInteractionDIV.append('<div class="btn-group-vertical" data-toggle="buttons">'+detailsText +'</div>');
		pageInteractionDIV.append('<div id=fbText></div>');
		$('label',pageInteractionDIV).click(function(){MulipleChoice_grade($(this).attr('id'))});
	}
}
function MultiButtonList_layout()
{	// Multiple buttons for multiple items (subquestions)
	pageInstructions="<p>Choose the best answer for the question.</p><p>After completing the first question, a new question will appear below it. Continue to answer any questions as they appear.</p><p>Only your first response to each question is scored. Individual questions are scored separately.</p>";//Multiple Choice Sequence


	let nextD=0;// Find next unanswered subquestion.
	let html='';
	for (let d in page.details)
	{
		let buttonList="";
		
		if (lessonReviewMode && page.answered)// & page.scores[d])
		{	// 05/22 Answered subquestion, show LessonReview style.
			nextD=parseInt(d)+1;
			var correctid=-1;
			let list='';
			var score=page.scores[d];
			for (let c in page.captions)
			{
				let fb=page.feedbacks[fbIndex(c,d)];
				fb.letter=page.captions[c];
				if (fb.grade==RIGHT) correctid=c;
				var showGrade=score && (c==score.id);
				buttonList += '<td>'+imgGradeReviewIcon(showGrade?fb.grade:'')+'</td><td><p>'+  fb.letter+'</p></td>';
			}
			list+='<h3>Question '+(parseInt(d)+1)+'</h3><div>'+page.details[d].text +'</div><table><tr>'+buttonList+'</td></tr></table><hr />';
			if (score && score.grade==RIGHT)
			{
				list+=textReviewFeedback('<div>Your answer <b>'+page.captions[score.id]+'</b> was correct and the response was: </div>',fbIndex(score.id,d));
			}
			else
			{
				if (!score || (score && score.id<0))
					list+='<div>You did not answer this question and receive no credit.</div>';
				else
					list+=textReviewFeedback('<div>You answered <b>'+page.captions[score.id]+'</b> and the response was:</div>',fbIndex(score.id,d));
				if (correctid>=0)
					list+=textReviewFeedback('<div>The correct answer was <b>'+page.captions[correctid]+'</b> and the response is: </div>',fbIndex(correctid,d),false);
			}
			html+='<div class=Report>'+list+'</div>';
		}
		else
		{	// Unanswered subquestion, allow interaction.
			let fbText="";
			html += '<div class="subq" id="subq'+d+'">';
			html += '<table width=100%><tr><td>';
			html += '</td><td>';
			html += '<div class="ChoiceText ReadText">' + page.details[d].text +"</div>";
			for (let c in page.captions)
			{
				let fb=page.feedbacks[fbIndex(c,d)];
				fb.letter=page.captions[c];
				buttonList += iButton2(fb.letter, fb.id,fb.grade)+ (lessonLive.isTeacher ? '<div class="llChoice" id="llChoice'+fb.id+'"></div>':'');
				fbText  += '<div id="fbText'+fb.id+'"></div>';
			}
			html+= '<div class="btn-group" data-toggle="buttons">'+buttonList+'</div>'+'<br clear=all><div class="gap"></div>'+ fbText+'</div></td></tr></table>';
		}
	}
	pageInteractionDIV.append(html);
	pageInteractionDIV.append('<div id=fbText></div>');
	if (nextD<page.details.length)
	{
		$('label',pageInteractionDIV).click(function(){MulipleChoice_grade($(this).attr('id'))});
		// Fade in subquestions
		page.subq=nextD;
		$('.subq').hide();
		$('#subq'+nextD).fadeIn('slow');
	}
}




function iButton(caption,id)
{	// choice option hyperlink styled as button
	return '<a class="HyperButton" href="choice://'+id + '" id='+id+'><span class='+id+'>' + caption + '</span></a>';
}

function oldPageTypeWarning()
{
	pageInteractionDIV.append('<h3>This page type is not in Mobile UX format</h3>');
}
function ShortAnswer_layout()
{
	pageInstructions="<p>Enter your answer into the empty box.</p><p>Once you’ve entered your answer, select “Grade my answer.”</p>";
	
	if ( lessonReviewMode && page.answered)
	{	// Just display correct answer.
		var html="";
		var correctid=-1;
		for (var r=0;r<page.textMatches.length;r++)
		{
			var match = page.textMatches[r];
			if (match.grade==RIGHT)
			{
				correctid=r;
				var matches=match.matchlist.split(DEL.toUpperCase());
				var mtext="";
				switch (match.matchstyle)
				{
					case "MatchContainsAny": //Answer must contain one of the matches.
						//mtext="Contains one of these";
						mtext="contains "+ joinQuotes(matches," or ");
						break;
					case "MatchContainsAll": //Answer must contain each of the matches.
						//mtext="Contains all of these";
						mtext="contains "+ joinQuotes(matches," and ");
						break;
					case "MatchContainsAllInOrder"://Answer must contain each of the matches in order
						//mtext="Contains all of these in order";
						mtext="contains "+ joinQuotes(matches," followed by ");
						break;
					case "MatchContainsNone"://Answer contains none of these
						//mtext="Contains none of these";
						mtext="does not contain "+ joinQuotes(matches," or ");
						break;
					default: // or =
						//mtext="Matches this exactly";
						mtext="is "+ joinQuotes(matches," or ");
				}
				html += '<tr><td><p>If your answer ' + mtext + '</td><td>'+imgGradeReviewIcon(match.grade)+'<td><div class="grade-fb grade-'+match.grade+'">'+match.feedback+'</div></td></tr>';
			}			
		}
		html='<p>Your answer was: '+page.scores[0].text+'</p>'+'<p>The correct answer(s) are:</p>'+'<table>'+html+'</table>';
		if ((correctid>=0) && ((page.nextPageDisabled && !page.destPage)) || page.visits>1)
		{
			page.destPage=page.textMatches[correctid].dest;
		}
		pageLessonReviewReport(html);

	}
	else
	{
		doGrade=ShortAnswer_grade;
		$(".PageSpecificGrade").append('<div style="vertical-align: middle">'
			+"<input type=text id=textResponse name=textResponse rows=2 size=60><BR><BR>"
			+gradeButton()
			+revealButton()
			+'</div>'
			+'<div id=fbText></div><BR>'
			);
		doReveal=ShortAnswer_reveal;
		$('#textResponse').keypress(function(e){if(e.keyCode == 13) { doGrade()}});
	}
}


function TextSelect_layout()
{
	pageInstructions="<p>Within the text inside the box, use your cursor to highlight the most appropriate text for the question, similar to the action of selecting text to copy.</p><p>Once you’ve made your selection, select “Grade my answer.”</p>";
	//https://cali-lesson-video.us-southeast-1.linodeobjects.com/help/Highlight Text Instructions.mp4
	
	let iText= '<div class=EssayTable><div class="row">'+writeEssayOrSelectColumn('col-sm-12',"ANSWER","",page.initialText)+"</div></div>";
	if (lessonReviewMode && page.answered)
	{	// 06/08 Lesson Review - just show text with correct answer hilited.
		//page.scores[0].text user's answer
		let html=iText+textReviewFeedbackRW("<p>The correct selection is:</p>"+"<div class=hilite>"+page.correctText +"</div>"+"<p>and the response is:</p>",true);
		pageLessonReviewReport(html);
	}
	else
	{
		pageInteractionDIV.append(iText);
		$(".PageSpecificGrade").append(gradeButton()+revealButton()).append('<div id=fbText></div>');
		doGrade=TextSelect_grade;
		doReveal=TextSelect_reveal;
	}
}

function TextSelect_grade()
{
	// Grab user answer, trim leading/trailing spaces
	var originalAnswer = $('#ANSWER').getSelection().text;
	var answer=cleanString(originalAnswer);
	//if it's blank, tell user to try
	if (answer=="") {note(t(lang.MakeSelection));return false;}
	$(".PageSpecificGrade #reveal").fadeIn();
	answer=answer.toLowerCase();
	var ok=false
	var correct=cleanString(page.correctText.toLowerCase());
	var p=answer.indexOf(correct); //if p>=0 the correct answer exists within our selection
	if (p>=0)
	{
		var before=answer.substring(0,p).split(" ")
		var after=answer.substring(p+correct.length,answer.length).split(" ")
		// Count the number of spaces in the before and after
		ok=(before.length-1<=page.slackWordsBefore && after.length-1<=page.slackWordsAfter)
	}
	
	page.attempts ++;
	if (ok)
		scoreAndShowFeedback(RIGHT,0,originalAnswer,null,"#fbText", page.rightFeedback,page.rightDest);
	else
	if (page.attempts<=page.hints.length)
		scoreAndShowFeedback(WRONG,0,originalAnswer,null,"#fbText", page.hints[page.attempts-1],null);
	else
		scoreAndShowFeedback(WRONG,0,originalAnswer,null,"#fbText", page.wrongFeedback,page.wrongDest);
	return false;
}

function TextSelect_reveal()
{
	if (page.attempts==0) {tryitonce();return false;}
	var originalAnswer="";
	originalAnswer=page.correctText;
	//showFeedback(INFO,lang.GaveUpHeading,"#fbText",txt);
	scoreAndShowFeedback(RIGHT,0,lang.GaveUpHeading,null,"#fbText","<div class=hilite>"+originalAnswer +"</div>" + page.rightFeedback,page.rightDest);
	return false;
}




var zIndex; // z-order drag items above background

function DrawLines_layout()
{	// 11/23/10 Layout categories on right, items to move on left.
	// TODO This should be drawing lines between item and category.
	// For now, hacked to emulate DragBox behavior, grading is identical anyway.
	//oldPageTypeWarning();
	var cats="";
	var items="";
	var cat0='<ul id=sortable'+0+' class="drawable droptrue">' +  page.categories[0]+ "</ul>";
	for (var c=1;c<page.categories.length;c++)
	{
		cats +=   '<ul id=sortable'+c+' class="drawable droptrue">' +  page.categories[c]+ "</ul>";
	}
	for (var i=0;i<page.items.length;i++)
	{
		items+='<li id=item'+i+' itemid='+i+' class="ui-state-default dragItem dragCollapse"><a href="#" class="dragExpander">[+]</a><span class=dragItemText>'+page.items[i].text+'</span></li>';
	}
	pageInteractionDIV.append("<table class=noborder>"
	  	+"<tr><th align=center >Items</th><th align=center >Matching</th></tr>"
		+"<tr><td width=50%>"+cat0+"</td><td width=50%>"+cats+"</td></tr>"
		+"</tr><table>");
	$("#sortable0").append(items);
	if (page.shuffle) $("#sortable0").shuffle();
	$('.dragItemText').each(function(){
		if ($(this).height()<=$(this).parent().height())
			$(this).parent().find('.dragExpander').hide();
	 });
	$("ul.droptrue li").addTouch();
	$("ul.droptrue").sortable({		connectWith: 'ul'	});
//	$("ul.droptrue li").draggable({		connectWith: 'ul'	});
	
	$("#sortable0, #sortable1, #sortable2, #sortable3").disableSelection();
	//var maxheight=$('#sortable0').height();
	//$('.drawable').css('min-height',maxheight);
	$('a.dragExpander').bind('click', function( )
	{
		var targetContent = $(this).parent();
		if ($(this).text()=="[-]" ) // targetContent.css('overflow') == 'hidden')
		{
			targetContent.removeClass('dragCollapse dragExpanded').addClass('dragCollapse');
			$(this).html('[+]');
		} else
		{
			targetContent.removeClass('dragCollapse dragExpanded').addClass('dragExpanded');
			$(this).html('[-]');
		}
		return false;
	})
	
	$(".PageSpecificGrade")
		.append(gradeButton())
		.append(revealButton())
		.append('<div id=fbText></div>');
	$(".PageSpecificGrade #reveal").click(DragBox_reveal);
	doGrade=DragBox_grade;
}

function Sliders_layout()
{
	//oldPageTypeWarning();
	pageInteractionDIV.append(Sliders_form())
	$(".PageSpecificGrade").append(gradeButton())
		//+revealButton());
		.append('<div id=fbText></div>');
	doGrade=Sliders_grade;
	//$(".PageSpecificGrade #reveal").click(Sliders_reveal).hide();
}



function Slider_choose(s,c)
{	// When user clicks on radio button for slider s, column c, toggle it.
	for (var c2=0;c2<page.phrases.length;c2++)
		$("#button"+s+"-"+c2).attr("src",GetIcon(c==c2));
}
function Sliders_form()
{	//Write form based page.
	var nbars=page.sliders.length;
	var nphrases = page.phrases.length;
	
	var sliderTypeText={};
	sliderTypeText[STYLE_TEXT]="Text";
	sliderTypeText[STYLE_NUMBER]="Number";
	sliderTypeText[STYLE_DOLLAR]="$";
	sliderTypeText[STYLE_PERCENT]="%";

	var txt="";
	var helptext="";
	//helptext+="This table layout is used if your browser doesn't support sliders. Instead, please "
	//if (page.style==STYLE_TEXT)
//		helptext=helptext + (nbars==1?"check the appropriate radio button":"check the appropriate radio buttons for each row")
//	else
		//helptext=helptext +(nbars==1?"enter a value":"enter values for each row")
	//txt += helptext + " then grade your answer.";
	
	txt+=("<table class=SliderGrid cellspacing=0 border=1>");
	if (page.style==STYLE_TEXT)
	{	// User chooses value for each item similar to radio button categorizing.
		txt+=("<tr>");
		txt+=("<th>&nbsp;</th>");
		var w=100/nphrases;
		for (p=0;p<nphrases;p++)
			txt+=("<th align=center width="+w+"%>" +page.phrases[p] +"</th>");
		txt+=("</tr>");
		for (s=0;s<nbars;s++)
		{
			txt+=("<tr>");
			txt+=("<td>"+page.sliders[s]+"</td>");
			for (p=0;p<nphrases;p++)
				txt+="<td align=center><a href=\"\" onclick='Slider_choose("+s+","+p+");return false'>"
					+"<img border=0 id=button"+s+"-"+p+" src=" + GetIcon(p==0) + "></a>"
					+"</td>";
			txt+=("</tr>");
		}
		txt+=("</table>");
	}
	else
	{	// User chooses a numeric value in range MIN to MAX by typing it in.
		txt+=("<tr>");
		txt+=("<th>&nbsp;</th>");
		txt+=("<th align=center nowrap>Enter a " + sliderTypeText[page.style] +" in the range <BR>" + page.MIN + " to " + page.MAX + "</th>");
		txt+=("</tr>");
		for (s=0;s<nbars;s++)
		{
			txt+=("<tr>");
			txt+=("<td>"+page.sliders[s]+"</td>");
			txt+=("<td align=center><input type=textbox size=10 maxlength=10 name=\"slider"+s+"\" value=\"" + page.MIN+"\"></td>"); //
			txt+=("</tr>");
		}
		txt+=("</table>");
	}
	return txt;
}

function FlashCards_layout()
{	// Display all flash card questions with links to show answers.
	var cards="";
	for (var fc=0;fc<page.flashCards.length;fc++)
		cards += 
			 '<div class="flashcard question">'+ page.flashCards[fc].question
			//+' <a href=# class=togglervert>Answer</a>'
			+'<div class="flashcard answer hidestart">'+page.flashCards[fc].answer+"</div>"
			+"</div>";
	pageInteractionDIV.append(cards);
	
	
	$("div.flashcard").unbind('click').click(function() {
		$(this).find("div.answer").slideToggle('fast');
		return false;
	});	
	page.scorePoints="";
}

function Hangman_layout()
{	// not implemented fully, just display for now.
	pageInteractionDIV.append(page.topic +"<ul><li>"+ page.phrases.join("<li>")+"</ul>");
	page.scorePoints="";
}

function ShortAnswer_grade()
{
	//Answers compared in lowercase.

	// Get user's answer.
	var originalanswer=$("#textResponse").val().trim();
	// Convert to lowercase for comparisons.
	var answer=originalanswer.toLowerCase()
	
	// Make sure user types something.
	if (answer=="") {note(t(lang.TypeSomething));return false;}
	
	var resp=-1
	for (var r=0;(r<page.textMatches.length && (resp<0));r++)
	{
		var matches=page.textMatches[r].matchlist.toLowerCase().split(DEL);
		var matchstyle=page.textMatches[r].matchstyle;
		if (matchstyle=="MatchExact" || matchstyle=="") // Answer must match exactly one of the matches.
		{
			for (var m=0;m<matches.length;m++)
				if (matches[m]==answer) {resp=r;break;}
		}
		else
		if (matchstyle=="MatchContainsAny") //Answer must contain one of the matches.
		{
			for (var m=0;m<matches.length;m++)
				if (answer.indexOf(matches[m])>=0) {resp=r;break;}
		}
		else
		if (matchstyle=="MatchContainsAll")  //Answer must contain each of the matches.
		{
			var all=true;//assume all matches are present, then set to false if any are not found.
			for (var m=0;m<matches.length;m++)
				if (answer.indexOf(matches[m])<0) all=false;
			if (all) {resp=r;break;}
		}
		else
		if (matchstyle=="MatchContainsAllInOrder")  //Answer must contain each of the matches in order
		{
			var matchcount=0
			var found=-1;
			for (var m=0;m<matches.length;m++)
			{
				var p=answer.indexOf(matches[m]);
				if (p>found)
				{
					found=p // each part must occur further in the string than the previous.
					matchcount++
				}
			}
			if (matchcount==matches.length) {resp=r;break;}
		}
		else
		if (matchstyle=="MatchContainsNone") // Contains None: Answer must contain NONE of these matches.
		{
			var found=false;
			for (var m=0;m<matches.length;m++)
			{
				if (answer.indexOf(matches[m])>=0)
					found=true;
			}
			if (!found)  {resp=r;break;}
		}
	}

	$(".PageSpecificGrade #reveal").fadeIn();
	// Save it for CALI Quiz, but only first attempt.
	// If user didn't match, the ID will be 0. Otherwise will be >=1.
	page.attempts ++;
	if (resp==-1) 
	{	// A match wasn't found, show any hints.
		if (page.attempts<=page.hints.length)
		{
			scoreAndShowFeedback(WRONG,0,originalanswer,null,"#fbText", page.hints[page.attempts-1],null);
		}
		else
		{
			scoreAndShowFeedback(WRONG,0,originalanswer,null,"#fbText", page.wrongFeedback,page.wrongDest);
		}
	}
	else
	{	// Display grade/feedback for given match.
		scoreAndShowFeedback(page.textMatches[resp].grade,(resp+1),originalanswer,null,"#fbText", page.textMatches[resp].feedback,page.textMatches[resp].dest);
	}
	return false;
}

function ShortAnswer_reveal()
{	// Display all the answers that are matched. 
	if (page.attempts==0) {tryitonce();return false;}
	var txt="";
	for (r=0;r<page.textMatches.length;r++)
	{
		var match = page.textMatches[r];
		var matches=match.matchlist.split(DEL.toUpperCase());
		var mtext="";
		switch (match.matchstyle)
		{
			case "MatchContainsAny": //Answer must contain one of the matches.
				//mtext="Contains one of these";
				mtext="contains "+ joinQuotes(matches," or ");
				break;
			case "MatchContainsAll": //Answer must contain each of the matches.
				//mtext="Contains all of these";
				mtext="contains "+ joinQuotes(matches," and ");
				break;
			case "MatchContainsAllInOrder"://Answer must contain each of the matches in order
				//mtext="Contains all of these in order";
				mtext="contains "+ joinQuotes(matches," followed by ");
				break;
			case "MatchContainsNone"://Answer contains none of these
				//mtext="Contains none of these";
				mtext="does not contain "+ joinQuotes(matches," or ");
				break;
			default: // or =
				//mtext="Matches this exactly";
				mtext="is "+ joinQuotes(matches," or ");
		}
		
		txt += t("If your answer ") + mtext + ":"
			+'<div class="Feedback ' + match.grade + ' Blank">'
			+'<div class="Text ReadText">'+match.feedback+'</div></div>';
		
	}
	showFeedback(INFO,t(lang.GaveUpSA),"#fbText",txt);
	return false;
}

function CheckBoxesSet_reveal()
{
	for (var d in page.details)
	{
		var c=0;
		var cdi =fbIndex(c,d);
		var shouldCheck  = page.feedbacks[cdi].grade==RIGHT;
		$('input[id=cb'+cdi+']').attr('checked',shouldCheck);
		$('#grade'+cdi).attr("src",gradeIcon());
	}
	CheckBoxesSet_grade(true);
	return false;
}



function Sliders_grade()
{
	page.attempts++;
	Sliders_reveal();
/* TODO better jquery sliders
	if (!DHTML && style!=STYLE_TEXT)
	{//For form based numeric entry with text field, peg the values to min/max.
		for (var s=0;s<nbars;s++)
		{
			var sliderelement=document.forms[0].elements["slider"+s]
			val=convertToNumber(sliderelement.value);
			if (val<MIN) { val=MIN;sliderelement.value=val;}
			if (val>MAX) { val=MAX;sliderelement.value=val;}
		}
	}

	if (nbars==1 && feedback.length>0)
	{
		if (DHTML)
			dofeedback(val)// Use 'val' assigned when user drags thumb.
		else
		if (style==STYLE_TEXT)
			dofeedback(val)// Use 'val' assigned when user clicks radio buttons
		else
			dofeedback(convertToNumber(document.forms[0].elements["slider0"].value)) // Extract user's typed in number.
	}
	else
		// More than one feedback is always the rhetorical question.
		showfeedback(defaultfeedback.feedback);
*/
}

function Sliders_reveal()
{
	var nbars=page.sliders.length;
	var nphrases = page.phrases.length;
	if (page.attempts==0) {tryitonce();return false;}
	var txt=""
	var numFeedbacks = page.feedbacks.length;
	if (nbars==1 && numFeedbacks>0)
	{	// Multiple feedbacks for 1 slider?
		for (var part=0;part<numFeedbacks;part++)
		{
			if (page.style!=STYLE_TEXT)
			{
				if (part==0) FROM=page.MIN; else FROM=Math.floor(page.MIN+(part)*(page.MAX-page.MIN)/numFeedbacks)
				if (part==(numFeedbacks-1)) TO=page.MAX; else TO=Math.floor(page.MIN+(part+1)*(page.MAX-page.MIN)/numFeedbacks)-1
				txt+="<tr><td>"+Sliders_ShowText(FROM)+"</td><td>"+Sliders_ShowText(TO)+"</td>"
					+"<td>"	+ "<img src="+gradeIcon(page.feedbacks[part].grade)+">"+ "</td>"
					+"<td>"+page.feedbacks[part].text+"</td></tr>"
			}
			else
			{
				txt+="<tr><td>"+Sliders_ShowText(part)+"</td>"
					+ "<td><img src=" + gradeIcon(page.feedbacks[part].grade) + "?</td>"
					+ "<td>"+page.feedbacks[part].text+"</td></tr>"
			}
		}
		var cap;
		if (page.style!=STYLE_TEXT)
			cap="<th>From</th><th>To</th>"
		else
			cap="<th>"+page.sliders[0]+"</th>"
		txt = ("<table border><tr>"+cap+"<th>Grade</th><th>Feedback</th></tr>"+txt+"</table>");
		scoreAndShowFeedback(INFO,0,"Possible Values",null,"#fbText",txt,'');	
	}
	else
	{
		scoreAndShowFeedback(INFO,0,"Information",null,"#fbText",page.feedbackShared,'');	
	}
	return true;
}









function nthLetter(n){ return "ABCDEFG".charAt(n)+".";}

var CMIN=1;

function addCBHint(cdi,grade)
{	// Attach right/wrong icon to each check box.
	if(grade==null)
	{
		$('#cdi'+cdi+' .hint').hide();
	}
	else
	{
		let classCB={RIGHT:'checkmark-success',WRONG:'checkmark-wrong'};
		$('#cdi'+cdi+' .hint').html('<span class="'+gradeGlyphIconMap[grade]+'" aria-live="polite" role="definition"><p>'+lang[grade]+'</p></span>');
		$('#cdi'+cdi+' .checkmark').removeClass('checkmark-selected').addClass(classCB[grade]);
		$('#cdi'+cdi+' .hint span').fadeIn().css('display','inline-block');
	}
}


function addRBHint(cdi,grade)
{	// Attach right/wrong icon to each radio button.
	if(grade==null)
	{
		$('#cdi'+cdi+' .hint').fadeOut();//('display','block');
	}
	else
	{
		let classRB={RIGHT:'checkmark-rad-success',WRONG:'checkmark-rad-error'};
		$('#cdi'+cdi+' .hint').html('<span class="'+gradeGlyphIconMap[grade]+'" aria-live="polite" role="definition"><p>'+lang[grade]+'</p></span>');
		$('#cdi'+cdi+' .checkmark').removeClass('checkmark-rad-selected').addClass(classRB[grade]);
		$('#cdi'+cdi+' .hint span').fadeIn().css('display','inline-block');
	}
}
function RadioButtons_grade(gaveup)
{
	let isRight=true;
	let caps=page.captions.length;

	if (caps == CMIN)
	{	// 1 column, standard layout, only one correct answer/item
		isRight=false;
		let col=$('input[name=rb0]:checked').val();
		for (let d in page.details)
		{
			let grade;
			let cdi =fbIndex(0,d);
			if (col==d)
			{
				if (page.checks[d][0])
				{
					isRight=true;
					addRBHint(cdi,RIGHT);
				}
				else
				{
					addRBHint(cdi,WRONG);
				}
			}
		}
	}
	else
	{	// Multiple columns, each radio for each item must be correctly set for credit. 
		isRight=true;
		for (let d in page.details)
		{
			
			//for (let c in page.captions)
			//{
				//let cdi =fbIndex(c,d);
				//addRBHint(cdi,null);
			//}
			let col=$('input[name=rb'+d+']:checked').val();
			if (!col)
			{
				isRight=false;
			}
			else
			{
				for (let c in page.captions)
				{
					let cdi =fbIndex(c,d);
					if (col==c)
					{
						if (page.checks[d][col])
						{
							addRBHint(cdi,RIGHT);
						}
						else
						{
							isRight=false;
							addRBHint(cdi,WRONG);
						}
					}
					else
					{
						//addRBHint(cdi,null);
					}
				}
			}
		}
	}
	return cbrbFeedback(gaveup,isRight);
}
function cbrbFeedback(gaveup,isRight)
{	// Feedback for radio or checkboxes.
	page.attempts ++;
	$("#reveal").fadeIn();
	if (isRight)
		scoreAndShowFeedback(RIGHT,1,(gaveup==true ? lang.GaveUpHeading : lang.RIGHT) ,null,"#fbText", page.rightFeedback,page.rightDest);
	else
	if (page.attempts<=page.hints.length)
		scoreAndShowFeedback(WRONG,0,lang.Hint,null,"#fbText", page.hints[page.attempts-1],null);
	else
		scoreAndShowFeedback(WRONG,0,lang.WRONG,null,"#fbText", page.wrongFeedback,page.wrongDest);
	return false;
}

function RadioButtons_reveal()
{
	for (let d in page.details)
	{
		for (let c in page.captions)
		{
			let cdi =fbIndex(c,d);
			$('input[id=rb'+cdi+']').attr('checked',page.checks[d][c]==true);
		}
	}
	RadioButtons_grade(true);
	return false;
}


function CheckBoxesSet_grade(gaveup)
{	// Each check box item gets a custom response for checked and unchecked plus a final right/wrong response for the entire set of checkboxes.
	let isRight=true;
	let c=0;
	for (let d in page.details)
	{
		let cdi =fbIndex(c,d);
		let checked = $('#cb'+cdi).is(':checked');
		let shouldCheck  = page.feedbacks[fbIndex(0,d)].grade==RIGHT;
		let grade;
		if (checked != shouldCheck)
		{
			isRight=false;
			grade=WRONG;
		}
		else
		{
			grade=RIGHT;
		}
		addCBHint(cdi,grade);
		feedbackText = page.feedbacks[fbIndex(checked ? 0 : 1,d)].text;
		showFeedback(grade,'-','#fbText'+cdi, feedbackText,'')
			
	}
	return cbrbFeedback(gaveup,isRight);
}

function CheckBoxes_grade(gaveup)
{	// If box is checked flag as right/wrong. If box unchecked flag as wrong only if wrong to avoid clutter.
	let isRight=true;
	for (let d in page.details)
	{
		for (let c in page.captions)
		{
			let cdi =fbIndex(c,d);
			let checked = $('#cb'+cdi).is(':checked');
			if (checked != page.checks[d][c])
			{
				isRight=false;
				addCBHint(cdi,WRONG);
			}
			else
			{
				if (checked)
				{
					addCBHint(cdi,RIGHT);
				}
				else
				{
					addCBHint(cdi,null);
				}
			}
		}
	}
	return cbrbFeedback(gaveup,isRight);
}

function CheckBoxes_reveal()
{
	for (var d in page.details)
	{
		for (var c in page.captions)
		{
			var cdi =fbIndex(c,d);
			$('input[id=cb'+cdi+']').attr('checked',page.checks[d][c]==true);
		}
	}
	CheckBoxes_grade(true);
	return false;
}


function RadioButtons_layout()
{	// vertical layout: each subquestion followed by radio button list.
	pageInstructions="<p>Choose the best answer for each question or item.</p><p>Once your choices are marked, select “Grade my answer.”</p><p>All selections must be correct to score the point. </p>";//Categorize Single

	if (lessonReviewMode && page.answered)
	{	// 
		let html=textReviewFeedbackRW("<p>The correct answer is:</p>"+textReviewCheckBoxRadioButton()+"<p>and the response is:</p>",true);
		pageLessonReviewReport(html);
	}
	else
	{
		let subQText=CheckBoxRadioButtonColumnHeadings();
		pageInteractionDIV.append(subQText);
		$(".PageSpecificGrade").append(gradeButton() + resetButton() + revealButton()).append('<div id=fbText></div>');
		doGrade=RadioButtons_grade;
		doReveal=RadioButtons_reveal;
	}
}

function CheckBoxes_layout()
{	// vertical layout: each subquestion followed by radio button list.
	
	if (page.captions.length == CMIN)
		pageInstructions="<p>Choose all that apply.</p><p>Once your choices are marked, select “Grade my answer.”</p><p>All selections must be correct to score the point.</p>";//Choose all that apply - 1 checkbox
	else
		pageInstructions="<p>Choose all that apply for each question or item.</p><p>Once your choices are marked, select “Grade my answer.”</p><p>All selections must be correct to score the point.</p>";//Choose all that apply - >1 box
	
	if (lessonReviewMode && page.answered)
	{	// 
		let html=textReviewFeedbackRW("<p>The correct answer is:</p>"+textReviewCheckBoxRadioButton()+"<p>and the response is:</p>",true);
		pageLessonReviewReport(html);
	}
	else
	{
		let subQText=CheckBoxRadioButtonColumnHeadings();
		pageInteractionDIV.append(subQText);
		$(".PageSpecificGrade").append(gradeButton() + resetButton() + revealButton()).append('<div id=fbText></div>');
		doGrade=CheckBoxes_grade;
		doReveal=CheckBoxes_reveal;
	}
}
function CheckBoxesSet_layout()
{	// vertical layout: each subquestion followed by radio button list.
	pageInstructions="<p>Choose all that apply.</p><p>Once your choices are marked, select “Grade my answer.”</p><p>All selections must be correct to score the point. </p>";//Categorize Set
	if (lessonReviewMode && page.answered)
	{
		let html='';
		for (let d in page.details)
		{
			let shouldCheck  = page.feedbacks[fbIndex(0,d)].grade==RIGHT;
			html+='<tr valign=top><td>'+'<input type=checkbox '+(shouldCheck?'checked':'')+'/></td><td>'+(parseInt(d)+1)+'.</td><td>'+page.details[d].text+'</td></tr>';
			html+='<tr valign=top><td colspan=2></td><td><div>'+page.feedbacks[fbIndex(shouldCheck ? 0 : 1,d)].text+'</div>'+'</td></tr>';
		}
		html='<p>The correct answers are:</p>'+'<table>'+html+'</table>';
		pageLessonReviewReport(html);
	}
	else
	{
		page.captions=[""];//fake column
		let subQText=CheckBoxRadioButtonColumnHeadings();
		pageInteractionDIV.append(subQText);
		$(".PageSpecificGrade").append(gradeButton() +  resetButton()  + revealButton()).append('<div id=fbText></div>');
		doGrade=CheckBoxesSet_grade;
		doReveal=CheckBoxesSet_reveal;
	}
}








function CheckBoxRadioButtonColumnHeadings()
{	// Generate columns/rows for checkbox and radio button types
	// 1 column yields standard looking cb/rb.
	// >1 column yields each item followed by cb/rb labeled A., B., C., etc. with key above.
	
	// Column Headings
	let html="";
	let radio=(page.style=="Radio Buttons");
	let caps=page.captions.length;
	//trace('CheckBoxRadioButtonColumnHeadings '+radio+' '+caps);
	if (caps == CMIN)
	{	// 1 column, standard layout
		for (let d in page.details)
		{
			let c=0;
			let cdi =fbIndex(c,d);
			let cbcol="cbcol";
			html += '<div class="btn-group" id="cdi'+cdi+'">'+ (radio ?
					'<label class="btn radio-container">   <input type=radio    name=rb'+c+'   id=rb'+cdi+' value='+d+' /><span class="checkmark checkmark-rad-selected"></span></label>' : 
					'<label class="btn checkbox-container"><input type=checkbox name=cb'+cdi+' id=cb'+cdi+' value='+d+' /><span class="checkmark checkmark-selected"></span></label>' )
				
          +page.details[d].text
          +'<div class="hint"></div>\
        </div>\
		  <div id="fbText'+fbIndex(0,d)+'"></div>'
		}
	}
	else
	{	// Need captions for each rb/cb.
		//for (let c=0;c<page.captions.length;c++)
		//{
		//	html+= '<div>'+(c+1) +'&nbsp;' + page.captions[c]+'</div>';
		//}
		for (let d in page.details)
		{
			html+='<div class="ChoiceText ReadText"><p>'+page.details[d].text +'</p></div>';
			for (let c in page.captions)
			{
				let cdi =fbIndex(c,d);
				html+='<div class="btn-group" id="cdi'+cdi+'">';
				let cbcol="cbcol"+ c;
				let caption=/*nthLetter(c)+' ' + */page.captions[c];
				html +=  (radio ?
					'<label class="btn radio-container"><input    type=radio    name=rb'+d+'   id=rb'+cdi+' value='+c+' /><span class="checkmark checkmark-rad-selected"></span>'+caption+'</label>' : 
					'<label class="btn checkbox-container"><input type=checkbox name=cb'+cdi+' id=cb'+cdi+' value='+c+' /><span class="checkmark checkmark-selected"></span>'+caption+'</label>' )
				+'<br clear=all><div class="hint"></div>';
				html+='</div>';
			}
			html+='<div id="fbText'+fbIndex(0,d)+'"></div>	<div class="gap"></div>';
		}
	}
	return '<div class="row"><div class="col-sm-12">'+html+'</div></div>';
}


/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {//https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function convertDragBox2RB()
{	// 6/29/18 Convert drag boxes into checkboxes
	let numCategories = page.categories.length;
	let convert={captions:[],details:[],checks:emptyMatrix( page.items.length, numCategories)};
	for (let c=1;c<numCategories;c++)
	{
		convert.captions.push(page.categories[c]);
	}
	let addHerring=false;
	let shuffledItems=shuffle(page.items);
	for (let i=0;i<shuffledItems.length;i++)
	{
		convert.details.push( {text: shuffledItems[i].text});
		if (shuffledItems[i].category ==0)
		{
			addHerring=true;
		}
		convert.checks[i][(shuffledItems[i].category -1  + numCategories )% numCategories]=true;// move the n/a to end of choices.
	}
	if (addHerring)
	{
		convert.captions.push(page.categories[0]);
	}
	page.captions=convert.captions;
	page.details=convert.details;
	page.checks=convert.checks;
	page.type="Multiple Choice";
	page.style="Radio Buttons";
	RadioButtons_layout();
}
function DragBoxOld_help()
{
	embedHelpHTML(this,lang.HelpStudentDragDrop + (page.ordered ? lang.HelpStudentDragDropSort : ''));
}

function DragBox_reveal()
{
	if (page.attempts==0) {tryitonce();return false;}
	$('#sortable .remove').hide();
	$('#sortable .undo').hide();
	for (let i=0;i<page.items.length;i++)
	{
		let herring=page.items[i].category==0;
		$('div','#item'+i).removeClass('right wrong removed').addClass('right').addClass(herring?'removed':'');
		//$('#item'+i+' .hint.right').show();
		if (herring)
		{
			$('#item'+i+' .undo').show();
		}
		else
		{
			$('#item'+i+' .remove').show();
		}
		$('#sortable').append($('#item'+i));
	}
	for (let i=0;i<page.items.length;i++)
	{
		let herring=page.items[i].category==0;
		if  (herring)
			$('#sortable').append($('#item'+i));
	}
	scoreAndShowFeedback(RIGHT,0,lang.GaveUpHeading,null,"#fbText",page.rightFeedback,page.rightDest);	
	return false;
}

function DragBox_grade()
{	//8/2018
	let isRight=true;// all right?
	let result = $('#sortable').sortable('toArray');
	let nextidx=0;//for ordering.
	for (let i=0;i<result.length;i++)
		if (page.items[i].category==0) nextidx++;// Red herrings are listed as the first items
	for (let i=0;i<result.length;i++)
	{	// Ensure items are in correct order and red herrings are ignored
		let $item=$('#'+result[i]);
		let idx=parseInt($item.attr('itemid'));
		let removed=$item.find('.removed').length>0;
		let cat=page.items[idx].category;
		let itemRight;
		if (cat==0)
		{	// Correct, if red herring removed
			itemRight=(removed);
		}
		else
		{
			itemRight=(!removed) && (idx==nextidx);// Correct, if in order and not a red herring
			nextidx++;
		}
		//trace("Slot "+i+" has item "+idx+"="+itemRight+" Red Herring="+(cat==0) +" Removed="+removed);
		$('div',$item).removeClass('right wrong').addClass(itemRight?'right':'wrong');
		if (!itemRight) isRight=false;
	}
	
	var answer=isRight? lang.RIGHT : lang.WRONG; ///TODO save drag positions as an answer.
	page.attempts ++;
	$("#reveal").fadeIn();
	if (isRight)
		scoreAndShowFeedback(RIGHT,0,answer,null,"#fbText",page.rightFeedback,page.rightDest);	
	else
	if (page.attempts<=page.hints.length)
		scoreAndShowFeedback(WRONG,0,answer,null,"#fbText", page.hints[page.attempts-1],null);
	else
		scoreAndShowFeedback(WRONG,0,answer,null,"#fbText", page.wrongFeedback,page.wrongDest);
	
	return false;
}




function DragBoxOld_layout()
{
	//oldPageTypeWarning();
	zIndex=999;
	var cats="";
	var items="";
	// Layout categories and items in a grid	
	cats+='<table width=100% class="DragTable noborder"><tr>';
	for (var c=0;c<page.categories.length;c++)
	{
		cats += "<th align=center width=" +( 100/page.categories.length)+"%" + ">"+  page.categories[c]+ "</th>";
	}
	cats += "</tr><tr>";
	for (var c=0;c<page.categories.length;c++)
	{
		cats +=  '<td>' + '<ul id=sortable'+c+' class="sortable droptrue">' + "</ul>" + '</td>';
	}
	cats+="</tr><table>";
	
	for (var i=0;i<page.items.length;i++)
	{
		items+='<li id=item'+i+' itemid='+i+' class="ui-state-default dragItem dragCollapse"><a href="#" class="dragExpander">[+]</a><span class=dragItemText>'+page.items[i].text+'</span></li>';
	}
	pageInteractionDIV.append(cats).append('<br clear="both" />');
	$("#sortable0").append(items);
	if (page.shuffle) $("#sortable0").shuffle();
	$('.dragItemText').each(function(){
		//TODO hide the expand option if not needed? 
		if ($(this).height()<=$(this).parent().height())
			$(this).parent().find('.dragExpander').hide();
	 });
	$("ul.droptrue").sortable({
		connectWith: 'ul',
		xforcePlaceholderSize: true
	});
	$("#sortable0, #sortable1, #sortable2, #sortable3").disableSelection();
	var maxheight=$('#sortable0').height();
	$('.sortable').css('min-height',maxheight);
	
	$('a.dragExpander').bind('click', function( )
	{
		var targetContent = $(this).parent();
		if ($(this).text()=="[-]" )
		{	// normal size
			targetContent.removeClass('dragCollapse dragExpanded').addClass('dragCollapse');
			$(this).html('[+]');
		} else
		{	// expanded for full reading
			targetContent.removeClass('dragCollapse dragExpanded').addClass('dragExpanded').css('z-index',++zIndex);
			$(this).html('[-]');
		}
		return false;
	})
	$("ul.droptrue li").addTouch();

	$(".PageSpecificGrade").append(gradeButton() + resetButton() + revealButton()  + helpButton() +  '<div id=fbText></div>');
	doGrade=DragBoxOld_grade;
	doReveal = DragBoxOld_reveal;
	doHelp = DragBoxOld_help;
}

function DragBoxOld_grade()
{
	var isRight=true;
	for (var c=0;c<page.categories.length;c++)
	{
		var result = $('#sortable'+c).sortable('toArray');
		var lastidx=-1;//for ordering.
		for (var i=0;i<result.length;i++)
		{
			var idx=parseInt($('#'+result[i]).attr('itemid'));
			var itemRight;
			if (page.items[idx].category==c)
				if (page.ordered && c>0)
				{
					if (idx>lastidx)
						itemRight=true;
					else
						itemRight=false;
					lastidx=idx;
				}
				else
					itemRight = true
			else
				itemRight=false;
			//trace("category "+c+", slot "+i+" has item "+idx+"="+itemRight);
			$('#item'+idx).removeClass('dragRIGHT dragWRONG').addClass('drag'+ (itemRight?RIGHT:WRONG));
			if (!itemRight) isRight=false;
		}
	}
	
	var answer="";//TODO save drag positions as an answer.
	page.attempts ++;
	$("#reveal").fadeIn();
	if (isRight)
		scoreAndShowFeedback(RIGHT,0,answer,null,"#fbText",page.rightFeedback,page.rightDest);	
	else
	if (page.attempts<=page.hints.length)
		scoreAndShowFeedback(WRONG,0,answer,null,"#fbText", page.hints[page.attempts-1],null);
	else
		scoreAndShowFeedback(WRONG,0,answer,null,"#fbText", page.wrongFeedback,page.wrongDest);
	
	return false;
}
function DragBoxOld_reveal()
{
	if (page.attempts==0) {tryitonce();return false;}
	for (var i=0;i<page.items.length;i++)
	{
		$('#item'+i).removeClass('dragRIGHT dragWRONG').addClass('dragRIGHT');
		$('#sortable'+page.items[i].category).append($('#item'+i));
	}
	scoreAndShowFeedback(RIGHT,0,lang.GaveUpHeading,null,"#fbText",page.rightFeedback,page.rightDest);	
	return false;
}




var gradeReview2emo={'':'','RIGHT':'✅','WRONG':'&#x274C;','MAYBE':'<b>?</b>','INFO':'I'};
function imgGradeReviewIcon(grade)
{
	return gradeReview2emo[grade];	//return '<img src=/lessons/web/share/jq/'+gradeIcon(grade)+'>';
}
function textReviewFeedback_(heading,fb,includeShared)
{
	var text=fb.text;
	if (!(includeShared==false))
		text+='<br />'+page.feedbackShared;
	if (fb.next && fb.next!=page.nextPage)
	{
		text+='<br />This response then branches to page <i>'+fb.next+'</i>.';
	}
	return heading+'<table><tr><td>'+imgGradeReviewIcon(fb.grade)+'</td><td><div class="grade-fb grade-'+fb.grade+'">'+text+'</div></td></tr></table>';
}
function textReviewFeedback(heading,id,includeShared)
{
	return textReviewFeedback_(heading,page.feedbacks[id],includeShared);
}
function textReviewFeedbackRW(heading,includeShared)//Feedback for right/wrong types, always show/branch for right answer.
{
	page.destPage=page.rightDest;
	return textReviewFeedback_(heading,{grade:RIGHT,text:page.rightFeedback,next:page.rightDest},includeShared);
}
function pageLessonReviewReport(html)
{	// Specific Lesson Review format.
	pageInteractionDIV.append('<div class=Report>'+html+'</div>');
}
function textReviewCheckBoxRadioButton()
{	// LessonText
	let radio=(page.style=="Radio Buttons");
	let caps=page.captions.length;
	let html='';
	if (caps>1)
	{
		html+='<tr>';
		for (let c in page.captions)
		{
			html+='<td>'+page.captions[c]+'</td>';
		}
		html+='<td>-</td>';
		html+='</tr>';
	}
	for (let d in page.details)
	{
		html+='<tr>';
		//<tr><td>'+imgGradeReviewIcon(fb.grade)+'</td><td><div class="grade-fb grade-'+fb.grade+'">'+text+'</div></td></tr>
		for (let c in page.captions)
		{
			let cdi =fbIndex(c,d);
			let checked=page.checks[d][c]==true;
			//$('input[id=cb'+cdi+']').attr('checked',page.checks[d][c]==true);
			if (radio)
				html+='<td><input type=radio value='+d+'-'+c+' '+(checked?'checked':'')+'/></td>'
			else
				html+='<td><input type=checkbox '+(checked?'checked':'')+'/></td>';
		}
		html+='<td><div class="ChoiceText ReadText"><p>'+page.details[d].text +'</p></div></td>';
		html+='</td></tr>';
	}
	return '<div class="row"><div class="col-sm-12"><table>'+html+'</table></div></div>';
}



function DragBox_layout()
{
	if (page.categories.length>2 && page.ordered)
	{	// Deprecated! Multiple categories with ordering uses the old format.
		DragBoxOld_layout();
		return;
	}
	if (!page.ordered)
	{	// Convert 1 or more categories drag/drop into a radio button style, the new replacement.
		convertDragBox2RB();
		return;
	}

	page.herrings=0;// if herrings exists, allow the 'remove' option.
	for (let i=0;i<page.items.length;i++)
	{
		if (page.items[i].category==0) page.herrings++;
	}

	if (page.herrings>0)
		pageInstructions="<p>Drag and drop items into the correct order.</p><p>Some items maybe need to be removed. Choose “Remove from list” where appropriate.</p><p>Once you’ve placed/removed all the items, select “Grade my answer.”</p><p>All items must be placed correctly to score the point.</p>";
	else
		pageInstructions="<p>Drag and drop items into the correct order.</p><p>Once you’ve placed all the items, select “Grade my answer.”</p><p>All items must be placed correctly to score the point.</p>";
	
	if ( lessonReviewMode && page.answered)
	{
		let html='';
		let j=0;
		for (let i=0;i<page.items.length;i++)
		{
			let herring=page.items[i].category==0;
			if (!herring)
			{
				j+=1;
				html+='<tr><td>#'+(j)+'</td><td><div>'+page.items[i].text+'</div></td></tr>';
			}
		}
		html='<p>The correct order is:</p>'+'<table>'+html+'</table>';
		html+=textReviewFeedbackRW('Response',false);
		pageLessonReviewReport(html);
	}
	else
	{
		// We now have one drag box column to sort so use the new Ordering interaction.
		// Stuff items into boxes that are both sortable and deletable.
		let items='';
		
		for (let i=0;i<page.items.length;i++)
		{
			items+='<li id=item'+i+' itemid='+i+' class="ui-sortable-handle"><div class="horizontal" aria-label="draggable box"><div class="vertical"><div class="dots-blue" aria-label="blue texture dots that show that this box is draggable"></div></div><div class="row drag-body"><div><p>'
		//	+('<b>Cheat'+(page.items[i].category==0?"H":(i+1))+"</b> ")
			+page.items[i].text+'</p></div>'
			+(page.herrings?'<div class="row remove"><span class="remove-icon"></span><p class="remove-txt">Remove from list</p></div><div class="row undo"><span class="undo-icon"></span><p class="undo-txt">Undo remove</p></div></div>':'')+'</div></li>';
	//	TODO add right/wrong icons and change grip color
	// <div class="hint right"><span class="glyphicon glyphicon-ok drag-drop-alert " aria-live="polite" role="definition" aria-labelledby="Right"><p>Right</p></span></div>\
	//	<iv class="hint wrong"><span class="glyphicon glyphicon-remove drag-drop-alert " aria-live="polite" role="definition" aria-labelledby="Wrong"><p>Wrong</p><p></p></span>\
		}
		pageInteractionDIV.append('<div class="row"><div class="col-sm-12 drag-content well"><ul id="sortable" class="list-unstyled ui-sortable">'+items+'</ul></div></div>');
		$('#sortable .undo').hide();
		$("#sortable").shuffle();
		
		$('#sortable .remove p').click(function(){
			$(this).parent().hide();
			$(this).parent().parent().find('.undo').show();
			$(this).parent().parent().parent().addClass('removed')});
		$('#sortable .undo p').click(function(){
			$(this).parent().hide();
			$(this).parent().parent().find('.remove').show();
			$(this).parent().parent().parent().removeClass('removed')});
		$(".PageSpecificGrade").append(gradeButton() + resetButton() + revealButton()  +  '<div id=fbText></div>');
		$("#sortable").shuffle();
		doGrade=DragBox_grade;
		doReveal = DragBox_reveal;
		//doHelp = DragBoxOld_help;
		
		$("#sortable").sortable({
			//xforcePlaceholderSize: true
			forcePlaceholderSize: true
		});
	}
}

function updateInstructions()
{
	$('#aboutInstructions').html(
		lessonReviewMode?
		'<p>This is a Lesson Review copy of your lesson run. It shows you your previous answers to questions in this lesson run. This lesson run has already been finalized, and the answers recorded. Question functionality has been disabled. </p>\
		<p>To start a new run of this lesson, visit the lesson through the CALI website or through the LessonLink if one was provided by your professor. Starting a new lesson run will not replace previous run scores. Starting a new run will result in a separate, entirely new score. </p>'
		:
		'<ul>\
	<li><strong>Get started:</strong> Proceed through the lesson using the “Next” button at the bottom, reading the material and answering any questions along the way.</li>\
	<li><strong>Getting help:</strong> Use the &nbsp;?&nbsp; button (always on the bottom, right of your screen) for instructions on how to answer different question types.</li>\
	<li><strong>Saving your answers:</strong> Your responses to questions are saved automatically and immediately recorded.</li>\
	<li><strong>Completing the lesson:</strong> At the end of the lesson, select “Finalize this score” to end this lesson run. Upon doing so, you will not be able to resume this lesson run. After finalizing a lesson run, you will be taken to a summary of your answer choices where you can print a copy of a certificate with your score.</li>\
	<li><strong>View your lesson runs:</strong> Go to “My Lesson Runs” in your CALI Dashboard to see a full list of your lesson runs, and to resume or review a lesson.</li>\
	<li><strong>Resume a lesson in progress:</strong> If you exit the lesson before finalizing your score, you will have the option to “Resume” this lesson run. Resuming a lesson run will NOT allow you to change your score for questions already answered in that run; previously answered questions are immediately recorded and cannot be changed.</li>\
	<li><strong>Start a new lesson run:</strong> At any time, you can start a new lesson run of the same lesson. In doing so, you will get a separate, entirely new score. This does not replace your old score(s). You can run a lesson as many times as you’d like. Simply restart the lesson via the CALI website or the LessonLink* provided by your professor.</li>\
	<li><strong>Review your responses:</strong> You also have the option to open a “Review” copy of any finalized runs that shows you your answers to questions in that run.</li>\
	<li><strong>*Lessons assigned by your professor:</strong> Your professor may have provided a link to run an assigned lesson – this is called a LessonLink. LessonLinks give your professor access to your lesson scores. If you believe you should be running a lesson through a LessonLink, look for LessonLink information on this page including the LessonLink logo in the upper left corner along with your professor’s name. If you do not see this information, it is not a LessonLink.</li>\
	</ul>'
		);
}


function lessonReviewBranchNotice()
{
	return '<div class="grade-fb grade-INFO">\
			  <p>You have returned to the start of a branch in the lesson. What you just saw was your path in this lesson run based on your first response to this question. (Subsequent attempts were not recorded and are therefore not included in this Review.) </p>\
<p>Upon clicking “Next” you will be taken down the path that results from a correct answer to this question. This might not mirror your experience and therefore you may see certain questions for the first time.</p>\
			  </div>';
}





function TextEssay_layout()
{	// Essays in 3 forms: optional Initial text for user to examine, user's editable Answer field, and optional Final text for user to compare with.
	let lastAnswer= (page.scores && page.scores[0] ? page.scores[0].text : "");// restore user's last answer
	
	// 03/24 4 variations of essays
	if (page.initialText=='' && page.correctText=='')
		pageInstructions="<p>Enter your answer into the empty box where it says “Write your answer below.”</p><p>Once you’ve entered your answer, select “Review my answer.”</p><p>Essay questions are not assigned points. This question will not count for or against your score. </p>";
	else
	if (page.initialText=='' && page.correctText!='')
		pageInstructions="<p>Enter your answer into the empty box where it says “Write your answer below.”</p><p>Once you’ve entered your answer, select “Review my answer.” A model answer will be provided for self-evaluation. </p><p>Essay questions are not assigned points. This question will not count for or against your score. </p>";
	else
	if (page.initialText!='' && page.correctText=='')
		pageInstructions="<p>Enter your answer into the box where it says “Write your answer below (edit as needed).” This box contains sample text or prompts that you can use in your answer. </p><p>Once you’ve entered your answer, select “Review my answer.” </p><p>Essay questions are not assigned points. This question will not count for or against your score. </p>";
	else
		pageInstructions="<p>Enter your answer into the box where it says “Write your answer below (edit as needed).” This box contains sample text or prompts that you can use in your answer. </p><p>Once you’ve entered your answer, select “Review my answer.” A model answer will be provided for self-evaluation. </p><p>Essay questions are not assigned points. This question will not count for or against your score. </p>";


	
	if (lessonReviewMode && page.answered)
	{
		let iText='';
		if (page.scores[0])
			iText+='<p>Your answer was:</p><div>'+lastAnswer+'</div>';
		if (page.correctText!="")
			iText+='<p>Suggested correct answer is: <div>'+page.correctText+'</div>';
		pageLessonReviewReport(iText);
	}
	else
	{
		let iText='';// '<div class=EssayTable><div class="row">';
		if (lastAnswer=="")// 12/02/22
			lastAnswer=page.initialText;
		let label='';
		if (page.initialText=='')
			label='Write your answer below';
		else
			label='Write your answer below (edit as needed)';
		iText+=writeEssayOrSelectColumn2(label,'col-sm-12',"ANSWER","",lastAnswer);
		$(".PageSpecificGrade").append(reviewButton()).append('<div id=fbText></div>');//append(helpTextWrapper(t(lang.HelpEssay))).
		pageInteractionDIV.append(iText);
		doGrade=TextEssay_grade;
	}
}

function TextEssay_grade()
{
	/* for 1 box, show feedback
		for 2 boxes, show feedback and if the first box is the user's answer display Correct answer in second box
		for 3 boxes, show feedback and display correct answer in last box
	*/
	page.attempts ++;
	
	var answer=$("#ANSWER").val();
	// Make sure user types something.
	if ((answer=="") || (answer==page.initialText)) {note(t(lang.TypeSomething));return false;}
	let iText='';
	if (page.correctText!="")	// 12/02/22
	{
		iText+='<div class=EssayTable><h2>'+'Model answer'+':</h2><div class="row"> <div class="EssayCorrectBox">'+(page.correctText.replaceAll("\n","<br />"))+'</div></div></div>';
	}
	// We don't care which attempt. We always save user's last essay response. 
	page.scores[0]=null;//clear so we always save user's new answer
	saveScore(INFO,0,answer,null);
	showFeedback(INFO,'Response','#fbText',iText+page.feedbackShared,null,answer);
	return false;
}



function writeEssayOrSelectColumn2(label,classCol,name,title,text)
{
	return '<div class=EssayTable><h2>'+label+':</h2><div class="row"> <div class="'+classCol+' col-xs-12"><textarea class=EssayBox wrap=soft id='+name+' name='+name+' rows=12>'+title+text+'</textarea></div></div></div>';
}


function writeEssayOrSelectColumn(classCol,name,title,text)
{
	return ' <div class="'+classCol+' col-xs-12"><textarea class=EssayBox wrap=soft id='+name+' name='+name+' rows=12>'+title+text+'</textarea></div>';
}
