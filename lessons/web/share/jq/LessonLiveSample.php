<?php

	/* 9/16/2016 Return sample live data. Check for the lastupdate to return the NOOP */
	
	if ($_GET['lastupdate']!='')
	{
		echo '{}';
	}
	else
	{
		echo file_get_contents('LessonLiveSampleRealUsers.json');
	}
?>