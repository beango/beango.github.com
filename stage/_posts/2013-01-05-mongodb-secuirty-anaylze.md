---
layout: post
section: Archive
category: default
date: 2013-01-05
title: "Mongodb安全性初探"
description: "Mongodb安全性初探"
tags: [mongodb]
redirecturl: http://www.phpweblog.net/GaRY/archive/2011/08/18/Mongodb_secuirty_anaylze.html
---
{% include JB/setup %}

Mongodb，这么火的玩意其实早就想好好研究一下了。之前一直没空仔细学学新的东西，总是感觉精力不足。这次趁着买了一本书，就零零散散地在VPS上搭建、测试、看实现代码。感觉也蛮有意思的一个数据库。虽然感觉它非常简单，尤其是看代码的时候更是感觉如此。但这不也是另一个KISS的典范么，还是简单但是实用的东西最能流行。

既然都看了其实现，也不能不产出点什么。正好多年没更新博文，就简单分析一下mongodb的安全性，凑个数先。

默认配置的安全情况
------------------

在默认情况下，mongod是监听在0.0.0.0之上的。而任何客户端都可以直接连接27017，且没有认证。好处是，开发人员或dba可以即时上手，不用担心被一堆配置弄的心烦意乱。坏处是，显而易见，如果你直接在公网服务器上如此搭建mongodb，那么所有人都可以直接访问并修改你的数据库数据了。

默认情况下，mongod也是没有管理员账户的。因此除非你在admin数据库中使用db.addUser()命令添加了管理员帐号，且使用--auth参数启动mongod，否则在数据库中任何人都可以无需认证执行所有命令。包括delete和shutdown。

