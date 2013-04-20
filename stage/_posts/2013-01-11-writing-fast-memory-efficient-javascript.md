---
layout: post
section: Archive
categories: [web开发,javascript]
date: 2013-01-11
title: "编写高效的JavaScript程序"
description: "编写高效的JavaScript程序"
tags: [javascript]
redirecturl: http://www.csdn.net/article/2012-11-20/2811887-writing-fast-memory-efficient-javascript
---
{% include JB/setup %}

**英文原文：**[Writing Fast, Memory-Efficient JavaScript][]

Addy Osmani是谷歌公司Chrome团队中的一名程序开发工程师。他是一位JavaScript爱好者，曾经编写过一本开放源码方面的书籍《[Learning
JavaScript Design Patterns][]》以及《Developing Backbone
Applications》。为Modernizr和jQuery社区贡献了开源项目，目前正在从事‘Yeoman’项目，旨在为开发者提供一系列健壮的工具、程序库和工作流，帮助他们快速构建出漂亮、引人注目的Web应用。本文作者将带领大家探索高效编写代码的测试验证方法。

**文章内容如下：**

　　JavaScript引擎包括Google
V8（Chrome，Node）都是专为快速执行大型JavaScript程序而设计的。在开发过程中，如果你在乎内存使用率和性能情况，那么你应该会关心在用户的浏览器中JavaScript引擎背后是怎么样的。无论是V8、SpiderMonkey
(Firefox)、Carakan (Opera)、Chakra (IE)
还是其他，有了它们可以帮助你更好的优化应用程序。

　　我们应该时不时地询问自己：

-   我还能做些什么使代码更加有效？
-   主流的JavaScript引擎做了哪些优化？
-   什么是引擎无法优化的，我能期待利用垃圾回收进行清洁吗？

![][0] 

　　快速的加载Web网页就如同汽车一样，需要使用特殊工具。

　　当涉及到编写高效的内存和快速创建代码时总会出现一些常见的弊端，在这篇文章中我们将探索高效编写代码的测试验证方法。

一、JavaScript如何在V8中工作？
-----------------------------

　　如果你对JS引擎没有较深的了解，开发一个大型Web应用也没啥问题，就好比会开车的人也只是看过引擎盖而没有看过车盖内的引擎一样（这里将Web网页比如成汽车）。Chrome浏览器是我的优先选择，这里我将谈下V8的核心组件：

-   **一个基本的编译器**，在代码执行前分析JavaScript、生成本地机器代码而非执行字节代码或是简单的解释，该段代码之初不是高度优化的。
-   **V8用对象模型“表述”对象。**在JavaScript中，对象是一个关联数组，但是V8中，对象被“表述”为隐藏类，这种隐藏类是V8的内部类型，用于优化后的查找。
-   **运行时分析器**监视正在运行的系统并优化“hot”（活跃）函数。（比如，终结运行已久的代码）
-   通过运行时分析器把**优化编译器**重新编译和被运行时分析器标识为“hot”的代码
    ，这是一种有效的编译优化技术,（例如用被调用者的主体替换函数调用的位置）。
-   **V8支持去优化**，也就是说当你发现一些假设的优化代码太过乐观，优化编译器可以退出已生成的代码。
-   **垃圾回收**，了解它是如何工作的，如同优化JavaScript一样同等重要。

二、垃圾回收
-----------------------------

　　垃圾回收是内存管理的一种形式，它试图通过将不再使用的对象修复从而释放内存占用率。垃圾回收语言（比如JavaScript）是指在JavaScript这种垃圾回收语言中，应用程序中仍在被引用的对象不会被清除。手动消除对象引用在大多数情况下是没有必要的。通过简单地把变量放在需要它们的地方（理想情况下，尽可能是局部作用域，即它们被使用的函数里而不是函数外层），一切将运作地很好。

![][1]

　　<div style="text-align:center;">垃圾回收清除内存</div>

　　在JavaScript中强制执行垃圾回收是不可取的，当然，你也不会想这么做，因为垃圾回收进程被运行时控制着，它知道什么时候才是适合清理代码的最好时机。

**1. “消除引用”的误解（De-Referencing Misconceptions）**

