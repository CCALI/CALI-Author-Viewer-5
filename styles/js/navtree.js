$('ul.slider-left').toggle();
$('label.nav-toggle a').click(function ($e) {
  $e.preventDefault();
  $(this).parent().parent().children('ul.slider-left').toggle(300);
});

$('.toggle-icon').click(function(){
  $(this).find('a').toggleClass('glyphicon-plus glyphicon-minus');
});

//toc link visted
$('.visited').click(function(){
  $(this).addClass('toc-visited');
});