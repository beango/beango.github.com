---
layout: post
category: default
date: 2013-08-08
title: "Nginx SSL性能调优"
description: "Nginx SSL性能调优"
tags: [ngnix]
redirecturl: http://blog.jobbole.com/44844/
---
{% include JB/setup %}

**本文由 [伯乐在线](http://blog.jobbole.com) - [路塔石](http://blog.jobbole.com/author/%e8%b7%af%e5%a1%94%e7%9f%b3/)
翻译自 [prashant](http://techsamurais.com/?p=1384)。转载请参见文章末尾处的要求。**

这篇文章的目的是要谈谈我的 Nginx 调优经验，就不涉及数据库调优的内容了。

### 初始服务器设置

我的服务器运行在亚马逊 EC2 t1 micro 上，选择 Nginx + PHP5-fpm 作为后端，因为一些安全因素还打开了SSL。

### 性能测试

我使用了Blitz.io 来进行压力测试。下面是我使用的命令：

    -p 1-250:60 https://mydomian.com

这是一个用户线性递增的测试，每个测试用户跑60秒。Blitz.io为每个请求每秒增加4个( = rise / run = 260 / 60)测试用户。

### 结论

我把结论提前写在这里，如果你不想读完整篇文章也没有问题。

​1. Nginx默认设置的DH算法（译注：Diffie-Hellman key exchange algorithm）是影响SSL性能的最大因素，因此采用如下设置能增加SSL性能：

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES256-SHA384:AES256-SHA256:RC4:HIGH:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!AESGCM;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

2.  升级硬件 Upgrade your EC2 from t1.micro to c1.medium
3.  正确配置 Nginx的worker进程数量 Set Nginx to have 2 worker processes as a c1.medium gives you 2 CPUs

### 细节解释

以下是我进行测试的详细过程。

**尝试1：升级硬件**

直觉告诉我，想解决性能问题的直接途径就是升级硬件，我把EC2实例从t1.micro升级到了为高流量而优化过的 c1.medium 升级后的测试结果：

![Nginx SSL性能调优]({{ site.JB.FILE_PATH }}/2013-08/63918611gw1e7ayxtue5mj20rb0o5gog.jpg)

巅峰时服务器的hits达到50/sec，压力增加时，time-out增加，hits减少。

** 尝试2：测试CPU性能**

我打开top然后重启了测试，注意到2个CPU的使用率不到13%，内存使用了300Mb，很明显硬件没有充分利用。所以我更改了nginx的设置 worker\_processes 2;

**尝试3，4，5：调整Nginx和PHP5-fpm**

以下尝试得到的结果都和尝试1相同

尝试3：

**nginx.conf**

    worker_processes 2;
    events {
    worker_connections 19000;
    multi_accept on;
    }
    ...

尝试4：

**nginx.conf**

    worker_processes 2;
    events {
      worker_connections 19000;
      multi_accept on;
    }
    http { 
      gzip on;
      gzip_disable "msie6";
     
      gzip_min_length  1000;
      gzip_proxied     expired no-cache no-store private auth;
      gzip_types       text/plain application/xml application/javascript text/css application/x-javascript;
    …
    }
    ...

尝试5：

在尝试4未变的情况下我更改了php5-fpm的设置：

    pm.max_children = 160
    pm.start_servers = 24
    pm.min_spare_servers = 20
    pm.max_spare_servers = 35
    pm.max_requests = 1500

### **尝试6****：在另一个服务器部署**

我有一个1.5GbRAM和8CPU的[Linode](http://blog.jobbole.com/go/linode/ "Linode")服务器，采用刚才的设置，这是我的测试结果：

![Nginx SSL性能调优]({{ site.JB.FILE_PATH }}/2013-08/63918611gw1e7azsiccppj20r40oqtbc.jpg)

[Linode](http://blog.jobbole.com/go/linode/ "Linode")的服务器的结果棒极了！我的第一个直觉是难道Linode比EC2好吗。在我把我的服务迁移到Linode之前我想确保两者仅有的对性能有可能产生影响的不同被排除掉。

**尝试7：大惊喜**

我Google到Nginx在SSL上有些问题。Nginx默认使用DHE算法来产生密匙，改变这个设置应该能使它快一些。

这里是我参考的一些文章：

http://matt.io/entry/ur

http://auxbuss.com/blog/posts/2011\_06\_28\_ssl\_session\_caching\_on\_nginx/

所以我更改了nginx.conf，删掉了kEDH算法

    worker_processes 2;
    events {
      worker_connections 1024;
    }
    http { 
      gzip on;
      gzip_disable "msie6";
     
      gzip_min_length  1000;
      gzip_proxied     expired no-cache no-store private auth;
      gzip_types       text/plain application/xml application/javascript text/css application/x-javascript;
      ssl_ciphers ALL:!kEDH!ADH:RC4+RSA:+HIGH:+EXP; 
    …
    }
    ...

下图是测试结果：

![Nginx SSL性能调优]({{ site.JB.FILE_PATH }}/2013-08/63918611gw1e7b06kcqxfj20rk0o50vg.jpg)

效果很显著！

**尝试8： 硬件提升是必要的吗**

现在我的EC2和Linode表现差不多了。但是我真的需要升级到c1.medium实例才能实现这个性能的提升吗？或许不是这样……所以我把我改回了t1.micro。因为t1.micro实例只有一个CPU，所以我把worder\_processes设置改回1。下面是测试的结果：

![Nginx SSL性能调优]({{ site.JB.FILE_PATH }}/2013-08/63918611gw1e7b0b1e68dj20re0ordim.jpg)

所以答案是肯定的，硬件上的提升是必要的。

**尝试9：**

有人在 Hacker News 上反馈说我的SSL密匙不能满足Perfect Forward Secrecy，我采用了他们的建议，对我的SSL设置做了如下更改：

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES256-SHA384:AES256-SHA256:RC4:HIGH:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!AESGCM;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

现在这个设置应该满足Perfect Forward Secrecy协议了。我重新跑了测试：

![Nginx SSL性能调优]({{ site.JB.FILE_PATH }}/2013-08/attempt10-300x263.png)

太棒了，性能也没有下降。很棒的学习经验！