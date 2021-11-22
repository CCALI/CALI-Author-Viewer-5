// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, Version: 03/21/2012

var MAX_ROWS=12 // Was 7; //Checkbox rows  (increaed to handle drag/drop conversion.)
var MAX_COLUMNS=7 // Was 4; //Checkbox columns (increaed to handle drag/drop conversion.)
var STYLE_TEXT="Text"
var STYLE_NUMBER="Number"
var STYLE_DOLLAR="Dollar"
var STYLE_PERCENT="Percent"

var pid=100;
var lessonPath;//Folder where book data and media files reside. // ="TestBookXML/"+  StartBook + "_jQueryBookData.xml";

function mapTOCUL2Viewer(ul,depth)
{	// 7/26/18 Map CA's simple ul/li outline into viewer's expandable TOC.
	let txt='';
	ul.children().each(function( )
	{
		if ($(this).is('UL'))
		{
			// 11/16/21 Initially expand all subtopics
			txt+='<li><label class="nav-toggle nav-header toggle-icon" for="cl-hamburger"><a href="#" class="nav-toggle-icon glyphicon glyphicon-minus visited" title="button to open and close sub menus" aria-label="Button to open and close sub menus."><p class="toc-title">'+text+'</p></a></label><ul class="nav nav-list slider-left" \
				xstyle="display: none;">'+mapTOCUL2Viewer($(this),depth+1)+'</ul></li>\n';
		}
		else
		if (!$(this).next().is('UL'))
		{
			text=$(this).text();
			let href=$('A',this).attr('HREF');
			if (depth>0)
				txt+='<li><a href="'+href+'" class="toc-link visited" title="link to lesson">'+text+'</a></li>\n';
			else
				txt+='<li><label class="nav-toggle-no-sub level-indent-no-sub"><a class="toc-link visited" href="'+escape(href)+'"><p class="toc-title no-sub">'+text+'</p></a></label></li>\n';
		}
		else
		{
			text=$(this).text();
		}

	});
	if (depth==0)
	{	// Add special pages.
		txt='<li><label class="nav-toggle-no-sub level-indent-no-sub"><a class="toc-link visited toc-visited" href="'+pageABOUT+'"><p class="toc-title no-sub">About this Lesson</p></a></label></li>\n'+txt
			+'<li><label class="nav-toggle-no-sub level-indent-no-sub"><a class="toc-link visited" href="'+pageLessonCompleted+'"><p class="toc-title no-sub">Complete the lesson</p></a></label></li>\n';
	}
	return txt;
}

