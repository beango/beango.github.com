---
layout: post
section: Archive
categories: [NoSql,软件架构]
date: 2013-02-27
title: "NoSQL的现状"
description: "NoSQL的现状"
tags: [NoSQL]
redirecturl: http://www.infoq.com/cn/articles/State-of-NoSQL
---
{% include JB/setup %}


译文来源：[InfoQ 张卫滨](http://www.infoq.com/cn/articles/State-of-NoSQL)

经过了至少4年的激烈争论，现在是对[NoSQL](http://blog.jobbole.com/1344/ "8种Nosql数据库系统对比")的现状做一个阶段性结论的时候了。围绕着NoSQL发生了如此之多的事情，以至于很难对其作出一个简单概括，也很难判断它达到了什么目标以及在什么方面没有达到预期。

在很多领域，NoSQL不仅在行业内也在学术领域中取得了成功。大学开始认识到NoSQL必须要加入到课程中。只是反复讲解标准数据库已经不够了。当然，这不意味着深入学习关系型数据库是错误的。相反，NoSQL是很好的很重要的补充。

**发生了什么？**

NoSQL领域在短短的4到5年的时间里，爆炸性地产生了50到150个新的数据库。[nosql-database.org](http://nosql-database.org/)列出了150个这样的数据库，包括一些像对象数据库这样很古老但很强大的。当然，一些有意思的合并正在发生，如CouchDB和Membase交易产生的CouchBase。但是我们稍后会在本文中讨论每一个主要的系统。

很多人都曾经假设在NoSQL领域会有一个巨大地整合。但是这并没有发生。NoSQL过去是爆炸性地增长，现在依旧如此。就像计算机科学中的所有领域一样——如[编程语言](http://blog.jobbole.com/tag/%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80/ "如何选择语言和编程语言排名相关文章")——现在有越来越多的空白领域需要大量的数据库。这是与互联网、大数据、传感器以及将来很多技术的爆炸性增长同步的，这导致了更多的数据以及对它们进行处理的不同需求。在过去的四年中，我们只看到了一个重要的系统离开了舞台：德国的Graph数据库Sones。为数众多的NoSQL依然快乐地生存着，要么在开源社区，不用考虑任何的金钱回报，要么在商业领域。

**可见性与金钱？**

另外一个重要的方面就是可见性与行业采用的情况。在这个方面，我们可以看到在传统的行业中——要保护投资——与新兴的行业（主要是初创公司）之间有很大的差别。几乎所有热门的基于Web的创业公司如Pinterest和Instagram都在使用混合式（SQL + NoSQL）的架构，而传统的行业依然纠结于是否采用NoSQL。但是观察显示，越来越多这样的公司正在试图将它们的一部分数据流用NoSQL方案进行处理并在以后进行分析，这样的方案包括Hadoop、MongoDB以及Cassandra等。

这同时导致了对具备NoSQL知识的架构师和开发人员的需求持续增长。[最近的调查](http://servicesangle.com/blog/2011/12/29/top-10-developer-and-engineering-skills-employers-will-look-for-going-into-2012/)显示行业中最需要的开发人员技能如下：

1.  HTML5
2.  MongoDB
3.  iOS
4.  Android
5.  Mobile Apps
6.  Puppet
7.  Hadoop
8.  jQuery
9.  PaaS
10. Social Media

在前十名的技术需求中，有两个[nosql数据库](http://blog.jobbole.com/1344/ "8种Nosql数据库系统对比")。有一个甚至排在了iOS前面。如果这不是对它的赞扬，那是什么呢？！

但是，跟最初预计相比，对NoSQL的采用变得越来越快，越来越深入。在2011年夏天，Oracle曾经发布过一个著名白皮书，它提到NoSQL数据库感觉就像是冰淇淋的风味，但是你不应该过于依附它，因为它不会持续太长时间。但是仅仅在几个月之后，Oracle就展现了它们将Hadoop集成到大数据设备的方案。甚至，他们建立了自己的NoSQL数据库，那是对BerkeleyDB的修改。从此之后，所有的厂商在集成Hadoop方面展开了竞赛。Microsoft、Sybase、IBM、Greenplum、Pervasive以及很多的公司都已经对它有了紧密的集成。有一个模式随处可见：不能击败它，就拥抱它。

但是，关于NoSQL被广泛采用的另一个很重要但不被大家关注的重要信号就是NoSQL成为了一个PaaS标准。借助于众多NoSQL数据库的易安装和管理，像Redis和MongoDB这样的数据库可以在很多的PaaS服务中看到，如Cloud Foundry、OPENSHIFT、dotCloud、Jelastic等。随着所有的事情都在往云上迁移，NoSQL会对传统的关系型数据库产生很大的压力。例如当面临选择MySQL/PostGres或MongoDB/Redis时，将会强制人们再三考虑他们的模型、需求以及随之而来的其他重要问题。

另外一个很有意思的技术指示器就是ThoughtWorks的技术雷达，即便你可能不完全同意它所包含的所有事情，但它总会包含一些有意思的事情。让我们看一下他们2012年10月份的技术雷达，如图1：

[![NoSQL的现状]({{ site.JB.FILE_PATH }}/2013-02/5fig1.jpg "NoSQL的现状")]({{ site.JB.FILE_PATH }}/2013-02/5fig1.jpg "NoSQL的现状")

**图1：ThoughtWorks技术雷达，2012年10月——平台**

在他们的平台象限中，列出了5个数据库：

1.  Neo4j （采用）
2.  MongoDB（试用阶段但是采用）
3.  Riak（试用）
4.  CouchBase（试用）
5.  Datomic（评估）

你会发现它们中至少有四个获得了很多的风险投资。如果你将NoSQL领域的所有风险投资加起来，结果肯定是在一亿和十亿美元之间！Neo4j就是一个例子，它在一系列的B类资助中得到了一千一百万美元。其他得到一千万到三千万之间资助的公司是Aerospike、Cloudera、DataStax、MongoDB以及CouchBase等。但是，让我们再看一下这个列表：Neo4j、MongoDB、Riak以及CouchBase已经在这个领域超过四年了并且在不断地证明它们是特定需求的市场领导者。第五名的数据库——Datomic——是一个令人惊讶的全新数据库，它是由一个小团队按照全新的范式编写的。这一定是很热门的东西，在后面简要讨论所有数据库的时候，我们更更深入地了解它们。

**标准**

已经有很多人要求NoSQL标准了，但他们没有看到NoSQL涵盖了一个范围如此之大的模型和需求。所以，适用于所有主要领域的统一语言如Wide Column、Key/Value、Document和Graph数据库肯定不会持续很长时间，因为它不可能涵盖所有的领域。有一些方式，如Spring Data，试图建立一个统一层，但这取决于读者来测试这一层在构建多持久化环境时是不是一个飞跃。

大多数的Graph和Document数据库在它们的领域中已经提出了标准。在Graph数据库世界，因为它的tinkerpop blueprints、Gremlin、Sparql以及Cypher使得它更为成功一些。在Document数据库领域，UnQL和jaql填补了一些位置，尽管前者缺少现实世界NoSQL数据库的支持。但是借助Hadoop的力量，很多项目正在将著名的ETL语言如Pig和Hive使用到其他NoSQL数据库中。所以标准世界是高度分裂的，但这只是因为NoSQL是一个范围很广的领域。

**格局**

作为最好的数据库格局图之一，是由[451 Group的Matt Aslett在一个报告中](http://blogs.the451group.com/information_management/2012/11/02/updated-database-landscape-graphic/)给出的。最近，他更新了该图片从而能够让我们可以更好得深入理解他所提到的分类。你可以在下面的图片中看到，这个格局是高度碎片化和重叠的：

[![NoSQL的现状]({{ site.JB.FILE_PATH }}/2013-02/7fig2small.jpg "NoSQL的现状")]({{ site.JB.FILE_PATH }}/2013-02/7fig2small.jpg "NoSQL的现状")

**图2：Matt Aslett（451 Group）给出的数据库格局**

你可以看到在这个图片中有多个维度。关系型的以及非关系型的、分析型的以及操作型的、NoSQL类型的以及NewSQL类型的。最后的两个分类中，对于NoSQL有著名的子分类Key-Value、Document、Graph以及Big Tables，而对于NewSQL有子分类Storage-Engine、Clustering-Sharding、New Database、Cloud Service Solution。这个图有趣的地方在于，将一个数据放在一个精确的位置变得越来越难。每一个都在拼命地集成其他范围数据库中的特性。NewSQL系统实现NoSQL的核心特性，而NoSQL越来越多地试图实现“传统”数据库的特性如支持SQL或ACID，至少是可配置的持久化机制。

这一切都始于众多的数据库都提供与Hadoop进行集成。但是，也有很多其他的例子，如MarkLogic开始参与JSON浪潮，所以也很难对其进行定位。另外，更多的多模型数据库开始出现，如ArangoDB、OrientDB和AlechemyDB（现在它是很有前途的Aerospike
DB的一部分）。它们允许在起始的时候只有一个数据库模型（如document/JSON模型）并在新需求出现的时候添加新的模型（Graph或key-value）。

**图书**

另外一个证明它开始变得成熟的标志就是图书市场。在2010年和2011年两本德语书出版之后，我们看到Wiley出版了Shashank Tiwari的书。它的结构很棒并且饱含了深刻伟大的见解。在2012年，这个竞赛围绕着两本书展开。“七周七数据库”（Seven Databases in Seven Weeks）当然是一本杰作。它的特点在于新颖的编写以及实用的基于亲身体验的见解：它选取了6种著名的NoSQL数据库以及PostGreSQL。这些都使得它成为一本高度推荐的图书。另一方面，P.J.Sandalage以及Martin Fowler采取了一种更为全面的方法，涵盖了所有的特征并帮助你评估采用NoSQL的路径和决策。

但是，会有更多的书出现。Manning的书出现在市场上只是个时间问题：Dan McCreary和Ann Kelly正在编写一本名为“[Making Sense of NoSQL](http://www.manning.com/mccreary/)”的书，首期的MEAP（指的是Manning Early Access Program——译者注）章节已经可以看到了。

在介绍完理念和模式后，他们的第三章看起来保证很有吸引力：

-   构建NoSQL大数据解决方案
-   构建NoSQL搜索解决方案
-   构建NoSQL高可用性解决方案
-   使用NoSQL来提高敏捷性

只是一个全新的方式，绝对值得一读。

**领导者的现状**

让我们快速了解一下各个NoSQL的领导者。作为市场上很明显的领导者之一，Hadoop是一个很奇怪的动物（作者使用这个词，可能是因为Hadoop的标识是一只大象——译者注）。一方面，它拥有巨大的发展势头。正如前面所说，每个传统的数据库提供商都急切地声明支持Hadoop。像Cloudera和MapR这样的公司会持续增长并且新的Hadoop扩展和继承者每周都在出现。\

即便是Hive和Pig也在更好地得到接受。不过，有一个美中不足之处：公司们依然在抱怨非结构化的混乱（读取和解析文件本应该更快一些），MapReduce在批处理上做的还不够（甚至Google已经舍弃了它），管理依旧很困难，稳定性问题以及在本地很难找到培训/咨询。即便你可以解决一些上面的问题，如果Hadoop继续像现在这样发展或发生重大变化的话，它依然会是热点问题。

第二位领导者，MongoDB，同样面临激烈的争论。处于领导地位的数据库会获得更多的批评，这可能是很自然的事情。不过，MongoDB经历了快速的增长，它受到的批评主要如下：

a)就老版本而言或者\

b)缺少怎样正确使用它的知识。尽管MongoDB在下载区域清楚地表明32位版本不能处理2GB的数据并建议使用64位版本，但这依然受到了很多近乎荒谬的抱怨。

不管怎样，MongoDB合作者和资助者推动了雄心勃勃的发展路线，包含了很多热门的东西：

-   行业需要的一些安全性/LDAP特性，目前正在开发
-   全文本搜索很快会推出
-   针对MapReduce的V8将会推出
-   将会出现比集合级别更好的锁级别
-   Hash分片键正在开发中

尤其是最后一点吸引了很多架构师的兴趣。MongoDB经常被抱怨（同时也被竞争对手）没有实现简洁一致的哈希，因为key很容易定义所以不能保证完全正确。但在将来，将会有一个对hash分片键的配置。这意味着用户可以决定使用hash
key来分片，还是需要使用自己选择分片key所带来的优势（可能很少）。

Cassandra是这个领域中的另一个产品，它做的很好并且添加了更多更好的特性，如更好的查询。但是不断有传言说运行Cassandra集群并不容易，需要一些很艰难的工作。但这里最吸引人的肯定是DataStax。Cassandra的新公司——获得了两千五百万美元的C类资助——很可能要处理分析和一些操作方面的问题。尤其是分析能力使得很多人感到惊讶，因为早期的Cassandra并没有被视为强大的查询机器。但是这种现状在最近的几个版本中发生了变化，查询功能对一些现代分析来讲已经足够了。

Redis的开发进度也值得关注。尽管Salvatore声明如果没有社区和Pieter Noordhuis的帮助，他做不成任何的事情，但是它依旧是相当棒的一个产品。对故障恢复的良好支持以及使用Lua的服务器端脚本语言是其最近的成就。使用Lua的决策对社区带来了一些震动，因为每个人都在集成JavaScript作为服务器端的语言。但是，Lua是一个整洁的语言并为Redis开启新的潘多拉盒子带来了可能性。

CouchBase在可扩展性和其他潜在因素方面看起来也是一个很好的选择，尽管Facebook以及Zynga面临着巨大的风波。它确实不是很热门的查询机器，但如果他们能够在将来提高查询能力，那它的功能就会相当完整了。与CouchDB创立者的合并毫无疑问是很重要的一个步骤，CouchDB在CouchBase里面的影响值得关注。在每个关于数据库的会议上，听到这样的讨论也是很有意思的，那就是在Damien、Chris和Jan离开后，CouchDB会变得更好呢还是更坏呢？大家在这里只能听到极端的观点。但是，只要数据库做得好谁关心这个呢。现在看起来，它确实做的很好。

最后一个需要提及的NoSQL数据库当然是Riak，在功能性和监控方面它也有了巨大的提升。在稳定性方面，它继续得到巨大的声誉：“像巨石一般稳定可靠且不显眼，并对你的睡眠有好处”。Riak
CS fork在这种技术的模块化方面看起来也很有趣。

**有意思的新加入者**

除了市场领导者，评估新的加入者通常是很有意思的。让我们深入了解它们中的一部分。

毫无疑问，Elastic Search是最热门的新NoSQL产品，在一系列的A轮资助中它刚刚获得了一千万美元，这是它热门的一个明证。作为构建在Lucene之上的高扩展性搜索引擎，它有很多的优势：a）它有一个公司提供服务并且b）利用了Lucene在过去的多年中已被充分证明的成就。它肯定会比以往更加深入得渗透到整个行业中，并在半结构化信息领域给重要的参与者带来冲击。

Google在这个领域也推出了小巧但是迅速的LevelDB。在很多特殊的需求下，如压缩集成方面，它作为基础得到了很多的应用。即使是Riak都集成了LevelDB。考虑到Google的新数据库如Dremel和Spanner都有了对应的开源项目（如Apache Drill或Cloudera Impala），它依然被视为会继续存在的。

另外一个技术变化当然就是在2012年初的DynamoDB。自从部署在Amazon中，他们将其视为增长最快的服务。它的可扩展性很强。新特性开发地比较慢但它关注于SSD，其潜力是很令人振奋的。

多模块数据库也是值得关注的一个领域。最著名的代表者是OrientDB，它现在并不是新的加入者但它在很迅速地提高功能。可能它变化得太快了，很多使用者也许会很开心地看到OrientDB已经到达了1.0版本，希望它能更稳定一些。对Graph、Document、Key-Value的支持以及对事务和SQL的支持，使得我们有理由给它第二次表现的机会。尤其是对SQL的良好支持使得它对诸如Penthao这样的分析解决方案方面很有吸引力。这个领域另一个新的加入者是ArangoDB，它的进展很快，并不畏惧将自己与已确定地位的参与者进行比较。\

但是，如果有新的需求必须要实现并且具有不同类型的新数据模型要进行持久化的话，对原生JSON和Graph的支持会省去很多的努力。

到目前位置，2012年的最大惊喜来自于Datomic。它由一些摇滚明星采用Clojure语言以难以令人置信的速度开发的，它发布了一些新的范式。另外，它还进入了ThoughtWorks的技术雷达，占据了推荐关注的位置。尽管它“只是”已有数据库中一个参与者，但是它有很多的优势，如：

-   事务
-   时间机器
-   新颖且强大的查询方式
-   新的模式方式
-   缓存以及可扩展性的特性

目前，支持将DynamoDB、Riak、CouchBase、Infinispan以及SQL作为底层的存储引擎。它甚至允许你同时混合和查询不同的数据库。很多有经验的人都很惊讶于这种颠覆性的范式转变是如何可能实现的。但幸运的是它就是这样。

**总结**

作为总结，我们做出三点结论：

1.  关于CAP理论，Eric Brewer的一些新文章应该几年前就发表。在[这篇文章中](http://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed;jsessionid=05F9C1BE83D9DD1D1326298BC22A297C)（[这篇佳文的中文版地址](http://www.infoq.com/cn/articles/cap-twelve-years-later-how-the-rules-have-changed;jsessionid=05F9C1BE83D9DD1D1326298BC22A297C)——译者注），他指出“三选二”具有误导性，并指出了它的原因，世界为何远比简单的CP/AP更为复杂，如在ACID/BASE之间做出选择。虽然如此，近些年来有成千上万的对话和文章继续赞扬CAP理论而没有任何批评性的反思。Michael Stonebraker是NoSQL最强有力的审查者之一（NoSQL领域也对他颇多感激），他在多年前就指出了这些问题！遗憾的是，没有多少人在听。但是，既然Eric Brewer更新了他的理论，简单的CAP叙述时代肯定要结束了。在指出CAP理论的真实和多样性的观点上，请站在时代的前列。

2.  正如我们所了解的那样，传统关系型数据库的不足导致了NoSQL领域的产生。但这也是传统帝国发起回击的时刻。在“NewSQL”这个术语之下，我们可以看到许多新的引擎（如database.com、VoltDB、GenieDB等，见图2），它们提高了传统的解决方案、分片以及云计算方案的能力。这要感谢NoSQL运动。
但是随着众多的数据库尝试实现所有的特性，明确的边界消失了
确定使用哪种数据库比以前更为复杂了。

    你必须要知道50个用例、50个数据库并要回答至少50个问题。关于后者，笔者在过去两年多的NoSQL咨询中进行了收集，可以在以下地址找到：[选择正确的数据库](http://nosql-database.org/select-the-right-database.html)，[在NoSQL和NewSQL间进行选择](http://www.infoq.com/presentations/Choosing-NoSQL-NewSQL;jsessionid=05F9C1BE83D9DD1D1326298BC22A297C)。

3.  一个通用的真理就是，每一项技术的变化——从客户端-服务端技术开始甚至更早——需要十倍的成本才能进行转移。例如，从大型机到客户端-服务端、客户端-服务端到SOA、SOA到WEB、RDBMS到混合型持久化之间的转换都是如此。所以可以推断出，在将NoSQL加入到他们的产品决策上，很多的公司在迟疑和纠结。但是，大家也都知道，最先采用的公司会从这个两个领域获益并且能够快速集成NoSQL，所以在将来会占据更有利的位置。就这一点而言，NoSQL解决方案会一直存在并且评估起来会是有利可图的领域。
