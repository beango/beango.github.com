---
layout: page
section: Code
category: code
date: 2013-07-01
title: "NodeJS 和 Socket.io 中文入门教程"
description: "NodeJS 和 Socket.io 中文入门教程"
summary: "NodeJS 和 Socket.io 中文入门教程"
---

NodeJS 最适合做得事情之一便是实时性应用，socket.io 给跨浏览器构建实时应用提供了完整的封装，可以在几种 transport 中自动切换，本贴板将翻译 socket.io 提供的入门使用教程。

socket.io 与 express 结合使用
-----------------------------

我们可以使用 expressjs 处理页面请求以及 Ajax 请求，由于 express 是 nodejs 平台下最流行的 web 服务端开发框架，因此 socket.io 提供了方便的方式来绑定 express 服务。

*服务器端代码*

    var app = require('express').createServer()
      , io = require('socket.io').listen(app);

    app.listen(80);

    app.get('/', function (req, res) {
      res.sendfile(__dirname + '/index.html');
    });

    io.sockets.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });

*浏览器端代码*

    <script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io.connect('http://localhost');
      socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
      });
    </script>

发送以及接收自定义事件
----------------------

除了 socket.io 提供的默认事件（如：`connect`, `message`, `disconnect`）外，我们还可以发送以及接收自定义事件的数据。

*示例代码*

    // note, io.listen(<port>) will create a http server for you
    var io = require('socket.io').listen(80);

    io.sockets.on('connection', function (socket) {
      io.sockets.emit('this', { will: 'be received by everyone'});

      socket.on('private message', function (from, msg) {
        console.log('I received a private message by ', from, ' saying ', msg);
      });

      socket.on('disconnect', function () {
        io.sockets.emit('user disconnected');
      });
    });

将数据关联并存储到当前连接的 socket
-----------------------------------

在一个会话周期中，我们大部分情况下都需要存储当前会话者的一些数据，来识别或者特定情形下获取这些数据。

*示例代码*

    var io = require('socket.io').listen(80);

    io.sockets.on('connection', function (socket) {
      socket.on('set nickname', function (name) {
        socket.set('nickname', name, function () {
          socket.emit('ready');
        });
      });

      socket.on('msg', function () {
        socket.get('nickname', function (err, name) {
          console.log('Chat message by ', name);
        });
      });
    });

非常建议使用这种方式来设置用户会话的数据。

发送、接收需要确认的数据
------------------------

在服务端与终端发送消息的过程中，如需要对方接收到消息后立刻得到确认，则只需在 `.send` 或 `.emit` 最后一个参数传入回调函数就可以了。

*服务端代码*

    var io = require('socket.io').listen(80);

    io.sockets.on('connection', function (socket) {
      socket.on('ferret', function (name, fn) {
        fn('woot');
      });
    });

*客户端代码*

    <script>
      var socket = io.connect(); // TIP: .connect with no args does auto-discovery
      socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
        socket.emit('ferret', 'tobi', function (data) {
          console.log(data); // data will be 'woot'
        });
      });
    </script>

socket.io 路由
--------------

官网称之为命名空间绑定，但我觉得用路由来形容似乎更好理解，上示例代码：

    var io = require('socket.io').listen(80);

    var chat = io
      .of('/chat')
      .on('connection', function (socket) {
        socket.emit('a message', {
            that: 'only'
          , '/chat': 'will get'
        });
        chat.emit('a message', {
            everyone: 'in'
          , '/chat': 'will get'
        });
      });

    var news = io
      .of('/news')
      .on('connection', function (socket) {
        socket.emit('item', { news: 'item' });
      });

当客户端连接 `/chat` 时，由 `chat` 来处理，连接 `/news` 由 `news` 来处理。

    <script>
      var chat = io.connect('http://localhost/chat')
        , news = io.connect('http://localhost/news');
      
      chat.on('connect', function () {
        chat.emit('hi!');
      });
      
      news.on('news', function () {
        news.emit('woot');
      });
    </script>

发送易变（volatile）的数据
------------------------

volatile意思大概是说，当服务器发送数据时，客户端因为各种原因不能正常接收，比如网络问题、或者正处于长连接的建立连接阶段。此时会让我们的应用变得suffer，那就需要考虑发送 volatile 数据。

    var io = require('socket.io').listen(80);

    io.sockets.on('connection', function (socket) {
      var tweets = setInterval(function () {
        getBieberTweet(function (tweet) {
          socket.volatile.emit('bieber tweet', tweet);
        });
      }, 100);

      socket.on('disconnect', function () {
        clearInterval(tweets);
      });
    });

按一回的理解，即使客户端没连线，一样可以这样发送，服务器会自动丢弃发送失败的数据。

认证与握手
----------

我们可以设置认证。这样客户端在连接 socket.io 服务器时可以做一些安全或者特殊处理。

socket.io 采用 TJ 风格的设置语法，如：

    io.configure(function (){
      io.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style 
      });
    });

上面的 authorrization 设置项即设置服务端的认证，后面回调函数的第一个参数 handshakeData 就附带了客户端传递过来的数据，比如头数据以及IP地址、请求的 URL 和 参数等，基于这些数据进行验证，如果验证符合你的业务逻辑，则调用`callback(null, true)` ，否则将错误放在callback的第一个参数，如`callback('need login')`;

注，验证失败之后，socket 所注册的各种事件就不会被执行。

    io.sockets.on('connection', function (socket) {
        // 。。。。
    });