　　在JavaScript中回收内存在网上引发了许多争论，虽然它可以被用来删除对象（map）中的属性（key），但有部分开发者认为它可以用来强制“消除引用”。建议尽可能避免使用delete，在下面的例子中delete
o.x 的弊大于利，因为它改变了o的隐藏类，使它成为通用的慢对象。

        var o = { x: 1 };       
        delete o.x; // true     
        o.x; // undefined 

　　目的是为了在运行时避免修改活跃对象的结构，JavaScript引擎可以删除类似“hot”对象，并试图对其进行优化。如果该对象的结果没有太大改变，超过生命周期，删除可能会导致其改变。

　　对于null是如何工作也是有误解的。将一个对象引用设置为null，并没有使对象变“空”，只是将它的引用设置为空而已。使用o.x=null比使用delete会更好些，但可能也不是很必要。

        var o = { x: 1 };      
        o = null;       
        o; // null     
        o.x // TypeError      

　　如果这个引用是最后一个引用对象，那么该对象可进行垃圾回收；倘若不是，那么此方法不可行。注意，无论您的网页打开多久，全局变量不能被垃圾回收清理。

    var myGlobalNamespace = {}; 

**　　**当你刷新新页面时，或导航到不同的页面，关闭标签页或是退出浏览器，才可进行全局清理；当作用域不存在这个函数作用域变量时，这个变量才会被清理，即该函数被退出或是没有被调用时，变量才能被清理。

**经验法则：**

　　为了给垃圾回收创造机会，尽可能早的收集对象，尽量不要隐藏不使用的对象。这一点主要是自动发生，这里有几点需要谨记：

1.  正如之前我们提到的，手动引用在合适的范围内使用变量是个更好的选择，而不是将全局变量清空，只需使用不再需要的局部函数变量。也就是说我们不要为清洁代码而担心。
2.  确保移除不再需要的事件侦听器，尤其是当DOM对象将要被移除时。
3.  如果你正在使用本地数据缓存，请务必清洁该缓存或使用老化机制来避免存储那些不再使用的大量数据。

**2. 函数（Functions）**

　　正如我们前面提到的垃圾回收的工作原理是对内存堆中已经死亡的或者长时间没有使用的对象进行清除和回收。下面的例子能够更好的说明这一点：

        function foo() {     
            var bar = new LargeObject();      
            bar.someCall();       
        }  

　　当foo返回时，bar自动指向垃圾回收对象，这是因为没被调用，这里我们将做个对比：

        function foo() {       
            var bar = new LargeObject();      
            bar.someCall();     
        　　return bar;      
        }  
        // somewhere else      
        var b = foo();      

　　这里有个调用对象且被一直调用着直到这个调用交给b（或是超出b范围）。

**3. 闭包（Closures）**

　　当你看到一个函数返回到内部函数，该内部函数可以访问外部函数，即使外部函数正在被执行。这基本上是一个封闭的，可以在特定的范围内设置变量的表达式。比如：

        function sum (x) {  
            function sumIt(y) {  
                return x + y;  
            };  
            return sumIt;  
        }  
        // Usage  
        var sumA = sum(4);  
        var sumB = sumA(3);  
        console.log(sumB); // Returns 7 

　　在sum调用上下文中生成的函数对象（sumIt）是无法被回收的，它被全局变量（sumA）所引用，并且可以通过sumA(n)调用。

　　这里有个示例演示如何访问largeStr？

        var a = function () {  
            var largeStr = new Array(1000000).join('x');  
            return function () {  
                return largeStr;  
            };  
        }();  

　　我们可以通过a()：

        var a = function () {  
            var smallStr = 'x';  
            var largeStr = new Array(1000000).join('x');  
            return function (n) {  
                return smallStr;  
            };  
        }();  

　　此时，我们不能访问了，因为它是垃圾回收的候选者。

**4. 计时器（Timers）**

　　最糟糕的莫过于在循环中泄露，或者在setTimeout()/setInterval()中，但这却是常见的问题之一。

        var myObj = {  
            callMeMaybe: function () {  
                var myRef = this;  
                var val = setTimeout(function () {  
                    console.log('Time is running out!');  
                    myRef.callMeMaybe();  
                }, 1000);  
            }  
        };  

