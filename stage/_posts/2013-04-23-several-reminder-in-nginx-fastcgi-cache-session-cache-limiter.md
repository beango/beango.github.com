---
layout: post
categories: [ngnix]
date: 2013-04-23
title: "Nginx模块fastcgi_cache的几个注意点"
description: "Nginx模块fastcgi_cache的几个注意点"
tags: [ngnix]
redirecturl: http://www.cnxct.com/several-reminder-in-nginx-fastcgi_cache-and-php-session_cache_limiter/
---
{% include JB/setup %}

[伯乐](http://www.jobbole.com "伯乐")在线注：本文来自文章作者  [@CFC4N](http://weibo.com/cfc4nx?s=6cm7D0 "CFC4N")
的投稿（[原文链接](http://www.cnxct.com/several-reminder-in-nginx-fastcgi_cache-and-php-session_cache_limiter/)）。

在web项目中，大家都已经非常熟悉其架构流程了。都说Cache是万金油，哪里不舒服抹哪里。这些流程中，几乎每个环节都会进行cache。从[浏览器](http://blog.jobbole.com/12749/ "浏览器")到webserver，到cgi程序，到DB数据库，会进行浏览器cache，数据cache，SQL查询的cache等等。对于fastcgi这里的cache，很少被使用。去年年底，我对nginx的[fastcgi\_cache](http://wiki.nginx.org/HttpFastcgiModule "Fastcgi_cache的WIKI")进行摸索使用。在我的测试过程中，发现一些wiki以及网络上没被提到的注意点，这里分享一下。

[![从浏览器到数据库的流程图](http://www.cnxct.com/wp-content/uploads/2013/02/browser-nginx-php-db-300x168.png)](http://www.cnxct.com/wp-content/uploads/2013/02/browser-nginx-php-db.png "Nginx模块fastcgi_cache的几个注意点")

从浏览器到数据库的流程图

这里是我的NGinx配置信息

1

2

3

4

5

6

7

8

9

10

11

12

13

`#增加调试信息`{.text .plain}

`add_header X-Cache-CFC "$upstream_cache_status - $upstream_response_time";`{.text
.plain}

`fastcgi_temp_path /dev/shm/nginx_tmp;`{.text .plain}

 

`#cache设置`{.text .plain}

`fastcgi_cache_path   /dev/shm/nginx_cache  levels=1:2 keys_zone=cfcache:10m inactive=50m;`{.text
.plain}

`fastcgi_cache_key "$request_method://$host$request_uri";`{.text .plain}

`fastcgi_cache_methods GET HEAD;`{.text .plain}

`fastcgi_cache   cfcache;`{.text .plain}

`fastcgi_cache_valid   any 1d;`{.text .plain}

`fastcgi_cache_min_uses  1;`{.text .plain}

`fastcgi_cache_use_stale error  timeout invalid_header http_500;`{.text
.plain}

`fastcgi_ignore_client_abort on;`{.text .plain}

配置这些参数时，注意每个参数的作用域，像fastcgi\_cache\_path参数，只能在http配置项里配置，而fastcgi\_cache\_min\_uses这个参数，可以在http、server、location三个配置项里配置。这样更灵活的会每个域名、每个匹配的location进行选择性cache了。具体的参数作用域，参考[FASTCGI模块的官方WIKI](http://wiki.nginx.org/HttpFastcgiModule "Nginx HttpFastcgiModule模块wiki")。我为了调试方便，添加了一个『X-Cache-CFC』的http响应头，[\$upstream\_cache\_status ](http://wiki.nginx.org/HttpUpstreamModule "Nginx HttpUpstreamModule模块的WIKI")变量表示此请求响应来自cache的状态，分别为：

-   MISS 未命中
-   EXPIRED – expired, request was passed to backend Cache已过期
-   UPDATING – expired, stale response was used due to
    proxy/fastcgi\_cache\_use\_stale updating
    Cache已过期，(被其他nginx子进程)更新中
-   STALE – expired, stale response was used due to
    proxy/fastcgi\_cache\_use\_stale Cache已过期，响应数据不合法，被污染
-   HIT 命中cache

[![FASTCGI\_CACHE \$upstream\_cache\_status
结果为miss，一次也没命中](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_miss_session_start-300x128.png)](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_miss_session_start.png "Nginx模块fastcgi_cache的几个注意点")

FASTCGI\_CACHE \$upstream\_cache\_status 结果为miss，一次也没命中

程序代码是Discuz!论坛，
随便开启测试了几下，发现/dev/shm/nginx\_cache/下没有任何目录建立，也没有文件创建。调试的http
header响应头里的X-Cache-CFC 结果一直是MISS。从服务器进程上来看，Nginx
cache manager process 跟Nginx cache loader process 进程也正常运行：

1

2

3

4

`root      3100     1  0 14:52 ?        00:00:00 nginx: master process `{.shell
.plain}`/usr/sbin/nginx`{.shell .plain}

`www-data  3101  3100  0 14:52 ?        00:00:00 nginx: worker process`{.shell
.plain}

`www-data  3102  3100  0 14:52 ?        00:00:00 nginx: cache manager process`{.shell
.plain}

`www-data  3103  3100  0 14:52 ?        00:00:00 nginx: cache loader process`{.shell
.plain}

不知道为何会这样，为何没有cache成功，我以为我配置参数有问题，只好阅读WIKI。发现fastcgi\_ignore\_headers
参数下解释有这么一段

> fastcgi\_ignore\_headers\
>  Syntax: fastcgi\_ignore\_headers field …\
>  Default:\
>  Context: http\
>  server\
>  location\
>  Reference: fastcgi\_ignore\_headers
>
> This directive forbids processing of the named headers from the
> FastCGI-server reply. It is possible to specify headers like
> “X-Accel-Redirect”, “X-Accel-Expires”, “Expires” or “Cache-Control”.

也就是说这个参数的值，将会被忽略掉，同样被忽略掉的响应头比如”X-Accel-Redirect”,
“X-Accel-Expires”, “Expires” or
“Cache-Control”，而nginx配置中并没有fastcgi\_ignore\_headers参数的设定，那么问题会不会出现在FASTCGI响应结果里包含了类似”X-Accel-Redirect”,
“X-Accel-Expires”, “Expires” or
“Cache-Control”这几个响应头呢？用strace抓包，看了下nginx与fpm进程通讯的数据

1

2

3

4

5

6

`####为了确保准确抓到处理该http请求的进程，我把nginx 、fpm都只开启了一个进程处理。`{.shell
.comments}

`//strace`{.shell .plain}
`-ff -tt -s 1000 -o xxx.log -p PHPFPM-PID`{.shell .plain}

`14:52:07.837334 write(3, `{.shell
.plain}`"\1\6\0\1\0\343\5\0X-Powered-By: PHP/5.3.10-1ubuntu3.5\r\nExpires: Thu, 19 Nov 1981 08:52:00 GMT\r\nCache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0\r\nPragma: no-cache\r\nContent-type: text/html\r\n\r\nHello cfc4n1362034327\0\0\0\0\0\1\3\0\1\0\10\0\0\0\0\0\0\0\0\0\0"`{.shell
.string}`, 256) = 256`{.shell .plain}

 

`//strace`{.shell .plain}
`-ff -tt -s 1000 -o xxx.log -p Nginx-PID`{.shell .plain}

`15:05:13.265663 recvfrom(12, `{.shell
.plain}`"\1\6\0\1\0\343\5\0X-Powered-By: PHP/5.3.10-1ubuntu3.5\r\nExpires: Thu, 19 Nov 1981 08:52:00 GMT\r\nCache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0\r\nPragma: no-cache\r\nContent-type: text/html\r\n\r\nHello cfc4n1362035113\0\0\0\0\0\1\3\0\1\0\10\0\0\0\0\0\0\0\0\0\0"`{.shell
.string}`, 4023, 0, NULL, NULL) = 256`{.shell .plain}

从抓取的数据包里可以看到，fpm确实返回了包含“Expires”、“Cache-Control”头的http
响应头信息。那么疑问来了：

-   nginx的fastcgi\_cache没缓存这条http响应，是因为响应头里包含“Expires”、“Cache-Control”的原因吗？
-   程序里并没有输出“Expires”、“Cache-Control” http
    header的代码，这是谁输出的呢？
-   既然是fpm响应的时候，就已经有了，那么是php的core模块，还是其他拓展模块输出的？
-   “Expires:”时间为何是“**Thu, 19 Nov 1981 08:52:00 GMT**”?

疑问比较多，一个一个查起，先从Nginx的fastcgi\_cache没缓存这条http响应查起。我根据测试环境nginx版本1.1.9(ubuntu
12.04默认的)，到nginx官方下了对应版本的源码，搜索了fastcgi参数使用的地方，在httpngx\_http\_upstream.c找到了。虽然不能很流程的读懂nginx的代码，但粗略的了解，根据了解的情况加以猜测，再动手测试实验，也得出了结论，确定了nginx的fastcgi\_cache的规则。

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

38

39

40

41

42

43

44

45

46

47

48

49

50

51

52

53

54

55

56

57

58

59

60

61

62

63

64

65

66

67

68

69

70

71

72

73

74

75

76

`//ngx_http_upstream.c`{.c .comments}

`//line 3136  当fastcgi响应包含set-cookie时，不缓存`{.c .comments}

`static`{.c .keyword .bold} `ngx_int_t`{.c .plain}

`ngx_http_upstream_process_set_cookie(ngx_http_request_t *r, ngx_table_elt_t *h,`{.c
.plain}

`    `{.c .spaces}`ngx_uint_t offset)`{.c .plain}

`{`{.c .plain}

`#if (NGX_HTTP_CACHE)`{.c .preprocessor}

`    `{.c .spaces}`ngx_http_upstream_t  *u;`{.c .plain}

 

`    `{.c .spaces}`u = r->upstream;`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold}
`(!(u->conf->ignore_headers & NGX_HTTP_UPSTREAM_IGN_SET_COOKIE)) {`{.c
.plain}

`        `{.c .spaces}`u->cacheable = 0;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

`#endif`{.c .preprocessor}

 

`    `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`}`{.c .plain}

 

`//line 3242 当响应头包含Expires时，如果过期时间大于当前服务器时间，则nginx_cache会缓存该响应，否则，则不缓存`{.c
.comments}

`static`{.c .keyword .bold} `ngx_int_t`{.c .plain}

`ngx_http_upstream_process_expires(ngx_http_request_t *r, ngx_table_elt_t *h,`{.c
.plain}

`    `{.c .spaces}`ngx_uint_t offset)`{.c .plain}

`{`{.c .plain}

`    `{.c .spaces}`ngx_http_upstream_t  *u;`{.c .plain}

 

`    `{.c .spaces}`u = r->upstream;`{.c .plain}

`    `{.c .spaces}`u->headers_in.expires = h;`{.c .plain}

 

`#if (NGX_HTTP_CACHE)`{.c .preprocessor}

`    `{.c .spaces}`{`{.c .plain}

`    `{.c .spaces}`time_t`{.c .color1 .bold}  `expires;`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold}
`(u->conf->ignore_headers & NGX_HTTP_UPSTREAM_IGN_EXPIRES) {`{.c .plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold} `(r->cache == NULL) {`{.c
.plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold}
`(r->cache->valid_sec != 0) {`{.c .plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c
.spaces}`expires = ngx_http_parse_time(h->value.data, h->value.len);`{.c
.plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold}
`(expires == NGX_ERROR || expires < ngx_time()) {         u->cacheable = 0;`{.c
.plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c .spaces}`r->cache->valid_sec = expires;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

`#endif`{.c .preprocessor}

 

`    `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`}`{.c .plain}

 

`//line 3199  当响应头包含Cache-Control时，#####如果####这里有如果啊。。。`{.c
.comments}

`//【注意】如果Cache-Control参数值为no-cache、no-store、private中任意一个时，则不缓存...不缓存...`{.c
.comments}

`//【注意】如果Cache-Control参数值为max-age时，会被缓存，且nginx设置的cache的过期时间，就是系统当前时间 + mag-age的值`{.c
.comments}

`    `{.c .spaces}`if`{.c .keyword .bold}
`(ngx_strlcasestrn(p, last, (u_char *) `{.c .plain}`"no-cache"`{.c
.string}`, 8 - 1) != NULL`{.c .plain}

`        `{.c .spaces}`|| ngx_strlcasestrn(p, last, (u_char *) `{.c
.plain}`"no-store"`{.c .string}`, 8 - 1) != NULL`{.c .plain}

`        `{.c .spaces}`|| ngx_strlcasestrn(p, last, (u_char *) `{.c
.plain}`"private"`{.c .string}`, 7 - 1) != NULL)`{.c .plain}

`    `{.c .spaces}`{`{.c .plain}

`        `{.c .spaces}`u->cacheable = 0;`{.c .plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c .spaces}`p = ngx_strlcasestrn(p, last, (u_char *) `{.c
.plain}`"max-age="`{.c .string}`, 8 - 1);`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold} `(p == NULL) {`{.c .plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `NGX_OK;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

`    `{.c .spaces}`...`{.c .plain}

`    `{.c .spaces}`r->cache->valid_sec = ngx_time() + n;`{.c .plain}

也就是说，fastcgi响应http请求的结果中，响应头包括Expires、Cache-Control、Set-Cookie三个，都会可能不被cache，但不只有这些，别忘了nginx配置中fastcgi\_ignore\_headers参数设定的部分。以及ngxin的[X-ACCEL](http://wiki.nginx.org/X-accel "X-Accel-Redirect、X-Accel-Expires等nginx自定义的响应头") X-Accel-Redirect、X-Accel-Expires、X-Accel-Charset、X-Accel-Buffering等nginx自定义的响应头。由于这几个不常用，我也没深入研究。通过对nginx的ngx\_http\_upstream模块代码模糊理解，加猜测，以及写了脚本测试验证，可以得到结论是正确的。即Nginx
fastcgi\_cache在缓存后端fastcgi响应时，当响应里包含“set-cookie”时，不缓存;当响应头包含Expires时，如果过期时间大于当前服务器时间，则nginx\_cache会缓存该响应，否则，则不缓存;当响应头包含Cache-Control时，如果Cache-Control参数值为no-cache、no-store、private中任意一个时，则不缓存，如果Cache-Control参数值为max-age时，会被缓存，且nginx设置的cache的过期时间，就是系统当前时间
+ mag-age的值。

[![nginx fastcgi\_cache
响应expired](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_expired-300x110.png)](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_expired.png "Nginx模块fastcgi_cache的几个注意点")

nginx fastcgi\_cache 响应expired

[![nginx fastcgi\_cache
hit命中](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_hit-300x127.png)](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_hit.png "Nginx模块fastcgi_cache的几个注意点")

nginx fastcgi\_cache hit命中

[![FASTCGI\_CACHE \$upstream\_cache\_status
结果为miss，一次也没命中。](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_miss-300x141.png)](http://www.cnxct.com/wp-content/uploads/2013/02/fastcgi_cache_miss.png "Nginx模块fastcgi_cache的几个注意点")

FASTCGI\_CACHE \$upstream\_cache\_status 结果为miss，一次也没命中。

1

2

3

4

5

6

7

8

9

10

`//逐个测试，测试时，注释其他的`{.php .comments}

`header(`{.php .plain}`"Expires: "`{.php .string}`.`{.php
.plain}`gmdate`{.php .functions}`(`{.php .plain}`"D, d M Y H:i:s"`{.php
.string}`, time()+10000).`{.php .plain}`' GMT'`{.php .string}`);`{.php
.plain}

`header(`{.php .plain}`"Expires: "`{.php .string}`.`{.php
.plain}`gmdate`{.php .functions}`(`{.php .plain}`"D, d M Y H:i:s"`{.php
.string}`, time()-99999).`{.php .plain}`' GMT'`{.php .string}`);`{.php
.plain}

`header(`{.php .plain}`"X-Accel-Expires:30"`{.php .string}`);`{.php
.plain}

`header(`{.php .plain}`"Cache-Control: no-cache"`{.php .string}`);`{.php
.plain}

`header(`{.php .plain}`"Cache-Control: no-store"`{.php .string}`);`{.php
.plain}

`header(`{.php .plain}`"Cache-Control: private"`{.php .string}`);`{.php
.plain}

`header(`{.php .plain}`"Cache-Control: max-age=10"`{.php
.string}`);`{.php .plain}

`setcookie(`{.php .plain}`'cfc4n'`{.php .string}`,`{.php
.plain}`"testaaaa"`{.php .string}`);`{.php .plain}

`echo`{.php .functions} `'Hello cfc4n'`{.php .string}`,time();`{.php
.plain}

到了这里，疑问1解决了。那么疑问2、3呢？程序里并没有输出“Expires”、“Cache-Control”
http
header的代码，这是谁输出的呢？既然是fpm响应的时候，就已经有了，那么是php的core模块，还是其他拓展模块输出的？我精简了代码，只输出一个“hello
world”，发现也确实被缓存了。显然，php脚本程序中并没输出http header
的“Expires”、“Cache-Control”，多次测试，最终定位到session\_start函数，翻阅源码找到了这些代码：

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

38

39

40

41

42

43

44

45

46

47

48

49

50

51

52

53

54

55

56

57

`//ext/session/session.c  line:1190 左右`{.c .comments}

`// ...`{.c .comments}

`CACHE_LIMITER_FUNC(`{.c .plain}`private`{.c .keyword .bold}`) `{.c
.plain}`/* {{{ */`{.c .comments}

`{`{.c .plain}

`    `{.c .spaces}`ADD_HEADER(`{.c
.plain}`"Expires: Thu, 19 Nov 1981 08:52:00 GMT"`{.c .string}`);`{.c
.plain}

`    `{.c .spaces}`CACHE_LIMITER(private_no_expire)(TSRMLS_C);`{.c
.plain}

`}`{.c .plain}

`/* }}} */`{.c .comments}

`//再到这里3 或者上面几个 ##默认是nocache`{.c .comments}

`CACHE_LIMITER_FUNC(nocache) `{.c .plain}`/* {{{ */`{.c .comments}

`{`{.c .plain}

`    `{.c .spaces}`ADD_HEADER(`{.c
.plain}`"Expires: Thu, 19 Nov 1981 08:52:00 GMT"`{.c .string}`);`{.c
.plain}

 

`    `{.c
.spaces}`/* For HTTP/1.1 conforming clients and the rest (MSIE 5) */`{.c
.comments}

`    `{.c .spaces}`ADD_HEADER(`{.c
.plain}`"Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0"`{.c
.string}`);`{.c .plain}

 

`    `{.c .spaces}`/* For HTTP/1.0 conforming clients */`{.c .comments}

`    `{.c .spaces}`ADD_HEADER(`{.c .plain}`"Pragma: no-cache"`{.c
.string}`);`{.c .plain}

`}`{.c .plain}

`/* }}} */`{.c .comments}

`//这里2`{.c .comments}

`static`{.c .keyword .bold}
`php_session_cache_limiter_t php_session_cache_limiters[] = {`{.c
.plain}

`    `{.c .spaces}`CACHE_LIMITER_ENTRY(`{.c .plain}`public`{.c .keyword
.bold}`)`{.c .plain}

`    `{.c .spaces}`CACHE_LIMITER_ENTRY(`{.c .plain}`private`{.c .keyword
.bold}`)`{.c .plain}

`    `{.c .spaces}`CACHE_LIMITER_ENTRY(private_no_expire)`{.c .plain}

`    `{.c .spaces}`CACHE_LIMITER_ENTRY(nocache)`{.c .plain}

`    `{.c .spaces}`{0}`{.c .plain}

`};`{.c .plain}

 

`static`{.c .keyword .bold} `int`{.c .color1 .bold}
`php_session_cache_limiter(TSRMLS_D) `{.c .plain}`/* {{{ */`{.c
.comments}

`{`{.c .plain}

`    `{.c .spaces}`php_session_cache_limiter_t *lim;`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold} `(PS(cache_limiter)[0] == `{.c
.plain}`'\0'`{.c .string}`) `{.c .plain}`return`{.c .keyword .bold}
`0;`{.c .plain}

 

`    `{.c .spaces}`if`{.c .keyword .bold} `(SG(headers_sent)) {`{.c
.plain}

`        `{.c .spaces}`const`{.c .keyword .bold} `char`{.c .color1
.bold}
`*output_start_filename = php_output_get_start_filename(TSRMLS_C);`{.c
.plain}

`        `{.c .spaces}`int`{.c .color1 .bold}
`output_start_lineno = php_output_get_start_lineno(TSRMLS_C);`{.c
.plain}

 

`        `{.c .spaces}`if`{.c .keyword .bold}
`(output_start_filename) {`{.c .plain}

`            `{.c
.spaces}`php_error_docref(NULL TSRMLS_CC, E_WARNING, `{.c
.plain}`"Cannot send session cache limiter - headers already sent (output started at %s:%d)"`{.c
.string}`, output_start_filename, output_start_lineno);`{.c .plain}

`        `{.c .spaces}`} `{.c .plain}`else`{.c .keyword .bold} `{`{.c
.plain}

`            `{.c
.spaces}`php_error_docref(NULL TSRMLS_CC, E_WARNING, `{.c
.plain}`"Cannot send session cache limiter - headers already sent"`{.c
.string}`);`{.c .plain}

`        `{.c .spaces}`}`{.c .plain}

`        `{.c .spaces}`return`{.c .keyword .bold} `-2;`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c .spaces}`for`{.c .keyword .bold}
`(lim = php_session_cache_limiters; lim->name; lim++) {`{.c .plain}

`        `{.c .spaces}`if`{.c .keyword .bold}
`(!strcasecmp(lim->name, PS(cache_limiter))) {`{.c .plain}

`            `{.c .spaces}`lim->func(TSRMLS_C);   `{.c
.plain}`//这里1`{.c .comments}

`            `{.c .spaces}`return`{.c .keyword .bold} `0;`{.c .plain}

`        `{.c .spaces}`}`{.c .plain}

`    `{.c .spaces}`}`{.c .plain}

 

`    `{.c .spaces}`return`{.c .keyword .bold} `-1;`{.c .plain}

`}`{.c .plain}

`// ...`{.c .comments}

到了这里，知道原因了，是程序调用session\_start时，php的session拓展自己输出的。session.cache\_limit参数来决定输出包含哪种Expires的header，默认是nocache，修改php.ini的session.cache\_limit参数为“none”即可让session模块不再输出这些http
响应头。或在调用session\_start之前，使用session\_cache\_limiter函数来指定下该参数值。那为什么要在使用session时，发Expires、Cache-Control的http
response
header呢？我猜测了下，需要session时，基本上是用户跟服务器有交互，那么，既然有交互，就意味着用户的每次交互结果也可能不一样，就不能cache这个请求的结果，给返回给这个用户。同时，每个用户的交互结果都是不一样的，nginx也就不能把包含特殊Cache-Control的个人响应cache给其他人提供了。

还有一个无聊的问题**“Expires:时间为何是Thu, 19 Nov 1981 08:52:00
GMT”**？我翻阅了session.c这段代码的添加时间，版本，作者信息，在php官方版本库中找到了[这次提交的信息](http://svn.php.net/viewvc/php/php-src/trunk/ext/session/session.c?view=log&log_pagestart=400)：

> Revision 17092 – (view) (download) (as text) (annotate) – [select for
> diffs]\
>  Modified Sun Dec 12 14:16:55 1999 UTC (13 years, 2 months ago) by
> sas\
>  File length: 28327 byte(s)\
>  Diff to previous 16964\
>  Add cache\_limiter and cache\_expire options. Rename
> extern\_referer\_check\
>  to referer\_check.

对比[session.c两个版本](http://svn.php.net/viewvc/php/php-src/trunk/ext/session/session.c?r1=16964&r2=17092 "session.c增加session.cache_limiter参数")的变更，果然是这块代码。作者是sas，也就是[Sascha
Schumann](http://schumann.cx/)， [http://php.net/credits.php](http://php.net/credits.php "php credits")里可以看到他的大名。关于这个expires过期时间的问题，有人在stackoverflow也提问过，[Why
is “Expires”
1981?](http://stackoverflow.com/questions/8194481/why-is-expires-1981 "Why is “Expires” 1981?")，别人说那天是他生日。这是真的么？如果那天是他生日的话，而他增加session.cache\_limiter时是1999年，他才17岁，17岁呀。我17岁时在干嘛？还不知道电脑长啥样，正在玩『超级玛丽』呢。

好奇的不是我一个人，还有个帖子是[epoch date — Expires: Thu, 19 Nov 1981
08:52:00](http://bytes.com/topic/php/answers/540207-epoch-date-expires-thu-19-nov-1981-08-52-00-a "epoch date -- Expires: Thu, 19 Nov 1981 08:52:00")也问了。另外两个地址虽然没问，也有人提到那天是他生日了。[http://boinc.berkeley.edu/dev/forum\_thread.php?id=2514](http://boinc.berkeley.edu/dev/forum_thread.php?id=2514)、[https://github.com/codeguy/Slim/issues/157](https://github.com/codeguy/Slim/issues/157)，这些帖子都提到说原帖是http://www.phpbuilder.com/lists/php3-list/199911/3159.php
，我无法访问，被跳转到首页了。用http://web.archive.org找到了[历史快照](http://web.archive.org/web/20120315000650/http://www.phpbuilder.com/lists/php3-list/199911/3159.php)，发现上下文关系不大，也不能证明是他生日。
我更是好奇的发了两封邮件到他的不同邮箱里问他，不过，目前他还没回复。或许他没收到、没看到，或许懒得回了。N年后，**“Expires:时间为何是Thu,
19 Nov 1981 08:52:00 GMT”**这个日期，会不会又成了一段奇闻佳话了呢？

 
