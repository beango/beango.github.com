---
layout: post
category: default
date: 2013-06-20
title: "使用 Varnish 加速你的 Web 网站"
description: "使用 Varnish 加速你的 Web 网站"
tags: [varnish, nginx]
redirecturl: http://www.oschina.net/translate/speed-your-web-site-varnish
---


Varnish可以有效降低web服务器的负载，提升访问速度。根据官方的说法，Varnish是一个cache型的HTTP反向代理。

按照HTTP协议的处理过程，web服务器接受请求并且返回处理结果，理想情况下服务器要在不做额外处理的情况下，立即返回结果，但实际情况并非如此。本文将分析在web服务器处理请求的过程中，Varnish能起到什么作用。

web服务器的实现千差万别，但典型的处理过程是相同的，都要经过一系列的步骤来处理接收到的每个请求。有可能需要启动一个进程来处理请求，有可能需要从磁盘上载入文件，或者启动内部线程来编译执行一些脚本。在执行脚本的过程中，还会有进行很多别的动作，比如进行数据库查询，读取文件等等。当成百上千个请求并发访问时，服务器的负载会很快上升，出现系统资源不够的情况。一种更糟的情况是，很多请求是重复的，但web服务器无法记住曾经作出的响应，还会重复上面复杂的处理过程。

当把Varnish部署上之后，web请求的处理过程会有一些变化。客户端的请求将首先被Varnish接受。Varnish将分析接收的请求，并将其转发到后端的web服务器上。后端的web服务器对请求进行常规的处理，并将依次将处理结果返回给Varnish。

但Varnish的功能并非仅限于此。Varnish的核心功能是能能将后端web服务器返回的结果缓存起来，如果发现后续有相同的请求，Varnish将不会将这个请求转发到web服务器，而是返回缓存中的结果。这将有效的降低web服务器的负载，提升响应速度，并且每秒可以响应更多的请求。Varnish速度很快的另一个主要原因是其缓存全部都是放在内存里的，这比放在磁盘上要快的多。诸如此类的优化措施使得Varnish的相应速度超乎想象。但考虑到实际的系统中内存一般是有限的，所以需要手工配置一下缓存的空间限额，同时避免缓存重复的内容。