　　如果我们运行：

    myObj.callMeMaybe(); 

　　在计时器开始前，我们看到每一秒“时间已经不多了”，这时，我们将运行：

    myObj = null; 

三、当心性能陷阱
-----------------------------

　　除非你真正需要，否则永远不要优化代码。在V8中你能轻易的看到一些细微的基准测试显示比如N比M更佳，但是在真实的模块代码中或是在实际的应用程序中测试，这些优化所带来的影响要比你想象中要小的多。

![][2]

**创建一个模块，这里有三点：**

1.  采用本地的数据源包含ID数值
2.  绘制一个包含这些数据的表格
3.  添加事件处理程序，当用户点击的任何单元格时切换单元格的css class

　　如何存储数据？如何高效的绘制表格并追加到DOM？怎样处理表单上的事件？

　　注意：下面的这段代码，千万不能做：

        var moduleA = function () {  
            return {  
                data: dataArrayObject,  
                init: function () {  
                    this.addTable();  
                    this.addEvents();  
                },  
                addTable: function () {  
                    for (var i = 0; i < rows; i++) {  
                        $tr = $('<tr></tr>');  
                        for (var j = 0; j < this.data.length; j++) {  
                            $tr.append('<td>' + this.data[j]['id'] + '</td>');  
                        }  
                        $tr.appendTo($tbody);  
                    }  
                },  
                addEvents: function () {  
                    $('table td').on('click', function () {  
                        $(this).toggleClass('active');  
                    });  
                }  
            };  
        }();  

　　很简单，但是却能把工作完成的很好。

 　　请注意，直接使用DocumentFragment和本地DOM方法生成表格比使用jQuery更佳，事件委托通常比单独绑定每个td更具备高性能。jQuery一般在内部使用DocumentFragment，但是在这个例子中，通过内循环调用代码append()
，因此，无法在这个例子中进行优化，但愿这不是一个诟病，但请务必将代码进行基准测试。

　　这里，我们通过opting for
documentFragment提高性能，事件代理对简单的绑定是一种改进，可选的DocumentFragment也起到了助推作用。

        var moduleD = function () {        
            return {       
                data: dataArray,         
                init: function () {  
                    this.addTable();  
                    this.addEvents();  
                },  
                addTable: function () {  
                    var td, tr;  
                    var frag = document.createDocumentFragment();  
                    var frag2 = document.createDocumentFragment();  
                    for (var i = 0; i < rows; i++) {  
                        tr = document.createElement('tr');  
                        for (var j = 0; j < this.data.length; j++) {  
                            td = document.createElement('td');  
                            td.appendChild(document.createTextNode(this.data[j]));  
                            frag2.appendChild(td);  
                        }  
                        tr.appendChild(frag2);  
                        frag.appendChild(tr);  
                    }  
                    tbody.appendChild(frag);  
                },  
                addEvents: function () {  
                    $('table').on('click', 'td', function () {  
                        $(this).toggleClass('active');  
                    });  
                }         
            };         
        }();  

　　我们不妨看看其他提供性能的方法，也许你曾读过使用原型模式或是使用JavaScript模板框架进行高度优化。但是使用这些仅针对可读的代码。此外，还有预编译。我们一起来实践下：

        moduleG = function () {};         
        moduleG.prototype.data = dataArray;  
        moduleG.prototype.init = function () {  
            this.addTable();  
            this.addEvents();  
        };  
        moduleG.prototype.addTable = function () {  
            var template = _.template($('#template').text());  
            var html = template({'data' : this.data});  
            $tbody.append(html);  
        };  
        moduleG.prototype.addEvents = function () {  
           $('table').on('click', 'td', function () {  
               $(this).toggleClass('active');  
           });  
        };  
        var modG = new moduleG();  

　　事实证明，选择模板和原型并没有给我们带来多大好处。

四、V8引擎优化技巧：
-----------------------------

　　特定的模式会导致V8优化产生故障。很多函数无法得到优化，你可以在V8平台使用–trace-opt
file.js搭配d8实用程序。

　　如果你关心速度，那么尽最大努力确保单态函数(functions
monomorphic)，确保变量（包括属性，数组和函数参数）只适应同样的隐藏类包含的对象。