此外，mongod还会默认监听28017端口，同样是绑定所有ip。这是[一个mongod自带的web监控界面](http://www.mongodb.org/display/DOCS/Http+Interface)。从中可以获取到数据库当前连接、log、状态、运行系统等信息。如果你开启了--rest参数，甚至可以直接通过web界面查询数据，执行mongod命令。

我试着花了一个晚上扫描了国内一个B段，国外一个B段。结果是国外开了78个mongodb，而国内有60台。其中我随意挑选了10台尝试连接，而只有一台机器加了管理员账户做了认证，其他则全都是不设防的城市。可见其问题还是比较严重的。

其实Mongodb本身有非常[详细的安全配置准则](http://www.mongodb.org/display/DOCS/Security+and+Authentication)，显然他也是想到了，然而他是将安全的任务推给用户去解决，这本身的策略就是偏向易用性的，对于安全性，则得靠边站了。

**用户信息保存及认证过程**
--------------------------

**
**类似MySQL将系统用户信息保存在mysql.user表。mongodb也将系统用户的username、pwd保存在admin.system.users集合中。其中[pwd
= md5(username + ":mongo:" +
real\_password)](https://github.com/mongodb/mongo/blob/r1.9.1/shell/db.js#L71)。这本身并没有什么问题。username和:mongo:相当于对原密码加了一个salt值，即使攻击者获取了数据库中保存的md5
hash，也没法简单的从彩虹表中查出原始密码。

我们再来看看mongodb对客户端的认证交互是如何实现的。mongo
client和server交互都是基于明文的，因此很容易被网络嗅探等方式抓取。这里我们使用数据库自带的[mongosniff](http://www.mongodb.org/display/DOCS/mongosniff)，可以直接dump出客户端和服务端的所有交互数据包：

{% highlight perl %}
[root@localhost bin]# ./mongosniff --source NET lo
sniffing 27017 

 // 省略开头的数据包，直接看看认证流程。以下就是当用户输入db.auth(username, real_passwd)后发生的交互。

127.0.0.1:34142  -->> 127.0.0.1:27017 admin.$cmd  62 bytes  id:8        8
        query: { getnonce: 1.0 }  ntoreturn: -1 ntoskip: 0
127.0.0.1:27017  <<--  127.0.0.1:34142   81 bytes  id:7 7 - 8
        reply n:1 cursorId: 0
        { nonce: "df97182fb47bd6d0", ok: 1.0 }
127.0.0.1:34142  -->> 127.0.0.1:27017 admin.$cmd  152 bytes  id:9       9
        query: { authenticate: 1.0, user: "admin", nonce: "df97182fb47bd6d0", key: "3d839522b547931057284b6e1cd3a567" }  ntoreturn: -1 ntoskip: 0
127.0.0.1:27017  <<--  127.0.0.1:34142   53 bytes  id:8 8 - 9
        reply n:1 cursorId: 0
        { ok: 1.0 }
{% endhighlight %}

1.  **第一步，client向server发送一个命令getnonce，向server申请一个随机值nonce。**
2.  **server返回一个16位的nonce。这里每次返回的值都不相同。**
3.  **第二步，client将用户输入的明文密码通过算法生成一个key，即 [key = md5(nonce + username + md5(username + ":mongo:" + real_passwd))](https://github.com/mongodb/mongo/blob/r1.9.1/shell/db.js#L90)，并将之连同用户名、nonce一起返回给server**
4.  **server收到数据，首先比对nonce是否为上次生成的nonce，然后比对key == md5(nonce + username + pwd)。如果相同，则[验证通过](https://github.com/mongodb/mongo/blob/r1.9.1/db/security_commands.cpp#L71)。**

由于至始至终没有密码hash在网络上传输，而是使用了类似挑战的机制，且每一次nonce的值都不同，因此即使攻击者截取到key的值，也没用办法通过重放攻击通过认证。

然而当攻击者获取了数据库中保存的pwd
hash，则认证机制就不会起到作用了。即使攻击者没有破解出pwd
hash对应的密码原文。但是仍然可以通过发送md5(nonce + username +
pwd)的方式直接通过server认证。这里实际上server是将用户的pwd
hash当作了真正的密码去验证，并没有基于原文密码验证。在这点上和我之前分析的[mysql的认证机制](http://www.phpweblog.net/GaRY/archive/2010/08/20/mysql_client_to_server_auth_method.html)其实没什么本质区别。当然或许这个也不算是认证机制的弱点，但是毕竟要获取mongodb的username和pwd的可能性会更大一些。


![]({{ site.JB.FILE_PATH }}/2013-01/mongodb.png)


然而在Web的监控界面的认证中则有一些不同。当client来源不是localhost，这里的用户认证过程是基于HTTP
401的。其过程与mongo认证大同小异。但是一个主要区别是：这里的nonce并没有随机化，而是[每次都是默认为"abc"](https://github.com/mongodb/mongo/blob/r1.9.2/db/dbwebserver.cpp#L130)。

利用这个特点，如果攻击者抓取了管理员一次成功的登录，那么他就可以重放这个数据包，直接进入Web监控页面。

同样，攻击者还可以通过此接口直接暴力破解mongo的用户名密码。实际上27017和28017都没有对密码猜解做限制，但Web由于无需每次获取nonce，因此将会更为简便。

JavaScript的执行与保护
----------------------

Mongodb本身最大的特点之一，就是他是使用javascript语言作为命令驱动的。黑客会比较关注这一点，因为其命令的支持程度，就是获取mongodb权限之后是否能进一步渗透的关键。

Javascript本身的标准库其实相当弱。无论是spidermonkey或者是v8引擎，其实都没有系统操作、文件操作相关的支持。对此，[mongodb做了一定的扩展](https://github.com/mongodb/mongo/blob/r1.9.1/shell/shell_utils.cpp#L890)。可以看到，ls/cat/cd/hostname甚至runProgram都已经在Javascript的上下文中有实现。看到这里是不是已经迫不及待了？mongo
shell中试一下输入ls("./")，看看返回。

等等？结果怎么这么熟悉？哈哈，没错，其实这些api都是在client的上下文中实现的。一个小小玩笑:)

那么在server端是否可以执行js呢？答案是肯定的。利用db.eval(code)——实际上底层执行的是db.$cmd.findOne({$eval:
code})——可以在server端执行我们的js代码。

当然在[server端也有js的上下文扩展](https://github.com/mongodb/mongo/blob/r1.9.2/scripting/utils.cpp#L67)。显然mongod考虑到了安全问题（也可能是其他原因），因此在这里并没有提供client中这么强大的功能。当然mongodb还在不断更新，长期关注这个list，说不定以后就有类似load_file/exec之类的实现。

一劳永逸解决服务端js执行带来的问题可以使用[noscripting](http://www.mongodb.org/display/DOCS/Command+Line+Parameters)参数。直接禁止server-side的js代码执行功能。
