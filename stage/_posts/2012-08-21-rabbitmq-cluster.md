---
layout: post
section: Archive
category: default
date: 2012-08-21
title: "rabbitmq集群-1 介绍"
description: "rabbitmq集群-1 介绍"
tags: [rabbitmq]
---


[http://www.rabbitmq.com/clustering.html#auto-config](http://www.rabbitmq.com/clustering.html#auto-config)  

### Clustering overview

-   A RabbitMQ broker is a logical grouping of one or several Erlang nodes, each running the RabbitMQ application and sharing users, virtual hosts, queues, exchanges, etc. Sometimes we refer to the collection of nodes as a cluster.

    __一个rabbitmq集群中可以共享 user，vhost，queue，exchange等__

-   All data/state required for the operation of a RabbitMQ broker is replicated across all nodes, for reliability and scaling, with full ACID properties. An exception to this are message queues, which currently only reside on the node that created them, though they are visible and reachable from all nodes. Future releases of RabbitMQ will introduce migration and replication of message queues.

    __所有的数据和状态都是必须在所有节点上复制的，一个例外是，那些当前只属于创建它的节点的消息队列，尽管它们可见且可被所有节点读取__

-   The easiest way to set up a cluster is by auto configuration using a default cluster config file. See the clustering transcripts for an example.
    The composition of a cluster can be altered dynamically. All RabbitMQ brokers start out as running on a single node. These nodes can be joined into clusters, and subsequently turned back into individual brokers again.

    __rabbitmq节点可以动态的加入到集群中，一个节点它可以加入到集群中，也可以从集群环境退出__

-   RabbitMQ brokers tolerate the failure of individual nodes. Nodes can be started and stopped at will.

    __允许个别的节点失败__

-   The list of currently active cluster connection points is returned in the known_hosts field of AMQP's connection.open_ok method, as a comma-separated list of addresses where each address is an IP address or a DNS name, optionally followed by a colon and a port number.

    Nodes in a cluster perform some basic load balancing by responding to client connection attempts with AMQP's connection.redirectinsist flag in the connection.open method. method as appropriate, unless the client suppressed redirects by setting the insist flag in the connection.open method.

    __集群会进行一个基本的负载均衡__

-   A node can be a RAM node or a disk node. RAM nodes keep their state only in memory (with the exception of the persistent contents of durable queues which are still stored safely on disc). Disk nodes keep state in memory and on disk. As RAM nodes don't have to write to disk as much as disk nodes, they can perform better. Because state is replicated across all nodes in the cluster, it is sufficient to have just one disk node within a cluster, to store the state of the cluster safely. Beware, however, that RabbitMQ will not stop you from creating a cluster with only RAM nodes. Should you do this, and suffer a power failure to the entire cluster, the entire state of the cluster, including all messages, will be lost.  
    __集群中有两种节点：  
    内存节点：只保存状态到内存（一个例外的情况是：持久的queue的持久内容将被保存到disk）  
    磁盘节点：保存状态到内存和磁盘  
    内存节点虽然不写入磁盘，但是它执行比磁盘节点要好  
    集群中，只需要一个磁盘节点来保存状态就足够了  
    如果集群中只有内存节点，那么不能停止它们，否则所有的状态，消息等都会丢失__