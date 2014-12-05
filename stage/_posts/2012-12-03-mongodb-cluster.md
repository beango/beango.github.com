---
layout: post
section: Archive
category: default
date: 2012-12-03
title: "MongoDB 集群"
description: "MongoDB 集群"
tags: [mongodb, 集群]
redirecturl: http://blog.nosqlfan.com/html/544.html
---
{% include JB/setup %}

本文是一篇转载文章，作者对[MongoDB](http://blog.nosqlfan.com/tags/mongodb "查看 MongoDB 的全部文章")[集群](http://blog.nosqlfan.com/tags/%e9%9b%86%e7%be%a4 "查看 集群 的全部文章")结构，集群中各个角色的功能和基本原理做了详细地图文并茂地讲解，值得一看。

原文链接：[http://www.javabloger.com/article/mongodb-cluster.html](http://www.javabloger.com/article/mongodb-http://www.javabloger.com/article/mongodb-cluster.html)

MongoDB 集群中包含一个自动分片模块
(“[mongos](http://blog.nosqlfan.com/tags/mongos "查看 mongos 的全部文章")”).
自动分片可以用于构建一个大规模的可扩展的数据库集群,这个集群可以并入动态增加的机器。自动建立一个水平扩展的数据库集群系统，将数据库分表存储在[sharding](http://blog.nosqlfan.com/tags/sharding "查看 sharding 的全部文章")的各个节点上。在一个mongodb的集群中包括一些shards(mongod进程)，mongos的路由进程，一个或多个config服务器。sharding是一种对大规模数据存储的一种策略，关于sharding的详细信息可以查看[这里](http://en.wikipedia.org/wiki/Shard)。也许有人会问，为什么需要做这种策略，因为在一个大型系统中最后的瓶颈会落在网络的带宽和磁盘的读写上，如果将数据分布在多个机器上的多个磁盘上，将会系统数据的处理能有所提高。

**MongoDB 集群的结构**：

下图中Shard是指每个节点的shard有一个或更多的服务器和存储数据的mongod进程，而mongod是MongoDB数据的核心进程。

每台机器上的mongod从配置获取服务器(元数据[metadata](http://blog.nosqlfan.com/tags/metadata "查看 metadata 的全部文章")
)，然后，当收到客户端请求时，它请求路由到相应的服务器组和编译结果发送回客户端。

mongos进行可以被看作是一个路由和协调的过程，因为他可以使得每个单一的各个节点组成一个集群系统。
另外还需要强调一点mongos进程没有持久状态，每个实例都需要一定的数据存储的内存空间。

换而言之，所谓MongoDB 集群也就是
MongoDB做了一个数据库路由的策略，而且保证跨库操作的数据库事务，而MongoDB
集群中的关键部分Sharding不是一门新技术，而是一种策略，关键还是看应用场景和案例提供的可用性，因为Sharding不仅仅是MongoDB
集群中所提到的分布在不同的机器上，还可以分表，分区，分数据，等等。

![]({{ site.JB.FILE_PATH }}/2012-12/machines-cluster.png)

**MongoDB 集群的工作原理：**

其中有一个服务器上存储着集群的metadata信息，包括每个服务器，每个shard的基本信息和chunk信息Config
Server
主要存储的是chunk信息。每一个config服务器都复制了完整的chunk信息，就是下图中左边黄色的部分。

如果客户端对集群的MongoDB插入一条数据，客户端并不知道刚刚插入的数据被分配到具体哪个MongoDB节点上了，因为当一条数据被传入
MongoDB集群中通过mongos路由，所以我们并感觉不到是数据存放在哪个shard的
chunk上，但是通过后台的Sharding的管理命令可以看到插入的数据存放在哪个节点上。

![]({{ site.JB.FILE_PATH }}/2012-12/mongodb_cluster_sharding.png)

**配置MongoDB集群**

模拟2个shard服务、一个config服务、一个mongos
process,全部运行在一个测试的服务器上，具体配置步骤如下：  
 口水： –shardsvr
是表示以sharding模式启动Mongodb服务器，Mongodb数据同步方式参见我写的另外一篇文章“[MongoDB
主(Master)/从(Slave)数据同步](http://www.javabloger.com/article/mongodb-master-slave-replication.html)”

{% highlight perl %}
$ mkdir /data/db/a
$ mkdir /data/db/b
$ mkdir /data/db/config
$ ./mongod –shardsvr –dbpath /data/db/a –port 10000 > /tmp/sharda.log &
$ cat /tmp/sharda.log
$ ./mongod –shardsvr –dbpath /data/db/b –port 10001 > /tmp/shardb.log &
$ cat /tmp/shardb.log
$ ./mongod –configsvr –dbpath /data/db/config –port 20000 > /tmp/configdb.log &
$ cat /tmp/configdb.log
$ ./mongos –configdb localhost:20000 > /tmp/mongos.log &
$ cat /tmp/mongos.log

$ # we connect to mongos process
$ ./mongo
MongoDB shell version: 1.1.0-
url: test
connecting to: test
type "help" for help
> use admin
switched to db admin
> db.runCommand( { addshard : "localhost:10000", allowLocal : true } )
{"ok" : 1 , "added" : "localhost:10000"}
> db.runCommand( { addshard : "localhost:10001", allowLocal : true } )
{"ok" : 1 , "added" : "localhost:10001"}

> config = connect("localhost:20000")
> config = config.getSisterDB("config")

> test = db.getSisterDB("test")
test

> db.runCommand( { enablesharding : "test" } )
{"ok" : 1}
> db.runCommand( { shardcollection : "test.people", key : {name : 1} } )
{"ok" : 1}

> db.runCommand({listshards:1})
{"servers" : [{"_id" :  ObjectId( "4a9d40c981ba1487ccfaa634")  , "host" : "localhost:10000"},
{"_id" :  ObjectId( "4a9d40df81ba1487ccfaa635")  , "host" : "localhost:10001"}] ,
"ok" : 1}
>
{% endhighlight %}

**BTW：**

MongoDB是一个介于关系数据库和非关系数据库之间的产品，MongoDB的数据结构非常松散，他的数据格式类似json的bjson格式，因此可以存储比较复杂的数据类型。

另外，Mongo最大的特点是他支持的查询语言非常强大，其语法有点类似于面向对象的查询语言，几乎可以实现类似关系数据库单表查询的绝大部分功能，而且还支持对数据建立索引。

Mongo还可以解决海量数据的查询效率，根据官方文档，当数据量达到50GB以上数据时，Mongo数据库访问速度是MySQL10
倍以上。对于这点我将来会去做些试验来进行证明。

每个节点上都是单点的，不知道MongoDB Sharding+Replication是什么效果，因为被散列的服务器还是存在着单点的现象，如果其中一个散列的节点坏点那么数据就不存在了。下面还要试试这2种方式的结合。

**相关文章：**

 [MongoDB主(Master)/从(Slave)数据同步](http://www.javabloger.com/article/mongodb-master-slave-replication.html)  
 [Java操作 MongoDBNoSQL数据库](http://www.javabloger.com/article/mongodb-java.html)