　　下面的代码演示了，我们不可这么做：

        function add(x, y) {  
           return x+y;  
        }  
        add(1, 2);  
        add('a','b');  
        add(my_custom_object, undefined);  

**　　**未初始化时不要加载和执行删除操作，因为它们并没有输出差异，这样做反而会使程序变得更慢。不要编写大量函数，函数越多越难优化。

**1. Objects使用技巧：**

　　适应构造函数来创建对象。这将确保所创建的所有对象具备相同的隐藏类并有帮助避免更改这些类。

　　在程序或者复杂性上不要限制多种对象类型。（原因：长原型链中倾向于伤害，只有极少数的对象属性得到一个特殊的委托）对于活跃对象保持短原型链以及低字段计数。

**2. 对象克隆（Object Cloning）**

　　对象克隆对于应用开发者来说是一种常见的现象。虽然在V8中这是实现各种类型问题的基准，但是当你进行复制时，一定要当心。当复制较大的程序时通常很会慢，因此，尽量不要这么做。在JavaScript循环中此举是非常糟糕的。这里有个最快的技巧方案，你不妨学习下：

        function clone(original) {  
          this.foo = original.foo;  
          this.bar = original.bar;  
        }  
        var copy = new clone(original);  

**3. 模块模式中的缓存功能**

　　在模块模式中使用缓存功能也许在性能方面会有所提升。请参阅下面的例子，通过jsPerf
test测试。注，使用这种方法比依靠原型模式更佳。

![Performance improvements][]

　　推荐：[这是测试原型与模块模式性能代码][]
      // Prototypal pattern  
      Klass1 = function () {}  
      Klass1.prototype.foo = function () {  
          log('foo');  
      }  
      Klass1.prototype.bar = function () {  
          log('bar');  
      }  
      // Module pattern  
      Klass2 = function () {  
          var foo = function () {  
              log('foo');  
          },  
          bar = function () {  
              log('bar');  
          };  
          return {  
              foo: foo,  
              bar: bar  
          }  
      }  
      // Module pattern with cached functions  
      var FooFunction = function () {  
          log('foo');  
      };  
      var BarFunction = function () {  
          log('bar');  
      };  
       Klass3 = function () {  
          return {  
              foo: FooFunction,  
              bar: BarFunction  
          }  
      }  
      // Iteration tests  
      // Prototypal  
      var i = 1000,  
          objs = [];  
      while (i--) {  
          var o = new Klass1()  
          objs.push(new Klass1());  
          o.bar;  
          o.foo;  
      }  
      // Module pattern  
      var i = 1000,  
          objs = [];  
      while (i--) {  
          var o = Klass2()  
          objs.push(Klass2());  
          o.bar;  
          o.foo;  
      }  
      // Module pattern with cached functions  
      var i = 1000,  
          objs = [];  
      while (i--) {  
          var o = Klass3()  
          objs.push(Klass3());  
          o.bar;  
          o.foo;  
      }  
      // See the test for full details

**4. 数组使用技巧：**

　　一般情况下，我们不要删除数组元素。它是使数组过渡到较慢的内部表现形式。当密钥集变得稀疏时，V8最终将切换到字典模式，这是变慢的原因之一。

五、应用优化技巧
-----------------------------

**　　在Web应用领域里，速度就是一切。**

　　没有用户希望在启动电子表格时需要等上几秒钟，或者花上几分钟时间来整理信息。这也是为什么在性能方面，需要格外注意的一点，有人甚至将编码阶段称为至关重要的一部分。

　　理解和提升性能方面是非常有用的，但它也有一定的难度。这里推荐几个步骤来帮你解决：

1.  测试：在应用程序中找到慢的节点 (~45%)
2.  理解：查找问题所在(~45%)
3.  修复:(~10%)

　　当然，还有许多工具或是技术方案帮助解决以上这些问题：

**1. 基准测试。**

　　在JavaScript上有许多方法可进行基准测试。

**2.剖析。**

　　Chrome开发工具能够很好的支持JavaScript分析器。你可以使用这些性能进行检测，哪些功能占用的时间比较长，然后对其进行优化。最重要的是，即使是很小的改变也能影响整体的表现。关于这款[分析工具][]，[这里][分析工具]有份详细的介绍。

