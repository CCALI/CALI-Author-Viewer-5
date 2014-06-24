CALI-Author-Viewer-5
====================

jQuery Viewer

2014-06-23
CALI Author Viewer 5 and associated Drupal files


Pages that touch Drupal:

lessons/web/share/jq/lesson.php
	get user name, whether they're an author, organization name and id for saving scores from Drupal
		
lessons/web/authorizefaculty.php
	gets user role from Drupal to determine if Faculty access is permitted
		(included by all lessontext.php and mapper.php files in lesson specific folders)
		
lessons/web/authorizestudent.php
	gets user role from Drupal to determine if student access is permitted
		(included by all jq.php files in lesson specific folders)

Pages that don't touch Drupal:

lessons/CAVPageJump.php
	a utility page for letting Deb jump to specific pages in any lesson

lessons/LessonTextPage.php
	a utility page for showing single lesson text pages for Deb


lessons/web/share/jq
	all the CALI Author Viewer 5 specific files

lessons/web/share/jq/CAV_urls.js
	contains URL patterns and links that leave the lesson including lesson runs,
	score save and jumping to other lessons.

