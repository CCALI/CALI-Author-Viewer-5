<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script src="jQuery/jquery-1.6.1.min.js" type="text/javascript"></script>
<script src="CAV_urls.js" type="text/javascript"></script>
<script xsrc="CAV_LessonPast.js" type="text/javascript"></script>
<link href="LessonLinkPast.css" rel="stylesheet" type="text/css" />
<link href="CALILessonFont/style.css" rel="stylesheet" type="text/css" />

<title>Lesson Link Past - CALI</title>


<script language="javascript">
	// 10/18/2016 Generate LessonLink reports for past use.
	var runid=0;
</script>

<?php
// 10/24/2016 SJG Current version expects runid, handled same way as lesson live.
// Need alternate version that accepts course/lesson id so works directly from LessonLink manager.
// Calls the .php LessonLinkSummary rather than embedding data directly. 
?>

<script language="javascript">

var usage={}; // Populated with lesson aggregate data.

var pageTypeNice={
	// Transforms internal page type/style into something teacher friendly.
	"Multiple Choice/Choose List":"Choose from list",
	"Multiple Choice/Choose Buttons":"Choose one",
	"Multiple Choice/Choose MultiButtons":"Choose one, with subquestions",
	"Prioritize/PDrag":"Drag and Drop"
	// Needs more entries here
}
var sortUsersBy="name";
var sortPagesBy="score";

function buildUsers()
{
	var optIncludeAllDates=$('#optIncludeAllDates').is(':checked');
	
  // User information
  // Sample record for usage.users[]
  var sample={
      "userid": 1,
      "name": "Brown, Charlie",
      "right": 57,
      "wrong": 23,
		"rundates": ["2016-06-19 23:18:14", "2016-06-23 12:48:45"]
    };
  var rows=[];
  for (var ui=0;ui<usage.users.length;ui++)
  {
		var user=usage.users[ui];
		var percent=0;
		var total=user.right+user.wrong;
		if ( total > 0) {
			percent=100 * user.right / total;
			percentDisplay = Math.round( percent)+'%'; 
		}
		else
		{
			percentDisplay='-';
		}
		var columns=[
			'<span class="icon-user"></span>'+(ui+0)
			,'<a target=_blank href="https://www.cali.org/user/'+user.userid+'">'+user.name+'</a>'
			,RWMBar(user.right,user.wrong,0)+' '+percentDisplay,user.right,user.wrong,total
			,(optIncludeAllDates ? user.rundates.join("<br>") : user.rundates[0]+' '+ (user.rundates.length>1 ? user.rundates.length : ''))
			];
		var sorts={
				name:user.name,
				score: (5000-percent) + user.name,
				right: (5000-user.right)+user.name,
				wrong: (5000-user.wrong)+user.name};
		rows.push( {key: sorts[sortUsersBy],data:'<tr><td>'+columns.join('</td><td>')+'</td></tr>'});
  }

  $('#userlist tbody').html(sortRows2HTML(rows));
}


