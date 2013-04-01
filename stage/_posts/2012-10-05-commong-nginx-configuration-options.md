---
layout: post
categories: [web开发]
date: 2012-10-05
title: "常见的nginx的配置选项"
description: "常见的nginx的配置选项"
tags: [nginx]
redirecturl: http://blog.jobbole.com/19043/
---
{% include JB/setup %}

英文原文：[agiletesting.blogspot.jp](http://agiletesting.blogspot.jp/2010/06/commong-nginx-configuration-options.html)，编译：[扶凯](http://www.php-oa.com/2012/04/01/commong-nginx-configuration-options.html)

对于想学  Nginx 的新人，这是一个非常不错的简明指导。

Google 上有丰富的 Nginx 的教程和样本配置文件，但很多时候时候，配置这些是需要一些技巧。

**Include 文件**

不要在您的主 nginx.conf文件中配置所有的东西,你需要分成几个较小的文件。您的同事会很感激你的。比如我的结构,我定义我的upstream 的 pool 的为一个文件，和一个文件定义 location 处理服务器上其它的应用。

例子：
 upstreams.conf

    upstream cluster1 {
     fair;
     server app01:7060;
     server app01:7061;
     server app02:7060;
     server app02:7061;
    }
    upstream cluster2 {
     fair;
     server app01:7071;
     server app01:7072;
     server app02:7071;
     server app02:7072;
    }

locations.conf

    location / {
     root /var/www;
     include cache-control.conf;
     index index.html index.htm;
    }
    location /services/service1 {
     proxy_pass_header Server;
     proxy_set_header Host $http_host;
     proxy_redirect off;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Scheme $scheme;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     add_header Pragma "no-cache";
     proxy_pass http://cluster1/;
    }
    location /services/service2 {
     proxy_pass_header Server;
     proxy_set_header Host $http_host;
     proxy_redirect off;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Scheme $scheme;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     add_header Pragma "no-cache";
     proxy_pass http://cluster2/service2;
    }

servers.conf

    server {
     listen 80;
     include locations.conf;
    }
现在，你的nginx.conf看起来非常的干净和简单（仍然可以分开更多,来更包括文件，比如分离gzip的配置选项)

    nginx.conf

    worker_processes 4;
    worker_rlimit_nofile 10240;
    events {
      worker_connections 10240;
      use epoll;
    }
    http {
      include upstreams.conf;
      include mime.types;
      default_type application/octet-stream;
      log_format custom '$remote_addr - $remote_user [$time_local] '
      '"$request" $status $bytes_sent '
      '"$http_referer" "$http_user_agent" "$http_x_forwarded_for" $request_time';
      access_log /usr/local/nginx/logs/access.log custom;
      proxy_buffering off;
      sendfile on;
      tcp_nopush on;
      tcp_nodelay on;
      gzip on;
      gzip_min_length 10240;
      gzip_proxied expired no-cache no-store private auth;
      gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/xml+rss image/svg+xml application/x-font-ttf application/vnd.ms-fontobject;
      gzip_disable "MSIE [1-6]\.";
      # proxy cache config
      proxy_cache_path /mnt/nginx_cache levels=1:2
      keys_zone=one:10m
      inactive=7d max_size=10g;
      proxy_temp_path /var/tmp/nginx_temp;
      proxy_next_upstream error;
      include servers.conf;
    }

这 nginx.conf 文件是使用了一些不太常见的配置选项，它值得指出其中一些重要的。

**多个 worker 的配置(进程)**

如果你的 Nginx 是多个 CPU 和多核,需要配置成多核的数量比较好:

    worker_processes 4;

**增加打开的文件句柄**

如果Nginx服务很大的流量,增加最大可以打开的文件句柄还是很有用的,因为默认只有1024个.可以使用 ‘ulimit -n’ 看到当前系统中的设置.

    worker_rlimit_nofile 10240;

**定制的日志**

可以看看 log\_format 和 access\_log 二个选项的设置.通常我们有几个参数最常使用,象 “\$http\_x\_forwarded\_for” 可以见到 load balancer 的设备之前的 IP, 还有 “\$request\_time” 可以见到 Nginx 来处理这个主动所花的时间.

**压缩**

压缩对于文本非常非常的有用.

    gzip on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/xml+rss image/svg+xml application/x-font-ttf application/vnd.ms-fontobject;
    gzip_disable "MSIE [1-6]\.";

**代理的选项**

这些选项可以在每个 location 中设置.

    proxy_pass_header Server;
    proxy_set_header Host $http_host;
    proxy_redirect off;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Scheme $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    add_header Pragma "no-cache";

这个中加了一个定制的参数,就是 ‘no-cache’,这样就不会使用 cache 的内容了.

**代理的 Cache**

使用 Nginx 可以给一些文件来 cache 到本地来当 Cache 的服务器,需要设置 proxy\_cache\_path 和 proxy\_temp\_path 在你的 HTTP 的 directive 中.在 location 中配置.如果有你想 cache 的内容的话.

    proxy_cache_path /mnt/nginx_cache levels=1:2
    keys_zone=one:10m
    inactive=7d max_size=10g;
    proxy_temp_path /var/tmp/nginx_temp;

这可能还想增加一些其它的参数

    proxy_cache one;
    proxy_cache_key mylocation.$request_uri;
    proxy_cache_valid 200 302 304 10m;
    proxy_cache_valid 301 1h;
    proxy_cache_valid any 1m;
    proxy_cache_use_stale error timeout invalid_header http_500 http_502 http_503 http_504 http_404;

**HTTP caching options**

有时你想使用其它的东西来做 Cache ,你可能需要指定怎么样 cache. 你可以给 cache 的信息的文件 include 到你的 root 的 location 中:

    location / {
     root /var/www;
     include cache-control.conf;
     index index.html index.htm;
    }

你可以指定不同的头到于不同的文件

    # default cache 1 day
    expires +1d;
    if ($request_uri ~* "^/services/.*$") {
     expires +0d;
     add_header Pragma "no-cache";
    }
    if ($request_uri ~* "^/(index.html)?$") {
     expires +1h;
    }

**SSL**

如果你要配置 ssl 的连接的话

    server {
     server_name www.example.com;
     listen 443;
     ssl on;
     ssl_certificate /usr/local/nginx/ssl/cert.pem;
     ssl_certificate_key /usr/local/nginx/ssl/cert.key;
     include locations.conf;
    }