---
layout: post
section: Archive
categories: [web开发]
date: 2012-12-15
title: "HTTP协议之代理"
description: "HTTP协议之代理"
tags: [redis]
redirecturl: http://www.cnblogs.com/TankXiao/archive/2012/12/12/2794160.html
---
{% include JB/setup %}

### 阅读目录

*   [什么是代理服务器](#chapter1)
*   [Fiddler就是个典型的代理](#chapter2)
*   [代理作用一：翻墙](#chapter3)
*   [代理作用二：匿名访问](#chapter4)
*   [代理作用三：通过代理上网](#chapter5)
*   [代理作用四：通过代理缓存，加快上网速度](#chapter6)
*   [代理作用五：儿童过滤器](#chapter7)
*   [IE代理设置：手动设置代理](#chapter8)
*   [IE代理设置：使用自动配置脚本(PAC)](#chapter9)
*   [IE代理设置：自动探测设置(WPAD)](#chapter10)
*   [代理认证，407状态码](#chapter11)
*   [使用代理服务器的安全问题](#chapter12)
*   [如何搭建代理服务器](#chapter13)

 

<h3 id="chapter1">什么是代理服务器</h3>

Web代理（proxy）服务器是网络的中间实体。
代理位于Web客户端和Web服务器之间，扮演“中间人”的角色。

HTTP的代理服务器即是Web服务器又是Web客户端。

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120511054068.png" alt="" class="Pic" />

<h3 id="chapter2">Fiddler就是个典型的代理</h3>

Fiddler 是以代理web服务器的形式工作的,它使用代理地址:127.0.0.1,
端口:8888. 当Fiddler退出的时候它会自动注销代理，这样就不会影响别的程序。

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012020409075327.png" alt="" class="Pic" />

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012020409081574.png" alt="" class="Pic" />

<h3 id="chapter3">代理的作用一， 翻墙</h3>

很多人都喜欢用Facebook， 看youTube。但是我们在天朝，天朝有The Great of
Wall(长城防火墙)，屏蔽了这些好网站。  怎么办?  
通过代理来跳墙，就可以访问了。

自己去寻找代理服务器很麻烦， 一般都是用翻墙软件来自动发现代理服务器的。

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120519345158.png" alt="" class="Pic" />

<h3 id="chapter4">代理的作用二， 匿名访问</h3>

经常听新闻，说”某某某“在网络上发布帖子，被跨省追缉了。  
假如他使用匿名的代理服务器，就不容易暴露自己的身份了。 

http代理服务器的匿名性是指：
HTTP代理服务器通过删除HTTP报文中的身份特性（比如客户端的IP地址，
或cookie,或URI的会话ID），
从而对远端服务器隐藏原始用户的IP地址以及其他细节。
<span style="background-color: #ffff00;">同时HTTP代理服务器上也不会记录原始用户访问记录的log(否则也会被查到)</span>。

 

<h3 id="chapter5">代理的作用三， 通过代理上网</h3>

比如局域网不能上网， 只能通过局域网内的一台代理服务器上网。

 

<h3 id="chapter6">代理的作用四， 通过代理缓存，加快上网速度</h3>

大部分代理服务器都具有缓存的功能，就好像一个大的cache，
它有很大的存储空间，它不断将新取得数据存储到它本地的存储器上，
如果浏览器所请求的数据在它本机的存储器上已经存在而且是最新的，那么它就不重新从Web服务器取数据，而直接将存储器上的数据传给用户的浏览器，这样就能显著提高浏览速度。

<h3 id="chapter7">代理的作用五：儿童过滤器</h3>

很多教育机构， 会利用过滤器代理来阻止学生访问成人内容。

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120516393239.png" alt="" class="Pic" />

 

<h3 id="chapter8">IE代理设置：手动设置代理</h3>

IE浏览器可以手动设置代理， 很简单，指定一个IP地址和端口就可以了。 如下图。

工具 -＞ Internet选项 -\> 连接 -\> 局域网设置 （快捷键）

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120519480694.png" alt="" class="Pic" />

假如代理服务器的IP地址改变了，或者端口号改变了。
难道要几百个客户端的浏览器去修改浏览器设置？ Impossable  这太难维护了。  下面还有一种更高级点的方法。

<h3 id="chapter9">IE代理设置：使用自动配置脚本（PAC）</h3>
 手动配置代理很简单，但是不灵活。 只能指定一个代理服务器，而且不支持故障转移。 

在大公司里一般都使用PAC文件来配置。只需要指定PAC文件的URL就可以了， 如图：

<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120519531553.png" alt="" class="Pic" />

PAC（Proxy Auto Config）文件是一个小型的JavaScript程序的文本文件，后缀为.dat。 

当浏览器访问网络的时候，会根据PAC文件中的JavaScript函数来选择恰当的代理服务器。

sample_pac.dat文件的内容
{% highlight perl %}
function FindProxyForURL(url, host) {
    if (url.substring(0, 5) == "http:") {
        // 应该使用指定的代理
        return "PROXY proxy:80";
    }
    else if (url.substring(0, 4) == "ftp:") {
        return "PROXY fproxy:80";
    }
    else if (url.substring(0, 7) == "gopher:") {
        return "PROXY gproxy";
    }
    else if (url.substring(0, 6) == "https:") {
        return "PROXY secproxy:8080";
    }
    else {
        // 直连，不经过任何代理
        return "DIRECT";
    }
}
{% endhighlight %}

<h3 id="chapter10">IE代理设置：自动探测设置（WPAD）</h3>

 浏览器只要选中“自动检测设置”， 就可以使用WPAD协议， WPAD会自动找到PAC文件的URL。  WPAD会使用一系列的资源发现技术（DHCP,DNS等）去寻找PAC文件。
<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120519553441.png" alt="" class="Pic" />

<h3 id="chapter11">代理认证，和407状态码</h3>

代理服务器也可以需要权限认证， HTTP定义了一种名为代理认证（Proxy authentication）的机制。 这种机制可以阻止对内容的请求。

当浏览器访问需要认证的代理时， 代理服务器会返回407 Authorization Required,告诉浏览器输入用户名和密码。

代理认证跟HTTP基本认证是一样的机制， 如需了解代理认证的机制，请看[HTTP协议基本认证]()
<img src="{{ site.JB.FILE_PATH }}/2012-12/2012120609374853.png" alt="" class="Pic" />

<h3 id="chapter12">使用代理服务器的安全问题</h3>

代理服务器和抓包工具（比如Fiddler）都能看到http request中的数据。 如果我们发送的request中有敏感数据，比如用户名，密码，信用卡号码。这些信息都会被代理服务器看到。所以非常危险。 所以我们一般都是用HTTPS来加密Http request.  这样代理服务器就看不到里面的数据了。

<h3 id="chapter13">如何搭建代理服务器</h3>

可以使用CCproxy, 和Squid 来搭建代理服务器。

