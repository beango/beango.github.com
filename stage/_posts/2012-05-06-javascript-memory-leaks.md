---
layout: post
section: Archive
category: default
date: 2012-05-06
title: "Javascript内存泄露"
description: "Javascript内存泄露"
tags: [javascript,内存泄露]
redirecturl: http://my.oschina.net/tsl0922/blog/56038
---


　　英文原文：[JavaScript Memory
Leaks](http://nesj.net/blog/2012/04/javascript-memory-leaks/)

　　**1. 什么是内存泄露？**

　　内存泄露是指分配给应用的内存不能被重新分配，即使在内存已经不被使用的时候。正常情况下，垃圾回收器在
DOM 元素和 event 处理器不被引用或访问的时候回收它们。但是，IE
的早些版本（IE7和之前）中内存泄露是很容易出现的，因为内存管理器不能正确理解
Javascript 生命周期而且在周期被打破(可以通过赋值为 null
实现)前不会回收内存。

　　**2. 为什么你需要注意它？**

　　在大型 Web
应用程序中内存泄露是一种常见的无意的编程错误。内存泄露会降低 Web
应用程序的性能，直到浪费的内存超过了系统所能分配的，应用程序将不能使用。作为一位
Web 开发者，开发一个满足功能要求的应用程序只是第一步，性能要求和 Web
应用程序的成功是同样重要的，更何况它可能会导致应用程序错误或浏览器崩溃。

　　**3. Javascript 中出现内存泄露的主要原因是什么？**

　　1) 循环引用

　　一个很简单的例子：一个 DOM 对象被一个 Javascript
对象引用，与此同时又引用同一个或其它的 Javascript 对象，这个 DOM
对象可能会引发内存泄露。这个 DOM
对象的引用将不会在脚本停止的时候被垃圾回收器回收。要想破坏循环引用，引用
DOM 元素的对象或 DOM 对象的引用需要被赋值为 null。

　　2) Javascript 闭包

　　因为 Javascript 范围的限制，许多实现依赖 Javascript
闭包。如果你想了解更多闭包方面的问题，请查看我的前面的文章 [JavaScript
Scope and
Closure](http://nesj.net/blog/2012/03/javascript-scope-and-closure/) 。

　　闭包可以导致内存泄露是因为内部方法保持一个对外部方法变量的引用，所以尽管方法返回了，内部方法还可以继续访问在外部方法中定义的私有变量。对
Javascript 程序员来说最好的做法是在页面重载前断开所有的事件处理器。

　　3) DOM 插入顺序

　　当 2 个不同范围的
DOM 对象附加到一起的时候，一个临时的对象会被创建。这个 DOM 对象改变范围到
document 时，那个临时对象就没用了。也就是说，
DOM 对象应该按照从当前页面存在的最上面的 DOM 元素开始往下直到剩下的
DOM 元素的顺序添加，这样它们就总是有同样的范围，不会产生临时对象。

　　**4) 如何检测？**

　　内存泄露对开发者来说一般很难检测，因为它们是由大量代码中的一些意外的错误引起的，但它在系统内存不足前并不影响程序的功能。这就是为什么会有人在很长时间的测试期中收集应用程序性能指标来测试性能。

　　最简单的检测内存泄露的方式是用任务管理器检查内存使用情况。在 Chrome
浏览器的新选项卡中打开应用并查看内存使用量是不是越来越多。还有其他的调试工具提供内存监视器，比如
Chrome
开发者工具。这是谷歌开者这网站中的[堆分析](https://developers.google.com/chrome-developer-tools/docs/heap-profiling)的特性的教程。

![]({{ site.JB.FILE_PATH }}/2012-05/20120504_161658_1.jpg)

　　**参考：**

　　1.
[http://javascript.crockford.com/memory/leak.html](http://javascript.crockford.com/memory/leak.html)

　　2.
[http://msdn.microsoft.com/en-us/library/Bb250448](http://msdn.microsoft.com/en-us/library/Bb250448)

　　3.
[http://www.ibm.com/developerworks/web/library/wa-memleak/](http://www.ibm.com/developerworks/web/library/wa-memleak/)

　　（OsChina.NET 编译）
