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

$(function() {
    $('pre').addClass('prettyprint linenums').attr('style', 'overflow:auto');
    window.prettyPrint && prettyPrint();
    $(".linkcodetoggle").parent().next().hide();
    //$("#wordcloud").tagcloud({colormin:"d88",colormax:"0a0"});
    //$("#wordcloud-left").tagcloud({type:"list",sizemin:8,colormin:"d88",colormax:"0a0"});
});
