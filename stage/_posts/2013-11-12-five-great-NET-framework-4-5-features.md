---
layout: post
categories: [.net]
date: 2013-11-12
title: ".NET Framework 4.5 五个很棒的特性"
description: ".NET Framework 4.5 五个很棒的特性"
tags: [dotnet,.net 4.5]
redirecturl: http://blog.jobbole.com/51271/
---
{% include JB/setup %}

### 简介

自.NET 4.5发布已经过了差不多1年了。但是随着最近微软大多数的发布，与.NET开发者交流的问题显示，开发者仅知道一到两个特性，其他的特性仅仅停留在MSDN并以简单的文档形式存在着。

比如说，当你问一个.NET开发者.NET框架内核中有什么新东西的时候，他们中的大多数仅仅会说异步与等待（至少和我交谈的人们仅仅谈到了这些特性）。

另外也很难贯通所有的新特性。因为这些特性可能对于你目前正在开发的工作并不如听上去那么有趣。

所以在这篇文章中我想提及我喜欢的5个在.NET4.5内核中的特性。当然，这可能只是我喜欢的而并不是你的。但是我所做的是当我选择这些特性时我也想着较大的.NET社区，我希望我满足了这种期望。

![aehtrhthjtyj]({{ site.JB.FILE_PATH }}/2013-11/aehtrhthjtyj.jpg)

提示：这篇文章没有讨论在ASP.NET, WCF, WPF, WWF等中的新特性。仅仅讲了关于内核的新特性。

### ** 特性1：异步与等待（代码开发者）**

这个特性已经被吹嘘过度并且每个.NET布道者都谈论它。但是这仍然是我喜欢的并且你会知道为什么从这里只有几行。

![atrhrtjrt2]({{ site.JB.FILE_PATH }}/2013-11/atrhrtjrt2.jpg)

异步和等待是标记，它们标记当任务（线程）结束时控制应该恢复到代码的位置。

让我们尝试通过下面的代码来搞清上面声明的含义。如果你明白下面代码的流程：

1.  Static void main()从开始处调用Method()方法。
2.  Method()方法产生一个名为LongTask的任务（线程），线程将等待10秒。
3.  同时，在调用了任务之后，控制又回到Method()方法继续执行剩下的代码。换句话说，正如调用时多线程的（Task.Run…）,LongTask仍在运行。例如，等待10秒并且Method()方法剩下的代码也在执行。

现在在相同的情景下，我们想要第3步执行得不一样。我们想要在LongTask()执行完成后，控制应该回到Method方法执行接下来的代码。“异步”和“等待”关键字能够帮助实现上面的功能。

![agfhgfnhgm3]({{ site.JB.FILE_PATH }}/2013-11/agfhgfnhgm3.jpg)

这里有三个关于关键字“异步”和“等待”的重点需要记住：

1.  异步和等待是一对关键字。你不能独立使用它们。
2.  异步应用于方法。这个关键字是一个标志，是说该方法会有一个等待关键字。
3.  等待关键字标记了任务恢复执行的位置。所以你总是发现这个关键字与Task关联。

下面是前面讨论的代码的修订版本，这里我们应用了异步与等待。所有其他的步骤仍然如前所述，但是“步骤3”将在“步骤2”完成之后执行。简单来说就是控制在任务完成之后回到Method()方法。

![arhtrh4]({{ site.JB.FILE_PATH }}/2013-11/arhtrh4.jpg)

现在你已经阅读了“异步”与“等待”的内容，让我来提个问题。上面的代码同样也能通过Task.Wait或者Task.ContinueWith实现，那么它们有什么不同？我把这个问题留作给你的家庭作业。

### **特性2：便利Zip压缩（Zip压缩）**

![sawfwsfa5]({{ site.JB.FILE_PATH }}/2013-11/sawfwsfa5.jpg)

Zip是最为人所接受的文件格式之一。Zip格式以某些内置的名字被几乎所有操作系统支持。

-   在Windows操作系统中，它以“压缩文件”的名称实现。
-   在MAC操作系统中，它以“文档实用程序”的名称实现。

现在在.NET中我们对执行Zip压缩没有内置的支持。许多开发者实用第三方组件如“DotnetZip”。在.NET4.5中，Zip属性内置于框架本身，以System.IO.Compression的命名空间内置。

