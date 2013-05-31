---
layout: post
categories: [javascript]
date: 2013-05-31
title: "深入研究JavaScript的Module模式"
description: "深入研究JavaScript的Module模式"
tags: [javascript]
redirecturl: http://blog.jobbole.com/40409/
---
{% include JB/setup %}

Module模式是常见的JavaScript编程模式，一般来说这种模式是很好理解的，但是依然有一些高级的用法没有得到太多的注意。在这篇文章中我会提到Module模式的基础知识和一些真正重要的话题，包括一个可能是我原创的。

基础知识
--------

首先我们要大概了解一下Module模式（2007年由YUI的EricMiraglia在博客中提出），如果你已熟悉 Module 模式，可以跳过本部分，直接阅读“高级模式”。

 

### 匿名函数闭包

匿名函数闭包是JavaScript最棒的特征，没有之一，是它让一切都成为了可能。现在我们来创建一个匿名函数然后立即执行。函数中所有的代码都是在一个闭包中执行的，闭包决定了在整个执行过程中这些代码的私有性和状态。

    (function () {
        // ... all vars and functions are in this scope only
        // still maintains access to all globals
    }());

注意在匿名函数外面的括号。这是由于在JavaScript中以function开头的语句通常被认为是函数声明。加上了外面的括号之后则创建的是函数表达式。

 

### 全局导入

JavaScript有一个特征叫做隐藏的全局变量。当一个变量名被使用，编译器会向上级查询用var来声明这个变量的语句。如果没有找到的话这个变量就被认为是全局的。如果在赋值的时候这样使用，就会创建一个全局的作用域。这意味着在一个匿名的闭包中创建一个全局变量是十分容易的。不幸的是，这将会导致代码的难以管理，因为对于程序员来说，如果全局的变量不是在一个文件中声明会很不清晰。幸运的是，匿名函数给我我们另一个选择。我们可以将全局变量通过匿名函数的参数来导入到我们的代码中，这样更加的快速和整洁。

    (function ($, YAHOO) {
        // now have access to globals jQuery (as $) and YAHOO in this code
    }(jQuery, YAHOO));

### 

### Module导出

有时你并不想要使用全局变量，但是你想要声明他们。我们可以很容易通过匿名函数的返回值来导出他们。关于Module模式的基本内容就这么多，这里有一个复杂一点的例子。

    var MODULE = (function () {
        var my = {},
            privateVariable = 1;

        function privateMethod() {
            // ...
        }

        my.moduleProperty = 1;
        my.moduleMethod = function () {
            // ...
        };

        return my;
    }());

这里我们声明了一个全局的module叫做MODULE，有两个公有属性：一个叫做MODULE.moduleMethod的方法和一个叫做MODULE.moduleProperty的变量。另外他通过匿名函数的闭包来维持私有的内部状态，当然我们也可使用前面提到的模式，轻松导入所需的全局变量

 

高级模式
--------

之前提到的内容已经可以满足很多需求了，但我们可以更深入地研究这种模式来创造一些强力的可拓展的结构。让我们一点一点，继续通过这个叫做MODULE的module来学习。

### 拓展

目前，module模式的一个局限性就是整个module必须是写在一个文件里面的。每个进行过大规模代码开发的人都知道将一个文件分离成多个文件的重要性。幸运的是我们有一个很好的方式来拓展modules。首先我们导入一个module，然后加属性，最后将它导出。这里的这个例子，就是用上面所说的方法来拓展MODULE。

    var MODULE = (function (my) {
        my.anotherMethod = function () {
            // added method...
        };

        return my;
    }(MODULE));

虽然不必要，但是为了一致性，我们再次使用var关键字。然后代码执行，module会增加一个叫做MODULE.anotherMethod的公有方法。这个拓展文件同样也维持着它私有的内部状态和导入。

 

### 松拓展

我们上面的那个例子需要我们先创建module，然后在对module进行拓展，这并不是必须的。异步加载脚本是提升Javascript应用性能的最佳方式之一。。通过松拓展，我们创建灵活的，可以以任意顺序加载的，分成多个文件的module。每个文件的结构大致如下

    var MODULE = (function (my) {
        // add capabilities...

        return my;
    }(MODULE || {}));

在这种模式下，var语句是必须。如果导入的module并不存在就会被创建。这意味着你可以用类似于LABjs的工具来并行加载这些module的文件。

 

### 紧拓展

