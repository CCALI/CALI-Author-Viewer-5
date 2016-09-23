<?php

	/* 9/16/2016 Return sample live data. Check for the lastupdate to return the NOOP */
	
	if ($_GET['lastupdate']!='')
	{
		echo '{}';
	}
	else
	{
		//$json= 'LessonLiveSampleRealUsers_4329_532.json');
		//echo file_get_contents('LessonLiveSampleRealUsers_4344_865.json');
		//$json= 'LessonLiveSampleRealUsers_4350_706.json';
		$json= 'LessonLiveSampleRealUsers_4344_663.json';
		
		
		echo file_get_contents($json);
		
	}
?>