---
layout: post
section: Archive
categories: [web开发, 高性能web]
date: 2012-04-20
title: "IIS是如何处理ASP.NET请求的"
description: "IIS是如何处理ASP.NET请求的"
tags: [iis ,asp.net]
redirecturl: http://kb.cnblogs.com/page/136274/
---
{% include JB/setup %}

　　英文原文：[Beginner’s Guide: How IIS Process ASP.NET
Request](http://abhijitjana.net/2010/03/14/beginner%E2%80%99s-guide-how-iis-process-asp-net-request/)

　　**前言**

　　每次服务器接受到请求，都要先经IIS处理。这不是一篇描述ASP.NE生命周期的文章，仅仅是关于IIS操作的。在我们开始之前，先了解这些会有助于对全文的理解，同时欢迎反馈和建议。

　　**什么是Web Server?**

　　每当我们通过VS运行ASP.NET网站时，VS集成的ASP.NET引擎会响应各种请求，这个引擎的名字叫“WebDev.WebServer.exe”。

　　当我们配置一个Web程序时，总会涉及到一个词“Web
Server”，它的功能便是会响应所有请求。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135408_1.JPG)

　　**什么是IIS？**

　　IIS（*Internet Information Server*）是微软Web
Server的一种，用来配置ASP.NET站点。IIS拥有自己的ASP.NET处理引擎来处理请求，因此，当一个请求到达时，IIS接收并处理请求，然后返回内容。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135410_2.JPG)

　　**请求处理过程**

　　现在，你应能搞清楚Web
Server和IIS的区别。现在我们来看一下核心部分。在继续之前，你需要搞清两个概念：

　　1、工作进程（Worker Process）

　　2、应用程序池（Application Pool）

　　**工作进程**：在IIS中，工作进程（w3wp.exe）运行着ASP.NET应用程序，管理并响应所有的请求，ASP.NET所有的功能都运行在工作进程下，当请求到来时，工作进程会生成Request和Response相关的信息。简而言之，工作进程就是ASP.NET程序的心脏。

　　**应用程序池**：应用程序池是工作进程的容器，通常用来隔开不同配置的工作进程。当一个程序出错或进程资源回收时，其他池中的程序不会受到影响。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135411_3.JPG)

　　**注**：当一个应用程序池包含多个工作进程时，被叫做“Web Garden”。

　　如果我们看一下IIS 6.0的结构，就会发现，可以把它分成两部分：

　　1、内核模块（Kernel Mode）

　　2、用户模块（User Mode）

　　内核模式是从IIS
6.0被引入的，它包含了一个叫HTTP.SYS的文件，每当请求进来时，会首先触发该文件的响应。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135411_4.JPG)

　　HTTP.SYS文件负责把请求传入相应的应用程序池中。但HTTP.SYS如何知道应传给哪个应用程序池呢？当然不是随机抽取，每当创建一个应用程序池，该池的ID就会生成并在HTTP.SYS文件中注册，因此该文件才能确定将请求往哪传。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135412_5.JPG)

　　以上便是IIS处理请求的第一步。接着，我们来看一下请求如何从HTTP.SYS传入应用程序池。

　　在IIS的用户模块中，通过*Web Admin Services
(WAS)*从HTTP.SYS接收请求，并传入相应的应用程序池中。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135414_6.JPG)

　　当应用程序池接收到请求，会接着传给工作进程（w3wp.exe），该进程检查来请求的URL后缀以确定加载哪个ISAPI扩展。ASP.NET加载时会附带自己的ISAPI扩展（aspnet\_isapi.dll），以便在IIS中映射。

　　**注意**：如果先安装了asp.net，然后再安装IIS，就需要通过aspnet\_regiis命令来注册ASP.NET中的ISAPI扩展。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135415_7.JPG)

　　一旦工作进程加载了aspnet\_isapi.dll,
就会构造一个HttpRuntime类，该类是应用程序的入口，通过ProcessRequest方法处理请求。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135417_8.JPG)

　　一旦这个方法被调用，一个HttpContext的实例就产生了。可通过HTTPContent.Current获取到这个实例，且该实例会在整个生命周期中存活，我们通过它可以获取到一些常用对象，如Request，Response，Session
等。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135418_9.JPG)

　　之后HttpRuntime会通过HttpApplicationFactory类加载一个HttpApplication对象。每一次请求都要穿过一堆HttpModule到达HttpHandler，以便被响应。而这些HttpModule就被配置在HttpApplication中。

　　有一个概念叫“Http管道”，被叫做管道是因为它包含了一系列的HttpModule，这些HttpModule拦截请求并将其导向相应的HttpHandler。我们也可自定义HttpModule，以便在请求响应之间做点特别的处理。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135419_10.JPG)

　　HttpHandler是“Http管道”的终点。所有请求穿过HttpModule需抵达相应的HttpHandler，然后HttpHandler根据请求资源，产生并输出内容。也正因此，我们请求任何aspx页面才会得到响应的Html内容。

![]({{ site.JB.FILE_PATH }}/2012-04/20120420_135422_11.JPG)

　　**结语**

　　每当请求Web服务器上的某些信息时，该请求首先会到达Http.SYS,
然后Http.SYS将其发送到相应的应用程序池，应用程序池传给工作进程并加载ISAPI扩展，然后HttpRuntime对象会被创建，并通过HttpModule和HttpHandler处理请求。

　　最后，ASP.NET页面生命周期就开始了。

　　这只是大致描述IIS处理过程的文章，如果你想进一步了解相应细节，请点击下面链接来进一步学习。

　　[A low-level Look at the ASP.NET
Architecture](http://www.west-wind.com/presentations/howaspnetworks/howaspnetworks.asp)

　　[IIS
Architecture](http://learn.iis.net/page.aspx/101/introduction-to-iis-7-architecture/)

　　本文翻译自：[Beginner’s Guide: How IIS Process ASP.NET
Request](http://abhijitjana.net/2010/03/14/beginner%E2%80%99s-guide-how-iis-process-asp-net-request/)[\
](http://abhijitjana.net/2010/03/14/beginner%E2%80%99s-guide-how-iis-process-asp-net-request/)

　　**译后小注：**

　　1、如果在IIS配置完站点却看不到“w3wp.exe”进程，只要用浏览器打开该站其中一个页面，“w3wp.exe”进程就会出现了。

　　2、为节省时间，直接引用了原图，英文差的，小查一下字典应该没啥问题。

　　相关博文：　　

　　[Asp.Net构架(Http请求处理流程) ](http://www.cnblogs.com/JimmyZhang/archive/2007/09/04/880967.html)