function buildPages()
{
	var optIncludeChoices=$('#optIncludeChoices').is(':checked');
	var optIncludeAllUsers=$('#optIncludeAllUsers').is(':checked');
	// Page information
	// Sample record for usage.pages[]
	var sample={
   "R26": {
      "total": 16,
      "type": "Multiple Choice\/Choose List",
      "1": {
        "right": 15,
        "total": 16,
        "wrong": 1,
        "1": {
          "grade": "right",
          "users": [0, 1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 10],
          "text": ["A."]
        },
        "3": {
          "grade": "wrong",
          "users": [3],
          "text": ["C."]
        }
      }
	}};
	var lessonCode=usage.lesson["Lesson Code"];
	var rows=[];
	for (var pagename in usage.pages) 
	{
		var pageinfo=usage.pages[pagename];
		for (var subqi=1;subqi<=7;subqi++)
		{
			if (pageinfo[subqi])
			{
				var html='';
				var subq=pageinfo[subqi];
				var percent=0;
				var total=subq.total; 
				if ( total > 0) {
					percent = 100 * subq.right / total;
					percentDisplay = Math.round(  percent)+'%'; 
				}
				else
				{
					percent=0;
					percentDisplay='-';
				}
				var displayname=pagename;
				if (pageinfo.type=='Multiple Choice/Choose MultiButtons') {
					displayname += '#' + String.fromCharCode(64+subqi);
				}
				var key  = Math.floor(100+(percent)) +' ' + displayname.toLowerCase();
				var details=[];
				if (optIncludeChoices)
				{
					var detailsUsers=[];
					for (var ci in subq)
					{
						if (parseInt(ci)>0)
						{
							var choice = subq[ci];
							if (choice.text=='') {
								choice.text  = 'Choice '+(ci); 
							}
							details.push( 
							'<td></td>'
							+'<td class="choice '+choice.grade+'">'+String(choice.grade).toUpperCase().substr(0,1)+'</td>'
							+'<td class="choice '+choice.grade+'">'+choice.text+'</td>'
							+'<td class="choice '+choice.grade+'">'+choice.users.length+'</td>');
							if (optIncludeAllUsers)
							{
								var userlist='';
								for (var ui=0;ui<choice.users.length;ui++)
								{
									var user=usage.users[choice.users[ui]];
									userlist += '<li>'+user.name;
								}
								detailsUsers.push('<td colspan=2></td><td colspan=3 class="users choice '+choice.grade+'"><ol>'+userlist)+'</td>';
							}
						}
					}
				}
				//details = '<table class="choices">'+details+'</table>';
				//var columns=[subq.right,subq.wrong,total, ,details];
				var rowspan=(optIncludeChoices ? ((optIncludeAllUsers?2:1)*(details.length)+1) : 1);
				html += '<tr>'
					+'<td rowspan='+rowspan+'>'+'<a target=_blank href="/lessons/web/'+lessonCode+'/lessontext.php#'+escape(pagename)+'">'+displayname+'</a></td>'
					+'<td rowspan='+rowspan+' nowrap >'+RWMBar(subq.right,subq.wrong,subq.maybe) +' '+percentDisplay+'</td>'
					+'<td rowspan='+rowspan+'>'+subq.right+'</td>'
					+'<td rowspan='+rowspan+'>'+subq.wrong+'</td>'
					+'<td rowspan='+rowspan+'>'+total+'</td>'
					+'<td colspan=4>'+(pageTypeNice[pageinfo.type]? pageTypeNice[pageinfo.type]: pageinfo.type )+'</td>'
					//+'<td></td><td></td><td></td>'
					+'</tr>';
				for (var d=0;d<details.length;d++)
				{
					html+= '<tr>'+details[d]+'</tr>';
					if (optIncludeAllUsers && optIncludeChoices) html+= '<tr>'+detailsUsers[d]+'</tr>';
				}
				var sorts={
					score: (500-percent)+' '+displayname,
					right:(5000-subq.right)+displayname,
					wrong:(5000-subq.wrong)+displayname};
				rows.push( {key:sorts[sortPagesBy],data:html});
			}
		}
  }
  
  $('#pagelist tbody').html(sortRows2HTML(rows)); 
}


function sortRows2HTML(rows) /* array of {key,data} tuples */
{
	rows.sort(function(a,b){ if (a.key<b.key) return -1;else if (a.key>b.key) return 1; else return 0;});
	var html='';
	for (var r=0;r<rows.length;r++) {
		html+=rows[r].data;
	}
	return html;
}
function build()
{	// 10/18/2016 Construct report tables
	var html='';
	var info=['Organization','Semester',['Teacher',usage.lesson['Teacher Name']],'Course Name','Lesson Name','Lesson Runs',['Users',usage.users.length]];
	for (var pi=0;pi<info.length;pi++) 
	{	// Display course/lesson meta data.
		var p = info[pi];
		if (typeof p!=='object') {
			label = p;
			value = usage.lesson[p]; 
		}
		else
		if (p.length>0) {
			label = p[0];
			value = p[1];
		}
		html += '<li>'+label +': '+ value;
	}
  $('#info').html(html);
	buildUsers();	
	buildPages();
}

$(document).ready(function()
{
	runid =  (getParameterByName('runid')); 
	courseid =  (getParameterByName('courseid'));
	lessonid =  (getParameterByName('lessonid')); 
	if (runid>0 || (courseid>0 && lessonid>0)) {
		lessonLiveDownloadSilent();
	}
	trace([runid,courseid,lessonid]);
	$('#optIncludeAllDates').change(buildUsers);
	$('#optIncludeAllUsers').change(buildPages);
	$('#optIncludeChoices').change(buildPages);
	$('.sortable').click(function(){
			var sort= $(this).attr('sort');
			var table= $(this).closest('table').attr('id');
			$(this).parent().children().removeClass('sorted');
			$(this).addClass('sorted');
			if (table=='userlist') {
				sortUsersBy=sort;
				buildUsers();	
			}
			else
			if (table=='pagelist') {
				sortPagesBy=sort;
				buildPages();
			}
	//	}
	})
});

