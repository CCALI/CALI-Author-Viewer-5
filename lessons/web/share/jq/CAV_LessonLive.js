//#############################################################
// 8/2016 CALI Author Viewer's LessonLive - live view of lesson link data.
//#############################################################

var lessonLive={
	isTeacher:false,
	isStudent:false,
	Summary:{}, // Aggregated score save user data downloaded from server
	revealUsers:false,// if true, show user real names, otherwise use the place holders
	revealResponses:false, // if true, always show scores
	revealScores:false, // when true, show score breakdowns for page
	pagename:'', // name of current page being displayed
	DownloadSilentInterval:0 // Interval downloader of JSON
}

function attachLessonLiveReportToPage( )
{	// Attach or update the LessonLive info/progress bars for the current page.
	// Since this can change on the fly, needs to be handled via jQuery updates to the DOM rather than during the page's initial Layout process.
	
	if (!page) return;
	if (!lessonLive.Summary.lesson) return; // No lesson live, do nothing. 
	if (!lessonLive.Summary.pages) return;
	if (page.name!=lessonLive.pagename)
	{
		lessonLive.pagename=page.name;
		lessonLive.revealScores=false;
	}
	if (lessonLive.revealResponses)
	{
		lessonLive.revealScores=true;
	}
	
	var LessonLivePageInfo='';// Prompt to teacher about lesson live info for this page, such as if lesson live doesn't apply, or total students answered.
	var pageLL = lessonLive.Summary.pages[page.name];
	if (!pageLL )
	{	// if no students viewed page yet, create placeholder.
		pageLL = lessonLive.Summary.pages[page.name] = {total:0};
	}
	
	var pageTypeTracksScores=true;
	var pageTypeTracksData = true;

	LessonLivePageInfo= 'Students responded: <br/>';
	$('.llChoice').text('').append('LessonLive');
	pageLL.marks=[];// right/wrong for each user
	pageLL.answer=[];// answer choice for each user
	pageLL.text=[];// text of the choices
	// Add custom percent/progress bars per question type. 
	if (page.type=="Multiple Choice" && page.style=="Choose Buttons")
	{	// Tally results for each button, eg., Yes, No, Maybe
		for (var b=0;b<page.captions.length;b++)
		{
			pageLL.text[b+1]=page.captions[b];
			lessonLiveAttachOne(pageLL,1,b+1,'llChoice'+b+'_0');
		}
	}
	else if (page.type=="Multiple Choice" && page.style=="Choose List") 
	{	// Tally results for each choice, eg., A, B, C, D
		for (var d=0;d<page.details.length;d++)
		{
			pageLL.text[ d+1 ]= page.details[d].letter;
			lessonLiveAttachOne(pageLL,1,d+1,'llChoice0_'+d);
		}
	}
	else if (page.type=="Multiple Choice" && page.style=="Choose MultiButtons")
	{	// Tally results for each button and each choice, eg., A-Yes, A-No, B-Yes, B-No, etc. 
		for (var d=0;d<page.details.length;d++) {
			for (var c=0;c<page.captions.length;c++)
			{
				pageLL.text[c+1]=page.captions[c];
				lessonLiveAttachOne(pageLL,d+1,c+1,'llChoice'+c+'_'+d);
			}
		}
	}
	else if (page.type=="Multiple Choice"  || page.type=="Prioritize" || page.style=='Text Select')
	{	// Types that are merely Right or Wrong.
		LessonLivePageInfo='LessonLive data for this page type only records a right or wrong response.'
		// Handle te question types which are simply marked Right or Wrong.
		pageLL.text[1]='R'; // User list caption is R)ight and W)rong.
		pageLL.text[2]='W';
		lessonLiveAttachOne(pageLL, 1,1,'' );// RIGHT
		lessonLiveAttachOne(pageLL, 1,2,'' );// WRONG
	}	
	else if (page.type=="Text Entry" && page.style=="Text Short Answer")
	{	// Short answer can have 1 or more matches plus the 'no match'.
		if (lessonLive.revealScores) {
			var matchHTML='';
			for (var r=0;(r<page.textMatches.length);r++)
			{
				var match = page.textMatches[r];
				var matchInfo='';
				switch (match.matchstyle)
				{
					case "MatchContainsAny": //Answer must contain one of the matches.
						matchInfo="matches one ";
						break;
					case "MatchContainsAll":  //Answer must contain each of the matches.
						matchInfo="matches all ";
						break;
					case "MatchContainsAllInOrder":  //Answer must contain each of the matches in order
						matchInfo="matches all in order";
						break;
					case "MatchContainsNone": // Contains None: Answer must contain NONE of these matches.
						matchInfo="matches none";
						break;
					case "MatchExact":
					case "": // Answer must match exactly one of the matches.
						matchInfo="matches exactly";
						break;
					default:
						matchInfo='';
				}
				var t=r+1;
				pageLL.text[t]=match.grade; // store grade for display in user column
				matchHTML+='<tr><td>' + lessonLiveGradeIconHTML(match.grade)+'</td><td>'+matchInfo+'</td><td>'
					+ '<ul><li>"'+match.matchlist.split(DEL.toUpperCase()).join('"<li>"') +'</td><td>' + lessonLiveAttachOne(pageLL, 1,t,'')+'</td></tr>';
			}
			pageLL.text[0]='W';// no match is Wrong
			matchHTML+='<tr><td>' +lessonLiveGradeIconHTML('WRONG') + '</td><td>Any other response</td><td>&nbsp;</td><td>' + lessonLiveAttachOne(pageLL,  1,0,'')+'</td></tr>';
			LessonLivePageInfo+='<table class=llShortAnswerMatches>'+matchHTML+'</table>';
				
		}
	}	
	else
	{	// Any unhandled page type gets a generic 'LessonLive not available for this type'. 
		if (page.scorePoints=='') { //name=='Contents' || page.name=='About this lesson') {
			LessonLivePageInfo='';
			pageTypeTracksScores=false;
			pageTypeTracksData=false;
		}
		else{
			LessonLivePageInfo='LessonLive data not presented for this page type.';
		}
	}	

	if (pageTypeTracksData && !lessonLive.revealScores)
	{	// Build list of user right/wrong/unanswered ticks - indicates how many students responded so far to this page. 
		var marks='';
		for (var u=0;u<pageLL.marks.length;u++)
		{
			var grade;
			if (! pageLL.marks[u ]) {
				grade='none'; // a gray placeholder for the user
				pageLL.marks[u ]=grade;
			}
			else
			if (lessonLive.revealScores)
				grade=pageLL.marks[u ]; // right,wrong,maybe,info response
			else
				grade='answered';
			marks += '<span class="llBarChunk answer '+ grade + '"/>';
		}
		LessonLivePageInfo = LessonLivePageInfo + '<div class=llChoice>'+marks+' ' +  pageLL.total + ' / ' + lessonLive.Summary.users.length + '</div>';
	} 
	
	if (LessonLivePageInfo!='' )
	{
		LessonLivePageInfo += '<P></P>';
		if (pageTypeTracksScores && lessonLive.revealScores && pageLL.total>0)
		{	// Show the right/wrong thermometer bar for easy identifying problem questions.
			var percent=Math.round(100*pageLL[1].right/pageLL.total);
			LessonLivePageInfo +=  '<P></P>'
				+'<div class=llChoice> '
				+'<div class="llBar llBarSlots">' // style="xwidth:'+(pageLL.total*3)+'px;"
				+lessonLiveBar('right',pageLL[1].right)
				+lessonLiveBar('wrong',pageLL[1].wrong)
				+lessonLiveBar('maybe',pageLL[1].maybe)
				+lessonLiveBar('info',pageLL[1].info)
				+'</div>'
				+ ' '+  percent +'% ' + pageLL[1].right +'/' + pageLL.total
				+'</div>';
		}
		else
		{
			if (pageTypeTracksData && !lessonLive.revealScores) {
				LessonLivePageInfo+='<P><a class="HyperButton">Reveal Student Responses</a></P>';
			}
		}
	}

	
	// Build list of users and their scores.
	var html='';
	var userInfo=[];
	for (var u=0;u<lessonLive.Summary.users.length;u++)
	{	// For each user, figure out their answers and grade.
		var grade='none';
		var text='';
		if (pageLL && pageLL.marks)
		{
			if (pageLL.answer[u]) {
				//text=pageLL.text[pageLL.answer[u]];// short caption of user's choice.
				text = pageLL.answer[u];
				grade = pageLL.marks[u ];
			}
		}
		if (!lessonLive.revealScores) {
			if (grade!='none'){
				grade='answered';// if not showing scores, mark user only as having answered.
			}
			text='-';
		}
		var user = lessonLive.Summary.users[u]; 
		html='<div class="llUser ll '+grade+'" id=llUser'+u+'>'
			+text //+'<span class="llIcon none">'+ (text ? text : '?') +'</span> '	
			+' <span class="llUserName ll">' +(lessonLive.revealUsers ? user.name : 'Student '+(u+1))+'</span></div>';
		userInfo.push({key:lessonLive.revealUsers ? String(user.name).toUpperCase()+ user.userid: u, html:html}); 
	}
	userInfo.sort( function(a,b){if (a.key<b.key) return -1; else if (a.key>b.key) return 1; else return 0;}); // Sort users 
	html='';
	for (var i=0;i<userInfo.length;i++) {
		html+=userInfo[i].html;
	}
	$('.llUserList').html(html);

	// Reveal scores if clicking on Reveal Answers button.
	$('.PageInteraction .llPageInfo').unbind('click')
		.click(function()
		{
			lessonLive.revealScores=true;
			attachLessonLiveReportToPage();
		}).html(LessonLivePageInfo);
	//$('.PageInteraction .llPageInfo').unbind('click').click(function(){$('#llPanel').toggle();}).html(LessonLivePageInfo);
}

