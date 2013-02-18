---
layout: post
categories: [高性能web, NoSql]
date: 2012-12-19
title: "CentOS6.3下Redis安装"
description: "CentOS6.3下Redis安装"
tags: [Redis]
---
{% include JB/setup %}

*   下载最新的稳定版redis  

<label />
    wget http://redis.googlecode.com/files/redis-2.6.7.tar.gz

*   安装

<label />
    tar xzf  redis-2.6.7.tar.gz
    cd redis-2.6.7
    make PREFIX=/usr/local install
    cp src/redis-server /usr/bin/ 
    cp src/redis-cli /usr/bin/
    cp src/redis-check-aof /usr/bin/
    cp src/redis-check-dump /usr/bin/
    cp src/redis-benchmark /usr/bin/

make命令执行完成后，会在src目录下生成5个可执行文件，分别是redis-server、redis-cli、redis-benchmark、redis-check-aof、redis-check-dump，它们的作用如下：
redis-server：Redis服务器的daemon启动程序
redis-cli：Redis命令行操作工具。当然，你也可以用telnet根据其纯文本协议来操作
redis-benchmark：Redis性能测试工具，测试Redis在你的系统及你的配置下的读写性能
redis-check-aof：更新日志检查
redis-check-dump：用于本地数据库检查

*   编写redis配置文件

<label />
    mkdir -p /etc/redis/
    cp redis.conf /etc/redis/redis.conf

*   启动

<label />
    redis-server /etc/redis/redis.conf

*   测试

<label />
    redis-cli
    redis 127.0.0.1:6379>set myKey  myValue
    OK
    redis 127.0.0.1:6379> get myKey
    "myValue"

*   redis.conf 配置参数：

<a href="#" onclick="javascript:toggle(this);" class="linkcodetoggle">+ 点击展开</a>

    #是否作为守护进程运行
    daemonize yes

    #如以后台进程运行，则需指定一个pid，默认为/var/run/redis.pid
    pidfile redis.pid

    #绑定主机IP，默认值为127.0.0.1
    #bind 127.0.0.1

    #Redis默认监听端口
    port 6379

    #客户端闲置多少秒后，断开连接，默认为300（秒）
    timeout 300

    #日志记录等级，有4个可选值，debug，verbose（默认值），notice，warning
    loglevel verbose

    #指定日志输出的文件名，默认值为stdout，也可设为/dev/null屏蔽日志
    logfile stdout

    #可用数据库数，默认值为16，默认数据库为0
    databases 16

    #保存数据到disk的策略
    #当有一条Keys数据被改变是，900秒刷新到disk一次
    save 900 1

    #当有10条Keys数据被改变时，300秒刷新到disk一次
    save 300 10

    #当有1w条keys数据被改变时，60秒刷新到disk一次
    save 60 10000

    #当dump .rdb数据库的时候是否压缩数据对象
    rdbcompression yes

    #本地数据库文件名，默认值为dump.rdb
    dbfilename dump.rdb

    #本地数据库存放路径，默认值为 ./
    dir /var/lib/redis/

    ########### Replication #####################

    #Redis的复制配置
    # slaveof <masterip> <masterport> 当本机为从服务时，设置主服务的IP及端口
    # masterauth <master-password> 当本机为从服务时，设置主服务的连接密码

    #连接密码
    # requirepass foobared

    #最大客户端连接数，默认不限制
    # maxclients 128

    #最大内存使用设置，达到最大内存设置后，Redis会先尝试清除已到期或即将到期的Key，当此方法处理后，任到达最大内存设置，将无法再进行写入操作。
    # maxmemory <bytes>

    #是否在每次更新操作后进行日志记录，如果不开启，可能会在断电时导致一段时间内的数据丢失。因为redis本身同步数据文件是按上面save条件来同步的，所以有的数据会在一段时间内只存在于内存中。默认值为no
    appendonly no

    #更新日志文件名，默认值为appendonly.aof
    #appendfilename

    #更新日志条件，共有3个可选值。no表示等操作系统进行数据缓存同步到磁盘，always表示每次更新操作后手动调用fsync()将数据写到磁盘，everysec表示每秒同步一次（默认值）。
    # appendfsync always

    appendfsync everysec

    # appendfsync no

    ################ VIRTUAL MEMORY ###########

    #是否开启VM功能，默认值为no
    vm-enabled no
    # vm-enabled yes

    #虚拟内存文件路径，默认值为/tmp/redis.swap，不可多个Redis实例共享
    vm-swap-file /tmp/redis.swap

    #将所有大于vm-max-memory的数据存入虚拟内存,无论vm-max-memory设置多小,所有索引数据都是内存存储的 (Redis的索引数据就是keys),也就是说,当vm-max-memory设置为0的时候,其实是所有value都存在于磁盘。默认值为0。
    vm-max-memory 0
    vm-page-size 32
    vm-pages 134217728
    vm-max-threads 4

    ############# ADVANCED CONFIG ###############

    glueoutputbuf yes
    hash-max-zipmap-entries 64
    hash-max-zipmap-value 512

    #是否重置Hash表
    activerehashing yes


注意：Redis官方文档对VM的使用提出了一些建议:

当你的key很小而value很大时,使用VM的效果会比较好.因为这样节约的内存比较大.
当你的key不小时,可以考虑使用一些非常方法将很大的key变成很大的value,比如你可以考虑将key,value组合成一个新的value.
最好使用linux ext3 等对稀疏文件支持比较好的文件系统保存你的swap文件.
vm-max-threads这个参数,可以设置访问swap文件的线程数,设置最好不要超过机器的核数.如果设置为0,那么所有对swap文件的操作都是串行的.可能会造成比较长时间的延迟,但是对数据完整性有很好的保证.

*   常见错误-zmalloc.h:51:31: error: jemalloc/jemalloc.h: No such file or directory  
    检查是否安装gcc，如果已经安装，先执行make distclean再make

*   python操作redis

<a href="#" onclick="javascript:toggle(this);">+ 点击展开</a>
<div style="display:none;">
{% highlight perl %}
wget http://pypi.python.org/packages/source/r/redis/redis-2.7.2.tar.gz
#tar xvzf redis-py-2.7.2.tar.gz
python setup.py install

#打开Python解释器：
>>> import redis
>>> r = redis.Redis(host='localhost', port=6379, db=0)
>>> r.set('foo', 'bar')   #或者写成 r['foo'] = 'bar'
True
>>> r.get('foo')   
'bar'
>>> r.delete('foo')
True
>>> r.dbsize()   #库里有多少key，多少条数据
0
>>> r['test']='OK!'
>>> r.save()   #强行把数据库保存到硬盘。保存时阻塞
True
--------------------------------
>>> r.flushdb()   #删除当前数据库的所有数据
True
>>> a = r.get('chang')
>>> a    # 因为是Noen对象，什么也不显示！
>>> dir(a)   
['__class__', '__delattr__', '__doc__', '__format__', '__getattribute__', '__hash__', '__init__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__']
>>> r.exists('chang')  #看是否存在这个键值
False
>>> r.keys()   # 列出所有键值。（这时候已经存了4个了）
['aaa', 'test', 'bbb', 'key1']
{% endhighlight %}
</div>