// Copyright 1999-2024 CALI, The Center for Computer-Assisted Legal Instruction. All Rights Reserved.
// CALI Viewer 5, logic handler - 09/29/23
/*
	Handles variables declared in the lesson.
	Handles logic within text.
	Logic:
		
		SET varName = expression
		
		IF condition
		ENDIF
		
		IF condition
		ELSE
		ENDIF
		
		expression
	
*/

//vars=new Map();// lesson's variable/value pairs. Saved with ScoreSave data.
//vars.set('NextPage','');
//console.log(vars);
var logicBlock={
	vars:{},
	buffer:"",
	PRINT:function(str){logicBlock.buffer+=str;}
};

function logicInit()
{	// See if variables page exists
	page = book.pages['Scripting Logic Variables'];
	if (page)
	{
		StartPage="";
		var js='';
		var jsBlock='';
		var parts=page.text.split('%%');
		if (parts.length>1)
		{	// Got some code
			logicBlock.buffer='';
			parts.forEach((part,i)=>
			{
				if ( i%2==1)
				{
					var codeLines=$('<div />').html(part.replaceAll('</p>',"</p>\n")).text().split("\n");
					codeLines.forEach((line)=>{
						line=line.trim();
						line=line.split('//')[0];
						if (line!='')
						{
							var lineU=line.toUpperCase();
							if (lineU.indexOf('SET ')==0)
							{
								js=line.substr(4);
								var i=js.indexOf("=");
								console.log(js);
								if (i>0)
								{
									var name=js.substr(0,i).trim();
									var exp=js.substr(i+1);
									js='logicBlock.vars["'+name+'"]='+exp+';';
								}
								else
									js='????????';
							}
							else
							if (lineU.indexOf('IF')==0)
								js="if ("+line.substr(3)+"){";
							else
							if (lineU.indexOf('ELSE')==0)
								js='}else{';
							else
							if (lineU.indexOf('ENDIF')==0)
								js='}';
							else
								js='PRINT('+line+');';
							jsBlock+=js+"\n";
						}
					});
				}
				else
				{
					jsBlock+='PRINT("'+part+'");\n';
				}
			});
			console.log(jsBlock);
			
			js=new Function('with (logicBlock)with (logicBlock.vars){'+jsBlock+'}');
			console.log(js);
			console.log(js.toString());
			console.log(logicBlock);
			try {
				js();
			} catch (error){
				logicBlock.PRINT("<h1>Error "+error+"</h1>");
			}
			console.log(logicBlock);
			var text=logicBlock.buffer.replaceAll('<p></p>','');
			console.log(text);
		}
	}
}

