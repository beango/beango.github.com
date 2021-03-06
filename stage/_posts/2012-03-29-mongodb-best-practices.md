---
layout: post
section: Archive
category: default
date: 2012-03-29
title: "MongoDB最佳实践"
description: "MongoDB最佳实践"
tags: [mongodb]
redirecturl: http://blog.nosqlfan.com/html/3661.html
---


英文原文：[mongodb-best-practices](http://www.engineyard.com/blog/2011/mongodb-best-practices/)，翻译：[NoSQL
Fan](http://blog.nosqlfan.com/html/3661.html)

将MongoDB加入到我们的服务支持列表中，是整个团队年初工作计划中的首要任务。但我们感觉如果先添加一项对[NoSQL](http://blog.jobbole.com/1344/ "8种Nosql数据库系统对比")存储的支持，而不是先升级已支持的关系型数据库，可能对用户不太好，毕竟目前的用户都使用关系型数据库。

所以我们决定将引入MongoDB这项工作放到升级MySQL和PostgreSQL之后来做。到目前为止，MySQL
5.5的Beta版已在进行中，而PostgreSQL的9.1
Beta版也将进入流程，因此我们打算在2012年第一季度中应用这两个版本。

由于我们对MongoDB的关注，我们选择性地为几名使用MongoDB的用户提供了技术支持。在这个过程中，我们了解到了很多可能出现问题的地方。所以想借此文与大家分享Engine
Yard眼中的MongoDB最佳实践。

如果你的MongoDB是定制化安装的，我们强烈建议你将自己的设置与本文讲到的内容进行对比，并进行必要的设置修改。

**通常意义上的NoSQL最佳实践**

已有很多文章对NoSQL选型方面进行过讨论。在选择一个数据库产品时，通常可能需要考虑以下因素：读写吞吐量、持久化、一致性以及延迟等。在Nathan
Hurst的文章《Visual Guide to NoSQL
Systems》中对这些方面都做了详尽的介绍。

数据库的选择是个大问题，本文不打算就这方面深入介绍，但希望读者能够自己去了解这方面的知识。一旦开发者了解得足够多，最后的结论永远都只有一个：没有任何一个数据库能够满足所有的应用场景。本文内容是基于选择MongoDB作为数据库存储上来说的。Engine
Yard在这方面提出了如下四点建议。

全面测试。测试一定要使用切合实际场景的数据，并且需要尽量模拟业务场景的数据操作情况。否则，开发者会发现在上线后的实际场景下，可能导致一些性能瓶颈甚至发现整体架构上的设计缺陷。因此，尽可能使用实际场景的操作使用来进行测试，然后收集足够的测试数据。

千万别以为在关系型数据库上的使用方法可以被直接移植。MongoDB并不支持一些关系型数据库的功能，所以开发者最好先搞清楚MongoDB支持哪些功能。为了获得更好的性能，开发者最好多看10gen官方建议的文档设计和操作方法。另外，在使用MongoDB前，建议开发者做好对整个架构进行[重构](http://www.amazon.cn/gp/product/B003BY6PLK/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&tag=vastwork-23&linkCode=as2&camp=536&creative=3200&creativeASIN=B003BY6PLK "重构:改善既有代码的设计")以适用新的存储模型的准备。为了更好地理解数据迁移的代价，建议阅读《The
cost of Migration》一文。

明确数据需要的一致性和可靠性。对MongoDB来说，可靠性不再过度地依赖将数据写入到磁盘的操作，更多的是通过将数据同步到其他节点的方式解决可靠性问题。绝不建议开发者在真实环境中使用没有备份的节点单独工作。这一点很重要，所以建议开发者了解其中的原因。

明确你对EBS的期望。如果你是Engine Yard云平台的用户（AWS
EC2），那么应该知道，EBS的性能不太稳定。所以在测试时，你最好收集足够多的EBS设备吞吐数据以做考量。Engine
Yard本身并没有对用户在EBS性能上做限制。

**MongoDB最佳实践**

以下是我们将MongoDB引入到服务支持列表过程中所遵循的原则。

总是使用Replica Sets。Replica
Sets通过自动failover机制提供MongoDB的高可用性。在应用中，如primary机器出现故障，那么某一台secondary机器就会通过选举成为新的primary，整个集群仍然能够提供正常服务。我们的服务不会支持无同步机制的MongoDB布置方案。如果在开发者自己的环境中同步机制的代价过高，我们建议其使用一些云存储服务。Engine
Yard目前已经与MongoHQ和MongoLab都建立了合作关系。开发者可以在合作者页面找到更多这方面的信息。

保持版本更新。保持版本更新很重要，10gen在每个版本中都会修复一些问题，使MongoDB的运行更出色。比如在2.0.x版本中，MongoDB的存储性能和并发性能就有极大提高，同时还包括索引优化、Bug修复以及compaction命令等一系列改进，以便开发者更方便地扩展其集群。如果你还在使用1.6.3版本，那就快升级吧。

不要在32位系统上使用MongoDB。在32位机器上，MongoDB只能存储约2.5GB的数据。因为MongoDB在内部实现上是通过内存映射的方式来提高性能的，所以在32位机器上其内存地址本身就限制了数据容量。在Engine
Yard云服务中使用MongoDB，请使用Large
instance来部署MongoDB。在实际产品中，我们也只支持64位的MongoDB。

默认开启journaling日志。MongoDB支持在写操作前记录journaling日志来提高节点的可用性。强烈建议在部署时开启journaling日志。注意数据文件的存放位置。在使用时，请确认你的数据文件处于一个持久化存储中（比如/data/mongodb目录）。也可以使用非持久化的设备进行数据文件存储，不过你最好小心再小心，因为这可能会对你的集群架构造成影响。推荐使用EBS进行MongoDB的数据文件存储。热数据最好能放在内存中。能够保持热数据（以及索引数据）一直放在内存中，这一点非常重要，它将对整个集群的性能造成影响。如果通过监控发现page
fault的数量增加，那么很可能就是热数据量超出了可用内存大小。当热数据量超出了可用内存量时，通常有两种解决方法：增加内存和数据分片。建议先增加内存，再考虑通过数据分片的方式解决。

压力过大升级配置。如果机器负载达到65%，那么应该考虑升级机器配置。在日常使用中，最好保持负载低于65%。同时这也对数据恢复和纵向扩展有影响。当需要升级配置时，AWS建议按下面的顺序来做：Large、Extra
Large、High Memory 4XL。而在更高配置的机器上，网络延迟也会更小。

分片需谨慎。分片策略会受数据访问特点的影响，所以在进行数据分片前，最好先理清楚数据的访问特点，并想明白是否确实需要分片。分片字段对性能的影响非常大，所以选择一个好的分片字段是非常重要的。Config节点对整个集群的健康运行是至关重要的，所以一旦你选择使用分片机制，就一定要保证有3个Config节点。永远不要删除Config节点的数据，要确保频繁地对这些数据进行日常备份。如果可能，通过域名来指定节点的地址，比如在/etc/hosts文件中指定相应的本地域名，这能让你在集群配置上更灵活。Config节点的压力很小，但还需运行在64位机器上。千万不要把3个Config节点都放在同一台机器上！

另外，如果你要部署一个分片集群，那么可以向Engine
Yard专家服务预约咨询服务。

使用Mongo MMS图形化监控服务。如果你还没有完善的MongoDB监控，可以尝试Mongo
MMS。Mongo
MMS是10gen官方发布的一个监控服务，可以将集群的各项健康指标以图形化的方式汇总展示。

 
