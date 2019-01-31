// Copyright 2017 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// 07/2017 SJG This page renders existing CALI Author Mapper flowchart using Cytoscape JS Charting Library.

var LSN;
var cy;
//var HREFBase="https://www.cali.org/lessons/web/"+LSN+"/lessontext.php?#";
var base=parent.location +"/../";
var HREFBase=base+"lessontext.php?";   
var elements=[];
var nodeColor={3:'#C4E1FF',4:'#ccc',5:'#ccf', 13:'#ccf',14:'#8f8',15:'#f88',16:'#ff8',18:'#ccf'};// Map branch kind to a color
var edgeColor={/*3:'#FFe080',*/4:'#ccc',5:'#ccf', 13:'#00f',14:'#080',15:'#f00',16:'#cc0',18:'#00f'};// Map branch kind to a color
var mapTOC;// starting page (table of contents)
var mapTOCNode;
var skipLTcenter=false;

function wrap1st(str)
{	// try to wrap page name nicely using line break before first number or colon.
	for (var i=0;i<str.length-1;i++){
		switch (str.charCodeAt(i))
		{
			case 32:
				var c= str.charCodeAt(i+1);
				if (c>=48 && c<=57)
				{
					return str.substr(0,i)+"\n"+str.substr(i+1);
				}
				break;
			case 58:
				return str.substr(0,i+1)+"\n"+str.substr(i+1);
		}
	}
	return str;
}

function bounds2xy(bounds)
{
	bounds=bounds.split(",");
	return {x:2*(parseInt(bounds[0])
					 + parseInt(bounds[2])/2
					 ),y:2*parseInt(bounds[1]) };
}
	
function addPage(page)
{
	if (page.KIND == 5) return; // Declutter - don't show Popups'

	var pos=bounds2xy(page.BOUNDS);
	page.NAME=wrap1st(page.NAME);
	var ePage= { 
      data: { id: page.ID,name:page.NAME/*.replace(" - ","\n")*/,href:'#'+page.HREF, tip:page.TIP, shape:'rectangle',
		color: nodeColor[parseInt(page.KIND)] || nodeColor[3] //nodeColorDefault // '#fe8' // color:'#FF8020'
		},
      position: pos
    }  ;
	elements.push ( ePage);
   
	if (page.NAME=="Contents"){
		mapTOC=ePage;
	}
	if (page.BRANCHES)
	{
		var outlinks={};//reduce outlink clutter
		page.BRANCHES.forEach(function(e,i)
		{
			e = e["@attributes"];
			
			var kind=parseInt(e.KIND);
			var bcolor=edgeColor [ kind] || edgeColor[4];// '#ccc' ;
			if( 1 )
			{	// each choice has a node and 2 edges
				var bid=page.ID+"_"+i;
				var pos=bounds2xy(e.BOUNDS);
				var eChoice= { data: { id: bid,name:e.NAME, dest:e.DEST,	/*href:ePage.data.href,	*/ color: nodeColor [ parseInt(e.KIND)] || '#ccc' ,shape:'roundrectangle'	},	position: pos }	 ;
				elements.push ( eChoice);
				
				var width=2;
				var style='solid';
				
				// Fake sample usage results:
				/*if (kind >=14 && kind<=16)
				{
					if (Math.random()<0.66)
						{ style='dashed'; }
					else  {width=4; }
				}
				*/

				var b1 = {data:{source:page.ID,target:bid, z:1 , color: bcolor,arrow:'none', width:width, style:style}}
				elements.unshift(b1);
				if (e.DEST !='' && e.DEST!=page.ID)
				{
					var b2 = {data:{source:bid,target:e.DEST,  z:2 , color: bcolor, arrow:'triangle', width:width, style:style}}
					elements.unshift(b2);
				}
			}
			else
			if (e.DEST !='')
			{	// each choice is simply an edge
				var b = {data:{source:page.ID,target:e.DEST, name:e.NAME, z:(e.name=="Next")? 1:2 , color:bcolor} }
				if (! (b.data.name=="Next" && outlinks[b.data.target]))// Reduce clutter: skip 'Next' if any other button goes to same location
				{
					//console.log(b.data.color+"@"+e.KIND + ": Branch "+e.NAME+" goes to [" + e.DEST+"]");
					//console.log(' target='+b.data.target+' z='+b.data.z + ' name='+b.data.name  );
					delete b.data.name;
					outlinks[b.data.target]=1;
					elements.unshift(b);
				}
			}
		});
	}
}

