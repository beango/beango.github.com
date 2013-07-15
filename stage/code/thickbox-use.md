---
layout: page
title: thickbox使用
section: Code
Code: Demos
categories: html/js/css
date: 2012-12-19
description: "thickbox使用"
summary: "ThickBox是一个基于JQuery类库的扩展，它能在浏览器界面上显示非常棒的UI框，它可以显示单图片，多图片，ajax请求内容或链接内容."
tags: [js,jquery,thickbox]
---
{% include JB/setup %}

### 一  准备工作

-   首先在 HTML 文件的 head中导入jquery.js 和thickbox.js，thickbox.css文件：

<label></label>
    <script src="jquery.js" type="text/javascript"></script>    //jquery
    <script src="thickbox.js" type="text/javascript"></script>  //thickbox
    <link rel="stylesheet" href="thickbox.css" type="text/css" /> //弹出层样式

### 二  使用示例

-   单个图片：

<label></label>
    <!-- title控制显示的标题显示  --> 
    <a href="big.jpg" title="点击小图看大图" class="thickbox">  
        <img src="small.jpg" alt="Single Image" />  
    </a>

-   一组图片 (设置一组相同的rel属性)*用 jquery-1.1.3.1.pack.js 时有效，更高级别的JQ库只会出现全屏黑*

<label></label>
    <a href="1.jpg" title="1" class="thickbox" rel="gallery-plants"><img src="1_t.jpg" alt="Plant1" /></a>  
    <a href="2.jpg" title="1" class="thickbox" rel="gallery-plants"><img src="2_t.jpg" alt="Plant2" /></a>  
    <a href="3.jpg" title="1" class="thickbox" rel="gallery-plants"><img src="3_t.jpg" alt="Plant3" /></a>  
    <a href="4.jpg" title="1" class="thickbox" rel="gallery-plants"><img src="4_t.jpg" alt="Plant4" /></a>

-   内嵌内容：*可设定弹出层的高度、宽度、inlineId 控制显示的内容、modal控制是否显示标题栏*

<label></label>
    <input type="button" alt="#TB_inline?height=200&width=300&inlineId=test" title="按钮" value="显示" class="thickbox" />
    或  
    <a href="#TB_inline?height=200&width=300&inlineId=hiddenModalContent&modal=true" title="链接" class="thickbox">显示</a>  
    <div id="test" style="display:none">这里是隐藏的内容</div>

-   iframe方式弹出  

<label></label>
    <a href="boxs.html?keepThis=true&TB_iframe=true&height=100&width=220&modal=true" title="显示IF" class="thickbox">显示</a>


-   ajax方式弹出： 

<label></label>
    <a href="box.html?height=350&width=350&modal=true" title="Ajax载入，页面无法查看源代码" class="thickbox">Example</a>

-   关闭弹出框：

<label></label>
    tb_remove();  
    self.parent.tb_remove();//如果是子页面

###三  自定义内容

-   弹出窗口(div)右上角的关闭按钮为显示为"close or esc key"，而不是中文的; 如果想把它变成\[X\]或"关闭"应该怎么来办呢 
将thickbox.js文件打开，查找关键字"or esc key"，将其删除，并将前面的close更改为\[X\]或"关闭"，然后把文件另存为UTF-8格式，如果不保存为UTF-8的话，将会出现乱码。  

-   修改遮罩层透明度修改thickbox.css。
查找.tb_overlaybg修改相关数值  

-   关闭层：如果我们需要自己添加一个关闭按钮或者图片

<label></label>
    onclick="self.parent.tb_remove();"  

-   thickbox插件默认情况是点击灰色的遮罩层就会关闭取消  
把两个$("#tb_overlay").click(tb_remove);去掉就可以取消掉

###四  相关参数
-   class="thickbox"  
    调用特效（必须）

-   height  
    打开页面的高度

-   width  
    打开页面的宽度

-   title="Iframe"  
    title的内容

-   keepThis=true  
    (不知道有什么用)

-   TB_iframe=true  
    设置后iframe中的thickbox还有效果 （适用于thickbox嵌套）

-   \#TB_inline  
    调用当前页面的层；

-   inlineId  
    当前页面层的ID

-   modal=true  
    表示禁用title，去掉即可显示title及可自动关闭

###五  更多资源

-   <a href="{{site.demourl}}/thickbox/" target="_blank"><span style="font-size:26px;font-bold:bold; color:#800080;">thickbox</span></a>
-   <a href="{{site.demourl}}/fancybox/" target="_blank"><span style="font-size:26px;font-bold:bold; color:#800080;">fancybox</span></a>
-   <a href="http://www.nickstakenburg.com/projects/lightview/" target="_blank">Lightview</a>  
    Lightview是一个基于Prototype与Script.aculo.us开发，用于创建可以覆盖整个页面的模式对话框。展示的内容不仅可以是图片、文字、网页、通过Ajax 调用的内容，还可以是Quicktime/Flash影片都能够以非常酷的效果展示。
-   <a href="http://orangoo.com/labs/GreyBox/" target="_blank">Greybox</a>