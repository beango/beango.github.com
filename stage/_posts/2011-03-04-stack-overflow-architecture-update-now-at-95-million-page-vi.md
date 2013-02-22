---
layout: post
section: Archive
categories: [企业架构, asp.net]
date: 2011-03-04
title: "基于.NET的大型Web站点StackOverflow架构分析"
description: "基于.NET的大型Web站点StackOverflow架构分析"
tags: [StackOverflow, 架构分析]
redirecturl: http://kb.cnblogs.com/page/92926/
---
{% include JB/setup %}

原文链接：[Stack Overflow Architecture Update - Now At 95 Million Page
Views A
Month](http://highscalability.com/blog/2011/3/3/stack-overflow-architecture-update-now-at-95-million-page-vi.html)

编译/博客园

Stack
Overflow网址：[http://stackoverflow.com/](http://stackoverflow.com/)

**当前访问量：**每月9500PV（每天300多万PV）

**当前Alexa排名：**149

**所用.NET技术：**C#、Visual Studio 2010 Team Suite、ASP.NET 4、ASP.NET
MVC 3、Razor、LINQ to SQL+raw SQL

**下面是英文原文：**

A lot has happened since my first article on the [Stack Overflow
Architecture](http://highscalability.com/blog/2009/8/5/stack-overflow-architecture.html)(2009-8-5).
Contrary to the theme of that last article, which lavished attention on
Stack Overflow's dedication to a scale-up strategy, Stack Overflow has
both grown up and out in the last few years.

自从2009年8月发布了第一篇关于“Stack Overflow 架构”方面的文章，Stack
Overflow已经发生了很大的变化。那篇文章更多关注的是Stack
Overflow如何解决网站的扩展性(scale-up)问题，而经过几年的发展，Stack
Overflow已经长大成人，成长为了大型网站。

Stack Overflow has grown up by more then doubling in size to over 16
million users and multiplying its number of page views nearly 6 times to
95 million page views a month.  

现在与2009年相比，Stack
Overflow每月独立访问用户翻了一倍，超过1600万；每月PV翻了近6倍，达到9500万。

Stack Overflow has grown out by expanding into the [Stack Exchange
Network](http://stackexchange.com/), which includes Stack Overflow,
Server Fault, and Super User for a grand total of 43 different sites.
That's a lot of fruitful multiplying going on.

Stack Overflow新增了很多站点，比如Server Fault, Super
User等，共有43个不同站点组成了Stack Exchange
Network，可谓硕果累累，迅猛增长。

What hasn't changed is Stack Overflow's openness about what they are
doing. And that's what prompted this update. A recent series of posts
talks a lot about how they've been handling their growth: [Stack
Exchange’s Architecture in Bullet
Points](http://blog.serverfault.com/post/stack-exchanges-architecture-in-bullet-points/), [Stack
Overflow’s New York Data
Center](http://blog.serverfault.com/post/1432571770/), [Designing For
Scalability of Management and Fault
Tolerance](http://blog.serverfault.com/post/1097492931/), [Stack
Overflow Search — Now 81%
Less](http://blog.stackoverflow.com/2011/01/stack-overflow-search-now-81-less-crappy/), [Stack
Overflow Network
Configuration](http://blog.stackoverflow.com/2010/01/stack-overflow-network-configuration/), [Does
StackOverflow use caching and if so,
how?](http://meta.stackoverflow.com/questions/69164/does-stackoverflow-use-caching-and-if-so-how), [Which
tools and technologies build the Stack Exchange
Network?](http://meta.stackoverflow.com/questions/10369/which-tools-and-technologies-build-the-stack-exchange-network).

Stack
Overflow的变化翻天覆地，而不变的是他们开放的心态，所以才有了这篇架构分享的文章。最近，他们写了一系列文章分享他们如何应对这样的快速增长。

Some of the more obvious differences across time are:  
穿越时空，我们来看看有哪些明显的变化？

-   **Just More**. More users, more page views, more datacenters, more
    sites, more developers, more operating systems, more databases, more
    machines. Just a lot [more of
    more](http://blog.stackoverflow.com/2011/01/state-of-the-stack-2010-a-message-from-your-ceo/).  
    **更多：**更多的用户，更多的PV，更多的数据中心，更多的站点，更多的开发者，更多的操作系统，更多的数据库，更多的服务器...
-   **Linux**. Stack Overflow was known for their Windows stack, now
    they are using a lot more Linux machines for HAProxy,
    Redis, Bacula, Nagios, logs, and routers. All support functions seem
    to be handled by Linux, which has required the development of
    [parallel release
    processes](http://blog.serverfault.com/post/1097492931/).   
    **Linux：**Stack
    Overflow因使用Windows系统而著称，现在他们使用越来越多的Linux服务器，比如HAProxy(负载均衡),
    Redis(NoSQL数据库), Bacula(数据备份系统), Nagios(远程监控软件),
    日志,
    路由器都运行于Linux系统，几乎所有需要并行处理的功能都是由Linux处理(这句话的翻译可能不准确)。
-   **Fault Tolerance**. Stack Overflow is now [being served by two
    different](http://blog.stackoverflow.com/2010/01/stack-overflow-network-configuration/)
    switches on two different internet connections, they've added
    redundant machines, and some functions have moved to a second
    datacenter.  
    **容错：**Stack
    Overflow使用了两条不同的互联网线路，增加了更多的冗余服务器，将一些网站服务运行于第二个数据中心。
-   **NoSQL**. Redis is now used as a [caching
    layer](http://meta.stackoverflow.com/questions/69164/does-stackoverflow-use-caching-and-if-so-how)
    for the entire network. There wasn't a separate caching tier before
    so this a big change, as is using a NoSQL database on Linux.  
    **NoSQL：**Redis作为整个网站的缓存层。这是一个巨大的改变，以前并没有将缓存作为一个独立的层分离出来。Redis运行于Linux。

Unfortunately, I couldn't find any coverage on some of the open
questions I had last time, like how they were going to deal with
multi-tenancy across so many diffrent properties, but there's still
plenty to learn from. Here's a roll up a few different sources:

遗憾的是，一些我关注的问题并没有从中找到答案，比如面对这么多不同的系统，如何解决多租户的问题（Multi-tenancy
是一种软件体系结构，在这种体系结构中软件运行在 software as a service
服务商的服务器上，服务于多个客户组织即
tenant）。但是，从中我们依然可以学到很多。下面是收集的一些数据列表：

### The Stats

-   95 Million Page Views a Month
-   800 HTTP requests a second
-   180 DNS requests a second
-   55 Megabits per second
-   16 Million Users  - Traffic to Stack Overflow grew 131% in 2010, to
    16.6 million global monthly uniques. 

### Data Centers

-   1 Rack with Peak Internet in OR (Hosts our chat and Data Explorer)
-   2 Racks with Peer 1 in NY (Hosts the rest of the Stack Exchange
    Network)

### Hardware

-   10 Dell R610 IIS web servers (3 dedicated to Stack Overflow):
    -   1x Intel Xeon Processor E5640 @ 2.66 GHz Quad Core with 8
        threads
    -   16 GB RAM
    -   Windows Server 2008 R2

-   2 Dell R710 database servers:
    -   2x Intel Xeon Processor X5680 @ 3.33 GHz
    -   64 GB RAM
    -   8 spindles
    -   SQL Server 2008 R2

-   2 Dell R610 HAProxy servers:
    -   1x Intel Xeon Processor E5640 @ 2.66 GHz
    -   4 GB RAM
    -   Ubuntu Server

-   2 Dell R610 Redis servers:
    -   2x Intel Xeon Processor E5640 @ 2.66 GHz
    -   16 GB RAM
    -   CentOS

-   1 Dell R610 Linux backup server running Bacula:
    -   1x Intel Xeon Processor E5640 @ 2.66 GHz
    -   32 GB RAM

-   1 Dell R610 Linux management server for Nagios and logs:
    -   1x Intel Xeon Processor E5640 @ 2.66 GHz
    -   32 GB RAM

-   2 Dell R610 VMWare ESXi domain controllers:
    -   1x Intel Xeon Processor E5640 @ 2.66 GHz
    -   16 GB RAM

-   2 Linux routers
-   5 Dell Power Connect switches

### Dev Tools

-   **C#**: Language
-   **Visual Studio 2010 Team Suite**: IDE
-   **Microsoft ASP.NET (version 4.0)**: Framework
-   **ASP.NET MVC 3**: Web Framework
-   **Razor**: View Engine
-   **jQuery 1.4.2**: Browser Framework:
-   **LINQ to SQL, some raw SQL**: Data Access Layer
-   **[Mercurial](http://mercurial.selenic.com/) and
    [Kiln](http://www.fogcreek.com/kiln/)**: Source
    Control（分布式版本控制系统）
-   [**Beyond Compare 3**](http://www.scootersoftware.com/): Compare
    Tool（文件比较工具）

### Software and Technologies Used

-   Stack Overflow uses a
    [WISC](http://stackoverflow.com/questions/177901/what-does-wisc-stack-mean)
    stack via
    [BizSpark](http://blog.stackoverflow.com/2009/03/stack-overflow-and-bizspark/)
-   **Windows Server 2008 R2 x64**: Operating System
-   **SQL Server 2008 R2** running**Microsoft Windows Server 2008
    Enterprise Edition x64**: Database
-   Ubuntu Server
-   CentOS
-   **IIS 7.0**: Web Server
-   [**HAProxy**](http://haproxy.1wt.eu/): for load
    balancing（高性能的负载TCP/HTTP均衡器）
-   **Redis**: used as the distributed caching
    layer.（作为分布式缓存层的NoSQL数据库）
-   **CruiseControl.NET**: for builds and automated
    deployment（.NET平台的持续集成工具）
-   **Lucene.NET**:  for search
-   [**Bacula**](http://www.bacula.org/en/): for
    backups（开源的数据备份系统）
-   [**Nagios**](http://www.nagios.org/): (with
    [n2rrd](http://n2rrd.diglinks.com/cgi-bin/trac.fcgi) and drraw
    plugins) for monitoring（监视系统运行状态和网络信息的远程监控软件）
-   **[Splunk](http://www.splunk.com/):** for logs（日志分析工具）
-   **[SQL
    Monitor](http://www.red-gate.com/products/dba/sql-monitor/):** from
    Red Gate - for SQL Server monitoring
-   **Bind**: for DNS
-   **[Rovio](http://www.wowwee.com/en/products/tech/telepresence/rovio/rovio)**:  a
    little robot (a real robot) allowing remote developers to visit the
    office “virtually.”
-   [**Pingdom**](http://www.pingdom.com/):  an external monitor and
    alert service.（网站监控服务及网站速度测试工具）

### External Bits

Code that is not included as part of the development tools:

-   [reCAPTCHA](http://www.google.com/recaptcha)（用于验证码验证，已被Google收购）
-   DotNetOpenId（.NET 平台上的 OpenID 实现方案）
-   WMD - Now developed as open source. See [github network
    graph](https://github.com/cky/wmd) （轻量级所见即所得编辑器）
-   [Prettify](http://code.google.com/p/google-code-prettify/)（代码高亮显示）
-   Google Analytics
-   Cruise Control .NET
-   HAProxy（负载均衡）
-   [Cacti](http://www.cacti.net/)（网络流量监测图形分析工具）
-   [MarkdownSharp](http://code.google.com/p/markdownsharp/)（Markdown文本处理器的C#实现）
-   [Flot](http://code.google.com/p/flot/)（基于JQuery的纯JavaScript实现的绘图库）
-   Nginx（反向代理服务器）
-   Kiln（分布式版本控制系统）
-   CDN: none, all static content is served off the
    [sstatic.net](http://sstatic.net/), which is a fast, cookieless
    domain intended for static content delivered to the Stack Exchange
    family of websites.
    （没有使用CDN，用一个专门的域名sstatic.net传递所有的静态内容）

### Developers and System Administrators

-   14 Developers
-   2 System Administrators

### Content

-   **License:** Creative Commons Attribution-Share Alike 2.5 Generic
-   **Standards:** OpenSearch, Atom
-   **Host:** PEAK Internet

### More Architecture and Lessons Learned

-   HAProxy is used instead of Windows NLB because HAProxy is cheap,
    easy, free, works great as a 512MB VM “device” on a network via
    Hyper-V. It also works in front of the boxes so it’s completely
    transparent to them, and easier to troubleshoot as a different
    networking layer instead of being intermixed with all your windows
    configuration.  
    用HAProxy取代了Windows
    NLB，HAProxy成本更低，更易于使用，通过Hyper-V可以很好地运行于512M内存的虚拟机。它工作于服务器群的最前端，对所有的服务器都透明。相比于原来混杂在一起的Windows配置，它运行于一个独立的网络层，更易于维护与故障处理。
-   A CDN is not used because even “cheap” CDNs like Amazon one are very
    expensive relative to the bandwidth they get bundled into their
    existing host’s plan. The least they could pay is $1k/month based
    on Amazon’s CDN rates and their bandwidth usage.  
    没有使用CDN，即使使用像Amazon那样与主机空间捆绑在一起的看起来“便宜”的CDN，实际的费用也是很高的，至少需要1000美元/月。
-   Backup is to disk for fast retrieval and to tape for historical
    archiving.  
    备份方案有两种，一种用于快速恢复的磁盘备份，一种用于历史数据存档的磁带备份。
-   Full Text Search in SQL Server is very badly integrated, buggy,
    deeply incompetent, so they went to Lucene.  
    SQL Server的全文索引是非常差劲的，所以他们用Lucene.NET。
-   Mostly interested in peak HTTP request figures as this is what they
    need to make sure they can handle.  
    让人很感兴趣的是他们如何处理访问高峰时的HTTP请求。
-   All properties now run on the same Stack Exchange platform. That
    means Stack Overflow, Super User, Server Fault, Meta, WebApps, and
    Meta Web Apps are all running on the same software.  
    所有这些都运行于Stack Exchange平台，那意味着Stack Overflow, Super
    User, Server Fault, Meta, WebApps, 和Meta Web
    Apps都运行于同一个软件。
-   There are separate StackExchange sites because people have different
    sets of expertise that shouldn't cross over to different topic
    sites. [You can be the greatest chef in the world, but that doesn't
    qualify you for fixing a
    server.](http://meta.stackoverflow.com/questions/69422/why-separate-stack-exchange-accounts)  
    也有一些独立运行的StackExchange站点，服务于那些具有多个专业技能，又不想为了不同的话题在多个站点之间奔波的人。如果你能成为最伟大的主厨，不能因为给你安排了服务员的工作，你就安于现状。
-   They aggressively cache everything.  
    他们疯狂地使用缓存。
-   All pages accessed by (and subsequently served to) annonymous users
    are cached via [Output
    Caching](http://learn.iis.net/page.aspx/154/walkthrough-iis-70-output-caching/).  
    未登录用户访问的所有页面都通过Output Caching进行缓存。
-   Each site has 3 distinct caches: local, site, global.   
    每个站点使用三种类型的缓存：本地、站点、全局。
-   **local cache**: can only be accessed from 1 server/site pair    
    本地缓存：只能被当前站点的当前服务器访问。
    -   To limit network latency they use a local "L1" cache, basically
        HttpRuntime.Cache, of recently set/read values on a server. This
        would reduce the cache lookup overhead to 0 bytes on the
        network.  
        为了减少网络延时，通常使用HttpRuntime.Cache作为一级缓存，这样可以避免通过网络在缓存服务器上查找的开销。
    -   Contains things like user sessions, and pending view count
        updates.  
        缓存内容包含用户会话，视图数的更新。
    -   This resides purely in memory, no network or DB access.  
        直接缓存在内存中。

-   **site cache**:  can be accessed by any instance (on any server) of
    a single site  
    **站点级缓存：**能被同一个站点的所有服务器访问。
    -   Most cached values go here, things like hot question id lists
        and user acceptance rates are good examples  
        大部分的缓存都在这一级，比如热点问题ID列表，用户支持率。
    -   This resides in Redis (in a distinct DB, purely for easier
        debugging)  
        缓存数据存储在Redis数据库中。
    -   Redis is so fast that the slowest part of a cache lookup is the
        time spent reading and writing bytes to the network.  
        Redis速度很快，缓存查找的开销主要在网络传输上。
    -   Values are compressed before sending them to Redis. They have
        plenty of CPU and most of their data are strings so they get a
        great compression ratio.  
        缓存数据发送至Redis之前会被压缩。为什么要压缩呢？因为CPU资源绰绰有余，而且大部分缓存数据是字符串，压缩率会很高，何乐而不为呢。
    -   The CPU usage on their Redis machines is 0%.  
        Redis服务器上的CPU使用率是0%。

-   **global cache**: which is shared amongst all sites and servers 
    **全局缓存：**被所有站点和服务器共享。
    -   Inboxes, API usage quotas, and a few other truly global things
        live here  
        缓存内容包含收件箱，API使用限额，一些全局设置等。
    -   This resides in Redis (in DB 0, likewise for easier debugging)  
        缓存于Redis数据库中。

-   Most items in the cache expire after a timeout period (a few minutes
    usually) and are never explicitly removed. When a specific cache
    invalidation is required they use [Redis
    messaging](http://code.google.com/p/redis/wiki/PublishSubscribe) to
    publish removal notices to the "L1" caches.  
    大部分缓存项目在超过缓存时间之后会自动过期（通常几分钟），不需要进行删除操作。当需要让一个特定的缓存失效，会通过Redis消息系统给一级缓存发送删除通知。
-   Joel Spolsky is not a Microsoft Loyalist, he doesn't make the
    technical decisions for Stack Overflow, and considers Microsoft
    licensing a rounding error. Consider yourself corrected [Hacker News
    commentor](http://news.ycombinator.com/item?id=2284900).  
    Joel Spolsky（Stack
    Overflow的创始人）并不是微软的忠诚分子，他不负责技术决策，使用微软软件考虑的也只是性价比。Hacker
    News上一些评论者的说法需要纠正。
-   For their IO system [they
    selected](http://blog.serverfault.com/post/our-storage-decision/) a
    RAID 10 array of [Intel X25 solid state
    drives](http://www.intel.com/design/flash/nand/extreme/index.htm) .
    The RAID array eased any concerns about reliability and the SSD
    drives performed really well in comparision to FusionIO at a much
    cheaper price.  
    对于IO系统，他们选择的是Intel X25 solid state drives(SSD硬盘)的RAID
    10磁盘阵列，这样的磁盘阵列，保证了可靠性。这个SSD硬盘用起来感觉不错，而且价格比FusionIO的便宜。
-   The [full boat cost](http://news.ycombinator.com/item?id=2285931)
    for their Microsoft licenses would be approximately $242K. Since
    Stack Overflow is using Bizspark they are not paying near the full
    sticker price, but that's the max they could pay.  
    使用的这些微软软件，如果全部购买的话，总费用大概在24.2万美元。由于Stack
    Overflow参加了微软的Bizspark计划，所以不需要付这么多钱，但是要付的话，最多也就是这么多。

Related Articles
----------------

-   [Stack Exchange’s Architecture in Bullet
    Points](http://blog.serverfault.com/post/stack-exchanges-architecture-in-bullet-points/)
-   [Stack Overflow’s New York Data
    Center](http://blog.serverfault.com/post/1432571770/) - hardware of
    the various machines?
-   [Designing For Scalability of Management and Fault
    Tolerance](http://blog.serverfault.com/post/1097492931/)
-   [HackerNews Thread](http://news.ycombinator.com/item?id=2207789)
-   [Stack Overflow Blog](http://blog.stackoverflow.com/)
-   [Stack Overflow Search — Now 81% Less
    Crappy](http://blog.stackoverflow.com/2011/01/stack-overflow-search-now-81-less-crappy/) -
    Lucene is now running on an underused cluster.
-   [State of the Stack 2010 (a message from your
    CEO)](http://blog.stackoverflow.com/2011/01/state-of-the-stack-2010-a-message-from-your-ceo/)
-   [Stack Overflow Network
    Configuration](http://blog.stackoverflow.com/2010/01/stack-overflow-network-configuration/)
-   [Does StackOverflow use caching and if so,
    how?](http://meta.stackoverflow.com/questions/69164/does-stackoverflow-use-caching-and-if-so-how)
-   [Meta StackOverflow](http://meta.stackoverflow.com/)
-   [How does StackOverflow handle cache
    invalidation?](http://meta.stackoverflow.com/questions/6435/how-does-stackoverflow-handle-cache-invalidation)
-   [Which tools and technologies build the Stack Exchange
    Network?](http://meta.stackoverflow.com/questions/10369/which-tools-and-technologies-build-the-stack-exchange-network)
-   [How does Stack Overflow handle
    spam?](http://meta.stackoverflow.com/questions/2765/how-does-stack-overflow-handle-spam)
-   [Our Storage
    Decision](http://blog.serverfault.com/post/our-storage-decision/)
-   [How are “Hot” Questions
    Selected?](http://meta.stackoverflow.com/questions/4766/how-are-hot-questions-selected) 
-   [How are “related” questions
    selected?](http://meta.stackoverflow.com/questions/20473/how-are-related-questions-selected) -
    the title, the question body, and the tags. 
-   [Stack Overflow and
    DVCS](http://blog.stackoverflow.com/2010/04/stack-overflow-and-dvcs/) -
    Stack Overflow selects Mercurial for source code control.
-   [Server Fault Chat
    Room](http://chat.stackexchange.com/rooms/127/the-comms-room) 
-   [C# Redis
    Client](https://github.com/ServiceStack/ServiceStack.Redis)