function lessonLiveGradeIconHTML(grade)
{
	return '<img  src=' + gradeIcon(grade) +' width="20" height="21" class="GradeIcon"/>';
}

function lessonLiveAttachOne(pageLL, subQ, choice,domid )
{	// Lookup subq/choice info for given a page and update the html ID with %/progress bar.
	var numUsers=0; // users giving this answer
	if (pageLL[subQ] && pageLL[subQ][choice] && pageLL[subQ][choice]['users']) {
		numUsers=pageLL[subQ][choice]['users'].length;
	}
	var html=''; // construct graduated answer count bar (likely a CSS shortcut for this)
	var total = pageLL.total;
	var percent;
	if (total>0 && pageLL[subQ] && pageLL[subQ][choice])
	{
		var grade=pageLL[subQ][choice].grade;
		var text = jQuery.trim( pageLL.text[choice].substr(0,1));
		percent=Math.round(100*numUsers/total);
		// Track each user's response for the summary list.
		for (var i=0;i<numUsers;i++) {
			//html+='<span class="llBarChunk answer ' + (lessonLive.revealScores? grade : 'none')  + '"/>';
			var u= pageLL[subQ][choice]['users'][i];
			//pageLL.marks[u]=grade;			
			//pageLL.answer[u] =choice;
			
			if (!pageLL.answer[u])
			{
				pageLL.answer[u]='';
				pageLL.marks[u]='right';
			}
			if (grade!='right')
			{
				pageLL.marks[u]=grade;
			}
			pageLL.answer[u]+= '<span class="llIcon ll '+grade+'">'+ (text ? text : '?') +'</span>';
			
		}
		if (lessonLive.revealScores) {
			html = lessonLiveBar(  grade  ,numUsers, total);
		}
	}
	else
	{
		percent='';
	}
	//if (!lessonLive.revealScores) {
//		html ='<span class="llBarChunk answer none"/>';
//	}
	html=''
		+'<div class=llBar>'+html+'</div>'// xstyle="width:'+(total)+'px;"
		+(lessonLive.revealScores? percent :'') +'% ' + (lessonLive.revealScores?numUsers:'-')
		;
	if (domid!='') {
		$('#'+domid).html(html); 
	}
	return html;
}


