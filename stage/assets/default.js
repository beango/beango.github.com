/*! default.js */
function toggle(obj){
	var tobj = $(obj).parent().next();
	tobj.toggle(0,function(){
		if(tobj.css("display")=="none")
			$(obj).text("+ 点击展开");
		else
			$(obj).text("- 点击收起");
	});
	event.preventDefault();
}

$(function(){
	$(".linkcodetoggle").parent().next().hide();
});

//plugin
jQuery.fn.topLink = function(settings) {
  settings = jQuery.extend({
	min: 1,
	fadeSpeed: 200
  }, settings);
  return this.each(function() {
	//listen for scroll
	var el = $(this);
	el.hide(); //in case the user forgot
	$(window).scroll(function() {
	  if($(window).scrollTop() >= settings.min)
	  {
		el.fadeIn(settings.fadeSpeed);
	  }
	  else
	  {
		el.fadeOut(settings.fadeSpeed);
	  }
	});
  });
};

//usage w/ smoothscroll
$(document).ready(function() {
  //set the link
  $('#top-link').topLink({
	min: 400,
	fadeSpeed: 500
  });
  //smoothscroll
  $('#top-link').click(function(e) {
	e.preventDefault();
	$.scrollTo(0,300);
  });
});    
