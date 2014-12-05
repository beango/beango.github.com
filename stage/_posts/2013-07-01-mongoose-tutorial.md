---
layout: page
section: Code
category: code
date: 2013-07-01
title: "Mongoose 基本功能使用"
description: "Mongoose 基本功能使用"
summary: "Mongoose 基本功能使用"
---

Mongoose 是 MongoDB 数据库的模型工具，为 NodeJS 设计，工作于异步环境下。

与其它同类工具相比，一回更喜欢它灵活友好的 API。相似的，还存在MongoSkin，MongoLian，以及原生驱动 node-mongodb-native等。

Mongoose 是什么？
----------------

Mongoose 是 MongoDB 数据库的模型工具，为 NodeJS 设计，工作于异步环境下。

与其它同类工具相比，一回更喜欢它灵活友好的 API。相似的，还存在MongoSkin，MongoLian，以及原生驱动 node-mongodb-native等。

查询文档
--------

查询多条文档：

    Model.find(query, fields, options, callback);

其中 Model 为 Mongoose 模型对象。

query参数与 MongoDB 查询条件一致。

fields 指定查询的键，一般我们需要哪些键就指定哪些，以节省系统内存消耗，输入[]，则查询所有的键。

options 选项，有 limit, skip, populate 等等。

callback 则是回调函数，查询完毕后执行。该回调函数支持传入两个参数，分别为 err 和 result，如果 err 为非假则说明查询发生了错误，可以 console.log(err) 将错误打印到控制台；如果 result 为假，则说明没有查到符合条件的数据。

查询单条文档参数与 find 是一样的，只不过返回的是一条数据。

    Model.findOne(query, fields, options, callback);

查询单条文档，还有一种最高效的方式，根据文档 ID 查询：

    Model.findById(id, fields, options, callback);

创建文档
--------

Mongoose 为模型对象提供了 create 方法用于创建 MongoDB 文档，语法如下：

    Model.create(doc, callback);

通常我们的 doc 都是单条记录，直接插入即可，callback 回调函数有两个参数，分别为 err 和 创建的 doc 记录，但对 update 或 remove 的回调函数来说，第二个参数并不一样，以后会介绍。

doc 也支持批量插入，即传入数组文档，比如做数据导入时，循环插入单条记录与批量插入相比，消耗时间差别还是很大的，因为单条插入每次需要发送请求头给 MongoDB 数据库服务器，这与前端减少请求数提升应用性能的原理是一样的。

更新文档
--------

更新文档细节其实挺多的，语法如下：

    Model.update(conditions, update, options, callback);

*参数解释*

conditions 即查找条件，与 MongoDB shell 条件一样的。

update 指定要更新的数据，Mongoose 会自动转换为原子级更新。

options 选项，有 safe 和 multi 等，前者可以指定是否采用安全插入，如果不需要安全插入，设置为 {safe: false} 则不需要等待数据库服务器返回结果，响应速度会变快。multi 指定是否更新符合条件的所有文档，默认 false。

callback 回调函数，有俩参数，err 和 num，其中 num 为本次更新影响的记录数，此处与创建文档回调函数第二个参数不同，需要注意。

*代码样例*

    UserModel.update({}, {
        $set: {favorite_num: 0},
        $inc: {credit: 10},
        $addToSet: {fans: adminId},
        $unset: {articles: 1}

    }, {safe: false, multi: true}).run();

删除文档
--------

删除文档与创建文档类似，有俩参数：

    Model.remove(conditions, callback);

*需要注意的点：*

删除语句调用后，如果不指定 callback 则返回 Query 对象，这点与更新文档方法 update 以及查询方法 find 是一样的，必须指定 callback 或者调用 run 或 exec 方法才能将指令传递给 MongoDB 数据库。

*移除数据库中时间超过 3 天的动态：*

    var cond = {date: {$lt: +new Date() - 3*24*60*60*1000}};
    FeedModel.remove(cond).run();

Mongoose 嵌入文档操作
---------------------

使用 Mongoose 过程中首次遇到该问题，查了好久的资料没找到答案，如今碰巧解决了，即记录下来。

嵌入文档分为两种基本形式，分别为：

    user: {  // 第一种
        email: String,
        username: String
    }
    user: [{  // 第二种
        email: String,
        username: String
    }]

注意，这里第二种嵌入文档的形式虽是这样，但实际编码中这样写存在着问题就是不能更新指定条件的数组成员，比如下面的代码会报错：

    TestModel.update({'user.email': 'xianlihua@csser.com'}, {$set: {'user.$.username': '一回'}}, {multi: true}).run();

    TypeError: Cannot call method 'path' of undefined

但在 `MongoDB Shell` 中完全执行正确。

所以正确的写法是先定义子模式，再用 Mongoose 模式嵌套方式定义 `user` 键：

    var SubSchema = {
        email: String,
        username: String
    };

    // ...
    user: [SubSchema]

Mongoose 中 group、findAndModify 及 mapReduce 的使用
----------------------------------------------------

`group` 是 MongoDB 中非常类似 MySQL group by 的查询指令。比较遗憾的是在 Mongoose Model 上并不存在该方法，我们需要直接操作 Mongoose 所依赖的 node-mongodb-native。

    MessageModel.collection.group(keys, condition, initial, reduce, final, command, callback);

Model.collection 可以直接取得原生驱动的 Collection 对象，这种方法代价最小。

同样还有一些其它指令可以采用类似的方式，比如：`mapreduce`，你可以阅读[node-mongodb-native](https://github.com/christkv/node-mongodb-native/blob/master/lib/mongodb/collection.js)源码查看详细参数使用方法。

源码文件路径在如下：

    node_modules/mongoose/node_modules/mongodb/lib/mongodb/collection.js

比如，mapReduce 和 findAndModify 如下方式使用：

    Model.collection.mapReduce(map, reduce, options, callback);

    Model.collection.findAndModify(query, sort, update, options, callback);

mongoose 排序的运用
-------------------

查询就要用到排序，使用 mongoose 的 Model 直接查询时，排序是作为第三个参数的选项来设置的，比如：

    QuestionModel.find(condition, fields, {sort: [['_id', -1]]}, callback);

注意 `sort` 的写法，上例将查询结果按时间倒序，因为 MongoDB 的 \_id 生成算法中已经包含了当前的时间，所以这样写不仅没问题，也是推荐的按时间排序的写法。

    var query = QuestionModel.find(condition, fields);
    query.desc('_id');
    query.run(function (err, questions) {
        // ....
    });

这也是一种写法，直接用 Query 对象的排序方法进行排序。

避免对一个键进行多种操作
------------------------

这句话的意思是说，如果希望对文档的同一个键进行多种操作，比如现在有一个 tags 键（数组结构），希望既对其 pull 又 希望同时 addToSet 新元素，下面的写法是不对的：

    ... {$pullAll: {tags: minus}, $addToSet: {tags: {$each: plus}}} ...

这一点，MongoDB 权威指南上也有提到。

所以为了满足这样的需求，建议事先对新 tags 进行处理得到一个 newTags 数组，通过 \$set 修改器更新这个键。

