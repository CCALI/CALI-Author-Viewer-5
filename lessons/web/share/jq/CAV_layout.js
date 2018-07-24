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
			page.destPage=null;
			var firstPage=null;
			$('.PageText a[href^="jump"]').each(function()
			{
			   var pagename = iefix( ($(this).attr('href').split('://')[1]));
			   if (pagename != pageTOC)
				{
					if (!firstPage) firstPage=pagename;
					if (!page.destPage && book.pages[pagename] && (book.pages[pagename].timeSpent == 0)) page.destPage=pagename;
				}
			});
			if (!page.destPage) page.destPage=firstPage;
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
		media += '<div id="slideshow"><ul>';
		for (var s=0;s<page.animationSlideSrcs.length; s++)
		{
			media += '<li><IMG SRC="' + (page.animationSlideSrcs[s])+'"/></li>';
			//sample:	<li><a href="http://templatica.com/preview/30"><img src="images/01.jpg" alt="Css Template Preview" /></a></li>
		}
		media+="</ul></div>";
	}
	if (page.pictureSrc!=null)
	{	// Picture with possible hotspots.
		media+='<div class="picture"><img id="picture"  /><div class="hotspots"></div></div>';
		//media +='<a class="zoomin HyperButton Small" href="'+page.pictureSrc+'" title="'+'Image'+'">Zoom</a> ';
		media += '<span id="zoom" class="zoom zoomin" aria-label="Zoom icon button"><span class="sr-only">Zoom icon button.</span></span>';
		
		if (page.ada!="" || page.hotspots.length>0)
		{
			var hotspots="";
			var hotspotsMap="";
			for (var h=0;h<page.hotspots.length;h++)
			{
				var hotspot=page.hotspots[h];
				if (typeof  hotspot.href=='undefined')
				{
					hotspot.href='#';
					hotspots+='<li>'+ hotspot.ada;
				}else
				{
					hotspots+='<li>'+'<a href="'+hotspot.href+'">'+hotspot.ada+' '+hotspot.href+"</a>";
				}
			}
			media += '<span class="description" aria-label="Description icon button"><span class="sr-only">Description icon button.</span></span>';
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
			media+='<a href=# class=togglervert>'+t(lang.AudioTranscription)+':</a><div class="Transcript">'+ page.transcript + '</div>';
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
		trace("Video",video);
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
}


function pictureLoaded()
{	// When picture finally loads (and we have width/height), attach hotspots.
	page.picWidth=this.width;
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





function doReset()
{	// Reset the answer, just redraw the question.
	renderPage();
}
function addNextButton(url,disabled)
{
	$(".PageSpecificNav").append('<div class="container-fluid"><div class="row"><div class="text-center">\
		<a href="'+url+'"><button class="CL-btn CL-next-btn shine icon-arrow-right '+(disabled==true?'btn-disabled':'')+'">'+t(lang.NextPage)+'<span class="next-arrow"/ ></button></a>\
	</div></div></div>');
}

function renderPage()
{	// Navbar elements:  back,next,grade,reveal
	doGrade=null;
	doReveal=null;
	doHelp=null;
	
	pageInteractionDIV.text('');
	pageInteractionDIV.prepend((lessonLive.isTeacher? '<div class="llPageInfo"/>':''));
	$(".PageSpecificGrade").empty();
	$(".PageSpecificNav").empty();
	pageTextDIV.hide().text('');
	

	if (textBuffer!="")
	{
		pageTextDIV.text(textBuffer);
		textBuffer="";
	}
	$(".PageName").text(page.name);//.append('<span class="Trace">(Type='+page.type+', Style='+page.style+')</span>');
	if (amode==1)
	{
		//$(".PageName").append('<a target="LessonText" href="'+LessonTextJump(page.name) + '">'+t(lang.FacultyView)+'</a>');
		$('.faculty-view').html('<a target="LessonText" href="'+LessonTextJump(page.name)+'" class="faculty-link">'+t(lang.FacultyView)+'</a>');
	}
	
	// Page type specific layout
	if (page.type=="Topics")
	{
		//TODO: slide out the TOC. //pageTextDIV.append('<div class="ReadText">'+page.text+'</div>');
		$(".PageName").text('');
	}
	else
	if (page.name==pageABOUT)
	{
		pageTextDIV.append('<div class="ReadText">'+page.text+'</div>');
		if (runid == null)
		{
			pageTextDIV.append('<div class="Feedback INFO"><div class="Text ReadText">'+thtml(lang.ScoreSaveOffNote)+'</div></div>');
		}
		//$(".PageSpecificNav").append(hyperButton(t(lang.TOC),'jump://'+pageTOC));
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
		textWithMedia(pageTextDIV,page);
		if (page.type == "Book Page")
		{
			//$(".PageSpecificNav").append(iButton(t(lang.NextPage),'gonext'));
		}
		else
		{
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
	$(".togglervert").unbind('click').click(function() {
		$(this).next().slideToggle('fast');
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
			$('.LinkNavBar').append('<a class="btn btn-default toolbar-button" type="button" href="'+tb.url+'">'+tb.text+'</a> '); //$('.LinkNavBar').append('<a href="'+tb.url+'">'+tb.text+'</a> ');
			if (tb.fresh)
			{	// newly seen toolbars are hilited for the user.
				newButtonCount++;
				$('.LinkNavBar>a:last-child').clearQueue().hide().delay(newButtonCount*1000).addClass('hilite').toggle(500).delay(500).queue(function(){$(this).removeClass('hilite')});
				tb.fresh=false;
			}
		}
		$('.LinkNavBar:first:not(:has(a))').hide();
	}
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
	oldPageTypeWarning();
//	pageTextDIV.append($('#ScoreReportCert').outerhtml());
	pageTextDIV.append($('.ScoreReport').outerhtml());
	//$(".PageSpecificNav").append(hyperButton(t(lang.TOC),'jump://'+pageTOC));
	$(".PageText .ScoreReport .ScoreButtons").removeClass('hidestart');
	ScoreScreenUpdate();
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
	trace(page.subq+','+fb.detail);
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
	var choicesText="";
	var fbText="";
	for (var c in page.captions)
	{
		var fb=page.feedbacks[fbIndex(c,0)];
		fb.letter=page.captions[c];
		choicesText += (lessonLive.isTeacher? '<div class=llButton>':'' )
			+iButton2(fb.letter, fb.id,fb.grade)
			+ (lessonLive.isTeacher ? '<div class="llChoice" id="llChoice'+fb.id+'"></div>': '')
			+(lessonLive.isTeacher? '</div>':'' )
			+' ';
		fbText += '<div id=fbText'+fb.id+'></div>';
	}
	pageInteractionDIV.append('<div class="btn-group" data-toggle="buttons">' + choicesText+ '</div>\
		<div class="gap"></div><div class="gap"></div><div class="gap">\
		</div><div id=fbText>'+fbText+'</div>');
	 $('label',pageInteractionDIV).click(function(){MulipleChoice_grade($(this).attr('id'))});
} 

function MultiButtonList_layout()
{	// Multiple buttons for multiple items (subquestions)
	let html="";
	for (let d in page.details)
	{
		let buttonList="";
		let fbText="";
		html += '<div class="subq" id="subq'+d+'">';
		html += '<table width=100%><tr><td>';
		//if (page.details.length>1) html += '<span class="BigLetter">'+(parseInt(d)+1)+"."+'</span>';
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
	pageInteractionDIV.append(html);
	pageInteractionDIV.append('<div id=fbText></div>');
	$('label',pageInteractionDIV).click(function(){MulipleChoice_grade($(this).attr('id'))});

	// Fade in subquestions
	page.subq=0;
	$('.subq').hide();
	$('#subq0').fadeIn('slow');
}

function ButtonList_layout()
{	// Page type: Multiple choice style A,B,C,...
	var detailsText="";

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


function writeEssayOrSelectColumn(classCol,name,title,text)
{
	return ' <div class="'+classCol+' col-xs-12"><textarea class=EssayBox wrap=soft id='+name+' name='+name+' rows=12>'+title+text+'</textarea></div>';
}

function TextSelect_layout()
{
	let iText= '<div class=EssayTable><div class="row">'
		+writeEssayOrSelectColumn('col-sm-12',"ANSWER","",page.initialText)
		+"</div></div>";
	pageInteractionDIV.append(iText);
	$(".PageSpecificGrade").append(gradeButton()+revealButton()).append('<div id=fbText></div>');
	doGrade=TextSelect_grade;
	doReveal=TextSelect_reveal;
}

function TextEssay_layout()
{	// Essays in 3 forms: optional Initial text for user to examine, user's editable Answer field, and optional Final text for user to compare with.
	let lastAnswer= (page.scores[0] ? page.scores[0].text : "");// restore user's last answer
	page.TextColumns = 1;
	if (page.initialText != "") page.TextColumns++;
	if (page.correctText != "") page.TextColumns++;
	let classCol='';
	if (page.TextColumns==1)
		classCol='col-sm-12';
	else if (page.TextColumns==2)
		classCol='col-sm-6';
	else
		classCol='col-sm-4';
	let iText= '<div class=EssayTable><div class="row">';
	if (page.initialText!="")
		iText+=writeEssayOrSelectColumn(classCol,"INITIAL","",page.initialText);
	iText+=writeEssayOrSelectColumn(classCol,"ANSWER","",lastAnswer);
	if (page.correctText!="")
		iText+=writeEssayOrSelectColumn(classCol,"CORRECT",t(lang.ModelAnswerWillAppear),"");
	iText+="</div></div>";
	$(".PageSpecificGrade").append(helpTextWrapper(t(lang.HelpEssay))).append(reviewButton()).append('<div id=fbText></div>');
	pageInteractionDIV.append(iText);
	doGrade=TextEssay_grade;
}
var zIndex; // z-order drag items above background

function DrawLines_layout()
{	// 11/23/10 Layout categories on right, items to move on left.
	// TODO This should be drawing lines between item and category.
	// For now, hacked to emulate DragBox behavior, grading is identical anyway.
	oldPageTypeWarning();
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
	oldPageTypeWarning();
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
	var originalanswer=$("#textResponse").val();
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
		scoreAndShowFeedback(INFO,0,"",null,"#fbText",txt,'');	
	}
	else
	{
		scoreAndShowFeedback(INFO,0,"",null,"#fbText",page.feedbackShared,'');	
	}
	return true;
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
	if (answer=="") {note(t(lang.TypeSomething));return false;}
	if ((page.TextColumns==3) || (page.TextColumns==2 && page.initialText=="")) 
		$("#CORRECT").val(page.correctText);
	// We don't care which attempt. We always save user's last essay response. 
	page.scores[0]=null;//clear so we always save user's new answer
	scoreAndShowFeedback(INFO,0,answer,null,"#fbText", page.feedbackShared,null);
	return false;
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









function lightbox(url)
{	// clone existing image/hotspots into full width popup
	trace('lightbox');
	$('.PageBorder').hide(); 
	txt='<div id=zoomin class="Feedback INFO">'
			+'<div class="Icon Info">&nbsp;</div>'
			+'<div class="Close"><a href="#">&nbsp;</a></div>'
			+'<div class="Title">'+(page.name)+' Image</div><br clear=all>'
			+'<div class="Text ReadText">' 
			+'</div>'	
			+'<div class="FeedbackButton">'+hyperButton(t(lang.ClosePopup),'#')+'</div>'
		+ '</div>';
	$(txt).prependTo('.NavigationPage');
	$('.MediaPanel').clone(true,true).appendTo('#zoomin .ReadText');
	$('#zoomin * .zoomin').remove();
	$('#zoomin * .picture #picture').unbind('click').dblclick(lightbox_unzoom);
	$('#zoomin * .picture #picture').css({width:'100%' });
	$('#zoomin .FeedbackButton a, #zoomin .Close a').unbind('click').click(lightbox_unzoom)
	updateHotSpots();
	return false;
}
function lightbox_unzoom()
{
	$('#zoomin').remove();
	$('.PageBorder').show();
	updateHotSpots();
	scrollIntoView($('#picture'),0);
	return false;
}

//

















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
	let subQText=CheckBoxRadioButtonColumnHeadings();
	pageInteractionDIV.append(subQText);
	$(".PageSpecificGrade").append(gradeButton() + resetButton() + revealButton()).append('<div id=fbText></div>');
	doGrade=RadioButtons_grade;
	doReveal=RadioButtons_reveal;
}

function CheckBoxes_layout()
{	// vertical layout: each subquestion followed by radio button list. 
	let subQText=CheckBoxRadioButtonColumnHeadings();
	pageInteractionDIV.append(subQText);
	$(".PageSpecificGrade").append(gradeButton() + resetButton() + revealButton()).append('<div id=fbText></div>');
	doGrade=CheckBoxes_grade;
	doReveal=CheckBoxes_reveal;
}
function CheckBoxesSet_layout()
{	// vertical layout: each subquestion followed by radio button list.
	page.captions=[""];//fake column
	let subQText=CheckBoxRadioButtonColumnHeadings();
	pageInteractionDIV.append(subQText);
	$(".PageSpecificGrade").append(gradeButton() +  resetButton()  + revealButton()).append('<div id=fbText></div>');
	doGrade=CheckBoxesSet_grade;
	doReveal=CheckBoxesSet_reveal;
}








function CheckBoxRadioButtonColumnHeadings()
{	// Generate columns/rows for checkbox and radio button types
	// 1 column yields standard looking cb/rb.
	// >1 column yields each item followed by cb/rb labeled A., B., C., etc. with key above.
	
	// Column Headings
	let html="";
	let radio=(page.style=="Radio Buttons");
	let caps=page.captions.length;
	trace('CheckBoxRadioButtonColumnHeadings '+radio+' '+caps);
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
			html+='<div class="ChoiceText ReadText">'+page.details[d].text +'</div>';
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
		trace(html);
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
		convert.captions.push("n/a");
	}
	page.captions=convert.captions;
	page.details=convert.details;
	page.checks=convert.checks;
	page.type="Multiple Choice";
	page.style="Radio Buttons";
	RadioButtons_layout();
}
function DragBox_help()
{
	embedHelpHTML(this,lang.HelpStudentDragDrop + (page.ordered ? lang.HelpStudentDragDropSort : ''));
}
function DragBox_layout()
{
	if (page.categories.length>1 && page.ordered)
	{	// Multiple categories with ordering uses the old format.
		DragBoxOld_layout();
		return;
	}
	if (!page.ordered)
	{	// Convert 1 or more categories drag/drop into a radio button style
		convertDragBox2RB();
		return;
	}
	DragBoxOld_layout();		
}


function DragBoxOld_layout()
{
	oldPageTypeWarning();
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