function lessonLiveBar(grade,numSlots,total)
{	// Return thermometer bar either as percent or individual slots.
	var html='';
	if ( total ) {
		if (!numSlots) {
			numSlots=0;
			grade='unanswered';
		}
		if (!total) {
			total = numSlots;
		}
		if (total==0) total=1;
		w= 66 * numSlots / total;
		html='<span class="llBarChunk answer ' + grade  + '" style="width:'+w+'px;"/>';
	}
	else
	{
		if (numSlots) {
			for (var i=0;i<numSlots;i++) {
				html+='<span class="llBarChunk answer ' + grade  + '"/>';
			}
		}
	}
	return html;
}




function lessonLiveDownloadSilent()
{	// Download score save xml summary data from website
	var scoreSaveSummaryURL=LessonLiveDownload() + '?runid='+runid;// formerly "/lessons/web/share/jq/LessonLiveSample.php?";
	if (lessonLive.Summary.lesson) {
		// Request report only if data newer that the LastUpdate.
		scoreSaveSummaryURL += '&lastupdate='+lessonLive.Summary.lesson.LastUpdate;
	}
	//trace('Loading data from '+scoreSaveSummaryURL);
	$.ajax({
		url: scoreSaveSummaryURL,
		dataType: "json",
		timeout: 15000,
		error: function(data,textStatus,thrownError){
		  //alert('Error occurred loading the XML from '+this.url+"\n"+textStatus);
			trace('Download of LessonLive data failed: '+textStatus);
			clearInterval(lessonLive.DownloadSilentInterval);
			lessonLive.DownloadSilentInterval=setTimeout ("lessonLiveDownloadSilent()", 9000); // wait 9 seconds to try again.
		 },
		success: function(data)
		{
			//trace('Downloaded LessonLive data'); 
			if (data.lesson ) {
				// update live percent bars, user data.
				lessonLive.Summary=data;
				//trace('Lesson Name: '+lessonLive.Summary.lesson["Lesson Name"]);
				attachLessonLiveReportToPage();
			}
			else
			{
				//trace('No new LessonLive data');
			}
			clearInterval(lessonLive.DownloadSilentInterval);
			lessonLive.DownloadSilentInterval=setTimeout ("lessonLiveDownloadSilent()", 5000); // load data again
		}
	});
	return false;
}

