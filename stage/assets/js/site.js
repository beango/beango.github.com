///import js.dom.INodeEvent;
///import elf.~shortcut.~dispatcher.string;
///import elf.~shortcut.~dispatcher.function;
///import elf.~shortcut.loadScript;
///import elf.~shortcut.template;
///import elf.~shortcut.ajax;
///import elf.~namespace.URL;

var site = {
	InitMap: {
		list: function () {
			site.VAR_AUTO_LOAD_ON_SCROLL && elf(window).on('scroll', site.Handlers.scrolling);
		},
		
		post: function () {
			var disqusUrl = site.URL_DISCUS_COMMENT;
			disqusUrl && elf().loadScript(disqusUrl, {});
		},
		
		search: function () {
			site.URL_GOOGLE_API &&
			site.VAR_GOOGLE_CUSTOM_SEARCH_ID &&
			elf().loadScript(site.URL_GOOGLE_API, {
				onload: site.Handlers.onGCSEAPILoad
			});
		}
	},
	
	Handlers: {
		deferLoad: function () {
			elf('article').toArray()
				.filter(site.Util.isViewable)
				.filter(function (item) {
					return item.getAttribute('content-loaded') != 1;
				}).slice(0, site.VAR_AUTO_LOAD_ON_SCROLL).forEach(site.Handlers.loadArticle);
			
		},
		
		loadArticle: function (item) {
			elf().ajax({
				url: elf(item).firstChild().firstChild().attr('href'),
				onsuccess: function (response) {
					site.Handlers.showAjaxContent(item, response);
				}
			});
		},
		
		showAjaxContent: function (node, response) {
			var article = elf(node);
			var content = response.split('<p class="meta">')[1].split('</p>');
			content.shift();
			content = content.join('</p>');
			content = content.split(/<\/article>/)[0];
			article.query('>.article-content').html(content);
			article.attr('content-loaded', 1);
			article.query('pre').forEach(function (item) {
				hljs.highlightBlock(item);
			});
		},
		
		scrolling: function () {
			var timer = site.scrollingTimer;
			if (timer) {
				clearTimeout(timer);
			}
			site.scrollingTimer = setTimeout(site.Handlers.deferLoad, 1000);
		},
		
		onGCSEAPILoad: function () {
			google.load('search', '1', {
				language: 'zh-CN',
				style: google.loader.themes.V2_DEFAULT,
				callback: site.Handlers.onGCSEReady
			});
		},
		
		onGCSEReady: function() {
			var customSearchControl = new google.search.CustomSearchControl(site.VAR_GOOGLE_CUSTOM_SEARCH_ID, {});
			customSearchControl.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
			
			var options = new google.search.DrawOptions();
			options.setAutoComplete(true);
			customSearchControl.draw('cse', options);
			
			var url = new elf.URL(location);
			var query = url.getParameter('q');
			if (query) {
				query = decodeURIComponent(query);
				document.title = elf().template(
					site.TPL_SEARCH_TITLE,
					site.VAR_SITE_NAME,
					query
				);
				customSearchControl.execute(query);
			}
		}
	},
	
	Util: {
		
		isViewable: function (element) {
			var pos = element.getBoundingClientRect();
			var doc = js.dom.Stage.getDocumentElement();
			var winHeight = doc.clientHeight;
			var winWidth = doc.clientWidth;
			var scrollLeft = document.body.scrollLeft || doc.scrollLeft;
			var scrollTop = document.body.scrollTop || doc.scrollTop;
			
			return (pos.right > 0 &&
				pos.left < winWidth &&
				pos.bottom > 0 &&
				pos.top < winHeight);
		}
	}
};

function AutoResizeImage(maxWidth,maxHeight,objImg){
	var img = new Image();
	img.src = objImg.src;
	var hRatio;
	var wRatio;
	var Ratio = 1;
	var w = img.width;
	var h = img.height;
	wRatio = maxWidth / w;
	hRatio = maxHeight / h;
	if (maxWidth ==0 && maxHeight==0){
		Ratio = 1;
	}else if (maxWidth==0){//
		if (hRatio<1) Ratio = hRatio;
	}else if (maxHeight==0){
		if (wRatio<1) Ratio = wRatio;
	}else if (wRatio<1 || hRatio<1){
		Ratio = (wRatio<=hRatio?wRatio:hRatio);
	}
	if (Ratio<1){
		w = w * Ratio;
		h = h * Ratio;
	}
	
	objImg.height = h;
	objImg.width = w;
}

$(function(){
	/*var imglist = $('.blogmain img');
	var wd = document.documentElement.clientWidth; // 可见区域宽度
	for (var i=0;i<imglist.length;i++)
	{
		var img = imglist[i]
		img.onload = function(){
		    var w = this.width;
			if(w>wd*0.8)
				AutoResizeImage(wd*0.8,0,this);
		};
	}*/
});