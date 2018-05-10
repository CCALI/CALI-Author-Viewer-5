$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("active");
});

$('ul.nav-left-ml').toggle();
$('label.nav-toggle span').click(function () {
  $(this).parent().parent().children('ul.nav-left-ml').toggle(300);
  var cs = $(this).attr("class");
  if(cs == 'nav-toggle-icon glyphicon glyphicon-plus') {
    $(this).removeClass('glyphicon-plus').addClass('glyphicon-minus');
  }
  if(cs == 'nav-toggle-icon glyphicon glyphicon-minus') {
    $(this).removeClass('glyphicon-minus').addClass('glyphicon-plus');
  }
});
