<?php
// 11/01/2016  - 5/20/04 SJG Some simple XML functions.

function XMLTagExtract($xml,$tag)
{	// Simple extract of a tag without child nodes. Returns only first occurrence.
	// Usage: XMLTagExtract("<XML><NAME>Sam</NAME></XML>","NAME") => "Sam"

	$tagstart=stripos($xml,"<$tag>");
	$tagend=stripos($xml,"</$tag>",$tagstart);
	if ($tagstart!==false)
		return  trim(substr($xml,$tagstart+strlen($tag)+2,$tagend-$tagstart-strlen($tag)-2));
	else
		return "";
}


?>