**3.避免内存泄露-3快照技术。**

　　谷歌开发团队通常会使用Chrome开发工具包括Gmail来帮助他们发现和修复内存泄露；此外，[**3snapshot**][]也是不错的选择。该技术允许在程序中记录一些行为、强制垃圾回收、查询，如果DOM节点无法返回预期的基线上，3snapshot帮助分析确定是否存在内存泄露。

**4.单页面程序上的内存管理。**

　　当你在编写单页程序时（比如，AngularJS，Backbone，Ember)），内存管理非常重要，他们从未得到刷新。这就意味着内存泄露很明显。在移动单页程序上存在着巨大的陷阱，因为内存有限，长期运行的程序比如email客户端或者社交网络应用。因此，它肩负着巨大的责任。

　　Derick发表了这篇《[memory
pitfalls][]》教您如何使用Backbone.js以及如何进行修复。Felix
Geisendörfer的这篇[在Node中调试内存泄露][memory pitfalls]也值得一读。

**5.最小化回流**。

　　[回流][]是指在浏览器中用户阻止此操作，所以它是有助于理解如何提高回流时间，你可以使用[DocumentFragment][]一个轻量级的文档对象来处理。

**6. Javascript内存泄露检测器**。

　　由Marja Hölttä和Jochen Eisinger两人开发的[这款][]工具，你不妨试试。

**7. V8 flags调试优化和内存回收**。

　　Chrome支持通过flags和js-flags flag获取更详细的输出：

　　例如：

    "/Applications/Google Chrome/Google Chrome" --js-flags="--trace-opt --trace-deopt" 

　　Windows用户运行chrome.exe –js-flags=“–trace-opt –trace-deopt”。

**当开发应用时，可以使用下面的V8 flags：**

-   trace-opt –日志名称的优化功能，显示优化跳过的代码
-   trace-deopt –记录运行时将要“去优化”的代码。
-   trace-gc – 对每次垃圾回收时进行跟踪

**结束语：**

　　正如上面提到的，在JavaScript引擎中有许多隐藏的陷阱，世界上没有什么好的银弹能够帮助你提高性能，只有通过在测试环境中进行优化，实现最大的性能收益。因此，了解引擎如何输出和优化代码可以帮助你调整应用程序。

　　因此，测试它、理解它、修复它，如此往复！

  [Writing Fast, Memory-Efficient JavaScript]: http://coding.smashingmagazine.com/2012/11/05/writing-fast-memory-efficient-javascript/ "Read 'Writing Fast, Memory-Efficient JavaScript'"

  [Learning JavaScript Design Patterns]: http://addyosmani.com/resources/essentialjsdesignpatterns/book/
  
  [0]: {{ site.JB.FILE_PATH }}/2013-01/30222814-d81e4caabffe4608b364814a05d30152.jpg
  [1]: {{ site.JB.FILE_PATH }}/2013-01/30222814-1daecc2610464207ace4ff0b55bf6478.jpg
  [2]: {{ site.JB.FILE_PATH }}/2013-01/30222814-7d1a23445e9e4a0e9f526ecc058d3327.jpg
  
  [Performance improvements]: {{ site.JB.FILE_PATH }}/2013-01/30222814-2290aec479784183a360e757fbc3677c.png "Performance Improvements When Using The Module And Prototypal Patterns"

  [这是测试原型与模块模式性能代码]: http://jsperf.com/prototypal-performance/12

  [分析工具]: http://coding.smashingmagazine.com/2012/06/12/javascript-profiling-chrome-developer-tools/
  [**3 snapshot**]: https://docs.google.com/presentation/d/1wUVmf78gG-ra5aOxvTfYdiLkdGaR9OhXRnOlIcEmu2s/pub?start=false&loop=false&delayms=3000#slide=id.g1d65bdf6_0_0
  [memory pitfalls]: http://lostechies.com/derickbailey/2012/03/19/backbone-js-and-javascript-garbage-collection/
  [回流]: http://stackoverflow.com/questions/510213/when-does-reflow-happen-in-a-dom-environment
  [DocumentFragment]: http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-B63ED1A3
  [这款]: http://google-opensource.blogspot.de/2012/08/leak-finder-new-tool-for-javascript.html