function parsePageXML(pageXML)
{	// Decode page XML into TPage object.
	var page = new TPage();
	
	page.name=pageXML.attr("ID");
	page.sortName=pageXML.attr("SORTNAME");
	page.type=pageXML.attr("TYPE");
	page.style=pageXML.attr("STYLE");
	page.xml=pageXML;
	page.nextPage=pageXML.attr("NEXTPAGE");
	page.nextPageDisabled = pageXML.attr("NEXTPAGEDISABLED").toLowerCase()=="true";
	page.text=pageXML.find("TEXT").xml();
	page.alignText=pageXML.find("TEXT").attr("ALIGN");
	page.timeSpent=0;
	page.startSeconds=null;
	
	if (page.text=="")
	{
		page.text=pageXML.find("QUESTION").xml();
		page.alignText=pageXML.find("QUESTION").attr("ALIGN");
	}
	if (page.type=="Topics")
	{
		//trace(pageXML.find("TOC").xml());
		page.text=mapTOCUL2Viewer(pageXML.find("TOC").find("UL:first"),0);
		page.text = page.text.replace(/href="/gi,'href="jump://');
		page.nextPageDisabled=true;
		book.lastPage=pageXML.find("LASTPAGE").xml();
	}
	page.columns=1;
	page.details=[];
	page.captions=[];
	page.feedbacks=[];
	page.feedbackShared="";
	page.animationSlideSrcs=[];
	page.hotspots=[];
	page.hints=[];
	page.textMatches=[];

	page.checks = pageXML.find('CHECKS').text(); // XML: <CHECKS>1-1,3-1,4-1</CHECKS
	if (page.checks!="" || page.style=='Check Boxes')
		page.checks=checkMatrix(page.checks);
	
	// Extract buttons/detail/feedback
	pageXML.children('BUTTON').each(function( )
	{
		page.captions.push(jQuery.trim($(this).xml()));
	});
	pageXML.find('DETAIL').each(function(d)
	{
		page.details.push({});
		page.details[d].text =jQuery.trim($(this).xml());
		page.details[d].letter = nthLetter(d);//"ABCDEFG".charAt(d)+".";
	});

	page.rightFeedback=pageXML.find("RIGHT").xml(); 	page.rightDest=pageXML.find("RIGHT").attr("NEXTPAGE");
	page.wrongFeedback=pageXML.find("WRONG").xml(); 	page.wrongDest=pageXML.find("WRONG").attr("NEXTPAGE");
	page.correctText=JSTextNoHTML(pageXML.find("CORRECTTEXT").xml());
	page.initialText=JSTextNoHTML(pageXML.find("INITIALTEXT").xml());
	page.slackWordsBefore = pageXML.find("SLACKWORDSBEFORE").xml();
	page.slackWordsAfter = pageXML.find("SLACKWORDSAFTER").xml();
		
	pageXML.find('FEEDBACK').each(function()
	{	
		var text=jQuery.trim($(this).xml());
		if ($(this).attr("BUTTON")==null)
			page.feedbackShared = text;
		else
		{
			var fb={};
			fb.button=$(this).attr("BUTTON")-1;
			fb.detail=$(this).attr("DETAIL")-1;
			fb.grade = $(this).attr("GRADE");
			if (fb.grade!=null) fb.grade=fb.grade;
			fb.next=$(this).attr("NEXTPAGE");
			fb.text = text;
			fb.id = fbIndex(fb.button,fb.detail);
			page.feedbacks[fb.id]=fb; 
		}
	});

	pageXML.find('SLIDE').each(function()
	{
		var image=fixMediaPath($(this).attr("SRC"));
		book.assets.push(image);
		page.animationSlideSrcs.push(image);
	});
	
	
	pageXML.find('ANSWER').each(function()
	{	// XML: <ANSWER GRADE="MAYBE" MATCHSTYLE="MatchExact" MATCHES="orange"><P>Close, but not exactly correct. Try again.</P></ANSWER>
		var feedback=jQuery.trim($(this).xml());
		var m=new TextMatch($(this).attr("MATCHSTYLE"),$(this).attr("MATCHES"),feedback,$(this).attr("GRADE"),$(this).attr("NEXTPAGE"));
		page.textMatches.push(m);
	});
	var tb=pageXML.find('TOOLBAR');
	if (tb)
	{	// XML: <TOOLBAR MODE="CLEAR"><BUTTON NAME="UPA 7" HREF="popup://UPA 7"></BUTTON> <BUTTON NAME="RUPA 202" HREF="popup://RUPA 202"></BUTTON> </TOOLBAR>
		page.toolbarMode = tb.attr("MODE");
		page.toolbarLinks=[];
		tb.find('BUTTON').each(function(){
			page.toolbarLinks.push({text: $(this).attr("NAME"), url: $(this).attr("HREF")});
		});
	}
	
	pageXML.find('AREA').each(function()
	{	// XML: <AREA TYPE="RECT" BOUNDS="319,22,439,259" GRADE="INFO" HREF="jump://Click on Image 2 (L)">
		page.hotspots.push({
		bounds:$(this).attr("BOUNDS"), 
			grade:$(this).attr("GRADE"), 
			href:$(this).attr("HREF"), 
			ada:$(this).text()});
	});
	
	page.shuffle = pageXML.find('SHUFFLE').text().toLowerCase() != 'false';//default to shuffle unless explicitly turned off.
	page.ordered = pageXML.find('ORDERED').text().toLowerCase() == 'true';
	let herring=pageXML.find('ITEMS').text();
	if (herring=="Items") herring=lang.NA;
	page.categories=[herring];//Column 0 is red herring.
	pageXML.find('CATEGORY').each(function()
	{	// XML: <CATEGORY>Correct</CATEGORY>
		page.categories.push(jQuery.trim($(this).xml()));
	});
	page.items=[];
	pageXML.find('ITEM').each(function()
	{	// XML: <ITEM CATEGORY="1">Vice President</ITEM>
		page.items.push( { text: jQuery.trim($(this).xml()), category: $(this).attr("CATEGORY")});
	});

	if (page.type=="Slider")
	{
		page.sliders=[];
		page.phrases=[];
		pageXML.find('SLIDER').each(function()
		{	//XML: <SLIDER>Color</SLIDER>
			page.sliders.push(jQuery.trim($(this).xml()));
		});
		pageXML.find('PHRASE').each(function()
		{	//XML: <PHRASE>green</PHRASE>
			page.phrases.push($(this).xml());
		});
		page.MIN = pageXML.find("MIN").xml();
		page.MAX = pageXML.find("MAX").xml();
		page.feedbacks=[];
		pageXML.find('DIVISION').each(function()
		{	//XML: <DIVISION GRADE=RIGHT>feedback text</DIVISION
			var text=jQuery.trim($(this).xml());
			var fb={};
			fb.grade = $(this).attr("GRADE");
			fb.next=$(this).attr("NEXTPAGE");
			fb.text = text;
			page.feedbacks.push(fb);
		});
	}
	
	
	if (page.style=="FLASHCARD")
	{	//XML: <FLASHCARD><QUESTION>1. Who's the first US President?</QUESTION><ANSWER>George Washington.</ANSWER></FLASHCARD>
		page.flashCards=[];
		pageXML.find('FLASHCARD').find('QUESTION').each(function(){
			page.flashCards.push( {question:$(this).xml()});
		});
		pageXML.find('FLASHCARD').find('ANSWER').each(function(index){
			page.flashCards[index].answer=$(this).xml();
		});
	}
	if (page.style=="HANGMAN")
	{	//XML:  <PHRASE ITEM="adjunct, agency, agent, alter ego, conduit, construct, corporation in name only, dummy, empty suit, facade, front, illlusion, instumentality, mere department, paper corporation, pawn, post office address, puppet, sham, shell, and tool"></PHRASE>
		//<TOPIC>Prejorative Terms Used in Judicial Opinions to Justify Piercing the Corporate Veil</TOPIC>
		pageXML.find('HANGMAN').find('PHRASE').each(function(){
			page.phrases=$(this).attr("ITEM").split(",");
		});
		page.topic=pageXML.find('HANGMAN').find('TOPIC').xml();
	}
	
	
	
	pageXML.find('HINT').each(function()
	{	//<HINT>A hint</HINT>
		page.hints.push(jQuery.trim($(this).xml()));
	});
	
	var pic=pageXML.children("PICTURE");
	page.pictureSrc = fixMediaPath(pic.attr("SRC"));
	if (page.pictureSrc!=null)
	{
		//trace(page.pictureSrc);
		book.assets.push(page.pictureSrc);
		page.srcPicWidth=pic.attr("WIDTH");
		page.srcPicHeight=pic.attr("HEIGHT");
		page.ada=pic.xml();
	}

	page.videoSrc = fixMediaPath(pageXML.find("VIDEO").attr("SRC"));
	page.videoEmbedCode = pageXML.find("VIDEO").attr("EMBED");
	
	var snd=pageXML.find("SOUND");
	page.soundSrc = fixMediaPath(snd.attr("SRC"));
	if (page.soundSrc!=null)
	{
		page.transcript=snd.xml();
		if (page.pictureSrc==null) page.pictureSrc="img/AudioImage.jpg";
	}
	page.scoring = pageXML.attr("SCORING");
	if (page.scoring==null){
		page.scoring="";
	}
	page.scoredQuestion = (page.scoring!="");
	if ((page.type == "Book Page" && page.hotspots.length==0) || page.style=="Text Essay" || page.type=="Topics") 
	{	//Book page with no hotspots and essays will never be scored (but will be recorded for time)
		page.scoredQuestion=false;
		if (page.style=="Text Essay") {
			page.scorePoints=0;
		}
		else{
			page.scorePoints="";
		}
	}
	else
	{
		if (page.scoredQuestion)
		{	// Scored question, number of points is 1 unless it's MultiSet.
			page.scorePoints = (page.style=="Choose MultiButtons") ? page.details.length : 1;
		}
		else{
			page.scorePoints = 0;
		}
	}
		
		
	// Many-Multiple choice buttons type has subquestions which need their own scoring. 
	if (page.style=="Choose MultiButtons")
	{
		for (var part=0;part<page.details.length;part++)
			page.scores[part]=null;
	}
	else
		// All other page types have a single score.
		page.scores[0]=null;

	var $mapper=pageXML.find('MAPPER');
	if ($mapper)
	{	//XML: <MAPPER ID="47" BOUNDS="1198,360,109"><BRANCH KIND="14" NAME="True" DEST="47" BOUNDS="1196,408,30"/></MAPPER>
		page.mapid = $mapper.attr("ID");
		if (page.mapid!=null){//no map in student mode inside CALIAuthor
		page.mapbounds= ($mapper.attr("BOUNDS")).split(',');
		page.mapbranches=[];
		$mapper.find('BRANCH').each(function(){
			page.mapbranches.push({
				kind: $(this).attr("KIND"),
				text: $(this).attr("NAME"),
				bounds: ($(this).attr("BOUNDS")).split(','), 
				dest: $(this).attr("DEST")});
		});
		}
	}
	
	return page;
}
function emptyMatrix(numRows,numCols)
{
	let map=[];
	for (let row=0;row<numRows;row++)
	{
		map[row]=[];
		for (let col=0;col<numCols;col++)
			map[row][col]=0;
	}
	return map;
}
function checkMatrix(checklist )  
{	// Convert list of correct checkbox/radio button items into matrix.
	// Sample Checklist "1-1,3-1,4-1"
	// Checklist is 1-based. but we'll work with 0-based.
	var row;
	var col;
	var map=emptyMatrix(MAX_ROWS,MAX_COLUMNS);
	if (checklist!="")
	{
		var parts=checklist.split(",");
		for (var p=0;p<parts.length;p++)
		{
			var one=parts[p].split("-");
			map[one[0]-1][one[1]-1]=1;
		}
	}
	return map;
}



function parseBookXML(bookXML)
{
	book.title = bookXML.find('INFO > TITLE').text();
	book.description = bookXML.find('INFO > DESCRIPTION').xml();
	book.lesson=bookXML.find('INFO > LESSON').text();
	book.version=bookXML.find('INFO > VERSION').text();
	book.qw='QW'==bookXML.find('INFO > GENERATOR').text();
	
	
	book.CALIdescription = bookXML.find('INFO > CALIDESCRIPTION').xml();
	book.subjectArea=bookXML.find('INFO > SUBJECTAREA').text();
	book.completionTime=bookXML.find('INFO > COMPLETIONTIME').text();
	book.copyrights=bookXML.find('INFO > COPYRIGHTS').text();
	book.credits=bookXML.find('INFO > CREDITS').text();
	book.notes=bookXML.find('INFO > NOTES').text();
	
	
	$(".LessonName").text(book.title);
	
	// Add stub pages for the About and Score screens.
	var page = new TPage();
	page.name=pageABOUT;
	page.text= book.description;
	book.pages[page.name]=page;
	
	page=new TPage();
	page.name=pageLessonCompleted;
	page.nextPageDisabled=true;
	book.pages[page.name]=page;
	// Parse pages into book.pages[] records. 
	bookXML.find("PAGE").each(function() {
		var page = parsePageXML($(this));
		book.pages[page.name] = page;
		book.mapids[page.mapid]=page;
		page.id = pid++;
	});
	if (typeof book.lastPage==='undefined' || book.lastPage===''){
		book.lastPage=pageLessonCompleted;
	}
	if (book.lastPage!=pageLessonCompleted)
	{
		page=book.pages[book.lastPage];
		page.nextPage=pageLessonCompleted;
		page.nextPageDisabled=false;
	}	
	processBook();
}


function JSTextNoHTML(html)
{ // make html into plain text but with blank lines for <P>
	if (html=="") return "";
	html  = html.replace(/<P>/g,'\n\n');//<P> becomes line breaks.
	html  = html.replace(/^\s+/g,'');//trim leading whitespace
	html  = html.replace(/<BR>/gi,'\n');// <BR /> becomes space
	html = html.replace(/<.*?>/g, ' ');//replace all HTML tags with space
	//html =$(html).text(); strips text if not already HTML markup
	return html;
}


function fbIndex(button,detail)
{
	return parseInt(button)+"_"+ parseInt(detail);
}

/** 
* Ensure media has full path 
* @param {String} media	image, video.
* @return {String}	Returns the full path.
*/
function fixMediaPath(media)
{	/// <summary>Ensure media has full path</summary>
	/// <param name="media">image, video</param>
	/// <returns>string</returns>
	return media?lessonPath + media:null;
}
//
