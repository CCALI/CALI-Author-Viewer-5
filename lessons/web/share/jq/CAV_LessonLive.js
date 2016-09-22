//#############################################################
// 8/2016 CALI Author Viewer's LessonLive - live view of lesson link data.
//#############################################################

var lessonLive={
	Summary:{}, // Aggregated score save user data downloaded from server
	revealUsers:0,// if true, show user real names, otherwise use the place holders
	revealResponses:0, // if true, always show scores
	revealScores:0, // when true, show score breakdowns for page
	pagename:'', // name of current page being displayed
	DownloadSilentInterval:0 // Interval downloader of JSON
}

function attachLessonLiveReportToPage( )
{	// Attach or update the LessonLive info/progress bars for the current page.
	// Since this can change on the fly, needs to be handled via jQuery updates to the DOM rather than during the page's initial Layout process.
	
	if (!page) return;
	if (!lessonLive.Summary.lesson) return; // No lesson live, do nothing. 
	if (!lessonLive.Summary.pages) return;
	if (page.name!=lessonLive.pagename) {
		lessonLive.pagename=page.name;
		lessonLive.revealScores=false;
	}
	if (lessonLive.revealResponses) {
		lessonLive.revealScores=true;
	}
	
	var LessonLivePageInfo='';// Prompt to teacher about lesson live info for this page, such as if lesson live doesn't apply, or total students answered.
	var pageLL = lessonLive.Summary.pages[page.name];
	if (pageLL )
	{	// At least 1 student has viewed this page. 
		LessonLivePageInfo= 'Students responded: ' + pageLL.total;
		$('.llChoice').text('').append('LessonLive');
		pageLL.marks=[];// right/wrong for each user
		pageLL.answer=[];// answer choice for each user
		pageLL.text=[];// text of the choices
		// Add custom percent/progress bars per question type. 
		if (page.type=="Multiple Choice" && page.style=="Choose Buttons")
		{	// Tally results for each button, eg., Yes, No, Maybe
			for (var b=0;b<page.captions.length;b++) {
				lessonLiveAttachOne(pageLL,1,b+1,'llChoice'+b+'_0');
				pageLL.text[b+1]=page.captions[b];
			}
		}
		else if (page.type=="Multiple Choice" && page.style=="Choose List") 
		{	// Tally results for each choice, eg., A, B, C, D
			for (var d=0;d<page.details.length;d++) {
				lessonLiveAttachOne(pageLL,1,d+1,'llChoice0_'+d);
				pageLL.text[ d+1 ]= page.details[d].letter;
			}
		}
		else if (page.type=="Multiple Choice" && page.style=="Choose MultiButtons")
		{	// Tally results for each button and each choice, eg., A-Yes, A-No, B-Yes, B-No, etc. 
			for (var d=0;d<page.details.length;d++) {
				pageLL.text[ d +1]= page.details[d].letter;
				for (var b=0;b<page.captions.length;b++)
				{
					lessonLiveAttachOne(pageLL,d+1,b+1,'llChoice'+b+'_'+d);
				}
			}
		}
		else
		{	// Any unhandled page type gets a generic 'LessonLive not available for this type'. 
			LessonLivePageInfo='LessonLive data not presented for this page type.'
		}	
		
		// Build list of user right/wrong/unanswered ticks - indicates how many students responded so far to this page.
		if (!lessonLive.revealScores)
		{
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
			LessonLivePageInfo = LessonLivePageInfo + '<div class=llChoice>'+marks+'</div>';
		}
	}
	else
	{	// Page not seen by any student yet.
		LessonLivePageInfo='';
	}
	
	if (LessonLivePageInfo!='') {
		LessonLivePageInfo += '<P></P>';
		if (lessonLive.revealScores && pageLL.total>0)
		{	// show the right/wrong thermometer bar for easy identifying problem questions.
			var percent=Math.round(100*pageLL[1].right/pageLL.total);
			LessonLivePageInfo +=  '<P></P>'
				+'<div class=llChoice> '
				+'<div class=llBar style="width:'+(pageLL.total*8)+'">'
				+lessonLiveBar('right',pageLL[1].right)
				+lessonLiveBar('wrong',pageLL[1].wrong)
				+lessonLiveBar('maybe',pageLL[1].maybe)
				+lessonLiveBar('info',pageLL[1].info)
				+'</div>'
				+ pageLL[1].right +' / ' + pageLL.total + ' ' +  percent +'%'
				+'</div>';
		}
		else
		{
			LessonLivePageInfo+='<P><a class="HyperButton">Reveal Student Responses</a></P>';
		}
	}

	
	// Build list of users and their scores.
	html='';
	if (lessonLive.revealUsers) {
		lessonLive.Summary.users.sort( function(a,b){return icaseCompare(a.email,b.email);}); // Sort users by email
	}
	for (var u=0;u<lessonLive.Summary.users.length;u++)
	{
		var grade='none';
		var text='';
		if (pageLL && pageLL.marks){
			grade = pageLL.marks[u ];
			if (pageLL.answer[u]) {
				text=pageLL.text[pageLL.answer[u]];
			}
		}
		if ((!lessonLive.revealScores)) {
			if (grade!='none'){
				grade='answered';// if not showing scores, mark user only as having answered.
			}
			text='-';
		}
		html+='<div class="llUser '+grade+'" id=llUser'+u+'>'
			+'<span class="llIcon none">'+text+'</span> '
			+(lessonLive.revealUsers ? lessonLive.Summary.users[u].email : 'Student '+(u+1))+'</div>';
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

function lessonLiveBar(grade,numSlots)
{
	if (!numSlots) {
		return '';
	}
	var html='';
	for (var i=0;i<numSlots;i++) {
		html+='<span class="llBarChunk answer ' + grade  + '"/>';
	}
	return html;	
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
	if (total>0 && pageLL[subQ][choice])
	{
		var grade=pageLL[subQ][choice].grade;
		percent=Math.round(100*numUsers/total);
		// Track each user's response for the summary list.
		for (var i=0;i<numUsers;i++) {
			html+='<span class="llBarChunk answer ' + (lessonLive.revealScores? grade : 'none')  + '"/>';
			var u= pageLL[subQ][choice]['users'][i];
			pageLL.marks[u]=grade;
			pageLL.answer[u]=choice;
		}
	}
	else
	{
		percent='';
	}
	if (!lessonLive.revealScores) {
		html ='<span class="llBarChunk answer none"/>';
	}
	html='<div class=llBar style="width:'+(total*8)+'">'+html+'</div>'
		+(lessonLive.revealScores?numUsers:'-')+' / '+total+' '+ (lessonLive.revealScores? percent :'--') +'%';
	$('#'+domid).html(html); 
}

function lessonLiveDownloadSilent()
{	// Download score save xml summary data from website
	var scoreSaveSummaryURL="/lessons/web/share/jq/LessonLiveSample.php?";
	if (lessonLive.Summary.lesson) {
		// Request report only if data newer that the LastUpdate.
		scoreSaveSummaryURL += '&lastupdate='+lessonLive.Summary.lesson.LastUpdate;
	}
	console.log('Loading data from '+scoreSaveSummaryURL);
	$.ajax({
		url: scoreSaveSummaryURL,
		dataType: "json",
		timeout: 15000,
		error: function(data,textStatus,thrownError){
		  //alert('Error occurred loading the XML from '+this.url+"\n"+textStatus);
			trace('Download of LessonLive data failed: '+textStatus);
			clearInterval(lessonLive.DownloadSilentInterval);
			lessonLive.DownloadSilentInterval=setInterval("lessonLiveDownloadSilent()", 9000); // wait 9 seconds to try again.
		 },
		success: function(data)
		{
			console.log('Downloaded LessonLive data'); 
			if (data.lesson ) {
				// update live percent bars, user data.
				lessonLive.Summary=data;
				console.log('Lesson Name: '+lessonLive.Summary.lesson["Lesson Name"]);
				attachLessonLiveReportToPage();
			}
			else
			{
				console.log('No new LessonLive data');
			}
			clearInterval(lessonLive.DownloadSilentInterval);
			lessonLive.DownloadSilentInterval=setInterval("lessonLiveDownloadSilent()", 5000); // load data again
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
					attachLessonLiveReportToPage();
					$('#llRevealNamesCB').prop('checked',true);
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
	if (1) {
		$('#llHeaderPage').removeClass('hidestart'); 
		$('#llPanel').removeClass('hidestart');
		$('#llRevealNamesCB').change(function(){
			if ($(this).is(':checked'))
			{
				llDialogRevealNames();
			}
			else
			{
				lessonLive.revealUsers=false;
				attachLessonLiveReportToPage( )
			}
		 });
		$('#llRevealResponsesCB').change(function(){
			lessonLive.revealResponses= ($(this).is(':checked'));
			attachLessonLiveReportToPage( )
		 });
		lessonLiveDownloadSilent();
	}
});

//
