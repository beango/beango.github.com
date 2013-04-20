---
layout: post
section: Archive
categories: [windows]
date: 2012-03-23
title: "一张破图胜过长篇大论（译文：关于Windows 8的新编程体系）"
description: "一张破图胜过长篇大论（译文：关于Windows 8的新编程体系）"
tags: [windows8]
redirecturl: http://kb.cnblogs.com/page/136244/
---
{% include JB/setup %}

　　译者：linger(sysu大三 )

　　注：本文是DOUG SEVEN写的关于Windows 8新的编程体系的一篇文章《[A bad
picture is worth a thousand
long discussions](http://dougseven.com/2011/09/15/a-bad-picture-is-worth-a-thousand-long-discussions/)》的译文。

　　在Build会议中，我跟顾客，还有其他的参与者，Microsoft的mvp，Microsoft的地方主管，Microsoft的工程团队成员谈了很多。其中谈的最多的是，Windows
8的平台和工具的技术盒子图。如下所示：

![]({{ site.JB.FILE_PATH }}/2012-03/2012032322562391.jpg)

　　现在我告诉你，我曾画过很多这种软件架构图，当然并不是很容易画出来的。这种图从技术的角度来说永不可能是精确的。显然没有一种简单的方式对这种复杂的系统来画一张技术上精确无误的框架图。结果是，你的框架图是会漏掉很多盒子的（漏掉很多在整个体系中实际存在的技术）。不幸的是，那正是这里所发生的事（Windows
8的技术盒子漏掉了一些实际存在的技术）。

　　谈话中其中之一的话题是围绕着技术盒子中绿色部分（即是Metro风格的应用程序）为何没有出现.NET和CLR。是不是在Metro风格的应用程序中，VB，C\#在编译和运行过程都不兼容WinRT？这意味着.NET框架的终结么？

　　还有一些研究过二进制码的质疑是否有两个CLR。Windows 8究竟在搞什么呢？

　　昨晚我跟.NET
CLR的团队的成员们交流过（这里不说出他们的名，不过请相信我，他们肯定明确知道这个体系是如何运行的），下面是一些内部消息。

　　**基本事实：**

　　只有一个CLR。每个应用程序或者应用程序池围绕着一个进程旋转，而CLR就是在该进程内部工作的。这意味着，同时运行的一个Metro风格的应用程序和一个桌面模式的应用程序用的是相同的CLR二进制码，只不过是CLR的两个不同的实例。

　　.NET4.5在桌面模式的应用程序和Metro风格的应用程序都可以用到。不过有点不同。Metro风格的应用程序使用的是最适合称之为另一个.NET的Profile
（比如说桌面模式的应用程序使用的是.NET Client的Profile
，而Metro风格的应用程序使用的是.NET
Metro的Profile）。事实上并不是不相同，但在Metro风格的应用程序中.NET的实现像是另一个Profile一样。

　　不管一个桌面模式的应用程序或者Metro风格的应用程序是不是.NET的app,
但都是编译成相同的MSIL（微软中间语言代码）。并不存在一个特殊的Windows
8的Metro的中间语言代码（就像CLR那样，只有一个MSIL）。

　　下面是一张更准确的图（当然还是技术上不是精确的框架图）

 ![]({{ site.JB.FILE_PATH }}/2012-03/2012032323015116.jpg)

　　在这张图中，你可以看到CLR和.NET4.5都用到了用C\#和VB写的桌面模式的app(蓝色部分)和Metro风格的app（绿色部分）。Silverlight仍然只能在桌面模式作为IE的插件运用到（当然，离开浏览器，它在桌面模式下还是支持的）。这幅图中另一个新添加的是DirectX，原来第一张图是完全没有存在的。DirectX在高级app中是一种很重要的技术，比如游戏。DirectX使得C++可以访问控制GPU。

　　最大的疑惑，正如我所提到的，是跨越了了蓝色部分和绿色部分的.NET的使用。为什么会存在.NET
Metro
Profile（我起的名）呢？因为Metro风格的app运行在一个特殊app的容器中，该容器限制了应用程序的访问权限，从而保护了终端用户，防止受到恶意程序的攻击。就本身而论，Metro
Profile其实是.NET Client
Profile的一个子集，只不过是去掉了一些app容器中对于Metro风格程序不允许的权限。开发者如果习惯了.NET的话，会发现很容易使用WinRT，就像是这样子的，有一些引用的集合，然后去使用那些集合中的成员。

　　Additionally, some of the changes in the Metro Profile are to ensure
Metro style apps are constructed in the preferred way for touch-first
design and portable form factors.
（该句不知该怎么翻译）比如File.Create()。以前如果你使用.NET来创建一个新文件的话，你会使用File.Create(string
fileLocation) 在磁盘上创建一个新文件，然后使用一个stream
reader来创建以字符串形式存在的文本的内容。这是一个同步操作（你调用了该函数，进程就阻塞在那里，直到函数返回）。而如今的Metro风格的app的理念是，应该利用异步的编程来减少比如IO延迟之类的东西，比如上面提到的文件系统的操作。这意味着，.NET
Metro
Profile提供给你的不是同步操作FileCreate()。不过，你仍然可以调用File.Create()（或者是File.CreateNew()我也想不起来函数名），不过是异步操作。一旦回调函数被使用，你仍然可以打开一个stream
reader然后对文件的内容视作一个字符串来处理，就像你所做的那样。

　　最后，所有这些意味着，你会有一些选择，但你不会因此牺牲多少。你仍然可以建立.NET和Silverlight的app，正如你所习惯的那样，当然他们还可以在Windows上跑很多年。如果你想建立一个Metro风格的app，你有四种选择：

1.Xaml和.NET(C\#或者VB)。你不会放弃很多.NET的东西（记住，你只是抛弃那些在app容器中所禁止的那些），你还可以使用WinRT来访问传感输入和其他的系统资源。

2.Xaml和C++。你可以使用你在Xaml和C++的技能来使用WinRT。当然你就感觉不到了.NET的好处，不过，有些人喜欢管理自己程序的垃圾回收。

3.Html和Javascript。你可以利用你在UI方面的能力，在Javascript中调用WinRT来访问系统资源和传感输入。

4.DirectX和C++。如果你在开发一个刺激好玩的游戏，你可以利用DirectX和通过C++跟WinRT来访问设备传感器和系统资源。

以上是译文，若那些译的不好，敬请指正。下面在提供一些关于Windows 8的编程链接：

[WinRT and .NET in Windows 8](http://blogs.microsoft.co.il/blogs/sasha/archive/2011/09/15/winrt-and-%20%20net-in-windows-8.aspx)

[Analyzing Windows 8 and WinRT](http://ardalis.com/Analyzing-Windows-8-and-WinRT)

[A bad picture is worth a thousand long discussions](http://dougseven.com/2011/09/15/a-bad-picture-is-worth-a-thousand-long-discussions/)

[Why is WinRT unmanaged?](http://stackoverflow.com/questions/7457371/why-is-winrt-unmanaged)
