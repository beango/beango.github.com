---
layout: page
category: code
date: 2012-06-11
title: "CSS收集"
description: "CSS收集"
summary: "CSS收集"
tags: [css]
redirecturl: http://download.keqie.com/codex.html
---

图片等比缩放  
------------

{% highlight css %}
.Pic {MARGIN: auto;WIDTH: 638px;}  
.Pic img{MAX-WIDTH: 100%!important;HEIGHT: auto!important;  
  width:expression(this.width>638?"638px":this.width)!important;}
{% endhighlight %}

* * *

浏览器样式兼容
------------------------------------

针对ie6,ie7,ie8,firefox,chrome显示不同效果 做网站时经常会用到.

<div class="demo-four" style="width:200px;">
<h4 style="margin:0;color:#999;">演示</h4><small>简单的hack实现方式和原理。浏览器呈红色则为firefox，浏览器呈灰色则为ie6，浏览器呈黄色则为ie9，浏览器呈蓝色则为ie7</small>

<span class="demo-hacker" style="font-size:36px;display:block;margin-top:10px;">hacker</span>
</div>

{% highlight css %}
#hacker{
    color:red; 
    *color:white; /*for ie6,ie7*/
    *+color:blue; /*for ie7*/
    _color:gray; /*for ie6*/
    color:balck !important; /*for firefox*/
    color:yellow \9; /*for ie9*/
}
{% endhighlight %}

* * *

透明<small style="font-size:60%;color:#999;">兼容所有浏览器</small>
------------------------------------

<div class="demo-four" style="width:200px;height:150px; text-align:center; margin-top:12px;background:url({{ site.JB.FILE_PATH }}/2013-01/30222814-7d1a23445e9e4a0e9f526ecc058d3327.JPG);">
<div style="padding:20px;"><div class="demo-transparent" style="background:#fff;">一段兼容的css透明代码一段兼容的css透明代码一段兼容的css透明代码</div></div>
</div>

{% highlight css %}
.transparent{
    filter:alpha(opacity=50); 
    -moz-opacity:0.5;/**Firefox 3.5即将原生支持opacity属性，所以本条属性只在Firefox3以下版本有效 ***/ 
    -khtml-opacity: 0.5; 
    opacity: 0.5; 
} 
{% endhighlight %}

* * *

高亮<small style="font-size:60%;color:#999;">兼容所有浏览器</small>
------------------------------------

<div class="demo-four">一段兼容的css<span class="demo-highlighted">高亮</span>代码一段兼容的css高亮代码一段兼容的css高亮代码一段兼容的css高亮代码
</div>

{% highlight css %}
.highlighted {
    background: none repeat scroll 0 0 #00ADEE;
    color: #FFFFFF;
    padding: 0 5px;
}
{% endhighlight %}

* * *

阴影+圆角
------------------------------------

<div class="demo-four">
<div class="demo-shadowradius">阴影+圆角</div>
</div>

{% highlight css %}
/**阴影**/
-webkit-box-shadow:0 0 3px black;
-moz-box-shadow:0 0 3px black;
/**圆角**/
-moz-border-radius:3px;
-webkit-border-radius:3px;
border-radius:3px;
{% endhighlight %}

