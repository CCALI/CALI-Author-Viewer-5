//#############################################################
// 8/2016 CALI Author Viewer's LessonLive - live view of lesson link data.
//#############################################################

var lessonLiveSummary={}; // Aggregated score save user data downloaded from server
var lessonLiveDownloadSilentInterval; // Interval downloader of JSON

function attachLessonLiveReportToPage(options)
{	// Attach or update the LessonLive info/progress bars for the current page.
	// Since this can change on the fly, needs to be handled via jQuery updates to the DOM rather than during the page's initial Layout process.
	
	if (!page) return;
	if (!lessonLiveSummary.lesson) return; // No lesson live, do nothing. 
	if (!lessonLiveSummary.pages) return;
	
	
	var LessonLivePageInfo='';// prompt to teacher about lesson live info for this page, such as if lesson live doesn't apply, or total students answered.
	
	//if (!$('.PageInteraction .LessonLivePageInfo').length)
	//{	// Ensure we have a place to put the prompt.
	//	$('.PageInteraction').append('<div class=LessonLivePageInfo/>');
	//}
	var pageLL = lessonLiveSummary.pages[page.name];
	if (pageLL )
	{	// At least 1 student has viewed this page. 
		LessonLivePageInfo= 'Students responded: ' + pageLL.total;
		$('.llChoice').text('').append('LESSONLIVEHERE');
		pageLL.marks=[];
		// Add custom percent/progress bars per question type. 
		if (page.type=="Multiple Choice" && page.style=="Choose Buttons")
		{	// Tally results for each button, eg., Yes, No, Maybe
			for (var b=0;b<page.captions.length;b++) {
				lessonLiveAttachOne(pageLL,1,b+1,'llChoice'+b+'_0');
			}
		}
		else if (page.type=="Multiple Choice" && page.style=="Choose List") 
		{	// Tally results for each choice, eg., A, B, C, D
			for (var d=0;d<page.details.length;d++) {
				lessonLiveAttachOne(pageLL,1,d+1,'llChoice0_'+d);
			}
		}
		else if (page.type=="Multiple Choice" && page.style=="Choose MultiButtons")
		{	// Tally results for each button and each choice, eg., A-Yes, A-No, B-Yes, B-No, etc. 
			for (var d=0;d<page.details.length;d++) {
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
		var marks='';
		for (var u=0;u<pageLL.marks.length;u++)
		{
			if (! pageLL.marks[u ]) {
				pageLL.marks[u ]='none';
			}
			var grade=pageLL.marks[u ];
			marks += '<span class="llBarChunk answer '+ grade + '"/>';
		}
		LessonLivePageInfo = LessonLivePageInfo + '<div class=llChoice>'+marks+'</div>';
	}
	else
	{	// Page not seen by any student yet.
		LessonLivePageInfo='';
	}
	
	// Build list of users and their scores.
	html='';
	lessonLiveSummary.users.sort( function(a,b){return icaseCompare(a.username,b.username);}); 
	for (var u=0;u<lessonLiveSummary.users.length;u++)
	{
		var grade='';
		if (pageLL.marks){
			grade = pageLL.marks[u ];
		}
		if (grade!='none' && !(options && options.showScores==true)) {
			grade='answered';// if don't show scores, flag user score simply as having answered.
		}
		html+='<div class="llUser '+grade+'" id=llUser'+u+'>'+'<span class="llIcon none">'+'</span> '+lessonLiveSummary.users[u].email+'</div>';
	}
	$('#llPanel').html(html);
	
	
	$('.PageInteraction .llPageInfo').unbind('click').click(function(){attachLessonLiveReportToPage({showScores:true});}).html(LessonLivePageInfo);
	//$('.PageInteraction .llPageInfo').unbind('click').click(function(){$('#llPanel').toggle();}).html(LessonLivePageInfo);
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
	if (total>0)
	{
		percent=Math.round(100*numUsers/total);
		// Track each user's response for the summary list.
		for (var i=0;i<numUsers;i++) {
			html+='<span class="llBarChunk"/>';
			pageLL.marks[pageLL[subQ][choice]['users'][i]]=pageLL[subQ][choice].grade;
		}
	}
	else
	{
		percent='';
	}
	html='<div class=llBar style="width:'+(total*8)+'">'+html+'</div>'+numUsers+' / '+total+' '+ percent +'%';
	//console.log(subQ,choice,domid,$('#'+domid).html());
	$('#'+domid).html(html); 
}

function lessonLiveDownloadSilent()
{	// Download score save xml summary data from website
	var scoreSaveSummaryURL="/lessons/web/share/jq/LessonLiveSample.php?";
	if (lessonLiveSummary.lesson) {
		scoreSaveSummaryURL += '&lastupdate='+lessonLiveSummary.lesson.LastUpdate;
	}
	console.log('Loading data from '+scoreSaveSummaryURL);
	$.ajax({
		url: scoreSaveSummaryURL,
		dataType: "json",
		timeout: 15000,
		error: function(data,textStatus,thrownError){
		  //alert('Error occurred loading the XML from '+this.url+"\n"+textStatus);
			trace('Download of LessonLive data failed: '+textStatus);
			clearInterval(lessonLiveDownloadSilentInterval);
			lessonLiveDownloadSilentInterval=setInterval("lessonLiveDownloadSilent()", 9000); // wait 9 seconds to try again.
		 },
		success: function(data)
		{
			console.log('Downloaded LessonLive data'); 
			if (data.lesson ) {
				// update live percent bars, user data.
				lessonLiveSummary=data;
				console.log('Lesson Name: '+lessonLiveSummary.lesson["Lesson Name"]);
				attachLessonLiveReportToPage();
			}
			else
			{
				console.log('No new LessonLive data');
			}
			clearInterval(lessonLiveDownloadSilentInterval);
			lessonLiveDownloadSilentInterval=setInterval("lessonLiveDownloadSilent()", 5000); // load data again
		}
	});
	return false;
}


$(document).ready(function()
{	// Check if this is a LessonLive presentation.
	if (1) {
		//console.log(window);
		// Currently place holder.
		$('#llHeaderPage').removeClass('hidestart'); 
		$('#llPanel').removeClass('hidestart'); 
		lessonLiveDownloadSilent();
	}
});

//
