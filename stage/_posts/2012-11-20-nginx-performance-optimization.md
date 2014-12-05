---
layout: post
category: default
date: 2012-11-20
title: "nginx性能优化"
description: "nginx性能优化"
tags: [nginx, linux]
redirecturl: http://www.dbasky.net/archives/2009/12/nginx.html
---
{% include JB/setup %}

作者：[Mike.Xu](http://www.dbasky.net) 发表于: December 28, 2009 9:09 PM

[](http://creativecommons.org/licenses/by/2.5/cn/)转载时请务必以超链接形式标明文章[原始出处](http://www.dbasky.net/archives/2009/12/nginx.html)和作者信息及[本版权声明](http://www.dbasky.net/archives/2009/12/nginx.html)。

链接：[http://www.dbasky.net/archives/2009/12/nginx.html](http://www.dbasky.net/archives/2009/12/nginx.html)

**操作系统**：CentOS 5.3

**nginx**的安装就不详细介绍了,请大家移步到我以前写的二篇文章

[Ngin＋php搭建高性能web服务器](http://www.dbasky.net/archives/2009/03/nginphp-web.html)

[搭建nginx + python + django +memcached+ mysql +fastcgi环境](http://www.dbasky.net/archives/2009/08/nginx-python-django-memcached-mysql-fastcgi.html)

1.编译安装

    ./configure --with-poll_module --with-http_ssl_module
    --with-http_gzip_static_module --with-http_perl_module
    --with-md5=/usr/include --with-md5-asm --with-sha1=/usr/include
    --with-sha1-asm
    make
    make install

2.制作SSL证书

生成CA证书

    openssl req -days 3650 -nodes -new -x509 -keyout ca.key -out ca.pem -config OpenSSL.cnf

生成自签名ssl证书

    openssl req -days 3650 -nodes -new -keyout cert.key -out cert.pem -config OpenSSL.cnf

对证书进行签名

    openssl ca -days 3650 -out cert.pem -in cert.pem -extensions server -config OpenSSL.cnf

3.配置优化

修改nginx.conf,工作进程10个，使用epoll事件模型，并发连接使用默认的1024个，启用gzip动态和静态压缩。

    worker_processes 10;

    events {
      use epoll;
      worker_connections 1024;
    }

    http {
        gzip  on;
        gzip_static on;
     
        gzip_comp_level     9;
        gzip_min_length     1k;
        gzip_proxied        any;
        gzip_types          text/plain text/xml application/xml application/xml+rss;
        #gzip_disable        "MSIE [1-6] \.";
        #gzip_vary           on;
    }

复制cert.key和cert.pem到conf目录，去掉HTTPS server下面的注释，启用SSL。

4.启用php
下载安装spawn-fcgi，建立/tmp/php-fcgi.sock的连接，并添加nginx配置。

    location ~ \.php$ {
        root           html;
        fastcgi_pass   unix:/tmp/php-fcgi.sock;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        fastcgi_param  PATH_INFO        $fastcgi_path_info;
        fastcgi_param  PATH_TRANSLATED  $document_root$fastcgi_path_info;
        include        fastcgi_params;
    }

下载安装APC、eAccelerator为php加速。

建立缓存目录

    mkdir /var/tmp/eaccelerator

eAccelerator配置

    [eAccelerator]
    zend_extension_ts = "/usr/lib/php5/ext/eAccelerator.so"
    eaccelerator.shm_size = "16"
    eaccelerator.cache_dir = "/var/tmp/eaccelerator"
    eaccelerator.enable = "1"
    eaccelerator.optimizer = "1"
    eaccelerator.check_mtime = "1"
    eaccelerator.debug = "0"
    eaccelerator.filter = ""
    eaccelerator.shm_max = "0"
    eaccelerator.shm_ttl = "0"
    eaccelerator.shm_prune_period = "0"
    eaccelerator.shm_only = "0"
    eaccelerator.compress = "1"
    eaccelerator.compress_level = "9"

5.启动nginx

运行命令

    sudo spawn-fcgi -f /usr/bin/php-cgi -s /tmp/php-fcgi.sock -F 2 -u nobody
    sudo /usr/local/nginx/sbin/nginx

为了方便管理，使用如下脚本，保存为nginx，放到/etc/init.d目录

    #! /bin/sh
    #
    # nginx daemon script
    #

    PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
    DAEMON=/usr/local/nginx/sbin/nginx
    NAME=nginx
    PIDFILE=/usr/local/nginx/logs/$NAME.pid
    PHPSOCKET=/tmp/php-fcgi.sock
    PHPPIDFILE=/tmp/run/php-fcgi.pid
    PHPSPAWN="spawn-fcgi -f /usr/bin/php-cgi -s $PHPSOCKET -P $PHPPIDFILE -F 2 -u nobody"

    test -x $DAEMON || exit 0

    set -e

    case "$1" in
      start)
    echo "Starting $NAME."
    $DAEMON
    $PHPSPAWN
    ;;

      stop)
    echo "Stopping $NAME."
    $DAEMON -s stop
    kill `cat $PHPPIDFILE`
    rm -f $PHPSOCKET $PHPPIDFILE
    ;;

      restart)
    echo "Restarting $NAME."
    $DAEMON -s reopen
    kill `cat $PHPPIDFILE`
    rm -f $PHPSOCKET $PHPPIDFILE
    $PHPSPAWN
    ;;

      reload)
        if [ ! -f $PIDFILE ]; then
          echo "nginx not started."
          exit 1
        fi
        echo "Reloading $NAME."
        $DAEMON -s reload
        ;;

      test)
        $DAEMON -t
        ;;

      *)
    N=/etc/init.d/$NAME
    echo "Usage: $N start|stop|restart|reload|test" >&2
    exit 1
    ;;
    esac

    exit 0 
