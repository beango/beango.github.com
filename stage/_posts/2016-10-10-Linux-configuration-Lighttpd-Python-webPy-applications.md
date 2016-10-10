---
layout: post
category: default
date: 2016-10-10
title: "Linux配置Lighttpd+Python+web.py应用"
description: "Linux配置Lighttpd+Python+web.py应用"
tags: [shell]
redirecturl: http://www.liaoxuefeng.com/article/0013738925109653a9f5fe0a82c4984ba8e8174b456d0ce000
---

用web.py写了一个app，由于官方网站推荐Lighttpd+fastcgi模式部署，于是实践一把，在Debian
Squeeze Linux上成功安装了Lighttpd和基于web.py的应用。

服务器是Debian Sequeeze
Linux，首先安装Lighttpd和Python，Python默认版本是2.6：

```perl
# apt-get install lighttpd python
```

然后安装app使用的必要的Python包：

```perl
# apt-get install python-setuptools python-flup python-webpy python-mysqldb python-simplejson python-imaging
```

下一步是配置Lighttpd，由于web.py应用的入口是app.py，所以Lighttpd需要把请求通过fastcgi传给app.py，lighttpd.conf配置如下：

```perl
server.modules = (
  "mod_access",
  "mod_accesslog","mod_alias",
  "mod_compress","mod_fastcgi","mod_rewrite",)

server.document-root        = "/path/to/app/dir"
server.upload-dirs          = ( "/var/cache/lighttpd/uploads" )
server.errorlog             = "/var/log/lighttpd/error.log"
server.pid-file             = "/var/run/lighttpd.pid"
server.username             = "www-data"
server.groupname            = "www-data"

index-file.names            = ( "index.php", "index.html",
                                "index.htm", "default.htm",
                               " index.lighttpd.html" )

url.access-deny             = ( "~", ".inc" )

static-file.exclude-extensions = (".py", ".php", ".pl", ".fcgi" )

dir-listing.encoding        = "utf-8"
server.dir-listing          = "disable"
accesslog.filename          = "/var/log/lighttpd/access.log"
compress.cache-dir          = "/var/cache/lighttpd/compress/"
compress.filetype           = ( "text/css", "text/html" )
fastcgi.server = ( "/app.py" =>(( "socket" =>"/tmp/fastcgi.socket",
     "bin-path" =>"/path/to/app/dir/app.py",
     "max-procs" =>1,
     "check-local" =>"disable"
  ))
)

url.rewrite-once = (
  "^/$" =>"/index.html",
  "^/favicon.ico$" =>"/favicon.ico",
  "^/(.*)$" =>"/app.py/$1",
)
include_shell "/usr/share/lighttpd/create-mime.assign.pl"
```

主要的改动是红色部分，包括：

-   配置fastcgi，指向app.py；
-   配置rewrite，将\^/(.\*)\$指向/app.py/\$1；
-   添加了access log，默认居然没有！

你需要把/path/to/app/dir改为webpy app的所在目录。

最后一步是设置web.py应用的权限，必须确保app.py具有**可执行**权限。由于fastcgi进程以www-data用户身份运行，最佳配置是将目录owner改为www-data，这样pyc文件才能正确生成：

```perl
# chown -R www-data:www-data my-webpy-app
# chmod a+x my-webpy-app/app.py
```