---
layout: post
section: Archive
categories: [软件架构, 高性能web, nosql]
date: 2011-12-03
title: "利用Tokyo Tyrant构建兼容Memcached协议、支持故障转移、高并发的分布式key-value持久存储系统"
description: "利用Tokyo Tyrant构建兼容Memcached协议、支持故障转移、高并发的分布式key-value持久存储系统"
tags: [memcached, tokyo tyrant]
redirecturl: http://blog.s135.com/post/362/3/1/
---

###一、安装 

<li>首先编译安装tokyocabinet数据库</li>

    wget http://www.1978th.net/tokyocabinet/tokyocabinet-1.4.45.tar.gz  
    tar zxvf tokyocabinet-1.4.45.tar.gz  
    cd tokyocabinet-1.4.45/  
    ./configure  
    #注：在32位Linux操作系统上编译Tokyo cabinet，请使用./configure --enable-off64代替./configure，可以使数据库文件突破2GB的限制。   
    #./configure --enable-off64  
    make  
    make install  
    cd ../

<li>然后编译安装tokyotyrant</li>

    wget http://www.1978th.net/tokyotyrant/tokyotyrant-1.1.40.tar.gz  
    tar zxvf tokyotyrant-1.1.40.tar.gz  
    cd tokyotyrant-1.1.40/  
    ./configure  
    make  
    make install  
    cd ../

### 二、配置

1.创建tokyotyrant数据文件存放目录

	mkdir -p /ttserver/

2.启动tokyotyrant的主进程（ttserver）

<li>单机模式</li>  

    ulimit -SHn 51200  
    ttserver -host 127.0.0.1 -port 11211 -thnum 8 -dmn -pid /ttserver/ttserver.pid -log /ttserver/ttserver.log -le -ulog /ttserver/ -ulim 128m -sid 1 -rts /ttserver/ttserver.rts /ttserver/database.tcb\#lmemb=1024\#nmemb=2048\#bnum=10000000  

<li>双机互为主辅模式</li>

服务器192.168.1.91：
    ulimit -SHn 51200  
    ttserver -host 192.168.1.91 -port 11211 -thnum 8 -dmn -pid /ttserver/ttserver.pid -log /ttserver/ttserver.log -le -ulog /ttserver/ -ulim 128m -sid 91 -mhost 192.168.1.92 -mport 11211 -rts /ttserver/ttserver.rts /ttserver/database.tcb\#lmemb=1024\#nmemb=2048\#bnum=10000000

服务器192.168.1.92：
    
    ulimit -SHn 51200  
    ttserver -host 192.168.1.92 -port 11211 -thnum 8 -dmn -pid /ttserver/ttserver.pid -log /ttserver/ttserver.log -le -ulog /ttserver/ -ulim 128m -sid 92 -mhost 192.168.1.91 -mport 11211 -rts /ttserver/ttserver.rts /ttserver/database.tcb\#lmemb=1024\#nmemb=2048\#bnum=10000000

3.停止tokyotyrant（ttserver）

	ps -ef | grep ttserver

找到ttserver的进程号并kill，例如：

	kill -TERM 2159

4.参数说明

    ttserver [-host name] [-port num] [-thnum num] [-tout num] [-dmn] [-pid path] [-log path] [-ld|-le] [-ulog path] [-ulim num] [-uas] [-sid num] [-mhost name] [-mport num] [-rts path] [dbname]  

    -host name: 指定需要绑定的服务器域名或IP地址。默认绑定这台服务器上的所有IP地址。  
    -port num: 指定需要绑定的端口号。默认端口号为1978  
    -thnum num: 指定线程数。默认为8个线程。  
    -tout num: 指定每个会话的超时时间（单位为秒）。默认永不超时。  
    -dmn: 以守护进程方式运行。  
    -pid path: 输出进程ID到指定文件（这里指定文件名）。  
    -log path: 输出日志信息到指定文件（这里指定文件名）。  
    -ld: 在日志文件中还记录DEBUG调试信息。  
    -le: 在日志文件中仅记录错误信息。  
    -ulog path: 指定同步日志文件存放路径（这里指定目录名）。  
    -ulim num: 指定每个同步日志文件的大小（例如128m）。  
    -uas: 使用异步IO记录更新日志（使用此项会减少磁盘IO消耗，但是数据会先放在内存中，不会立即写入磁盘，如果重启服务器或ttserver进程被kill掉，将导致部分数据丢失。一般情况下不建议使用）。  
    -sid num: 指定服务器ID号（当使用主辅模式时，每台ttserver需要不同的ID号）   
    -mhost name: 指定主辅同步模式下，主服务器的域名或IP地址。  
    -mport num: 指定主辅同步模式下，主服务器的端口号。  
    -rts path: 指定用来存放同步时间戳的文件名。  

如果使用的是哈希数据库，可以指定参数“#bnum=xxx”来提高性能。它可以指定bucket存储桶的数量。例如指定“#bnum=1000000”，就可以将最新最热的100万条记录缓存在内存中：  
    ttserver -host 127.0.0.1 -port 11211 -thnum 8 -dmn -pid /ttserver/ttserver.pid -log /ttserver/ttserver.log -le -ulog /ttserver/ -ulim 128m -sid 1 -rts /ttserver/ttserver.rts /ttserver/database.tch\#bnum=1000000

如果大量的客户端访问ttserver，请确保文件描述符够用。许多服务器的默认文件描述符为1024，可以在启动ttserver前使用ulimit命令提高这项值。例如：  
    ulimit -SHn 51200

### 三、调用

1.任何Memcached客户端均可直接调用tokyotyrant。  

2.还可以通过HTTP方式调用，下面以Linux的curl命令为例，介绍如何操作tokyotyrant：

<li>写数据，将数据“value”写入到“key”中：</li>  
    curl -X PUT http://127.0.0.1:11211/key -d "value"
	
<li>读数据，读取“key”中数据：</li>  
    curl http://127.0.0.1:11211/key
	
<li>删数据，删除“key”：</li>  
    curl -X DELETE http://127.0.0.1:11211/key