function llDialogRevealNames()
{	// Confirm if student names should be displayed.
	 $( "#dialog-revealnames" ).dialog({
			resizable: false,
			height:250,
			width: 400,
			modal: true,
			buttons: {
				"Yes": function() {
					lessonLive.revealUsers=true;
					lessonLive.revealResponses=true;
					attachLessonLiveReportToPage();
					$('#llRevealNamesCB').prop('checked',true);
					$('#llLessonPast').removeClass('hidestart').attr('href','/lessons/web/share/jq/LessonLinkPast.php?runid='+runid);
					$( this ).dialog( "close" ); 
				},
				"No": function() {
					$('#llRevealNamesCB').prop('checked',false);
					$( this ).dialog( "close" );
				}
			}
		}); 
}

$(document).ready(function()
{	// Check if this is a LessonLive presentation.
	if (llMode=='own')
	{	// Activate Teacher's LessonLive UI
		lessonLive.isTeacher=true;
		$('#llHeaderPage').removeClass('hidestart'); 
		$('#llLiveLogo').removeClass('hidestart'); 
		$('#llPanel').removeClass('hidestart');
		$('#llRevealNamesCB').change(function(){
			if ($(this).is(':checked'))
			{
				llDialogRevealNames();
			}
			else
			{
				lessonLive.revealUsers=false;
				lessonLive.revealResponses=false;
				attachLessonLiveReportToPage( )
			}
		 });
		$('#llRevealResponsesCB').change(function(){
			lessonLive.revealResponses= ($(this).is(':checked'));
			attachLessonLiveReportToPage( )
		 });
		lessonLiveDownloadSilent();
	}
	else
	if (llMode=='stu')
	{	// Activate Student's LessonLinkLive watermark.
		lessonLive.isStudent=true;
		$('#llHeaderPage').removeClass('hidestart'); 
		$('#llLinkLogo').removeClass('hidestart').click(function()
		{	// Jump to the teacher's page
			$.ajax({
				url: "LessonLinkTeacherPage.php?runid="+runid,
				dataType: "json",
				timeout: 15000,
				error: function(data,textStatus,thrownError)
				{
				  //alert('Error occurred loading the XML from '+this.url+"\n"+textStatus); 
				},
				success: function(data)
				{
					var teacherPage = data["Current Page"];
					if (teacherPage && teacherPage!="")
					{
						gotoPage(teacherPage);
					}
				}
			});
			return false;
		});
	}
});

//