下面来看一下Varnish的安装过程。可以从源码进行安装，也可以直接使用一些发行版中的预编译包。当期Varnish的版本是3.0.3（译者注：目前最新是2013年6月17日发布的3.0.4版），本文将基于3.0.3进行源码安装。需要注意的是，2.X版的Varnish和3.X的配置文件格式发生了变化。可以从Varnish的[官方网站](https://www.varnish-cache.org/docs/3.0/installation/upgrade.html)上找到2.x到3.x升级的细节。

从源码进行安装经常遇到的问题是系统缺少某些依赖的文件。可以从Varnish的[安装文档](https://www.varnish-cache.org/docs/3.0/installation/install.html#compiling-varnish-from-source)里找到编译所需的所有依赖的文件。

以root身份运行如下命令来下载和安装Varnish。

    cd /var/tmp
    wget http://repo.varnish-cache.org/source/varnish-3.0.3.tar.gz
    tar xzf varnish-3.0.3.tar.gz
    cd varnish-3.0.3
    sh autogen.sh
    sh configure
    make
    make test
    make install

Vanish将安装在/usr/local目录下。主程序的完整路径为：/usr/local/sbin/varnishd，默认的配置文件为：/usr/local/etc/varnish/default.vcl

在运行varnishd之前，需要先配置后端的web服务器，参照如下格式编辑default.vcl文件，更改为你自己web服务器配置。

    backend default {
        .host = "127.0.0.1";
        .port = "80";
    }

用如下命令启动Varnishd：

    /usr/local/sbin/varnishd -f /usr/local/etc/varnish/default.vcl -a :6081 -P /var/run/varnish.pid -s malloc,256m

执行完毕后，Varnish将进入后台运行，同时返回命令行状态。需要注意的是，Varnish运行时会同时启动两个进程，一个主进程，一个是子进程，如果子进程出现问题，主进程将重新生成一个子进程。

### Varnishd 的启动选项

-f : 指定配置文件位置

-a : varnish监听的本地地址和端口。

-P :PID文件位置，用来关闭Varnish

-s :cache配置。默认使用256M内存

如果从一些包管理器来安装varnish，可能安装完毕后就会自动运行。这种情况下需要先停掉它。并使用上述命令选项来运行。否则一些配置可能和本文例子中的不同了。可以用下面的命令来检查varnish的运行情况和配置。

    /usr/bin/pgrep -lf varnish

启动完毕之后，Varnish就可以处理并转发请求了。在转发过程中，varnish会尽可能的缓存结果。我们通过下面几个简单的GET请求，来看看varnish是如何工作的。首先，运行如下命令：

    /usr/local/bin/varnishlog
    /usr/local/bin/varnishstat

下面的GET命令是perl的libwww-perl中的。使用这个命令可以看到varnish返回的HTTP响应的细节。如果你的系统里没有安装libwww-perl，也可以使用Firefox中live HTTP Headers扩展，或者使用其他类似工具也可以。

    GET -Used http://localhost:6081/

![]({{ site.JB.FILE_PATH }}/2013-06/20080236_hM8L.png)

在这里GET命令的选项无所谓。需要注意的是varnish返回的响应，varnish会增加三个相应头信息，分别是“X-Varnish”、“Via”和“Age”。这些头信息在Varnish的处理过程中非常有用。X-Varnish头信息的后面会有一个或两个数字，如果是一个数字，就表明varnish在缓存中没有发现这个请求，这个数字的含义是varnish为这个请求所做的标记ID。如果X-Varnish后是两个数字，就表明varnish在缓存中命中了这个请求，第一个数字是请求的标识ID，第二个数字是缓存的标识ID。“Via”头信息表明这个请求将经过一个代理。“Age”头信息标识出这个请求将被缓存多长时间（单位：秒）。首次请求的“Age”为0，后续的重复请求将会使Age值增大。如果后续的请求没有是“Age”增加，那就说明varnish没有缓存这个响应的结果。

现在来看看 varnishstat 命令启动执行的情况，如下图所示：

![]({{ site.JB.FILE_PATH }}/2013-06/20080237_w5ic.png)

图2. varnishstat 命令

最重要的是 cache\_hit 和 cache\_miss这两行。如果没有任何命中，cache\_hits不会显示。当越来越多的请求进来，计数器会不断更新以反应新的命中数和未命中数。

接下来看看 varnishlog 命令：

![]({{ site.JB.FILE_PATH }}/2013-06/20080238_inKm.png)

图3. varnishlog 命令

上图显示varnish接受请求并作出响应的内部细节，下面是varnish官方文档中的解释：

> 第一列是一个乱数，用来标识当前请求。第一列数字相同的行属于一HTTP请求序列。第二列是日志信息的标签，所有的日志信息会分类标记，以“Rx”开头的为接收的数据，以“Tx”开头的为发送的数据。第三列表示数据在客户端，vainish和web服务器之间的传输状态。第四列是被日志记录的数据。

varnishlog命令有很多的选项可以在查询时使用。强烈推荐在排错或测试时使用varnishlog。可以阅读varnish的man page来查看这个命令的详细使用情况。下面是一些使用的例子。

显示varnish和客户端之间的通信（忽略后端web服务器）：

    /usr/local/bin/varnishlog -b

显示varnish接收到的HTTP头信息（既有客户端请求的，也有web服务器响应的）：

    /usr/local/bin/varnishlog -c -i RxHeader

只显示web服务器响应的头信息：

    /usr/local/bin/varnishlog -Dw /var/log/varnish.log

从/var/log/varnish.log中读取所有日志信息

    kill `cat /var/run/varnish.pid`

这个命令会从/var/run/varnish.pid中读取varnish的主进程的PID，并给这个进程发送TERM信号，从而关闭varnish。

现在通过上述命令，我们可以控制varnish的启动和关闭，可以检查缓存的命中情况，下一个问题是varnish到底缓存了什么，会存多久？

varnish的默认缓存策略是偏向保守的（可以通过配置改变）。它默认只缓存get请求和HEAD请求。不会缓存带有Cookie和认证信息的请求，也不会缓存带有Set-Cookie或者有变化的头信息的响应。varnish也会检查请求和响应中的Cache-Control头信息，这个头信息中会包含一些选项来控制缓存行为。当Cache-control中Max-age的控制和默认策略冲突时，varnish不会单纯的根据Cache-control信息就改变自己的缓存行为。例如：Cache-Control: max-age=n，n为数字，如果varnish收到web服务器的响应中包含max-age，varnish会以此值设定缓存的过期时间（单位：秒），否则varnish将会设置为参数配置的时间，默认为120秒。

### 注意:

varnish的默认配置可以适应多数情况。例如，默认的default\_ttl缓存过期时间是120秒。配置文件的详细解释可以阅读varnishd的man page。如果你想改变某些默认设置，一种方式是通过命令行varnishd加上-p参数，这将重启varnishd，并清空缓存。另外一种方式是使用varnish的管理接口，要使用varnish的管理接口需要以-T参数启动varnish，这个参数指定了，varnish管理接口的监听端口。然后使用varnishadm命令连接到varnish的管理接口上，然后实时的查询varnish的运行参数，或者更改新的参数，这些都不需要重启varnish。

想要了解详细的情况，可以参阅varnishd、varnishadm和varnish-cli的man page。

一般情况下我们会改变varnish的缓存行为，定制自己的缓存策略。可以将配置写入默认的default.vcl文件，VCL是varnish的配置文件的格式，像一种简单的脚本语言。可以通过vcl的man page来了解详细的格式，推荐阅读。

在修改default.vcl配置之前，我们先来看一下varnish处理http请求的一个完整过程。我们将之成为一个请求／响应周期（request/response cycle）。这个过程始于varnish收到客户端的请求，varnish将检查这个请求，并将其标记存储，接下来varnish将根据一定的策略决定是将这个请求直接转发，还是检查缓存。如果是第一种情况，varnish会将请求直接转发到后端的服务器上，并且将服务器的响应返回给你客户端。如果是第二种情况，varnish会进行一个缓存查询的过程，如果缓存命中，varnish会将缓存中结果返回给客户端，如果缓存中没有，varnish会将此请求转发给后端的服务器，并将服务器的响应先进行缓存，然后再转发给客户端。

了解完varnish对请求和响应处理的过程之后，我们来讨论一下如何改变varnish的缓存策略。varnish有一系列的子功能来完成上述处理过程，每一个子功能完成处理过程的一个部分。每一个子功能的执行结果传递给下一个子功能。所以我们可以通过改变子功能的返回值来改变varnish的处理动作。每一个子功能都在default.vcl中有一个默认定义，可以通过改变这些值来定制varnish的功能。

### Varnish 子程序

varnish的子程序在default.vcl中有默认的配置，如果你重新配置了某一个功能，并不意味着默认的动作一定不会执行。一般情况下，如果你重新配置了某一个功能，但是没有返回值，varnish将会执行默认的动，因为所有的varnish子程序都会有一个返回值。这可以看作varnish的一种容错机制。

第一个子程序是“vcl\_recv”，在姐收到完整的客户端请求后开始执行这个子程序，可以通过修改req对象来改变默认的请求处理，varnish根据返回值决定处理方式。比如，返回：pass，将使varnish直接转发请求到web服务器，返回：lookup，将使varnish检查缓存。

下一个子程序是vcl\_pass。如果在vcl\_recv中返回了“pass”，将执行vcl\_pass。vcl\_pass有两种返回值，pass：继续转发请求到后端web服务器。restart:将请求重新返回给vcl\_recv。

vcl\_miss和vcl\_hit将会根据varnish的缓存命中情况来执行。vcl\_miss的执行有两种情况,一是从后端服务器获取响应结果，并且在本地缓存（fetch），二是从后端获取到响应，但本地不缓存（pass）。如果varnish缓存命中，将会执行vcl\_hit，会有两个选择，一个直接将缓存的结果返回给客户端（deliver），二是丢弃缓存，重新从后端服务器获取数据（pass）。

当从后端服务器获取到数据之后，将会执行vcl\_fetch过程，在这里可以通过beresp对象来访问响应数据，返回两种处理结果；deliver:按计划将数据发送给客户端，restart，退回这个请求。

在vcl\_deliver子程序中，可以将响应结果发送给客户端（deliver），结束这个请求，同时根据不同情况决定是否缓存结果。也可以返回“restart”值，来重新开始这个请求。

如前所述，通过default.vcl来控制varnish的缓存策略，通过子程序的返回值来控制varnish的动作。子程序的返回值可以基于req和resp对象，也可以基于客户端对象，服务端对象或者后端服务器对象。但在子程序处理过程中，上述数据对象并非一直都可用。另外要注意子程序的返回值会有一定的限制范围，一个难点就是记住在什么时候，哪个子程序中什么数据对象是可用的，合法的返回值有哪些。为了让这个问题更清晰一些，下面是一张表格，可以在修改配置的时候快速参考：

### 表1. 各子程序中各数据对象的可用情况.

<table border="1"> 
 <tbody> 
  <tr> 
   <td> <br> </td> 
   <td> client </td> 
   <td> server </td> 
   <td> req </td> 
   <td> bereq </td> 
   <td> beresp </td> 
   <td> resp </td> 
   <td> obj </td> 
  </tr> 
 </tbody> 
 <tbody> 
  <tr> 
   <td> <em>vcl_recv</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_pass</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_miss</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_hit</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_fetch</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_deliver</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> <br> </td> 
  </tr> 
 </tbody> 
</table>

### 表2. 各子程序的合法返回值.

<table border="1"> 
 <tbody> 
  <tr> 
   <td> <br> </td> 
   <td> pass </td> 
   <td> lookup </td> 
   <td> error </td> 
   <td> restart </td> 
   <td> deliver </td> 
   <td> fetch </td> 
   <td> pipe </td> 
   <td> hit_for_pass </td> 
  </tr> 
 </tbody> 
 <tbody> 
  <tr> 
   <td> <em>vcl_recv</em> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_pass</em> </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_lookup</em> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_miss</em> </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_hit</em> </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_fetch</em> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
  </tr> 
  <tr> 
   <td> <em>vcl_deliver</em> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> X </td> 
   <td> X </td> 
   <td> X </td> 
   <td> <br> </td> 
   <td> <br> </td> 
   <td> <br> </td> 
  </tr> 
 </tbody> 
</table>

### 注意:

请仔细阅读vcl的文档来了解相关子程序，返回值以及可用的数据对象。

下面是一些实际的例子：

修改HTTP请求的 Host 头信息:

    sub vcl_recv {
        if (req.http.host ~ "^www.example.com") {
            set req.http.host = "example.com";
        }
    }

你可以通过 req.http.host来访问请求的HTTP host头信息，类似的，你可以通过req.http访问所有的HTTP头信息。“\~”符表示相等的意思，后面是一个正则表达式. 如果匹配上，会通过set关键字和“=”赋值操作，将hostname改为"example.com".修改hostname的一个作用是防止重复的缓存。 因为varnish会通过hostname和URL来判断缓存匹配情况，所以hostname应该被修改为统一的形式。

下面是默认 vcl\_recv 子程序的一个片段:

    sub vcl_recv {
        if (req.request != "GET" && req.request != "HEAD") {
            return (pass);
        }
        return (lookup);
    }

这是默认的vcl\_recv配置文件的片段，在这个配置中如果发现请求不是GET或者HEAD，varnish将会直接pass这个请求，并且不会缓存这个请求的响应，如果是GET或HEAD，将会到缓存中进行查找。

匹配特定的URL，移除请求中的Cookie信息：

    sub vcl_recv {
        if (req.url ~ "^/images") {
            unset req.http.cookie;
        }
    }

这个是varnish网站上的例子，如果发现请求的URL以"/images"开始，varnish会将其中的Cookie信息移除。当在cookie中设置不缓存当前响应时，varnish可以通过移除Cookie，来缓存这个响应。

在对图片文件的响应头中中移除set-Cookie：

    sub vcl_fetch {
        if (req.url ~ "\.(png|gif|jpg)$") {
            unset beresp.http.set-cookie;
            set beresp.ttl = 1h;
        }
    }

这个是varnish网站上的另一个例子。接收到web服务器的返回结果后会触发vcl\_fetch处理过程。当从web服务器接收到新的数据后，beresp中保存web服务器返回的响应信息，req中是本次请求的信息。如果本次请求的文件是图像文件，varnish会将响应头信息中的“Set-Cookie”移除，并且将缓存的时间设置为1小时（带有Set-Cookie的响应，varnish不会缓存）。

现在我们想朝响应信息中增加一个"X-Hit"的头信息，当缓存命中的时候，这个值为1，未命中的时候为0。根据上文，判断缓存命中的最简单的办法是在vcl\_hit中。当缓存命中是会调用vcl\_hit，因此可以考虑在vcl\_hit中设置这个头信息，但从上文表1中我们看到，vcl\_hit里beresp和resp都是不可用的。一个可行的办法就是在请求中设置里一个临时头信息，然后在后续的处理过程中真正进行设置。下面我们看一下这个问题是如何解决的：

在响应头信息中增加“x-hit”：

    sub vcl_hit {
        set req.http.tempheader = "1";
    }

    sub vcl_miss {
        set req.http.tempheader = "0";
    }

    sub vcl_deliver {
        set resp.http.X-Hit = "0";
        if (req.http.tempheader) {
            set resp.http.X-Hit = req.http.tempheader;
            unset req.http.tempheader;
        }
    }

上述vcl\_hit和vcl\_miss中设置了一个临时的请求头信息，来标识出缓存的命中情况。真正的处理过程在vcl\_deliver里，首先默认设置x-hit为0，然后根据请求里的临时头信息判断缓存的命中情况，并且依此更新刚才设置的x-hit默认值，最后删除此临时头信息。之所以选择在vcl\_deliver里来进行处理，是因为在响应信息返回给客户端之前，只有在vcl\_deliver中才可以访问resp对象。

下面我们看一个针对此问题错误的解决办法：

增加“x-hit”头信息（错误的方法）：

    sub vcl_hit {
        set req.http.tempheader = "1";
    }

    sub vcl_miss {
        set req.http.tempheader = "0";
    }

    sub vcl_fetch {
        set beresp.http.X-Hit = "0";
        if (req.http.tempheader) {
            set beresp.http.X-Hit = req.http.tempheader;
            unset req.http.tempheader;
        }
    }

在vcl\_fetch里修改服务器返回的信息（beresp），但这并不是最终发送给客户端的数据。上述配置貌似正确，其实隐含了一个大BUG。首次请求当缓存未命中时，web服务器的响应被标上'x-hit'为0，然后送到vcl\_fetch处理，并被缓存在本地。但当后续请求缓存命中时，vcl\_fetch过程不会被执行，结果就导致所有的缓存命中的响应都带有x-hit=0的标记。这是在配置varnish时需要特别注意的一类问题。

避免这些问题的办法是熟练掌握上述的表1的内容，并且在实际工作中多做测试。

下面的配置可以让varnish将所有的数据缓存一个小时（不建议在真实环境中使用）

    sub vcl_recv {
        return (lookup);
    }

    sub vcl_fetch {
        set beresp.ttl = 1h;
        return (deliver);
    }

在上述配置中重写了vcl\_recv和vcl\_fetch两个过程。需要注意的是：如果vcl\_fetch不返回“deliver”，varnish将会继续执行默认的处理过程，就不会有想要的效果了。

一旦varnish运行生效之后，你可以通过一些负载测试工具来测试性能的改善。我通常使用的测试工具是apache自带的ab，可以从apache的安装包里找到，或者通过一些第三方的包管理器进行安装。可以在[apache的网站](http://httpd.apache.org/docs/2.4/programs/ab.html)上找到ab的使用文档。

在下面的测试例子中，apache2.2监听在80端口，varnish监听在6081端口。用来做测试的页面是一个非常简单的perl
CGI脚本，只输出一个单行的HTML文件。通过访问相同的URL来测试apache和varnish的不同表现。为避免网络因素的影响，所有的测试都在本机执行。测试中使用的ab选项非常简单，也可以试着去改变这些选项，看看是什么结果。

首先进行一个1000次的请求（n=1000），并发数量1个（c=1）.

先测试apache：

    ab -c 1 -n 1000 http://localhost/cgi-bin/test

图 4. Apache测试结果

再测试varnish：

    ab -c 1 -n 1000 http://localhost:6081/cgi-bin/test

图 5. varnish测试结果

ab的测试输出里包含很多信息，最基本的性能指标有“Time per request”和“Requests per second（rps）”。

从上述测试结果来看，apache的每个请求在1ms以上（780rps），而varnish在0.1ms（7336rps）比apache高了10倍。

从这个测试结果说明varnish的速度比apache快，至少在当前环境下是这样。可以尝试改变ab的选项来进行不同的测试，例如改变并发访问数量。

### 系统负载和磁盘IO（ %iowait）

系统负载是反映CPU运行状况的指标，通常情况下系统中每个CPU核心的负载应该在1.0以下。如果你的系统中有4个CPU核心，理想的系统负载应该在4.0以下。

磁盘的%iowait反映每个CPU时间片内系统的输入输出（I／O）状况。%iowait指标较高表示磁盘IO成为了系统瓶颈会拖慢整体的速度。比如，如果收到的每个请求都需要读取100个文件或者更多，这将会导致%iowait迅速升高然后成为系统性能的瓶颈。

测试的时候除了关注系统的响应时间之外，还要看系统资源的使用情况。当测试请求持续很长时间时，我们比较一下两者的系统资源使用情况。监控的指标就是系统的负载（system
load）和磁盘IO（%iowait）。系统负载可以从top命令里查看，%iowait可以从iostat命令看到。在测试过程中需要同时关注这两个指标，我们打开两个终端分别运行top和iostat。

运行iostat，2秒更新一次：

    iostat -c 2

运行top:

    /usr/bin/top

现在就可以做测试了。因为要看长时间持续请求的状况下服务器的性能表现（至少要在1到10分钟），所以需要在ab的选项里加大请求次数和并发数量。

使用ab对Apache进行测试：

    ab -c 50 -n 100000 http://localhost/cgi-bin/test

![]({{ site.JB.FILE_PATH }}/2013-06/20080239_FhrH.png)

图 6. Apache 下系统压力测试流量记录

使用ab测试Varnish:

    ab -c 50 -n 1000000 http://localhost:6081/cgi-bin/test

![]({{ site.JB.FILE_PATH }}/2013-06/20080239_P03y.png)

图 7. Varnish下系统压力测试流量记录

首先对比响应时间，虽然截图上没有直接显示时间，但是我们可以从ab结束的时间计算出来，apache是23ms每次请求（2097rps），varnish是4ms每次请求（12099rps）。最大的差异是平均负载，Apache使系统的负载达到了12，使用varnish时则一直保持在0～0.4。在从apache切换到varnish做测试时，甚至要等上几分钟，系统负载才能回复正常。最好在非生产环境下用比较空闲的机器做这些测试。

尽管真实环境中的web服务器有很多个性化的配置和需求，但是vanish一般都可以帮助你的web服务器提高性能并且降低负载。
