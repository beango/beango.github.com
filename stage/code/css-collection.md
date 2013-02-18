---
layout: post
section: Code
category: Favorite
date: 2012-06-11
title: "CSS收集"
description: "CSS收集"
summary: "CSS收集."
---
 
-   一、图片等比缩放  

<label/>
    .Pic {MARGIN: auto;WIDTH: 638px;}  
    .Pic img{MAX-WIDTH: 100%!important;HEIGHT: auto!important;  
      width:expression(this.width>638?"638px":this.width)!important;}

