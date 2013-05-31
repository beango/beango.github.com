---
layout: post
categories: [函数式编程]
date: 2013-04-25
title: "Python中函数式编程，第三部分"
description: "Python中函数式编程，第三部分"
tags: [python]
redirecturl: http://www.oschina.net/translate/python-functional-programming-part3
---
{% include JB/setup %}

英文原文：[Charming Python: Functional programming in Python, Part 3](http://www.ibm.com/developerworks/linux/library/l-prog3/index.html)，翻译：[开源中国](http://www.oschina.net/translate/python-functional-programming-part3)

**摘要：**  作者David Mertz在其文章《可爱的Python：“Python中的函数式编程”》中的[第一部分](http://blog.jobbole.com/35028/)和[第二部分](http://blog.jobbole.com/35042/)中触及了函数式编程的大量基本概念。本文中他将继续前面的讨论，解释函数式编程的其它功能，如currying和Xoltar
Toolkit中的其它一些高阶函数。

**表达式绑定**

有一位从不满足于解决部分问题读者，名叫Richard Davies，提出了一个问题，问是否可以将所有的绑定全部都转移到一个单个的表达式之中。首先让我们简单看看，我们为什么想这么做，然后再看看由comp.lang.python中的一位朋友提供的一种异常优雅地写表达式的方式。

让我们回想一下功能模块的绑定类。使用该类的特性，我们可以确认在一个给定的范围块内，一个特定的名字仅仅代表了一个唯一的事物。

***具有重新绑定向导的 Python 函数式编程(FP)***

    >>> from functional import *
    >>> let = Bindings()
    >>> let.car = lambda lst: lst[0]
    >>> let.car = lambda lst: lst[2]
    Traceback (innermost last):
      File "<stdin>", line 1, in ?
      File "d:\tools\functional.py", line 976, in __setattr__
     
    raise BindingError, "Binding '%s' cannot be modified." % name
    functional.BindingError:  Binding 'car' cannot be modified.
    >>> let.car(range(10))
    0

绑定类在一个模块或者一个功能定义范围内做这些我们希望的事情，但是没有办法在一条表达式内使之工作。然而在ML家族语言(译者注：ML是一种通用的函数式[编程语言](http://blog.jobbole.com/tag/%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80/ "如何选择语言和编程语言排名相关文章")),在一条表达式内创建绑定是很自然的事。

***Haskell 命名绑定表达式***

    -- car (x:xs) = x  -- *could* create module-level binding
    list_of_list = [[1,2,3],[4,5,6],[7,8,9]]
     
    -- 'where' clause for expression-level binding
    firsts1 = [car x | x <- list_of_list] where car (x:xs) = x
     
    -- 'let' clause for expression-level binding
    firsts2 = let car (x:xs) = x in [car x | x <- list_of_list]
     
    -- more idiomatic higher-order 'map' technique
    firsts3 = map car list_of_list where car (x:xs) = x
     
    -- Result: firsts1 == firsts2 == firsts3 == [1,4,7]

Greg Ewing发现用Python的list概念实现同样的效果是有可能的；甚至我们可以用几乎与Haskell语法一样干净的方式做到。

***Python 2.0+ 命名绑定表达式***

    >>> list_of_list = [[1,2,3],[4,5,6],[7,8,9]]
    >>> [car_x for x in list_of_list for car_x in
     (x[0],)]
    [1, 4, 7]

在列表解析（list comprehension）中将表达式放入一个单项元素（a single-item tuple）中的这个小技巧，并不能为使用带有表达式级绑定的高阶函数提供任何思路。要使用这样的高阶函数，还是需要使用块级（block-level）绑定，就象以下所示：

***Python中的使用块级绑定的’map()’***

    >>> list_of_list = [[1,2,3],[4,5,6],[7,8,9]]
    >>> let = Bindings()
    >>> let.car = lambda l: l[0]
    >>> map(let.car,list_of_list)
    [1, 4, 7]

这样真不错，但如果我们想使用函数map()，那么其中的绑定范围可能会比我们想要的更宽一些。然而，我们可以做到的，哄骗列表解析让它替我们做名字绑定，即使其中的列表并不是我们最终想要得到的列表的情况下也没问题：

***从Python的列表解析中“走下舞台”***

    # Compare Haskell expression:
    # result = func car_car
    #          where
    #              car (x:xs) = x
    #              car_car = car (car list_of_list)
    #              func x = x + x^2
    >>> [func for x in list_of_list
    ...       
    for car in (x[0],)
    ...       
    for func in (car+car**2,)][0]
    2

我们对list\_of\_list列表中第一个元素的第一个元素进行了一次算数运算，而且期间还对该算术运算进行了命名（但其作用域仅仅是在表达式的范围内）。作为一种“优化”，我们可以不用费心创建多于一个元素的列表就能开始运算了，因为我们结尾处用的索引为0，所以我们仅仅选择的是第一个元素。：

***从列表解析中高效地走下舞台***

    # Compare Haskell expression:
    # result = func car_car
    #          where
    #              car (x:xs) = x
    #              car_car = car (car list_of_list)
    #              func x = x + x^2
    >>> [func for x in list_of_list
    ...       
    for car in (x[0],)
    ...       
    for func in (car+car**2,)][0]
    2

**高阶函数：currying**

Python内建的三个最常用的高阶函数是：map()、reduce()和filter()。这三个函数所做的事情 —— 以及谓之为“高阶”（higher-order）的原因 —— 是接受其它函数作为它们的（部分）参数。还有别的一些不属于内置的高阶函数，还会返回函数对象。
藉由函数对象在Python中具有首要地位，
Python一直都有能让其使用者构造自己的高阶函数的能力。举个如下所示的小例子：

***Python中一个简单函数工厂（function factory）***

    >>> def
     foo_factory():
    ...    
    def
     foo():
    ...        
    print
    "Foo function from factory"
    ...    
    return foo
    ...
    >>> f = foo_factory()
    >>> f()
    Foo function from factory

本系列文章的第二部分我讨论过的Xoltar Toolkit中，有一组非常好用的高阶函数。Xoltar的functional模块中提供的绝大多数高阶函数都是在其它各种不同的传统型函数式编程语言中发展出来的高阶函数，其有用性已经过多年的实践验证。

可能其中最著名、最有用和最重要的高阶函数要数curry()了。函数curry()的名字取自于逻辑学家Haskell Curry，前文提及的一种编程语言也是用他姓名当中的名字部分命名的。”currying”背后隐含的意思是，（几乎）每一个函数都可以视为只带一个参数的部分函数（partial function）。要使currying能够用起来所需要做的就是让函数本身的返回值也是个函数，只不过所返回的函数“缩小了范围”或者是“更加接近完整的函数”。这和我在第二部分中提到的闭包特别相似 —— 对经过curry后的返回的后继函数进行调用时一步一步“填入”最后计算所需的更多数据（附加到一个过程（procedure）之上的数据）

现在让我们先用Haskell中一个很简单例子对curry进行讲解，然后在Python中使用functional模块重复展示一下这个简单的例子：

**在Haskell计算中使用Curry***

    computation a b c d = (a + b^2+ c^3 + d^4)
    check = 1 + 2^2 + 3^3 + 5^4
     
    fillOne   = computation 1
    -- specify "a"
    fillTwo   = fillOne 2    
    -- specify "b"
    fillThree = fillTwo 3    
    -- specify "c"
    answer    = fillThree 5  
    -- specify "d"
     
    -- Result: check == answer == 657

现在使用Python：

在Python计算中使用Curry

    >>> from functional import curry
    >>> computation = lambda a,b,c,d: (a + b**2 + c**3 + d**4)
    >>> computation(1,2,3,5)
    657
    >>> fillZero  = curry(computation)
    >>> fillOne   = fillZero(1)  
    # specify "a"
    >>> fillTwo   = fillOne(2)   
    # specify "b"
    >>> fillThree = fillTwo(3)   
    # specify "c"
    >>> answer    = fillThree(5) 
    # specify "d"
    >>> answer
    657

第二部分中提到过的一个简单的计税程序的例子，当时用的是闭包（这次使用curry()），可以用来进一步做个对比：

    Python中curry后的计税程序

    from functional import *
     
    taxcalc = lambda income,rate,deduct: (income-(deduct))*rate
     
    taxCurry = curry(taxcalc)
    taxCurry = taxCurry(50000)
    taxCurry = taxCurry(0.30)
    taxCurry = taxCurry(10000)
    print "Curried taxes due =",taxCurry
     
    print "Curried expression taxes due =", \
          curry(taxcalc)(50000)(0.30)(10000)

和使用闭包不同，我们需要以特定的顺序（从左到右）对参数进行curry处理。当要注意的是，functional模块中还包含一个rcurry()类，能够以相反的方向进行curry处理（从右到左）。

从一个层面讲，其中的第二个print语句同简单的同普通的taxcalc(50000,0.30,10000)函数调用相比只是个微小的拼写方面的变化。但从另一个不同的层面讲，它清晰地一个概念，那就是，每个函数都可以变换成仅仅带有一个参数的函数，这对于刚刚接触这个概念的人来讲，会有一种特别惊奇的感觉。

**其它高阶函数**

除了上述的curry功能，functional模块简直就是一个很有意思的高阶函数万能口袋。此外，无论用还是不用functional模块，编写你自己的高阶函数真的并不难。至少functional模块中的那些高阶函数为你提供了一些很值一看的思路。\

它里面的其它高阶函数在很大程度上感觉有点象是“增强”版本的标准高阶函数map()、filter()和reduce()。这些函数的工作模式通常大致如此：将一个或多个函数以及一些列表作为参数接收进来，然后对这些列表参数运行它前面所接收到的函数。在这种工作模式方面，有非常大量很有意思也很有用的摆弄方法。还有一种模式是：拿到一组函数后，将这组函数的功能组合起来创建一个新函数。这种模式同样也有大量的变化形式。下面让我们看看functional模块里到底还有哪些其它的高阶函数。

sequential()和also()这两个函数都是在一系列成分函数（component function）的基础上创建一个新函数。然后这些成分函数可以通过使用相同的参数进行调用。两者的主要区别就在于，sequential()需要一个单个的函数列表作为参数，而also()接受的是一系列的多个参数。在多数情况下，对于函数的副作用而已这些会很有用，只是sequential()可以让你随意选择将哪个函数的返回值作为组合起来后的新函数的返回值。

*** 顺序调用一系列函数(使用相同的参数)***

    >>> def a(x):
    ...     print x,
    ...     return "a"
    ...
    >>> def b(x):
    ...     print x*2,
    ...     return "b"
    ...
    >>> def c(x):
    ...     print x*3,
    ...     return "c"
    ...
    >>> r = also(a,b,c)
    >>> r
    <functional.sequential instance at 0xb86ac>
    >>> r(5)
    5 10 15
    'a'
    >>> sequential([a,b,c],main=c)('x')
    x xx xxx
    'c'

isjoin()和conjoin()这两个函数同equential()和also()在创建新函数并对参数进行多个成分函数的调用方面非常相似。只是disjoin()函数用来查询成分函数中是否有一个函数的返回值（针对给定的参数）为真；conjoin()函数用来查询是否所有的成分函数的返回值都为真。在这些函数中只要条件允许就会使用逻辑短路，因此disjoin()函数可能不会出现某些副作用。joinfuncs()i同also()类似，但它返回的是由所有成分函数的返回值组成的一个元组（tuple），而不是选中的某个主函数。

前文所述的几个函数让你可以使用相同的参数对一系列函数进行调用，而any()、all()和none\_of()这三个让你可以使用一个参数列表对同一个函数进行多次调用。在大的结构方面，这些函数同内置的map()、reduce()和filter()有点象。但funtional模块中的这三个高阶函数中都是对一组返回值进行布尔（boolean）运算得到其返回值的。例如：

*** 对一系列返回值的真、假情况进行判断***

    >>> from functional import *
    >>> isEven = lambda n: (n%2 == 0)
    >>> any([1,3,5,8], isEven)
    1
    >>> any([1,3,5,7], isEven)
    0
    >>> none_of([1,3,5,7], isEven)
    1
    >>> all([2,4,6,8], isEven)
    1
    >>> all([2,4,6,7], isEven)
    0

有点数学基础的人会对这个高阶函数非常感兴趣：iscompose().将多个函数进行合成（compostion）指的是，将一个函数的返回值同下个函数的输入“链接到一起”。对多个函数进行合成的程序员需要负责保证函数间的输入和输出是相互匹配的，不过这个条件无论是程序员在何时想使用返回值时都是需要满足的。举个简单的例子和阐明这一点：

*** 创建合成函数***

    >>> def minus7(n): return n-7
    ...
    >>> def times3(n): return n*3
    ...
    >>> minus7(10)
    3
    >>> minustimes = compose(times3,minus7)
    >>> minustimes(10)
    9
    >>> times3(minus7(10))
    9
    >>> timesminus = compose(minus7,times3)
    >>> timesminus(10)
    23
    >>> minus7(times3(10))
    23

**后会有期**

衷心希望我对高阶函数的思考能够引起读者的兴趣。无论如何，请动手试一试。试着编写一些你自己的高阶函数；一些可能很有用，很强大。告诉我它如何运行；或许这个系列之后的章节会讨论读者不断提供的新观点，新想法。

[Python中的函数式编程，第一部分](/archives/2013/03/04/python-functional-programming-part1.html "Python中函数式编程，第一部分")

[Python中的函数式编程，第二部分](/archives/2013/04/11/python-functional-programming-part2.html "Python中函数式编程，第二部分")

[Python中的函数式编程，第三部分](/archives/2013/04/25/python-functional-programming-part3.html "Python中的函数式编程，第三部分")