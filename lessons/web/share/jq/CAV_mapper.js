// Copyright 1999-2014 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CAV_mapper.js
// 12/2010 CALI Author Viewer - Mapper view

var mapSize= -1 ; //0 is small, 1 is normal

function mapsize(newSize)
{
	mapSize=newSize;
	buildMap();
	return false;
}

function buildMap()
{	// Contruct mapper flowcharts. 
	$(".map").empty();
	$('.MapViewer').removeClass('big').addClass(mapSize==1 ? 'big':'');
	
	if (mapSize==0)
	{	// Render only boxes, no lines
		// Could be used for students but need to remove popups and add coloring.
		var YSC=.15;// YScale
		var XSC=.1 ;
		for (var p in book.pages)
		{
			var page=book.pages[p];
			if (page.mapbounds != null)
			{
				var nodeLeft=XSC*parseInt(page.mapbounds[0]);
				var nodeTop=YSC*parseInt(page.mapbounds[1]);
				$(".map").append(''
					+'<div class="node tiny" rel="'+page.mapid+'" style="left:'+nodeLeft+'px;top:'+nodeTop+'px;"></div>'
					//+'<span class="hovertip">'+page.name+'</span>'
				);
			}
		}
	}
	if (mapSize==1)
	{	// Full size boxes with question names and simple lines connecting boxes.
		var YSC=1.35;// YScale
		var NW=56;//half node width
		for (var p in book.pages)
		{
			var page=book.pages[p];
			if (page.mapbounds != null)
			{
				var nodeLeft=parseInt(page.mapbounds[0]);
				var nodeTop=YSC*parseInt(page.mapbounds[1]);
				$(".map").append(''
					+(page.type=="Pop-up page" ? '':'<div class="arrow" style="left:'+(nodeLeft+50)+'px; top:'+(nodeTop-16)+'px;"></div>')
					+'<div class="node" rel="'+page.mapid+'" style="left:'+nodeLeft+'px;top:'+nodeTop+'px;">'+page.name+'</div>'
					+lineV(nodeLeft+NW,nodeTop+46,10)
					);
				var downlines=false;
				var nBranches=page.mapbranches.length;
				for (var b in page.mapbranches)
				{
					var branch=page.mapbranches[b];
					var branchLeft=parseInt(branch.bounds[0]);
					var branchTop=YSC*parseInt(branch.bounds[1])-15;
					var branchWidth=branch.bounds[2];
					if (branch.dest!="")
					{
						var destLeft=parseInt(book.mapids[branch.dest].mapbounds[0])+NW;
						var destTop =YSC*parseInt(book.mapids[branch.dest].mapbounds[1]);
						if (destTop>nodeTop) downlines=true;
						var x1 =branchLeft+branchWidth/2;// nodeLeft+NW-(b-nBranches/2)*5;
						var y1 =branchTop+18;// nodeTop+46;
						var y2 = y1 + 10 +((nBranches-b)*2);
						var x2,x3;
						if (destLeft<x1 ) {x2=destLeft;x3=x1;} else {x2=x1;x3=destLeft};
						$(".map").append(''
							+(destTop>nodeTop ?  lineV( x1,y1, y2-y1) + lineH(x2,y2,x3-x2):'')
							);
					}
					$(".map").append( 
						'<div class="branch" rel="'+branch.dest+'" style="left:'+(branchLeft)+'px; top:'+branchTop+'px; width:'+branchWidth+'px;">'+branch.text+'</div>');
				}
			}
		}
		$('.map > .branch').click(function(){focusNode($('.map > .node[rel="'+$(this).attr('rel')+'"]'));	});
	}
	$('.map > .node').click(function(){	focusNode($(this));});
	/*$('.map > .node').simpletip({
			onBeforeShow: function(){
				// Note this refers to the API in the callback function this.load('content.txt');
				this.update('<b>Hi</b> this is a tip');
			} });
	*/
   // Setup tooltips on all the new span elements
   if(0)
	// these tooltips don't work properly within a scrolling field. :(
	$('.map > .node').qtip(
   {
      content: '...', // Give it a loading message while request is being sent
      position: {
         corner: {
            target: 'topMiddle',
            tooltip: 'bottomMiddle'
         }
      },
      show: {
         //when: 'click', // Show it on click...
         solo: true // ...but hide all others when its shown
      },
      //hide: 'unfocus', // Hide when it loses focus...
      style: {
         tip: true, // Create speech bubble tip at the set tooltip corner above
         textAlign: 'center',
         name: 'cream'
      },
      api: {
         // Retrieve the content when tooltip is first rendered
         onRender: function()
         {
            var self = this;
            self.updateContent(book.mapids[$(this.elements.target).attr('rel')].name);
         }
      }
   });
	
	focusPage()
}
function focusPage()
{
	focusNode($('.map > .node[rel="'+page.mapid+'"]'))
}
function focusNode(node)
{
	if (node.length==0)return; 
	if (node.hasClass('mark')) return;
	$('.map>.node').removeClass('mark');
	$('.MapViewer').scrollTo(node.addClass('mark'),{duration:500,center:true});
	gotoPage(book.mapids[$(node).attr('rel')].name);
}
function lineV(left,top,height)
{
	return '<div class="line" style="left:'+left+'px;top:'+top+'px;width:1px;height:'+height+'px;"></div>';
}
function lineH(left,top,width)
{
	return '<div class="line" style="left:'+left+'px;top:'+top+'px;width:'+width+'px;height:1px;"></div>';
}
//