虽然松拓展已经很棒了，但是它也给你的module增添了一些局限。最重要的一点是，你没有办法安全的重写module的属性，在初始化的时候你也不能使用其他文件中的module属性（但是你可以在初始化之后运行中使用）。紧拓展包含了一定的载入顺序，但是支持重写，下面是一个例子（拓展了我们最初的MODULE）。

    var MODULE = (function (my) {
        var old_moduleMethod = my.moduleMethod;

        my.moduleMethod = function () {
            // method override, has access to old through old_moduleMethod...
        };

        return my;
    }(MODULE));

这里我们已经重写了MODULE.moduleMethod，还按照需求保留了对原始方法的引用。

 

### 复制和继承

    var MODULE_TWO = (function (old) {
        var my = {},
            key;

        for (key in old) {
            if (old.hasOwnProperty(key)) {
                my[key] = old[key];
            }
        }

        var super_moduleMethod = old.moduleMethod;
        my.moduleMethod = function () {
            // override method on the clone, access to super through super_moduleMethod
        };

        return my;
    }(MODULE));

这种模式可能是最不灵活的选择。虽然它支持了一些优雅的合并，但是代价是牺牲了灵巧性。在我们写的代码中，那些类型是对象或者函数的属性不会被复制，只会以一个对象的两份引用的形式存在。一个改变，另外一个也改变。对于对象来说[[g5]](http://blog.jobbole.com/40409/#_msocom_5) ，我们可以通过一个递归的克隆操作来解决，但是对于函数是没有办法的，除了eval。然而，为了完整性我还是包含了它。

 

### 跨文件的私有状态

把一个module分成多个文件有一很大的局限，就是每一个文件都在维持自身的私有状态，而且没有办法来获得其他文件的私有状态。这个是可以解决的，下面这个松拓展的例子，可以在不同文件中维持私有状态。

    var MODULE = (function (my) {
        var _private = my._private = my._private || {},
            _seal = my._seal = my._seal || function () {
                delete my._private;
                delete my._seal;
                delete my._unseal;
            },
            _unseal = my._unseal = my._unseal || function () {
                my._private = _private;
                my._seal = _seal;
                my._unseal = _unseal;
            };

        // permanent access to _private, _seal, and _unseal

        return my;
    }(MODULE || {}));

每一个文件可以为它的私有变量\_private设置属性，其他文件可以立即调用。当module加载完毕，程序会调用MODULE.\_seal(),让外部没有办法接触到内部的  \_.private。如果之后module要再次拓展，某一个属性要改变。在载入新文件前,每一个文件都可以调用\_.unsea(),，在代码执行之后再调用\_.seal。

这个模式在我今天的工作中想到的，我从没有在其他地方见到过。但是我认为这是一个很有用的模式，值得单独写出来。

 

### Sub-modules

最后一个高级模式实际上是最简单的，有很多创建子module的例子，就像创建一般的module一样的。

    MODULE.sub = (function () {
        var my = {};
        // ...

        return my;
    }());

虽然这可能是很简单的，但是我决定这值得被写进来。子module有一般的module所有优质的特性，包括拓展和私有状态。

 

总结
----

大多数高级模式都可以互相组合来创建更有用的新模式。如果一定要让我提出一个设计复杂应用的方法的话，我会结合松拓展，私有状态，和子module。

在这里我没有提到性能相关的事情，但是我可以说，module模式对于性能的提升有好处。它可以减少代码量，这就使得代码的载入更迅速。松拓展使得并行加载成为可能，这同样提升的载入速度。初始化的时间可能比其他的方法时间长，但是这多花的时间是值得的。只要全局变量被正确导入了运行的时候就不会出问题，在子module中由于对变量的引用链变短了可能也会提升速度。

最后，这是一个子module自身动态加载的例子（如果不存在就创建），为了简介我没有考虑内部状态，但是即便考虑它也很简单。这个模式可以让复杂，多层次的代码并行的加载，包括子module和其他所有的东西。

    var UTIL = (function (parent, $) {
        var my = parent.ajax = parent.ajax || {};

        my.get = function (url, params, callback) {
            // ok, so I'm cheating a bit :)
            return $.getJSON(url, params, callback);
        };

        // etc...

        return parent;
    }(UTIL || {}, jQuery));

我希望这些内容是有用的，请在下面留言来分享你的想法。少年们，努力吧，写出更好的，更模块化的JavaScript。

英文原文；[ben cherry](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)，编译：[伯乐](http://www.jobbole.com "伯乐在线")在线 – [王筱](http://blog.jobbole.com/author/%e7%8e%8b%e7%ad%b1/)

译文链接：[http://blog.jobbole.com/40409/](http://blog.jobbole.com/40409/)
