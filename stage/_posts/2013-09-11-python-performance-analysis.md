---
layout: post
category: default
date: 2013-09-11
title: "Python程序的性能分析指南"
description: "Python程序的性能分析指南"
tags: [python]
redirecturl: http://blog.jobbole.com/47619/
---


虽然不是所有的Python程序都需要严格的性能分析，不过知道如何利用Python生态圈里的工具来分析性能，也是不错的。

分析一个程序的性能，总结下来就是要回答4个问题：

1.  它运行的有多快？
2.  它的瓶颈在哪？
3.  它占用了多少内存？
4.  哪里有内存泄漏？

接下来，我们会着手使用一些很棒的工具，来帮我们回答这些问题。

### 粗粒度的计算时间

我们先来用个很快的方法来给我们的代码计时：使用unix的一个很好的功能 time。

$ time python yourprogram.py
 
real    0m1.028s
user    0m0.001s
sys     0m0.003s

关于这3个测量值的具体含义可以看[StackOverflow上的帖子](http://stackoverflow.com/questions/556405/what-do-real-user-and-sys-mean-in-the-output-of-time1)，但是简要的说就是：

-   real：代表实际花费的时间
-   user:：代表cpu花费在内核外的时间
-   sys：代表cpu花费在内核以内的时间

通过把sys和user时间加起来可以获得cpu在你的程序上花费的时间。

如果sys和user加起来的时间比real时间要小很多，那么你可以猜想你的程序的大部分性能瓶颈应该是IO等待的问题。

 

### 用上下文管理器来细粒度的测量时间

我接下来要使用的技术就是让你的代码仪器化以让你获得细粒度的时间信息。这里是一个计时方法的代码片段：

    import time
     
    class Timer(object):
        def __init__(self, verbose=False):
            self.verbose = verbose
     
        def __enter__(self):
            self.start = time.time()
            return self
     
        def __exit__(self, *args):
            self.end = time.time()
            self.secs = self.end - self.start
            self.msecs = self.secs * 1000  # millisecs
            if self.verbose:
                print 'elapsed time: %f ms' % self.msecs

为了使用它，将你想要测量时间的代码用Python关键字with和Timer上下文管理器包起来。它会在你的代码运行的时候开始计时，并且在执行结束的完成计时。

下面是一个使用它的代码片段：

    from timer import Timer
    from redis import Redis
    rdb = Redis()
     
    with Timer() as t:
        rdb.lpush("foo", "bar")
    print "=> elasped lpush: %s s" % t.secs
     
    with Timer as t:
        rdb.lpop("foo")
    print "=> elasped lpop: %s s" % t.secs

我会经常把这些计时器的输入记录进一个日志文件来让我知道程序的性能情况。

 

### 用分析器一行一行地计时和记录执行频率

Robert Kern有一个很棒的项目名叫[line\_profiler](http://packages.python.org/line_profiler/)。我经常会用它来测量我的脚本里每一行代码运行的有多快和运行频率。

为了用它，你需要通过pip来安装这个Python包：

    $ pip install line_profiler

在你安装好这个模块之后，你就可以使用line\_profiler模块和一个可执行脚本kernprof.py。

为了用这个工具，首先需要修改你的代码，在你想测量的函数上使用@profiler装饰器。不要担心，为了用这个装饰器你不需要导入任何其他的东西。Kernprof.py这个脚本可以在你的脚本运行的时候注入它的运行时。

Primes.py

    @profile
    def primes(n): 
        if n==2:
            return [2]
        elif n<2:
            return []
        s=range(3,n+1,2)
        mroot = n ** 0.5
        half=(n+1)/2-1
        i=0
        m=3
        while m <= mroot:
            if s[i]:
                j=(m*m-3)/2
                s[j]=0
                while j<half:
                    s[j]=0
                    j+=m
            i=i+1
            m=2*i+3
        return [2]+[x for x in s if x]
    primes(100)
     
    .

一旦你在你的代码里使用了@profile装饰器，你就要用kernprof.py来运行你的脚本：

    $ kernprof.py -l -v fib.py

-l这个选项是告诉kernprof将@profile装饰器注入到你的脚本的内建里，-v是告诉kernprof在脚本执行完之后立马显示计时信息。下面是运行测试脚本后得到的输出：

    Wrote profile results to primes.py.lprof
    Timer unit: 1e-06 s
     
    File: primes.py
    Function: primes at line 2
    Total time: 0.00019 s
     
    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
         2                                           @profile
         3                                           def primes(n): 
         4         1            2      2.0      1.1      if n==2:
         5                                                   return [2]
         6         1            1      1.0      0.5      elif n<2:
         7                                                   return []
         8         1            4      4.0      2.1      s=range(3,n+1,2)
         9         1           10     10.0      5.3      mroot = n ** 0.5
        10         1            2      2.0      1.1      half=(n+1)/2-1
        11         1            1      1.0      0.5      i=0
        12         1            1      1.0      0.5      m=3
        13         5            7      1.4      3.7      while m <= mroot:
        14         4            4      1.0      2.1          if s[i]:
        15         3            4      1.3      2.1              j=(m*m-3)/2
        16         3            4      1.3      2.1              s[j]=0
        17        31           31      1.0     16.3              while j<half:
        18        28           28      1.0     14.7                  s[j]=0
        19        28           29      1.0     15.3                  j+=m
        20         4            4      1.0      2.1          i=i+1
        21         4            4      1.0      2.1          m=2*i+3
        22        50           54      1.1     28.4      return [2]+[x for x in s if x]
     
    .

在里面寻找花费时间比较长的行，有些地方在优化之后能带来极大的改进。

 

### 它用了多少内存？

现在，我们已经能很好的测量代码运行时间了，接下来就是分析代码用了多少内存了。幸运的是，Fabian
Pedregosa已经完成了一个很好的[memory\_profiler](https://github.com/fabianp/memory_profiler)，它模仿了Robert
Kern的line\_profile。

首先，用pip来安装它：

    $ pip install -U memory_profiler
    $ pip install psutil

（推荐安装psutils包，这是因为这能大大提升memory\_profiler的性能）

跟line\_profiler类似，memory\_profiler需要用@profiler装饰器来装饰你感兴趣的函数，就像这样：

    @profile
    def primes(n): 
        ...
        ...

用一下的命令来查看你的函数在运行时耗费的内存：

    $ python -m memory_profiler primes.py

在代码运行完之后，你就应该能看到一下的输出：

    Filename: primes.py
     
    Line #    Mem usage  Increment   Line Contents
    ==============================================
         2                           @profile
         3    7.9219 MB  0.0000 MB   def primes(n): 
         4    7.9219 MB  0.0000 MB       if n==2:
         5                                   return [2]
         6    7.9219 MB  0.0000 MB       elif n<2:
         7                                   return []
         8    7.9219 MB  0.0000 MB       s=range(3,n+1,2)
         9    7.9258 MB  0.0039 MB       mroot = n ** 0.5
        10    7.9258 MB  0.0000 MB       half=(n+1)/2-1
        11    7.9258 MB  0.0000 MB       i=0
        12    7.9258 MB  0.0000 MB       m=3
        13    7.9297 MB  0.0039 MB       while m <= mroot:
        14    7.9297 MB  0.0000 MB           if s[i]:
        15    7.9297 MB  0.0000 MB               j=(m*m-3)/2
        16    7.9258 MB -0.0039 MB               s[j]=0
        17    7.9297 MB  0.0039 MB               while j<half:
        18    7.9297 MB  0.0000 MB                   s[j]=0
        19    7.9297 MB  0.0000 MB                   j+=m
        20    7.9297 MB  0.0000 MB           i=i+1
        21    7.9297 MB  0.0000 MB           m=2*i+3
        22    7.9297 MB  0.0000 MB       return [2]+[x for x in s if x]
     
    .

 

### IPython里针对line\_profiler和memory\_profiler的快捷方式

Line\_profiler和memory\_profiler共有的特性是它们都在IPython里有快捷方式。你只需要在IPython里输入以下内容：

    %load_ext memory_profiler
    %load_ext line_profiler

完成这个步骤后，你就可以使用一个神奇的命令 %lprun 和 %mprun，它们跟其对应的命令行的功能是类似的。主要的不同是在这里你不需要在你想测量的函数上面使用@profiler来装饰它。可以直接在IPython里像一下的样子了来运行它：

    %load_ext In [1]: from primes import primes
    In [2]: %mprun -f primes primes(1000)
    In [3]: %lprun -f primes primes(1000/pre>

这个因为其不用修改你的代码，而能够节省你很多的时间和精力。

 

### 哪里有内存泄漏？

C Python解释器使用引用计数的方法来作为其内存管理的主要方法。这意味着虽有对象都包含一个计数器，如果增加了一个对这个对象的引用就加1，如果引用被删除就减1。当计数器的值变成0的时候，C Python解释器就知道这个对象不再被使用便会删除这个对象并且释放它占用的内存。如果在你的程序里，尽管一个对象不再被使用了，但仍然保持对这个对象的引用，就会导致内存泄漏。找到这些内存泄漏最快的方法就是使用一个很棒的工具，名叫[objgraph](http://mg.pov.lt/objgraph/)，由Marius Gedminas写的。这个工具能让你看到内存里的对象数量，也能在你的代码里定位保持对这些对象的引用的地方。首先是安装objgraph：

    pip install objgraph

在它安装好之后，在你的代码里添加一段声明来调用debugger。

    import pdb; pdb.set_trace()

 

### 哪些对象是最常见的？

在运行时，你可以通过运行它考察在你的代码里排前20最常见的对象：

    (pdb) import objgraph
    (pdb) objgraph.show_most_common_types()
     
    MyBigFatObject             20000
    tuple                      16938
    function                   4310
    dict                       2790
    wrapper_descriptor         1181
    builtin_function_or_method 934
    weakref                    764
    list                       634
    method_descriptor          507
    getset_descriptor          451
    type                       439

 

### 哪些对象被添加或者删除？

我们也可以及时看到在两点之间那些对象被添加或者删除了：

    (pdb) import objgraph
    (pdb) objgraph.show_growth()
    .
    .
    .
    (pdb) objgraph.show_growth()   # this only shows objects that has been added or deleted since last show_growth() call
     
    traceback                4        +2
    KeyboardInterrupt        1        +1
    frame                   24        +1
    list                   667        +1
    tuple                16969        +1

 

### 哪里引用了有漏洞的对象

顺着这条路继续，我们也能看到哪里有对任何指定对象的引用是被保持了的。我们以下面的程序为例：

    x = [1]
    y = [x, [x], {"a":x}]
    import pdb; pdb.set_trace()

为了看哪里有对于变量x的一个引用，运行objgraph.show\_backref( )函数：

    (pdb) import objgraph
    (pdb) objgraph.show_backref([x], filename="/tmp/backrefs.png")

这个命令的输出应该是一个PNG图片，它的路径为/tmp/backrefs.png。它看起来应该是这样：

[![backrefs]({{ site.assetpath }}/2013-09/backrefs.png)]({{ site.assetpath }}/2013-09/backrefs.png "Python程序的性能分析指南")

最下面的方框，里面用红色字母写出的是我们感兴趣的对象。我们可以看到它被变量x引用一次，被列表y引用三次。如果x是导致内存泄漏的对象，我们可以用这个方法来看为什么它没有通过追踪所有的引用而被自动释放。

来回顾一下，[objgraph](http://mg.pov.lt/objgraph/) 能让我们：

-   显示我们的python程序里占用内存最多的前N个对象
-   显示在一段时间里被添加或删除的对象
-   显示在我们的代码里对一个给定对象的所有引用

 

### 成就vs 精确

在前文中，我已经展示了如果使用几种工具来分析Python程序的性能。在有了这些工具和技术后，你应该能得到所需要的所有信息来追踪Python程序里大部分的内存泄漏和性能瓶颈。

跟很多其他的主题一样，进行一个性能分析意味着平衡和取舍。在不确定的时候，实现最简单的方案将是适合你目前需要的。

原文链接： [Huy Nguyen](http://www.huyng.com/posts/python-performance-analysis/) 翻译：[伯乐在线](http://blog.jobbole.com) - [贱圣OMG](http://blog.jobbole.com/author/fwg1989/)