function buildMap(CAMapperXML)
{
	var mapper = xmlToJson( CAMapperXML); 
	
	mapper.MAPPER.PAGES.PAGE.forEach(function(page){	// Add Page nodes
		var attr=page["@attributes"];
		if (page.BRANCH)
		{
			if (!Array.isArray(page.BRANCH)) page.BRANCH=[page.BRANCH];
			attr.BRANCHES=page.BRANCH;
		}
		addPage( attr) ;
	});
	
	elements=elements.filter(function(e){		// Remove links back to TOC to reduce clutter
		return (e.data.id) || ((e.data.target != mapTOC.data.id) )
		});
	/*
	for (var i in linksTo)
	{
		var id=linksTo[i];
		if (!pageIDs[id])
		{
			addPage({ID:id,NAME: '? #'+id, KIND:"3", HREF: "" ,
			  BOUNDS:(mapTOC.position.x-500)+","+(mapTOC.position.y-100) ,
			  TIP:""
			  //,BRANCHES:[{DEST:mapTOC.data.id}]
			  });
		}
	}
	*/
	var lsnTitle=mapper.MAPPER.INFO.TITLE['#text'];
	addPage({ID:"TOP",NAME: lsnTitle, KIND:"3", HREF: "" ,
			  BOUNDS:mapTOC.position.x+","+(mapTOC.position.y-100) ,
			  TIP:""
			  //,BRANCHES:[{DEST:mapTOC.data.id}]
			  });

	
	cy=cytoscape({
		container: document.getElementById('cy'),
	 
		zoom: 0.2,
		userZoomEnabled: true,
		zoomingEnabled: true,
		wheelSensitivity: 0.5,
		
		elements: elements,
		layout: {
			name: 'preset'
			
			//name: 'cose' // 'cose-bilkent'
			//name: 'breadthfirst' ,roots : roots
			//name:'concentric' randomize: false, 
	
		},
	
	  // so we can see the names
	  style: [
			{
				selector: 'node',
				style: {
					'content': 'data(name)',
					'width': 'label',
					'height': 'label',
					'shape': 'data(shape)',
					'text-valign': 'center',
					'font-size': '1em',
					'padding':'0.5em',
					
					'text-wrap':'wrap',
					'text-max-width' : '250px',// '150px',
					
					//'text-outline-width': '1em',
					//'text-outline-color': '#fff', // 'data(color)' ,
					//'text-outline-color': 'data(color)' ,
					
					//'text-background-color':'data(color)' ,
					//'text-background-opacity': 0.75,
					'text-background-padding':'0.2em',
					'background-color': 'data(color)' 
				}
			},
			{
				selector: 'edge',
				style: {
					'source-distance-from-node': 5,
					//'target-endpoint':'0deg',
					//'source-endpoint':'180deg',
					'loop-direction':'90deg',
					
					//'z-index:': 'data(z)',
					'width': 'data(width)',
					'line-style':'data(style)',
					
					'source-label':'data(name)',
					'source-text-offset':20,
					'color': 'data(color)',
					'text-opacity':1.0,
					'font-size': '0.75em',
					'text-background-color':'#fff',
					'text-background-opacity':1,
					
					'curve-style': 'bezier', //'segments', //
					'control-point-weight': 0.25,
					
					'opacity': 1, // 0.666,
					//'target-arrow-shape': 'triangle',
					'target-arrow-shape': 'data(arrow)',
					//'source-arrow-shape': 'circle',
					'line-color': 'data(color)',
					'source-arrow-color': 'data(color)',
					'target-arrow-color': 'data(color)',
				}
			}
	  ]
	
	});
	//cy.nodes.ungrabify()
	cy.on('tap', 'node', function(){
		var href= this.data('href') ;
		if (href)
		{	// A page node : scroll lesson text, center self.
			//console.log('Tap node '+this.data('id'));
			if (!skipLTcenter){// avoid double-sync
				document.getElementById("ltframe").src = HREFBase +  href;
			}
			cy.animate( {zoom:1, center:{ eles: this} } );
		}
		else
		{	// A Choice node: go to next page, to as above.
			var destID= this.data('dest');
			if (destID)
			{
				var destNode = cy.$('#'+destID );
				//console.log('Tap choice to node '+destID);	
				//cy.animate( {zoom:1, center:{ eles: destNode} } );
				destNode.trigger('tap'); // tap!!
				//destNode.select();
			}
		}
	  });
	cy.minZoom(cy.zoom());
	cy.autolock(true);
	mapTOCNode=cy. $('#'+mapTOC.data.id);
	//zoomPage(mapTOC.data.id);//
	mapTOCNode.trigger('tap'); // tap!!
	$('#ltframe').load(function(){	//  capture clicks in LessonText to sync the map.
		mapTOCNode.trigger('tap'); // tap!!
		//cy.animate( { fit:{padding:30}})		
		
		var ltframe= $('#ltframe').contents();
		
		ltframe.find('a').click(function(){
			scrollMap2HREF($(this).attr('href'));
		});
	
		ltframe.scroll(function(){
			var windowHeight = ltframe.height() ;
			var scrollTop = ltframe.scrollTop() + 100;
			var first = false;
			var e=[];
			$('#ltframe').contents().find("a[name]").each( function() {
				var offset = $(this).offset();
				e.push(this);
				if (scrollTop <= offset.top && ($(this).height() + offset.top) < (scrollTop + windowHeight) && first == false) {
					first=true;
					return false;
				}
				else
					return true;
			});

			if (  first){
				if (e.length>2)
				{
					e=e[e.length- 3];
					scrollMap2HREF('#'+$(e).attr('name'));
				}
			}
		});
	
	});
	
	$('#btnZoomIn').click(function(){
		cy.animate( {zoom:1, center:{ eles: mapTOCNode} } );
	});
	$('#btnZoomOut').click(function(){
		cy.animate( { fit:{padding:30}})
	});
	$().alert();$('.alert').delay(8000).slideUp(200,function(){$(this).alert('close')});
}//buildMap


var centerTimer;// cut down overload when user scrolls quickly.
var centerHREF;
function scrollMap2HREF(href)
{	// Center map on node with matching href, like 'P_005'
	if (href=='') return;
	centerHREF=href;
	clearTimeout(centerTimer);
	centerTimer = setTimeout(function(){
		//console.log('scrollMap2HREF href='+href);
		skipLTcenter=true;
		var node = elements.find(function(e){
			return e.data.href == href;
		});
		if ( node ){
			//console.log('mapper node='+node.data.id);
			//console.log('mapper node href='+node.data.href);
			//cy.animate( {zoom:1, center:{ eles: node} } );
			var destNode = cy.$('#'+node.data.id );
			destNode.trigger('tap'); // tap!!
		}
		skipLTcenter=false;
	},250);
}
function loadDefaultMap()
{
	var mapxml=base+"report-mapper.xml";
	$.get( mapxml, function( data ) {
	  buildMap(data);
	});
}