第一步你需要引用两个命名空间：

-   System.IO.Compression.FileSystem
-   System.IO.Compression

接下来引用如下两个命名空间：

    using System.IO.Compression;

如果你想要从文件夹压缩文件你可以调用如下所示的CreateFromDirectory函数。

    ZipFile.CreateFromDirectory(@"D:\data",@"D:\data.zip");

如果你想要解压，你可以调用如下代码所示的ExtractToDirectory函数。

    ZipFile.ExtractToDirectory(@"D:\data.zip", @"D:\data\unzip");

### **特性3：正则表达式超时（超时）**

![ewfjdnvlgdklgv]({{ site.JB.FILE_PATH }}/2013-11/ewfjdnvlgdklgv.jpg)

“正则表达式”一直是做验证首选的方式。如果你是正则表达式的新手，请看正则表达式，我解释了正则表达式是如何执行的。但是正因为正则表达式的典型逻辑解析使得它暴露于DOS攻击下。让我们试着理解刚才我说的。

作为例子请考虑这样的正则表达式-“\^ (\\d+)\$”。这个正则表达式表明只能有数字。你也可以看正则表达式符号图，它标明了这个正则表达式会如何求值。现在让我们假设要验证“123456X”。这将有6条路径如下图所示。

![afnhjgfnhgm7]({{ site.JB.FILE_PATH }}/2013-11/afnhjgfnhgm7.jpg)

但如果我们再多加一个数字进去，将会有7条路径。换句话说，随着字符长度的增加，正则表达式将会花更多时间执行。也就是说，求值时间与字符长度成线性比例。

![agnhgm8]({{ site.JB.FILE_PATH }}/2013-11/agnhgm8.jpg)

现在让我们把之前定义的正则式从“\^ (\\d+)\$”变为“\^ (\\d+)+\$”。如果你看正则表达式符号图它将相当复杂。如果我们现在试着验证“123456X”，将会有32条路径。如果你再增加一个字符，路径数将会增加到64。

![asdgvdfbfgn9]({{ site.JB.FILE_PATH }}/2013-11/asdgvdfbfgn9.jpg)

换句话说，上面的正则表达式中时间开销与字符数目为成倍关系。

![adsbfdbfghrt10]({{ site.JB.FILE_PATH }}/2013-11/adsbfdbfghrt10.jpg)

现在你可能要问的是，这很重要吗？线性上升的求值时间可以被黑客利用来进行DOS（拒绝服务）攻击。他们可以部署一个长而且是足够长的字符串来使你的应用永远挂起。

对于这个问题合适的解决方法是在正则表达式执行上设置超时时间。好消息是，在.NET4.5中你可以定义一个超时属性如下代码所示。所以如果你收到任何怀有恶意的字符串，应用不会永远在循环中执行。

    try
    {
      var regEx = new Regex(@”^(\d+)+$”, RegexOptions.Singleline, TimeSpan.FromSeconds(2));
      var match = regEx.Match(“123453109839109283090492309480329489812093809x”);
    }
    catch (RegexMatchTimeoutException ex)
    {
      Console.WriteLine(“Regex Timeout”);
    }

### **特性4：优化配置文件（提升启动性能）**

![asdvdbfrbngrb-11]({{ site.JB.FILE_PATH }}/2013-11/asdvdbfrbngrb-11.jpg)

我们都知道.NET代码是半编译的格式。在运行时，JIT（Just-in-Time）编译器执行并且转换这种半编译的IL代码为机器原生代码。对JIT最大的抱怨之一是当.NET应用初次执行的时候，它运行得很慢因为JIT在忙着转换IL代码到机器代码。

为了降低这个启动时间，在.NET4.5中有称为“优化配置文件”的内容。配置文件不过是一个记录了应用在启动运行中需要的方法列表的简单文件。所以当应用开始后，后台的JIT执行并且开始转换这些方法的IL代码为机器/原生语言。

这个后台JIT在多个处理器上编译启动方法从而进一步降低启动时间。另外请注意你需要多核处理器来实现配置文件优化。如果你没有多核处理器那么这个设定会被忽略。

![afgngkmyjkytjy12]({{ site.JB.FILE_PATH }}/2013-11/afgngkmyjkytjy12.jpg)

