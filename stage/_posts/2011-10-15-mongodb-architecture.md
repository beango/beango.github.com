---
layout: post
section: Archive
category: default
date: 2011-10-15
title: "MongoDB构架图分享"
description: "MongoDB构架图分享"
tags: [mongodb]
redirecturl: http://blog.nosqlfan.com/html/3887.html
---
{% include JB/setup %}

本文图片来自Ricky
Ho的博文[MongoDB构架](http://horicky.blogspot.jp/2012/04/mongodb-architecture.html)（[MongoDB](http://blog.nosqlfan.com/tags/mongodb "查看 MongoDB 的全部文章")
Architecture），这是个一听就感觉很宽泛的话题，但是作者在文章中确实对MongoDB由内至外的[架构](http://blog.nosqlfan.com/tags/%e6%9e%b6%e6%9e%84 "查看 架构 的全部文章")进行了剖析。本文截取了其文章中的几张重点架构示意图片进行简单描述。希望对大家有用。

### MongoDB数据文件内部结构

![MongoDB构架图]({{ site.JB.FILE_PATH }}/2012-10/O6EzR.png)

1.  MongoDB在数据存储上按命名空间来划分，一个collection是一个命名空间，一个索引也是一个命名空间
2.  同一个命名空间的数据被分成很多个Extent，Extent之间使用双向链表连接
3.  在每一个Extent中，保存了具体每一行的数据，这些数据也是通过双向链接连接的
4.  每一行数据存储空间不仅包括数据占用空间，还可能包含一部分附加空间，这使得在数据update变大后可以不移动位置
5.  索引以BTree结构实现

相关阅读：《[MongoDB数据文件内部结构](http://blog.nosqlfan.com/html/3515.html)》

### 在MongoDB中实现事务

![MongoDB构架图]({{ site.JB.FILE_PATH }}/2012-10/qklTw.png)

众所周知，MongoDB只支持对单行记录的原子性修改，并不支持对多行数据的原子操作。但是通过上图中的变态操作，实际你也可以自己实现事务。其步骤如图所未：

-   第1步：先记录一条事务记录，将要修改的多行记录的修改值写到里面，并设置其状态为init（如果这时候操作中断，那么在重新启动时，会判断到他处于init状态，从而将其保存的多行修改操作应用到具体的行上）
-   第2步：然后更新具体要修改的行，将刚才写的事务记录的标识写到它的tran字段中
-   第3步：将事务记录的状态从init变成pending（如果在这时候操作中断，那么在重新启动时，会判断到它的状态是pending的，这时候查看其所有对应的多条要修改的记录，如果其tran有值，那么就进行第4步，如果没值，说明第4步已经执行过了，直接将其状态从pending变成commited了就行）
-   第4步：将需要修改的多条记录的相应值修改了，并且unset掉之前的tran字段
-   第5步：将事务记录那一条的状态从pending变成commited，事务完成

其实上面的步骤并不罕见，在支持事务的DBMS中，其事务原子性提交的保证大多都与上面类似。其实事务记录的tran那条记录，就类似于这些DBMS中的redolog一样。

### MongoDB数据同步

![MongoDB构架图]({{ site.JB.FILE_PATH }}/2012-10/8SKjb.png)

上图是MongoDB采用Replica Sets模式的同步流程

-   红色箭头表示写操作写到Primary上，然后异步同步到多个Secondary上
-   蓝色箭头表示读操作可以从Primary或Secondary任意一个上读
-   各个Primary与Secondary之间一直保持心跳同步检测，用于判断Replica
    Sets的状态

### 分片机制

![MongoDB构架图]({{ site.JB.FILE_PATH }}/2012-10/wlqvf.png)

-   MongoDB的分片是指定一个分片key来进行，数据按范围分成不同的chunk，每个chunk的大小有限制
-   有多个分片节点保存这些chunk，每个节点保存一部分的chunk
-   每一个分片节点都是一个Replica Sets，这样保证数据的安全性
-   当一个chunk超过其限制的最大体积时，会分裂成两个小的chunk
-   当chunk在分片节点中分布不均衡时，会引发chunk迁移操作

### 服务器角色

![MongoDB构架图]({{ site.JB.FILE_PATH }}/2012-10/RArrX.png)

上面讲了分片的标准，下面是具体在分片时的几种节点角色

-   客户端访问路由节点mongos来进行数据读写
-   config服务器保存了两个映射关系，一个是key值的区间对应哪一个chunk的映射关系，另一个是chunk存在哪一个分片节点的映射关系
-   路由节点通过config服务器获取数据信息，通过这些信息，找到真正存放数据的分片节点进行对应操作
-   路由节点还会在写操作时判断当前chunk是否超出限定大小，如果超出，就分列成两个chunk
-   对于按分片key进行的查询和update操作来说，路由节点会查到具体的chunk然后再进行相关的工作
-   对于不按分片key进行的查询和update操作来说，mongos会对所有下属节点发送请求然后再对返回结果进行合并

更多详细内容请看原文：[MongoDB Architecture](http://horicky.blogspot.jp/2012/04/mongodb-architecture.html)

