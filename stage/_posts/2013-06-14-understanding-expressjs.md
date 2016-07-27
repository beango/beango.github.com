---
layout: post
category: default
date: 2013-06-14
title: "(译)深入理解Express.js"
description: "(译)深入理解Express.js"
tags: [node.js]
redirecturl: http://xvfeng.me/posts/understanding-expressjs/
---


本文针对那些对[Node.js](http://nodejs.org)有一定了解的读者。假设你已经知道如何运行Node代码，使用npm安装依赖模块。但我保证，你并不需要是这方面的专家。本文针对的是Express 3.2.5版 ​​本，以介绍相关概念为主。

[Express.js](http://expressjs.org)这么描述自己："轻量灵活的node.js Web应用框架"。它可以帮助你快速搭建web应用。如果你使用过Ruby里的[Sinatra](http://www.sinatrarb.com/),那么相信你对这个也会很快就能熟悉。

和其他web框架一样，Express隐藏了代码背后的秘密，然后告诉你："别担心，你不用去理解这个部分"。它来帮你解决这些问题，所以你不用去为这个而烦恼，只用将重心集中到代码上。换句话说，它有某些魔法！

[Express的wiki里介绍了一些它的使用者](http://expressjs.com/applications.html)，其中就有很多知名的公司:MySpace, Klout.

但是[拥有魔力是需要付出代价的](http://shapeshed.com/all-magic-comes-with-a-price/)，你可能根本就不知道它的工作原理。正如驾驶一辆汽车，我可以很好的驾驭它但是可能不理解为什么汽车可以正常工作，但是我最好知道这些东西。如果车坏掉怎​​么办？如果你想最大程度的去发挥它的性能？如果你对知识有无限的渴望并想去弄清它？

那么我么首先从理解Express的最底层-Node开始。

底层：Node HTTP服务器
--------------------

Node中有[HTTP模块](http://nodejs.org/api/http.html),它将搭建一个web服务器的过程抽象出来。你可以这样使用:

    // 引入所需模块
    var http = require("http");

    // 建立服务器
    var app = http.createServer(function(request, response) {
        response.writeHead(200, {
            "Content-Type": "text/plain"    
        });
        response.end("Hello world!\n");
    });

    // 启动服务器
    app.listen(1337, "localhost");
    console.log("Server running at http://localhost:1337/");

运行这个程序(假设文件名 ​​为`app.js` ,运行`node app.js` )，你会得到"Hello world!“在浏览器访问`localhost:1337`，你会得到同样的结果。你也可以尝试访问其他地址，如`localhost:1337/whatever`，结果仍然会一样。

分解以上代码来看。

第一行使用`require`函数引入Node内置模块`http`。然后存入名为`http`的变量中。如果你要了解更多关于require函数的知识，参考[Nodejitsu](http://docs.nodejitsu.com/articles/getting-started/what-is-require)的文档。

然后我们使用`http.createServer`将服务器保存至`app`变量。它将一个函数作为参数监听请求。稍后将会详细介绍它。

最后我们要做的就是告诉服务器监听来自1337端口的请求，之后输出结果。然后一切完成。

好的，回到request请求处理函数。这个函数相当重要。

**request方法**

在开始这个部分之前，我事先声明这里所涉及的HTTP相关知识与学习Express本身没有太大关系。如果你感兴趣，可以查看[HTTP模块文档](http://nodejs.org/api/http.html)。

任何时候我们向服务器发起请求，request方法将会被调用。如果你不信，你可以`console.log`将结果打印出来。你会发现每次请求一个页面时它都会出来。

`request`是来自客户端的请求。在很多应用中，你可能会看到它的缩写`req`。仔细看代码。我们修改代码如下:

    var app = http.createServer(function(request, response) {

        // 创建answer变量
        var answer = "";
        answer += "Request URL: " + request.url + "\n";
        answer += "Request type: " + request.method + "\n";
        answer += "Request headers: " + JSON.stringify(request.headers) + "\n";

        // 返回结果
        response.writeHead(200, {"Content-Type": "text/plain" });
        response.end(answer);

    });

重启服务器并刷新`localhsot:1337`.你会发现，每次访问一个URL，就会发起一次GET请求，并会得到一堆类似用户代理或者一些其他的更加复杂的HTTP相关信息。如果你访问`localhost:1337/what_is_fraser`,你会看到request的地址发生了变化。如果你使用不同的浏览器访问，用户代理也会跟着改变，如果你使用POST请求，request的方法也很改变。

`response`是另外一个部分。正如`request`被缩写为`req`，`response`同样被简写为`res`。每次response你都会得到对应的返回结果，之后你便可以通过调用`response.end`来结束。实际上最终你还是要执行这个方法的,甚至在[node](http://nodejs.org/api/http.html#http_response_end_data_encoding)的文档里也是这么描述的。这个方法完成了真正的数据传输部分。你可以建立一个服务器并不调用`req.end`方法，它就会永远存在。

在你返回结果之前，你也可以填写一下header头​​部部分。我们的例子里是这么写的:

    response.writeHead(200, { "Content-Type": "text/plain" });

这个步骤主要完成两件事情。第一，发送[HTTP状态码](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)，表示请求成功。其次，它设置了返回的头部信息。这里表示我们要返回的是纯文本格式的内容。我们也可以返回类似JSON或者HTML格式的内容。

未完待续。。。

// 接上回

看了上面的之后，你可能会立马开始利用它来写api了。

    var http = require("http");

    http.createServer(function(req, res) {

        // Homepage
        if(req.url == "/") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("Welcome to the homepage!");
        }

        // About page
        else if (req.url == "/about") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("Welcome to the about page!");
        }

        // 404'd!
        else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 error! File not found.");
        }

    }).listen(1337, "localhost");

你可以选择优化代码，让它变得更整洁。也可以向[npm.org](https://github.com/isaacs/npm-www#design-philosophy)的那帮家伙一样用原生的Node来编写。但是你也可以选择去创建一个框架。这就是Sencha所做的，并把这个框架称为–Connect.

中间件: Connect
---------------

[Connect](http://www.senchalabs.org/connect/)是Nodejs的中间件。可能你现在还并不太理解什么是中间件(middleware)，别担心，我马上会进行详细解释。

**一段Connect代码**

假如我们想要编写和上面一样的代码，但是这次我们要使用Connect.别忘记安装Connect模块( `npm install` )。完成之后，代码看起来非常相似。

    // 引入所需模块
    var connect = require("connect");
    var http = require("http");

    // 建立app
    var app = connect();

    // 添加中间件
    app.use(function(request, response) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Hello world!\n");
    });

    // 启动应用
    http.createServer(app).listen(1337);

下面分解这段代码来看。

首先我们分别引入了Connect和Node HTTP模块。

接下来和之前一样声明`app`变量，但是在创建服务器时，我们调用了`connect()`.这有是如何工作的？

我们添加了一个中间件，实际上就是一个函数。传入`app.use`，几乎和上面使用request方法写法一样。实际上代码是从上面粘贴过来的。

之后我们建立并启动服务器。`http.createServer`接收函数作为参数。没错，`app`实际上也是一个函数。这是一个Connect提供的函数，它会查找代码并自上而下执行。

(你可能会看见其他人使用`app.listen(1337)`,这实际上只是将`http.createServer`返回一个promise对象。再Connect和Express中都是一样的原理。)

接下来解释什么是中间件(middleware).

**什么是中间件?**

首先推荐阅读[Stephen Sugden对于Connect中间件的描述](http://stephensugden.com/middleware_guide/),比我讲的更好。如果你不喜欢我的解释，那就去看看。

还记得之前的request方法？每个中间件都是一个handler.依次传入request, response, next三个参数。

一个最基本的中间件结构如下:

    function myFunMiddleware(request, response, next) {
        // 对request和response作出相应操作
        // 操作完毕后返回next()即可转入下个中间件
        next();
    }

当我们启动一个服务器，函数开始从顶部一直往下执行。如果你想输出函数的执行过程，添加一下代码:

    var connect = require("connect");
    var http = require("http");
    var app = connect();

    // log中间件
    app.use(function(request, response, next) {
        console.log("In comes a " + request.method + " to " + request.url);
        next();
    });

    // 返回"hello world"
    app.use(function(request, response, next) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Hello World!\n");
    });

    http.createServer(app).listen(1337);

如果你启动应用并访问`localhost:1337`，你会看到服务器可以log出相关信息。

有一点值得注意，任何可以在Node.js下执行的代码都可以在中间件执行。例如上面我们所使用的`req.method`方法。

你当然可以编写自己的中间件，但是也不要错过Connect的一些很cool的[第三方中间件](https://github.com/senchalabs/connect/wiki)。下面我们移除自己的log中间件，使用Connect内置方法。

    var connect = require("connect");
    var http = require("http");
    var app = connect();

    app.use(connect.logger());
    // 一个有趣的事实：connect.logger返回一个函数

    app.use(function(request, response) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Hello world!\n");
    });

    http.createServer(app).listen(1337);

跳转至浏览器并访问`localhost:1337`你会得到同样的结果。

很快有人就会想使用上面的中间件组合起来创建一个完整应用。代码如下:

    var connect = require("connect");
    var http = require("http");
    var app = connect();

    app.use(connect.logger());

    // Homepage
    app.use(function(request, response, next) {
        if (request.url == "/") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("Welcome to the homepage!\n");
            // The middleware stops here.
        } else {
            next();
        }
    });

    // About page
    app.use(function(request, response, next) {
        if (request.url == "/about") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("Welcome to the about page!\n");
            // The middleware stops here.
        } else {
            next();
        }
    });

    // 404'd!
    app.use(function(request, response) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("404 error!\n");
    });

    http.createServer(app).listen(1337);

“这个看起来不太好看!我要自己写框架！”

某些人看了Connect的代码之后觉得，“这个代码可以更简单”。于是他们创造了Express.（事实上他们好像直接盗用了[Sinatra](http://www.sinatrarb.com/).）

最顶层: Express
---------------

文章进入第三部分，我们开始真正进入Express.

正如Connect拓展了Node, Express拓展Connect.代码的开始部分看起来和在Connect中非常类似：

    var express = require("express");
    var http = require("http");
    var app = express();

结尾部分也一样:

    http.createServer(app).listen(1337);

中间部分才是不一样的地方。Connect为我们提供了中间件，Express则为我们提供了另外三个优秀的特性：路由分发，请求处理，视图渲染。首先从如有开始看。

### 特性一：路由

路由的功能就是处理不同的请求。在上面的很多例子中，我们分别有首页，关于和404页面。我们是通过`if`来判断并处理不同请求地址。

但是Express却可以做的更好。Express提供了"routing"这个东西，也就是我们所说的路由。我觉得可读性甚至比纯文字还要好。

    var express = require("express");
    var http = require("http");
    var app = express();

    app.all("*", function(request, response, next) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        next();
    });

    app.get("/", function(request, response) {
        response.end("Welcome to the homepage!");
    });

    app.get("/about", function(request, response) {
        response.end("Welcome to the about page!");
    });

    app.get("*", function(request, response) {
        response.end("404!");
    });

    http.createServer(app).listen(1337);

简单的引入相关模块之后，我们立即调用`app.all`处理所有请求。写法看起来也非常像中间件不是吗？

代码中的`app.get`就是Express提供的路由系统。也可以是`app.post`来处理POST请求，或者是PUT和任何的HTTP请求方式。第一个参数是路径，例如`/about`或者`/`。第二个参数类似我们之前所见过的请求handler。引用[Expess文档的内容](http://expressjs.com/api.html#app.VERB):

> 这些请求handler和中间件一样，唯一的区别是这些回调函数会调用`next('route')`从而能够继续执行剩下的路由回调函数。这种机制简单说来，它们和我们之前提过的中间件是一样，只不过是一些函数而已。

这些路由也可以更加灵活，看起来是这样：

    app.get("/hello/:who", function(req, res) {
        res.end("Hello, " + req.params.who + ".");    
    });

重启服务器并在浏览器访问`localhost:1337/hello/animelover69`你会得到如下信息：

    Hello, animelover69.

[这些文档](http://expressjs.com/api.html#app.VERB)演示了如何使用正则表达式，可以使得路由更加灵活。如果只是单从概念理解来讲，我说的已经足够了。

但是还有更加值得我们去关注的。

### 特性二：请求处理request handling

Express将你传入请求的handler传入request和response对象中。原先该有的还在，但是却加入了更多新的特性。[API文档](http://expressjs.com/api.html)里有详细解释。下面让我们来看一些例子。

其中一个就是`redirect`方法。代码如下：

    response.redirect("/hello/anime");
    response.redirect("http://xvfeng.me");
    response.redirect(301, "http://xvfeng.me"); // HTTP 301 状态码

以上代码既不属于原生Node代码也不是来自与Connect,而是Express中自身添加的。它加入了一些例如`sendFile`，让你传输整个文件等功能：

    response.sendFile("/path/to/anime.mp4");

request对象还有一些很cool的属性，例如`request.ip`可以获取IP地址,`request.files`上传文件等。

理论上来讲，我们要知道的东西也不是太多，Express做的只是拓展了request和response对象而已。Express所提供的方法，请参考[API文档](http://expressjs.com/api.html).

### 特性三：视图

Express可以渲染视图。代码如下：

    // 启动Express
    var express = require("express");
    var app = express();

    // 设置view目录
    app.set("views", __dirname + "/views");

    // 设置模板引擎
    app.set("view engine", "jade");

开头部分的代码和前面基本一样。之后我们指定视图文件所在目录。然后告诉Express我们要使用`Jade`作为模板引擎。[Jade](http://jade-lang.com/)是一种模板语言。稍后将会详细介绍。

现在我们已经设置好了view.但是如何来使用它呢？

首先我们建立一个名为`index.jade`的文件并把它放入`views`目录。代码如下：

    doctype 5
    html
      body
        h1 Hello, world!
        p= message

代码只是去掉了括号的HTML代码。如果你懂HTML那肯定也看得懂上面的代码。唯一有趣的是最后一样。`message`是一个变量。它是从哪里来的呢？马上告诉你。

我们需要从Express中渲染这个视图。代码如下：

    app.get("/", function(request, response) {
        response.render("index", { message: "I love anime" });    
    });

Express为`response`对象添加了一个`render`方法。这个方法可以处理很多事情，但最主要的还是加载模板引擎和对应的视图文件，之后渲染成普通的HTML文档，例如这里的`index.jade`.

最后一步(我觉得可能算是第一步)就是安装Jade,因为它本身并不是Express的一部分。添加至`package.json`文件并使用`npm install`进行安装。

如果一起设置完毕，你会看到[这个页面](http://evanhahn.com/wp-content/uploads/2013/05/anime.html)。[完整代码](https://gist.github.com/EvanHahn/5673968).

### 加分特性： 所有代码来自于Connect和Node

我需要再次提醒你的是Express建立与Connect和Node之上，这意味着所有的Connect中间件均可以在Express中使用。这个对与开发来讲帮助很大。例如：

    var express = require("express");
    var app = express();

    app.use(express.logger()); // 继承自Connect

    app.get("/", function(req, res) {
        res.send("fraser");    
    });

    app.listen(1337);

如果说你从这篇文章中学到了一点什么，就是这一点。

实战
----

本文的大部分内容都是理论，但是下面我将教你如何使用它来做一点你想做的东西。我不想说的过于具体。

你可以将Exp​​ress安装到系统全局，从而可以在命令行使用它。它可以帮助你迅速的完成代码组织并启动应用。使用npm安装：

    # 安装时可能需要加`sudo`
    npm install -g express

如果你需要帮助，输入`express --help`。它加入一些可选参数。例如，如果你想使用EJS模板引擎，LESS作为CSS引擎。应用的名称为"myApp".输入以下命令：

    express --ejs --css less myApp

这里会自动生成很多文件。进入项目目录，并使用`npm install`安装依赖包，之后便可以使用`node app`启动应用！我建议你详细的查看项目结构和代码。它可能还算不上一个真正的应用，但是我觉得它对于初学者来讲还是很有帮助的。

[项目Github目录下](https://github.com/visionmedia/express/tree/master/examples)也有一些很有帮助的文档。

### 一些补充

-   如果你也和我一样喜欢使用CoffeeScript，好消息是Express完美支持CoffeeScript.你甚至不需要编译它。这样你只用`coffee app.coffee`即可启动应用。我在我的其他项目中也是这么做的。
-   在我看到`app.use(app.router)`的时候我很疑惑：
    Express不是一直在使用router吗？简单回答是`app.router`是Express的路由中间件，在你定义路由的时候被直接添加到项目中。如果你需要在加载其他文件之前应用，也可以直接引入它。关于这么做的原因，请参考[StackOverflow的这个答案](http://stackoverflow.com/a/12695813/804100).
-   本文是针对Express 3，而在[第四版的规划中](https://github.com/visionmedia/express/wiki/4.x-roadmap)又会有很多大的改动。最明显的是，Experss可能要将会分解成一些小的模块，并吸收Connect的一些特性。这个虽然还在计划中，但是也值得一看。

如果这个还不能满足你？你肯定是个变态！你很快就会变成像一个瘾君子，半睁着眼，耗尽你最后一点精力，写着苦逼的代码。

正如Rails成为使用Ruby建立网页应用的王者一样，我觉得Express也会成为Node中的主流。但是和Rails不一样，Express更加底层。似乎还没有一个真正意义上的高级Node库。我觉得可能会发生改变。（译者注：这点我不同意，Node的很多思想来自与Unix哲学，强调的是一个Module只解决一个问题，而不是成为一个复杂的库。很多Rails的开发者转向Node，就是因为Rails正在逐渐变得臃肿，不易自定义，且效率逐渐降低。）。

这里我就不再多谈。已经又很多很基于Express建立了新的东西，[Expess的维基](https://github.com/visionmedia/express/wiki#frameworks-built-with-express)里有列举。如果你觉得好可以随意使用它们，如果你喜欢从底层做起，你也可以只选择Express。不管是哪一种，好好利用它吧。

原文地址：[http://evanhahn.com/understanding-express-js/](http://evanhahn.com/understanding-express-js/)

时间仓促，翻译错误在所难免，还请指正，转载还请注明。
