---
layout: post
category: default
date: 2012-08-11
title: "不可忽略的缓存重建"
description: "不可忽略的缓存重建"
tags: [mongodb,nosql,cache]
redirecturl: http://blog.nosqlfan.com/html/3097.html
---


　　本文的主要内容来源于[MongoDB](http://blog.nosqlfan.com/tags/mongodb "查看 MongoDB 的全部文章")官方博客，由NoSQLFan补充说明，本文对传统的分布式Cache系统进行了分析，指出了其在[缓存](http://blog.nosqlfan.com/tags/%e7%bc%93%e5%ad%98 "查看 缓存 的全部文章")[重建](http://blog.nosqlfan.com/tags/%e9%87%8d%e5%bb%ba "查看 重建 的全部文章")中会对数据库产生巨大压力的问题。并分析了MongoDB的mmap方案是如何规避这一问题的。

　　如下图的架构，在数据库前端加上分布式的Cache（比如我们常用的Memcached），让客户端在访问时先查找Cache，Cache不命中再读数据库并将结构缓存在Cache中。这是目前比较常用的一种分担读压力的方法。

![]({{ site.assetpath }}/2012-08/zraqX.png "cache")

　　但是这个方法存在一个问题，如果前端的Cache挂掉，或者比较极端的整个机房断电了，那么在机器重启后，原来Cache机器在内存中的缓存会全部清空，在客户端访问过程中，会百分之百的不命中，这样数据库会在瞬间接受巨大的读压力。

　　试想如果一个64GB的缓存[失效](http://blog.nosqlfan.com/tags/%e5%a4%b1%e6%95%88 "查看 失效 的全部文章")了，在其重建时，假设与数据库连接的千兆网卡，假设其以极限速度100M每秒从数据库取数据过来重建缓存，那么也需要10分钟才能建完。更何况这是理想情况，对于客户端触发式的随机缓存重建，可能会花掉更长的时间。这还是在数据库能提供100M每秒的数据读请求的前提下。

　　我们经常看到一些网站挂掉后又恢复，恢复后又挂掉，如此反复几次才能真正恢复，原因就在于其第一次Cache倒了，数据库无法承受相应的读压力，在缓存重建了一小部分后被压死。相当于数据库每重启一次，可以恢复部分缓存，直到缓存的非命中率到达数据库可承受的压力时，才能够真正恢复服务。

　　这个问题可以用一些可以提供持久化功能的缓存来实现，比如[Redis](http://blog.nosqlfan.com/tags/redis "查看 Redis 的全部文章")，在未开启aof的情况下，其定期dump出来的rdb文件出能自动恢复出绝大部分数据，当然，在有的时候这可能导致缓存和数据库数据不一致的情况，需要根据应用场景选择性的使用。

　　上面是对分布式Cache的问题，而对于很多数据库存储，实际上也几乎都是将热数据尽量放在内存中的。但很多数据库在实现上是自己在内存中实现了Cache机制，这样在数据库重启（非操作系统重启）时，这些Cache可能也就随之被清空了，对于数据库来说，也需要重建缓存，而数据库这时所有的操作可能都落在磁盘IO上，带来了同样的问题。

　　而MongoDB与上面的方式不太一样，MongoDB采用mmap来将数据文件映射到内存中，所以当MongoDB重启时，这些映射的内存并不会清掉，因为它们是由操作系统维护的（所以当操作系统重启时，MongoDB才会有相同问题）。相对于其它一些自己维护Cache的数据库，MongoDB在重启后并不需要进行缓存重建与预热。

　　另外，新浪微博的timyang也曾经提出过一种缓存重建加锁的方式，也能部分解决此问题。简单来说就是缓存重建时，当多个客户端对同一个缓存数据发起请求时，会在客户端采用加锁等待的方式，对同一个Cache的重建需要获取到相应的锁才行，只有一个客户端能拿到锁，并且只有拿到锁的客户端才能访问数据库重建缓存，其它的客户端都需要等待这个拿到锁的客户端重建好缓存后直接读缓存，其结果是对同一个缓存数据，只进行一次数据库重建访问。但是如果访问分散比较严重，还是会瞬间对数据库造成非常大的压力。

下面是几点比较实用的知识：

-   无论使用哪个存储，都最好先搞清楚其缓存重建的过程，如果一次重启就可能导致数据库崩溃，还是小心为好，最好把重启时间选在访问量比较小的时候。
-   重启MongoDB不会导致MongoDB的缓存失效（除非重启服务器）
-   当你重新mount磁盘时，文件系统的缓存会失效，这和重启机器时一样，MongoDB也无法避免
-   一个使用MongoDB的小技巧，当MongoDB服务器刚启动时，你可以将其所有文件copy到/dev/null中，这会触发操作系统对这些文件的读操作，从而在内存允许的条件下，会将尽可能多的MongoDB数据文件映射到物理内存中。当然，如果在MongoDB运行过程中，你能够判断哪些文件保存的数据是热数据，也可以将这些文件copy到/dev/null来为其争取更多的物理内存。

参考源：[blog.mongodb.org](http://blog.mongodb.org/post/10407828262/cache-reheating-not-to-be-ignored)