为了创建“配置文件”这个文件，首先你需要引入System.Runtime命名空间。然后你可以调用静态类ProfileOptimization的SetProfileRoot和StartProfile方法。现在当应用启动后台JIT，它将会读取配置文件并且在后台编译启动方法从而降低启动时间。

    using System.Runtime;
     
    // Call the Setprofilerroot and Startprofile method
    ProfileOptimization.SetProfileRoot(@"D:\ProfileFile");
     
    ProfileOptimization.StartProfile("ProfileFile");

重要提示：ASP.NET 4.5和Silverlight 5应用默认支持Profileoptimization。所以上述代码在这些技术中无需编写。

### **特性5：垃圾回收（垃圾后台清理）**

![afgjrtk5ytjytn13]({{ site.JB.FILE_PATH }}/2013-11/afgjrtk5ytjytn13.jpg)

垃圾回收在.NET应用中是一项真正繁重的任务。当是ASP.NET应用的时候，它变得更繁重。ASP.NET应用在服务器运行，许多客户端向服务器发送请求从而产生对象负荷，使得垃圾回收确实努力清理不需要的对象。

![aedvgdbh4erh14]({{ site.JB.FILE_PATH }}/2013-11/aedvgdbh4erh14.jpg)

在.NET4.0中，当垃圾回收运行清理的时候，所有的应用程序线程都暂停了。在上图中你可以看到我们有3个应用程序线程在执行。有两个垃圾回收运行在不同的线程上。一个垃圾回收线程对应一个逻辑处理器。现在应用程序线程运行并执行它们的任务，伴随着这些应用程序线程的执行它们也创建了操作对象。

在某个时间点，后台垃圾回收运行开始清理。当这些垃圾回收开始清理的时候，它们暂停了所有的应用程序线程。这使得服务器/应用程序在那一刻不响应了。

![afvfbrtherg15]({{ site.JB.FILE_PATH }}/2013-11/afvfbrtherg15.jpg)

为了克服上述问题，服务器垃圾回收被引进了。在服务器垃圾回收机制中多创建了一个运行在后台的线程。这个线程在后台运行并持续清理2代对象（关于垃圾回收0,1和2代的视频）从而降低主垃圾回收线程的开销。由于双垃圾回收线程的执行，主应用程序线程很少被暂停，进而增加了应用程序吞吐量。为了使用服务器垃圾回收，我们需要使用gcServer XML标签并且将它置为true。

    <configuration>
       <runtime>
          <gcServer enabled="true"/>
       </runtime>
    </configuration>

### **另三个值得探索的特性**

**设置默认应用程序域的区域性**

在上一个版本的.NET中如果我想设置区域性那么我需要在每个线程中设置。下面的示例程序演示了在线程级别设置区域性的痛苦。当我们有大量多线程应用程序的时候这是真正的痛苦。

    CultureInfo cul = new CultureInfo(strCulture);
    Thread.CurrentThread.CurrentCulture = cul;
    Thread.CurrentThread.CurrentUICulture = cul;

在4.5中我们可以在应用程序域级别设置区域性并且所有在这个应用程序域当中的线程都会继承这个区域性。下面就是如何实现DefaultThreadCurrentCulture的示例代码。

    CultureInfo culture = CultureInfo.CreateSpecificCulture("fr-FR");
     
    CultureInfo.DefaultThreadCurrentCulture = culture;

**数组支持超过2GB容量**

我不确定在什么样的情景下我们会需要2GB的容器。所以我个人并不清楚我们将在哪用到这个特性。如果我曾需要如此之大的容器我会把它分解成小份。但我确信在框架中启用此功能应该有个很好的理由。

**控制台支持Unicode编码**

我把这个特性留在讨论范围之外是因为非常少的人用控制台程序工作。我曾见过有人把控制台用于学术目的。总而言之，我们现在也对控制台应用有了Unicode编码支持。

**引用**

-   http://msdn.microsoft.com/en-us/library/ms171868.aspx
-   Mr Sukesh marla的精彩文章ASP.NET 4.5 new features

当你有空的时候，一定来看看我的网站 www.questpond.com关于.NET4.5面试问和答，我已经在这方面有了不少努力。

![astrhhjync]({{ site.JB.FILE_PATH }}/2013-11/astrhhjync.jpg)
