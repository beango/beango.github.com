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

    .Pic {MARGIN: auto;WIDTH: 638px;}  
    .Pic img{MAX-WIDTH: 100%!important;HEIGHT: auto!important;  
      width:expression(this.width>638?"638px":this.width)!important;}

浏览器样式兼容
------------------------------------

针对ie6,ie7,ie8,firefox,chrome显示不同效果 做网站时经常会用到.

演示简单的hack实现方式和原理。浏览器呈红色则为firefox，浏览器呈灰色则为ie6，浏览器呈黄色则为ie9，浏览器呈蓝色则为ie7

    #hacker{
        color:red; 
        *color:white; /*for ie6,ie7*/
        *+color:blue; /*for ie7*/
        _color:gray; /*for ie6*/
        color:balck !important; /*for firefox*/
        color:yellow \9; /*for ie9*/
    }

透明
------------------------------------

一段兼容的css透明代码一段兼容的css透明代码一段兼容的css透明代码

    .transparent{
        filter:alpha(opacity=50); 
        -moz-opacity:0.5;/**Firefox 3.5即将原生支持opacity属性，所以本条属性只在Firefox3以下版本有效 ***/ 
        -khtml-opacity: 0.5; 
        opacity: 0.5; 
    }

高亮
------------------------------------

一段兼容的css高亮代码一段兼容的css高亮代码一段兼容的css高亮代码一段兼容的css高亮代码

    .highlighted {
        background: none repeat scroll 0 0 #00ADEE;
        color: #FFFFFF;
        padding: 0 5px;
    }

### 阴影+圆角

    /**阴影**/
    -webkit-box-shadow:0 0 3px black;
    -moz-box-shadow:0 0 3px black;
    /**圆角**/
    -moz-border-radius:3px;
    -webkit-border-radius:3px;
    border-radius:3px;

