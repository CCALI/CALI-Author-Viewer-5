<?php
// 07/12/2005 SJG Let Deb bring up a page in CAV by including lesson and page name from email message
// 08/27/2009 SJG Points to new site and lesson structure.
// 02/11/2010 SJG make sure pages with '/' in name are handled.
// 02/11/2010 SJG Implemented as standalone on drupal site.
?><title>CALI Author Flash Page Jumper</title><body bgcolor="#FFFFFF">
<p><img src="CALIWebSiteTools2.png" width="512" height="150" /></p>
<h1>Lesson Page Jumper</h1>
<p>Enter a Subject from a user's email regarding a Flash lesson to see the original page.<br />
</p>
<form name="CAV" id="CAV" onsubmit="return dojump()">
	<script language="JavaScript" type="text/javascript">
function dojump()
{
	var txt=document.forms["CAV"].elements["message"].value;
	//txt should look like this example:
	// CALI Lesson Comment: BA08/Elements of Partnership 1a (04/14/2005)-CAV
	str=new String(txt);
	str=str.replace("CALI Lesson Comment: ","");
	versionDate=/[(]\d+[\/]\d+[\/]\d+[)]/gi;
	str=str.replace(versionDate,"");
	str=str.replace("-CAV","");
	str=trimAll(str);
	var i=str.indexOf("/");
	if (i<0)
	{	
		lesson=str;
		page=null;
	}
	else
	{
		lesson=str.substr(0,i);
		page=str.slice(i+1);
	}
	//url="http://www.cali.org/lessons/web/"+lesson+"/flash.php";
	url="/lessons/web/"+(lesson.toLowerCase())+"/flash.php";
	if (page!=null)
		url += "?page="+escape(page);
	//alert("Lesson="+lesson+"\n"+"Page="+page+"\n"+"URL="+url);
	window.open(url);
	return false;
}
function trimAll(sString)
{
	while (sString.substring(0,1) == ' ')
	{
		sString = sString.substring(1, sString.length);
	}
	while (sString.substring(sString.length-1, sString.length) == ' ')
	{
		sString = sString.substring(0,sString.length-1);
	}
	return sString;
}

				</script>
	<input name="message" type="text" size="80"
xvalue="CALI Lesson Comment: BA08/Elements of Partnership 1a (04/14/2005)-CAV" />
	<input type="submit" value="Jump To It" />
</form>
		<table border="2" cellpadding="9" cellspacing="0" bgcolor="#e0e0e0">
			<tr>
				<th colspan="2">Sample uses:</th>
			</tr>
			<tr>
				<td valign="top">Paste in the Lesson Comment email subject line:</td>
				<td><p>CALI Lesson Comment: BA08/Elements of Partnership 1a (04/14/2005)-CAV</p>
						<p>CALI Lesson Comment: LR55/Definitions 4/6 (08/25/2006)-CAV</p></td>
			</tr>
			<tr>
				<td valign="top">Lesson and page name</td>
				<td>EVD04/Larceny Q20A</td>
			</tr>
			<tr>
				<td valign="top">Or just a lesson</td>
				<td>TRT20</td>
			</tr>
		</table>
<ul><li>2/10 Fixed a bug with '/ in page names</li>
	<li>8/09 Updated to run lessons from www.cali.org.</li>
	<li>7/12/2005 Implemented</li>
</ul>
