// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// 02/16/2015 Compare CALI Author Books - Worker thread
// This is a Worker Thread.





var SHOWALLPAGES= 1 ; // if true, all pages are includes in the context table (can be cluttering)
var html=''; // buffer for building text
var rowGroup = 0; // counts when we switch to a new page in context table

// These 3 passed in from Parent
var bookOld;
var bookNew;

// Import our difference comparison library
importScripts('diff_match_patch.js'  );
// Setup our difference comparison
var dmp = new diff_match_patch();
dmp.Diff_Timeout = 10;
dmp.Diff_EditCost = 4;


onmessage = function(e)
{	// Parent passes in two books to compare.
	bookOld = e.data[ 0 ];
	bookNew = e.data[ 1 ];
	compareBooks();
	postMessage({});
}

function makestr(str)
{
	if (str===null || typeof str === 'undefined') {
		str='';
	}
	return str;
}
function icaseCompare(a,b)
{	// Case insensitive comparison
	a = String(a).toUpperCase(); 
	b = String(b).toUpperCase(); 
	if (a > b) 
		return 1;
	if (a < b) 
		return -1;
	return 0; 
}

function compareBooks()
{	// Compare our two books.
	// 	First compare meta data
	// 	Pages that were added
	// 	Pages that were deleted
	// 	Pages that changed

	var p;
	rowGroup  =0;
	
	// Build list of all pages from both books and sort
	var PagesList=[];
	var PagesInv={};
	function addPages(book)
	{
		book.mapPages={};
		for (var id in book.pages)
		{	// while p is now the page name, might be the ID instead, so should use page.name for certain.
			var page = book.pages[id];
			var mapName = id; // strip spaces to make same.
			mapName = mapName.replace('  ',' ',"gi");
			//console.log(name);
			//var name=page.sortName;
			book.mapPages[mapName]=page;
			if (!PagesInv[mapName])
			{
				PagesInv[mapName]=1;
				page.mapName=mapName;
				PagesList.push(page);
			}
		}
	}	
	addPages(bookNew);
	addPages(bookOld);
	function sortPageBySortName(a,b)
	{
		return icaseCompare(a.sortName ,b.sortName );
	}

	PagesList.sort(sortPageBySortName);
	

	
	//console.log('Comparing books:'+bookOld.title+' to '+bookNew.title);
	var pageName='';
	var BOOKINFO='Book Info';
	
	function testBookProp(prop)
	{
		test(BOOKINFO,prop,bookOld[prop],bookNew[prop]);
	}
	
	function testBookProps(props)
	{
		for ( p in props)
		{
			var prop = props[p];
			testBookProp(prop);
		}
	}

	function flatten(xml)
	{	// Convert page XML into a flattened thing. Certain TAGS have whitespace for easier reading.
		//xml = '' + xml.xml();
		xml = '' + xml;
		// Split the page XML by these specific elements rather than trying to compare all the page type permutations.
		var tags=['QUESTION','TEXT','DETAIL','FEEDBACK','INITIALTEXT','RIGHT','WRONG','HINT'];
		for (var t in tags) {
			var tag = tags[t];
			xml = xml.replace('<'+tag, '<BR>'+tag+'<BR><'+tag,"gi");
		}
		//xml = xml.replace(' ALIGN="AUTO"','');//ignore these
		xml = xml.replace(' </P>','</P>',"gi");//ignore these
		 
		xml = xml.trim();
		 //console.log(xml);
		//xml = JSTextNoHTML(xml);
		return xml;
	}
	

	testBookProps(['title','lesson','CALIdescription','subjectarea','version',
						'completionTime','copyrights','credits',
						'notes',	'description']);
	rowGroup ++;
	
	// Test pages 
	/** @type {TPage} */
	var pOld;	
	/** @type {TPage} */
	var pNew;
	
	var pdiffs;
	//var FORCE=' &nbsp;';
	
	function testPagePropVal(prop,pOldVal,pNewVal)
	{
		if (test( pageName ,prop,pOldVal,pNewVal)) {pdiffs++;}
	}
	
	function testPagePropName(name,prop)
	{
		if (test( pageName ,name,pOld[prop],pNew[prop])) {pdiffs++;}
	}
	function testPagePropNameArray(name,prop)
	{	// Gather props from both, compare props of both to each other
		var oldArray = pOld[prop];
		var newArray = pNew[prop];
		//if (pageName=='Guides2') {			debugger;		}
		var props={};
		for (var prop in oldArray) {
			props[prop]=1;
		}
		for (var prop in newArray) {
			props[prop]=1;
		}
		for (var prop in props)
		{
			var eName= name + (parseInt(prop)+1) + ' '; // eltBase+( prop )+' ';
			var o  = oldArray[ prop ];
			var n  = newArray[ prop ];
			if (typeof o === 'object')
			{
				for (var subprop in o)
				{
					testPagePropVal(eName+  subprop,o[subprop],n[subprop]  );
				}					
			}
			else
			{
				testPagePropVal(eName  ,o,n  );
			}
		}
	}
	
	//console.log(PagesList);
	var changes={
		New: [],
		Changed: [],
		Deleted: [],
		Identical : []
	};
	
	// List changed pages
	//for (var ni in bookNew.pages)
	for (var ni =0; ni< PagesList.length; ni++) 
	{
		var pTest = PagesList[ni]; 
		var pageIndex = pTest.mapName;
		pageName=pTest.name;
		//if (pageName!=pageIndex) {
		//	console.log( ' (Name Change '+pageIndex+')');
	//	}
		var pNew = bookNew.mapPages[ pageIndex ];
		var pOld = bookOld.mapPages[ pageIndex ];
		pdiffs=0;
		//console.log('Testing '+pageIndex);
		postMessage({append:'#diff',html:html});//		$('#diff').append(html);
		html = ''; 
		if (pNew && pOld )
		{
			//console.log('Test Change');
			//if (pOld===null) {
			//	pOld=new TPage();
			//	pOld.xml='';
			//}
			if (!pOld) {
				console.log('ERROR');
			}
			if (pNew.xml != '' && pOld.xml != '')
			{
				//console.log('Comparing elements');
				try{
					testPagePropVal('Type / Style',		pOld.type+'/'+makestr(pOld.style), pNew.type+'/'+makestr(pNew.style));
					testPagePropName('Text Alignment',	'alignText');
					testPagePropName('Question / Text',	'text'); 
					testPagePropName('Next Page',			'nextPage'); 
					testPagePropName('Next Page Disabled','nextPageDisabled');
					
					testPagePropNameArray('Button #','buttons');
					testPagePropNameArray('Detail #','details');
					testPagePropNameArray('Hotspot #','hotspots');
	
					testPagePropName('Feedback Right','rightFeedback');
					testPagePropName('Feedback Wrong','wrongFeedback');
					testPagePropName('Essay Initial','initialText');
					testPagePropName('Essay Correct', 'correctText');
					testPagePropName('Select Slack Words Before', 'slackWordsBefore');
					testPagePropName('Select Slack Words After','slackWordsAfter');
					testPagePropName('Feedback Shared', 'feedbackShared');
			
					testPagePropNameArray('Caption #',	'captions');
					testPagePropNameArray('Feedback #',	'feedbacks');
					testPagePropNameArray('Hint #',	'hints');
					testPagePropNameArray('Category #',	'categories');
					testPagePropNameArray('Item #',	'items');
					
					
					testPagePropName('Picture Src','pictureSrc');
					testPagePropName('Picture ADA','ada');

				}
				catch (e){
					console.log(e);
				}
			}

			// Direct XML
			var tOld = flatten(pOld.xml);
			var tNew = flatten(pNew.xml);
			if ( tOld !== tNew)
			{
				pdiffs ++ ;
				if ( 0  || (pdiffs==1))
				{
					addRow(pageName,'XML',diff(tOld,tNew));
				}
			}

			if (pdiffs == 0) {
				changes.Identical.push(pageName);
			}
			else{
				changes.Changed.push(pageName);
			}
			if (SHOWALLPAGES && (pdiffs == 0)) { 
				addRow(pageName,'','Identical page');
			}
		}
		else
		{
			if (pNew)
			{
				//console.log('New',pageIndex);
				changes.New.push(pageIndex);
				//if (SHOWALLPAGES) {
				//	addRow(pageIndex,'','New page');
				//}
				var tOld = '';
				var tNew = flatten(pNew.xml);
				addRow(pageIndex,'New page XML',diff(tOld,tNew));
			}
			else
			if (pOld) 
			{
				//console.log('Deleted',pageIndex);
				changes.Deleted.push(pageIndex);
				//if (SHOWALLPAGES) {
				//	addRow(pageIndex,'','Deleted page');
				//}
				
				var tOld = flatten(pOld.xml);
				var tNew = '';
				addRow(pageIndex,'Deleted page XML',diff(tOld,tNew));
			}
			else{
				console.log('ERROR',pageIndex);				
			}
		}
		if (SHOWALLPAGES || (pdiffs > 0)) {
			postMessage({append:'#diff',html:html});//$('#diff').append(html);
			rowGroup ++;
		}
		//pNew.pdiffs = pdiffs;
		html = '';
	}
	
	if (1)
	{ 	// 2015-02-16 Prepare table summary report of new,changed,deleted pages.
		for (var c in changes)
		{
			var lst=changes[c].join('<li>');
			if (lst!='') {
				lst= '<li>'+ lst; 
			}
			//console.log(lst);
			postMessage({append:'#changes'+c,html:lst});//$('#changes'+c).append(lst);
		}
	}
	else
	{		
		if ( 1 )
		{	// List new pages
			addRowSpan('New pages');
			for (var ni in bookNew.pages)
			{
				if (!bookOld.pages[ ni])
				{
					test(ni,'',  '', ni);
				}			
			}
		}
		if (1)
		{	// list Removed pages
			addRowSpan('Deleted Pages');
			for ( var oi in bookOld.pages)
			{
				//console.log(p , bookNew.pages[p]);
				if (!bookNew.pages[ oi ])
				{
					test(oi,'',oi,'');
				}
			}
		}
		
		if ( 0 )
		{	// List identical pages
			addRowSpan('Unmodified pages');
			for (var ni =0; ni< PagesList.length; ni++) 
			{
				pNew = PagesList[ni];
				pOld = bookOld.pages[ pNew.name];
				if (pOld && pNew && ( pNew.pdiffs === 0 ))
				{
					test('',pNew.name,'',pNew.name  );
				}
						
			}
		}
	} 
	//console.log(html);
	postMessage({append:'#diff',html:html});//$('#diff').append(html);
}