function getParameterByName(name, url)
{	//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript?noredirect=1
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function isLocalFile()
{
	return location.href.match(/^file:\/\//)
}
function lessonLiveDownloadSilent()
{	// Download score save xml summary data from website
	var scoreSaveSummaryURL=LessonLiveDownload() + '?runid='+runid+"&courseid="+courseid+"&lessonid="+lessonid;
	$.ajax({
		url: scoreSaveSummaryURL,
		dataType: "json",
		timeout: 15000,
		error: function(data,textStatus,thrownError){
			$('#info').html('Download of LessonLive data failed: '+textStatus);
			//clearInterval(lessonLive.DownloadSilentInterval);
			//lessonLive.DownloadSilentInterval=setTimeout ("lessonLiveDownloadSilent()", 9000); // wait 9 seconds to try again.
		 },
		success: function(data)
		{
			if (data.lesson )
			{
				usage.lesson = data.lesson;
				usage.pages = data.pages;
				usage.users = data.users; 
				build(); 
			}
			else{
				$('#info').html(data.error);
			}
		}
	});
	return false;
}

function trace(a)
{
	if (console && console.log){console.log(a);}
}

function RWMBar(right,wrong,maybe)
{	// Simple horizontal bar made of green, red and yellow (right,wrong,maybe) segments.
	if (!maybe) {
		maybe=0;
	}
	var total=right+wrong+maybe;
	if (total==0) {
		return ''
	}
	else{
		var W=100;
		right = right/total*W;
		wrong = wrong/total*W;
		maybe = maybe/total*W;
		return '<span><span style="height:12px; width:'
			+right+'px; display:inline-block; background-color:#0f0"></span><span style="height:12px; width:'
			+wrong+'px; display:inline-block; background-color:#f00"></span><span style="height:12px; width:'
			+maybe+'px; display:inline-block; background-color:#ff0"></span></span>';
	}
}

</script>
</head>

<body>
<h1>Lesson Link Past - CALI</h1>
<h2>Course Lesson Information</h2>

<ul id=info>
	Loading lesson score data <img src="img/ajax-loader.gif">
</ul>
<h2>Student Performance</h2>
<p>Results for each student.  Multiple LessonLink runs by a single student will be merged and only the first response for each question will be counted.</p>
<p><label><input type=checkbox value=false id=optIncludeAllDates>Include all dates of student runs</label></p>
<table id="userlist" border="1" cellpadding="5" cellspacing="0"><thead>
    <tr>
		<th nowrap  class="sortable " sort="user">User</th>
      <th nowrap class="sortable sorted" sort="name" ><p><strong>Name</strong></p></th>
      <th nowrap class="sortable" sort="score"><p>Score</p></th>
      <th  class="sortable " sort="right" ><p>Right</p></th>
      <th class="sortable " sort="wrong"  ><p>Wrong</p></th>
      <th  ><p>Total </p></th>
      <th nowrap><p>Run Date</p></th>
    </tr></thead>
  <tbody> 
  </tbody>
</table>
<h2>Page Performance</h2>
<p>Combined results for all students.</p>
<p>
	<label><input type=checkbox value=false id=optIncludeChoices>Include response breakdown</label>
		<label><input type=checkbox value=false id=optIncludeAllUsers>Include students with responses</label>
</p>


<table id="pagelist" border=1 cellpadding="5"   cellspacing=0 >
  <thead><tr>
    <th nowrap class="sortable " sort="name">Page name </th>
    <th nowrap class="sortable sorted" sort="score"> Score  </th> 
    <th nowrap class="sortable " sort="right">Right</th> 
    <th nowrap class="sortable " sort="wrong">Wrong</th> 
    <th nowrap>Total</th> 
    <th nowrap>Page type</th>
    <th nowrap>Grade</th>
    <th nowrap>Choice</th>
    <th nowrap>Students</th>
  </tr></thead>
  <tbody> 
	 </tbody> 
</table>
<p>&nbsp;</p>
<p>&nbsp;</p>
<!-- 10/18/2016 -->
</body>
</html>
