---
layout: post
categories: [SQL]
date: 2013-05-30
title: "SQL联合语句的视觉解释"
description: "SQL联合语句的视觉解释"
tags: [SQL]
redirecturl: http://blog.jobbole.com/40443/
---
{% include JB/setup %}

我认为Ligaya Turmelle的关于SQL联合（join）语句的帖子对于新开发者来说是份很好的材料。SQL联合语句好像是基于集合的，用韦恩图来解释咋一看是很自然而然的。不过正如在她的帖子的回复中所说的，在测试中我发现韦恩图并不是十分的匹配SQL联合语法。

不过我还是喜欢这个观点，所以我们来看看能不能用上韦恩图。假设我们有下面两张表。表A在左边，表B在右边。我们给它们各四条记录。

    id name       id  name
    -- ----       --  ----
    1  Pirate     1   Rutabaga
    2  Monkey     2   Pirate
    3  Ninja      3   Darth Vader
    4  Spaghetti  4   Ninja

我们用过name字段用几种不同方式把这些表联合起来，看能否得到和那些漂亮的韦恩图在概念上的匹配。

    SELECT * FROM TableA
    INNER JOIN TableB
    ON TableA.name = TableB.name
     
    id  name       id   name
    --  ----       --   ----
    1   Pirate     2    Pirate
    3   Ninja      4    Ninja

内联合（inner join）只生成同时匹配表A和表B的记录集。（如下图）

[![inner join]({{ site.JB.FILE_PATH }}/2013-05/iinner-join.png "inner join")]({{ site.JB.FILE_PATH }}/2013-05/iinner-join.png "inner join")

——————————————————————————-

    SELECT * FROM TableA
    FULL OUTER JOIN TableB
    ON TableA.name = TableB.name
     
    id    name       id    name
    --    ----       --    ----
    1     Pirate     2     Pirate
    2     Monkey     null  null
    3     Ninja      4     Ninja
    4     Spaghetti  null  null
    null  null       1     Rutabaga       
    null  null       3     Darth Vader

全外联合（full outer join）生成表A和表B里的记录全集，包括两边都匹配的记录。如果有一边没有匹配的，缺失的这一边为null。（如下图）

[![Full outer join]({{ site.JB.FILE_PATH }}/2013-05/Full-outer-join.png "Full outer join")]({{ site.JB.FILE_PATH }}/2013-05/Full-outer-join.png "Full outer join")

——————————————————————————-

    SELECT * FROM TableA
    LEFT OUTER JOIN TableB
    ON TableA.name = TableB.name
     
    id  name       id    name
    --  ----       --    ----
    1   Pirate     2     Pirate
    2   Monkey     null  null
    3   Ninja      4     Ninja
    4   Spaghetti  null  null

左外联合（left outer join）生成表A的所有记录，包括在表B里匹配的记录。如果没有匹配的，右边将是null。（如下图）

[![Left outer join]({{ site.JB.FILE_PATH }}/2013-05/Left-outer-join.png "Left outer join")]({{ site.JB.FILE_PATH }}/2013-05/Left-outer-join.png "Left outer join")

——————————————————————————-

    SELECT * FROM TableA
    LEFT OUTER JOIN TableB
    ON TableA.name = TableB.name
    WHERE TableB.id IS null
     
    id  name       id     name
    --  ----       --     ----
    2   Monkey     null   null
    4   Spaghetti  null   null

为了生成只在表A里而不在表B里的记录集，我们用同样的左外联合，然后用where语句排除我们不想要的记录。（如下图）

[![]({{ site.JB.FILE_PATH }}/2013-05/WHERE-TableB.id-IS-nul.png "WHERE TableB.id IS nul")]({{ site.JB.FILE_PATH }}/2013-05/WHERE-TableB.id-IS-nul.png "WHERE TableB.id IS nul")

——————————————————————————-

    SELECT * FROM TableA
    FULL OUTER JOIN TableB
    ON TableA.name = TableB.name
    WHERE TableA.id IS null 
    OR TableB.id IS null
     
    id    name       id    name
    --    ----       --    ----
    2     Monkey     null  null
    4     Spaghetti  null  null
    null  null       1     Rutabaga
    null  null       3     Darth Vader

为了生成对于表A和表B唯一的记录集，我们用同样的全外联合，然后用where语句排除两边都不想要的记录。（如下图）

 

[![]({{ site.JB.FILE_PATH }}/2013-05/WHERE-TableA.id-IS-null.png "WHERE TableA.id IS null")]({{ site.JB.FILE_PATH }}/2013-05/WHERE-TableA.id-IS-null.png "WHERE TableA.id IS null")

———————————————————–

还有一种笛卡尔积或者**交叉联合（cross join）**，据我所知不能用韦恩图表示：

    SELECT * FROM TableA
    CROSS JOIN TableB

这个把“所有”联接到“所有”，产生4乘4=16行，远多于原始的集合。如果你学过数学，你便知道为什么这个联合遇上大型的表很危险。

英文原文；[Jeff Atwood](http://www.codinghorror.com/blog/2007/10/a-visual-explanation-of-sql-joins.html)，编译：[伯乐](http://www.jobbole.com "伯乐在线")在线 – @[奇风余谷](http://weibo.com/deepfish2567 "奇风余谷")