function addRowSpan(info )
{
	html += ('<tr>' 
		+ '<td  colspan=3>' + info +   ' &nbsp;</td>'
		+	'</tr>');
}
function addRow(info,prop,difference)
{
	html += ('<tr class="group'+ (rowGroup%2)+'">'+
							'<td>' + info +   ' &nbsp;</td>'
							+'<td>' + prop + ' &nbsp;</td>'
						//+	'<td>'+oldT+'&nbsp;</td>'
						//+	'<td>'+newT+'&nbsp;</td>'
						+	'<td>'+difference +' &nbsp;</td>'
						+	'</tr>');
}

function diff(oldT,newT)
{	// oldT and newT are HTML blocks.
	var d = dmp.diff_main(oldT, newT);
	dmp.diff_cleanupSemantic(d);
	var ds = dmp.diff_prettyHtml(d);
	
	// Restore white space for readability
	ds = ds.replace('&lt;P&gt;','<P>&lt;P&gt;',"gi");
	ds = ds.replace('&lt;BR/&gt;','<P>&lt;BR/&gt;',"gi");
	return ds;
}
function test(info,prop, oldT, newT)
{	// Test strings for a match. If they are equal we display nothing. 
	if (typeof oldT==='undefined' || oldT===null) {
		oldT='';
	}
	if (typeof newT==='undefined' || newT===null) {
		newT='';
	}
	if (oldT === newT) {
		return false;
	}
	//console.log([info,prop]);//,prop,oldT,newT);
	addRow(info,prop,diff(oldT,newT));
	return true;
}

