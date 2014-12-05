---
layout: post
section: Archive
category: default
date: 2012-05-19
title: "MongoDB索引实战技巧"
description: "MongoDB索引实战技巧"
tags: [mongodb]
redirecturl: http://blog.nosqlfan.com/html/3656.html
---
{% include JB/setup %}

本文内容源自[Kyle Banker](http://www.manning.com/banker/) 的[MongoDB](http://blog.nosqlfan.com/tags/mongodb "查看 MongoDB 的全部文章")
In Action一书。主要描述了MongoDB[索引](http://blog.nosqlfan.com/tags/%e7%b4%a2%e5%bc%95 "查看 索引 的全部文章")相关的一些基础知识和使用技巧。

索引类型
--------
虽然MongoDB的索引在存储结构上都是一样的，但是根据不同的应用层需求，还是分成了唯一索引（unique）、稀疏索引（sparse）、多值索引（multikey）等几种类型。

**唯一索引**

唯一索引在创建时加上unique:true 的选项即可，创建命令如下：

    db.users.ensureIndex({username: 1}, {unique: true})

上面的唯一索引创建后，如果insert一条username已经存在的数据，则会报如下的错误：

    E11000 duplicate key error index: gardening.users.$username_1 dup key: { : "kbanker" }

如果你在一个已有数据的collection上创建唯一索引，若唯一索引对应的字段原来就有重复的数据项，那么创建会失败，我们需要加上一个dropDups的选项来强制将重复的项删除掉，命令如下例：

    db.users.ensureIndex({username: 1}, {unique: true, dropDups: true})

**松散索引**

如果你的数据中一些行中没有某个字段或字段值为null，那么如果在这个字段上建立普通索引，那么无此字段或值null的行也会参与到索引结构中，占用相应的空间。如果我们不希望这些值为空的行参与到我们的索引中，这时候可以采用松散索引，松散索引只会让指定字段不为空的行参与到索引创建中来。创建一个松散索引可以用下面的命令：

    db.reviews.ensureIndex({user_id: 1}, {sparse: true})

**多值索引**

MongoDB可以对一个array类型创建索引，比如像下面的结构，MongoDB可以在tags字段上创建索引：

    { name: "Wheelbarrow",
    tags: ["tools", "gardening", "soil"]
    }

在生成索引时，会为tags中的三个值分别生成三个索引元素，索引中tools，gardening，soil三个值都会指向这同一行数据。相当于分裂成了三个独立的索引项。

索引管理
--------

**索引的创建和删除**

创建和删除索引的方法有很多种，下面两个是比较原始的方法，通过对system.indexes这个collection进行相应的写操作来完成索引的创建：

    spec = {ns: "green.users", key: {‘addresses.zip’: 1}, name: ‘zip’}
    db.system.indexes.insert(spec, true)

上面命令往system.indexes中写入一条记录来创建索引，这条记录包含了要在上面创建索引的collection的名字空间，索引的信息，以及索引的名称。

创建完成后，我们可以通过下面命令找到我们创建的索引：

    db.system.indexes.find()
    { "_id" : ObjectId("4d2205c4051f853d46447e95"), "ns" : "green.users",
    "key" : { "addresses.zip" : 1 }, "name" : "zip", "v" : 0 }

要删除一个已创建的索引，我们可以使用下面的命令来实现：

    use green
    db.runCommand({deleteIndexes: "users", index: "zip"})

**创建索引命令**

实际上创建索引还有更方便的命令，那就是ensure[Index](http://blog.nosqlfan.com/tags/index "查看 Index 的全部文章")，比如我们创建一个open和close两个字段的联合索引，就可以用下面的命令：

    db.values.ensureIndex({open: 1, close: 1})

这个命令会触发索引创建的两个过程，一个是将相应的字段排序，因为索引是按B+树来组织的，要构建树，将数据进行排序后能够提高插入B+树的效率（第二个过程的效率），在日志中，你能看到和下面类似的输出：

    Tue Jan 4 09:58:17 [conn1] building new index on { open: 1.0, close: 1.0 } for stocks.values
    1000000/4308303 23%
    2000000/4308303 46%
    3000000/4308303 69%
    4000000/4308303 92%
    Tue Jan 4 09:59:13 [conn1] external sort used : 5 files in 55 secs

第二个过程是将排序好的数据插入到索引结构中，构成可用的索引：

    1200300/4308303 27%
    2227900/4308303 51%
    2837100/4308303 65%
    3278100/4308303 76%
    3783300/4308303 87%
    4075500/4308303 94%
    Tue Jan 4 10:00:16 [conn1] done building bottom layer, going to commit
    Tue Jan 4 10:00:16 [conn1] done for 4308303 records 118.942secs
    Tue Jan 4 10:00:16 [conn1] insert stocks.system.indexes 118942ms

除了日志中的输出外，你还可以通过在终端执行currentOp命令来获取当前操作线程的相关信息，如下例：

    > db.currentOp()
    {
        "inprog" : [
            {
                "opid" : 58,
                "active" : true,
                "lockType" : "write",
                "waitingForLock" : false,
                "secs_running" : 55,
                "op" : "insert",
                "ns" : "stocks.system.indexes",
                "query" : {
                },
                "client" : "127.0.0.1:53421",
                "desc" : "conn",
                "msg" : "index: (1/3) external sort 3999999/4308303 92%"
            }
        ]
    }

最后一部分就是一个索引构建过程，目前正在执行排序过程，执行到92%。

**在后台创建索引**

创建索引会对数据库添加写锁，如果数据集比如大，会将线上读写数据库的操作挂起，以等待索引创建结束。这影响了数据库的正常服务，我们可以通过在创建索引时加background:true
的选项，让创建工作在后台执行，这时候创建索引还是需要加写锁，但是这个写锁不会直接独占到索引创建完成，而是会暂停为其它读写操作让路，不至于造成严重的性能影响。具体方法：

    db.values.ensureIndex({open: 1, close: 1}, {background: true})

**离线创建索引**

无论如何，索引的创建都会给数据库造成一定的压力，从而影响线上服务。如果希望创建索引的过程完全不影响线上服务，我们可以通过将replica
sets中的节点先从集群中剥离，在这个节点上添加相应的索引，等索引添加完毕后再将其添加到replica
sets中。这只需要保证一个条件，就是创建索引的时间不能长于oplog能够保存日志的时间，否则创建完后节点再上线发现再也无法追上primary了，这时会进行resync操作。

**索引备份**

我们知道，无论是使用mongodump还是mongoexport命令，都只是对数据进行备份，无法备份索引。我们在恢复的时候，还是需要等待漫长的索引创建过程。所以，如果你希望备份的时候带上索引，那么最好采用备份数据文件的方式。

**索引压缩**

索引在使用一段时间后，经历增删改等操作，会变得比较松散，从而战用不必要的空间，我们可以通过reindex命令，重新组织索引，让索引的空间占用变得更小。

来源：[www.cloudcomputingdevelopment.net](http://www.cloudcomputingdevelopment.net/mongodb-indexing-in-practice/)
