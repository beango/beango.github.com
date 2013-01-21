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