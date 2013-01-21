---
layout: post
section: Code
categories: Favorite
date: 2013-01-19
title: "趣解HTTP状态码"
description: "趣解HTTP状态码"
summary: "趣解HTTP状态码"
tags: [HTTP状态码]
redirecturl: http://www.cnblogs.com/diguage/archive/2012/07/22/2604099.html
---
 
　　前两天，在豆瓣上看到一个讲解HTTP状态码的文章，觉得很搞笑。虽说我也是搞IT的，也经常见到服务器返回的各种HTTP状态码，但是真没认真去了解过这个东东。借此机会，我也搜集了一下HTTP状态码的相关资料，和大家分享一下。

　　HTTP状态码（HTTP Status
Code）是用以表示网页服务器HTTP响应状态的3位数字代码。它由 RFC2616
规范定义的，并得到RFC2518、RFC2817、RFC2295、RFC2774、RFC2918等规范扩展。

　　HTTP状态码一共分为五类。状态码的第一个数字代表了响应的五种状态之一。分类如下：

<table style="width: 98%;" border="1" cellspacing="0" cellpadding="3"><caption>HTTP状态码分类</caption>
<tbody>
<tr style="background-color: rgb(233, 238, 244);"><th scope="col" width="52">分类</th><th scope="col" width="833">含义</th></tr>
<tr><th scope="row" width="52">1XX</th>
<td width="833">表示消息。这一类型的状态码，代表请求已被接受，需要继续处理。这类响应是临时响应，只包含状态行和某些可选的响应头信息，并以空行结束。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row" width="52">2XX</th>
<td width="833">表示成功。这一类型的状态码，代表请求已成功被服务器接收、理解、并接受。</td>
</tr>
<tr><th scope="row" width="52">3XX</th>
<td width="833">表示重定向。这类状态码代表需要客户端采取进一步的操作才能完成请求。通常，这些状态码用来重定向，后续的请求地址（重定向目标）在本次响应的Location域中指明。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row" width="52">4XX</th>
<td width="833">表示请求错误。这类的状态码代表了客户端看起来可能发生了错误，妨碍了服务器的处理。除非响应的是一个HEAD请求，否则服务器就应该返回一个解释当前错误状况的实体，以及这是临时的还是永久性的状况。这些状态码适用于任何请求方法。浏览器应当向用户显示任何包含在此类错误响应中的实体内容。</td>
</tr>
<tr><th scope="row" width="52">5XX</th>
<td width="833">表示服务器错误。这类状态码代表了服务器在处理请求的过程中有错误或者异常状态发生，也有可能是服务器意识到以当前的软硬件资源无法完成对请求的处理。除非这是一个HEAD请求，否则服务器应当包含一个解释当前错误状态以及这个状况是临时的还是永久的解释信息实体。浏览器应当向用户展示任何在当前响应中被包含的实体。</td>
</tr>
</tbody>
</table>

　　下面，我们就开始趣解HTTP状态码。（少儿不宜，十八岁以下禁止观看啊。哈哈…）

<table style="width: 98%;" border="1" cellspacing="0" cellpadding="3"><caption>趣解HTTP状态码</caption>
<tbody>
<tr style="background-color: rgb(233, 238, 244);"><th scope="col" width="52">状态码</th><th scope="col" width="230">英/中双解</th><th scope="col">汉语解释</th><th scope="col" width="150">趣解</th></tr>
<tr><th scope="row" colspan="4">1XX—表示消息。这一类型的状态码，代表请求已被接受，需要继续处理。</th></tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">100</th>
<td>Continue/继续</td>
<td>客户端应当继续发送请求。</td>
<td>人家... 还要...</td>
</tr>
<tr><th scope="row">101</th>
<td>Switching Protocols/转换协议</td>
<td>服务器已经理解了客户端的请求，并将通过Upgrade消息头通知客户端采用不同的协议来完成这个请求。</td>
<td>服务姬傲娇中</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">102</th>
<td>Processing</td>
<td>由WebDAV（RFC 2518）扩展的状态码，代表处理将被继续执行。</td>
<td>造人中…</td>
</tr>
<tr><th scope="row" colspan="4">2XX—表示成功。代表请求已成功被服务器接收、理解、并接受。</th></tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">200</th>
<td>OK/正常</td>
<td>请求已成功，请求所希望的响应头或数据体将随此响应返回。</td>
<td>欢迎回来, 主人</td>
</tr>
<tr><th scope="row">201</th>
<td>Created/已创建</td>
<td>表示服务器在请求的响应中建立了新文档；应在定位头信息中给出它的URL。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">202</th>
<td>Accepted/接受</td>
<td>服务器已接受请求，但尚未处理完。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">203</th>
<td>Non-Authoritative Information/非官方信息</td>
<td>表示文档被正常的返回，但是由于正在使用的是文档副本所以某些响应头信息可能不正确。</td>
<td>俺是小三</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">204</th>
<td>No Content/无内容</td>
<td>表示服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。在并没有新文档的情况下，确保浏览器继续显示先前的文档。</td>
<td>小姐呢？！怎么没有？</td>
</tr>
<tr><th scope="row">205</th>
<td>Reset Content/重置内容</td>
<td>意思是虽然没有新文档但浏览器要重置文档显示。这个状态码用于强迫浏览器清除表单域。</td>
<td>先生，给你换个小姐？</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">206</th>
<td>Partial Content/局部内容</td>
<td>该请求必须包含Range头信息来指示客户端希望得到的内容范围，并且可能包含If-Range来作为请求条件。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">207</th>
<td><em>Multi-Status/多种状态</em></td>
<td>由WebDAV(RFC 2518)扩展的状态码，代表之后的消息体将是一个XML消息，并且可能依照之前子请求数量的不同，包含一系列独立的响应代码。</td>
<td>搞个NP。嘿嘿…</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row" colspan="4">3xx—表示重定向。代表需要客户端采取进一步的操作才能完成请求。</th></tr>
<tr><th scope="row">300</th>
<td>Multiple Choices/多重选择</td>
<td>表示被请求的文档可以在多个地方找到，并将在返回的文档中列出来。</td>
<td>先生，请点菜。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">301</th>
<td><em>Moved Permanently/永久迁移</em></td>
<td>指所请求的文档在别的地方；文档新的URL会在定位响应头信息中给出。浏览器会自动连接到新的URL。</td>
<td>人家搬家了</td>
</tr>
<tr><th scope="row">302</th>
<td>Found/找到</td>
<td>与301有些类似，只是定位头信息中所给的URL应被理解为临时交换地址而不是永久的。</td>
<td>亲，先等下啦，人家先去洗白白嘛。。。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">303</th>
<td>See Other/参见其他信息</td>
<td>和 301、302 相似，只是如果最初的请求是 POST，那么新文档（在定位头信息中给出）药用 GET 找回。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">304</th>
<td>Not Modified/没有修改</td>
<td>如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个状态码。304响应禁止包含消息体，因此始终以消息头后的第一个空行结尾。</td>
<td>好久不见，还是风味犹存啊。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">305</th>
<td>Use Proxy/使用代理</td>
<td>表示所请求的文档要通过定位头信息中的代理服务器获得。</td>
<td>泡妞是需要拉皮条的。</td>
</tr>
<tr><th scope="row">306</th>
<td><em>Switch Proxy/切换代理</em></td>
<td>在最新版的规范中，306状态码已经不再被使用。</td>
<td>这店里的鸡太差了，换个。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">307</th>
<td>Temporary Redirect/临时重定向</td>
<td>在响应为303时按照GET和POST请求转向；而在307响应时则按照GET请求转向而不是POST请求。</td>
<td>不是这里, 换个地方啦</td>
</tr>
<tr><th scope="row" colspan="4">4xx—表示请求错误。代表客户端可能发生了错误，妨碍服务器的处理。</th></tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">400</th>
<td>Bad Request/错误请求</td>
<td>指出客户端请求中的语法错误。</td>
<td>不要把奇怪的东西给人家嘛</td>
</tr>
<tr><th scope="row">401</th>
<td>Unauthorized/未授权</td>
<td>表示客户端在授权头信息中没有有效的身份信息时访问受到密码保护的页面。</td>
<td>对上对联，才让进洞房。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">403</th>
<td>Forbidden/禁止</td>
<td>表示除非拥有授权否则服务器拒绝提供所请求的资源。</td>
<td>这里不可以啦!</td>
</tr>
<tr><th scope="row">404</th>
<td>Not Found/未找到</td>
<td>告诉客户端所给的地址无法找到任何资源。</td>
<td>这里什么都没有 --- 人家是平的啦</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">405</th>
<td>Method Not Allowed/方法未允许</td>
<td>表示请求方法(GET, POST, HEAD, PUT, DELETE, 等)对某些特定的资源不允许使用。</td>
<td>打开方式不对</td>
</tr>
<tr><th scope="row">406</th>
<td>Not Acceptable/无法访问</td>
<td>表示请求资源的MIME类型与客户端中Accept头信息中指定的类型不一致。</td>
<td>啊啊啊,慢着!!好疼</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">407</th>
<td>Proxy Authentication Required/代理服务器认证要求</td>
<td>该状态指出客户端必须通过代理服务器的认证。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">408</th>
<td>Request Timeout/请求超时</td>
<td>指服务端等待客户端发送请求的时间过长。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">409</th>
<td>Conflict/冲突</td>
<td>该状态通常与PUT请求一同使用，409 状态常被用于试图上传版本不正确的文件时。</td>
<td>找 小 姐找到了自己媳妇，然后…</td>
</tr>
<tr><th scope="row">410</th>
<td>Gone/已经不存在</td>
<td>告诉客户端所请求的文档已经不存在并且没有更新的地址。410状态不同于404，410是在指导文档已被移走的情况下使用，而404则用于未知原因的无法访问。</td>
<td>那个，你是个好人……</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">411</th>
<td>Length Required/需要数据长度</td>
<td>表示服务器不能处理请求，除非客户端发送Content-Length头信息指出发送给服务器的数据的大小。</td>
<td>太长了…进不去</td>
</tr>
<tr><th scope="row">412</th>
<td>Precondition Failed/先决条件错误</td>
<td>指出请求头信息中的某些先决条件是错误的。</td>
<td>先买房，然后才能结婚。</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">413</th>
<td>Request Entity Too Large/请求实体过大</td>
<td>告诉客户端现在所请求的文档比服务器现在想要处理的要大。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">414</th>
<td>Request URI Too Long/请求URI过长</td>
<td>用于在URI过长的情况时。这里所指的"URI"是指URL中主机、域名及端口号之后的内容。</td>
<td>这... 太长了啦</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">415</th>
<td>Unsupported Media Type/不支持的媒体格式</td>
<td>意味着请求所带的附件的格式类型服务器不知道如何处理。</td>
<td>石女</td>
</tr>
<tr><th scope="row">416</th>
<td>Requested Range Not Satisfiable/请求范围无法满足</td>
<td>表示客户端包含了一个服务器无法满足的Range头信息的请求。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">417</th>
<td>Expectation Failed/期望失败</td>
<td>表示在请求头Expect中指定的预期内容无法被服务器满足。</td>
<td>没房，只能分手了。</td>
</tr>
<tr><th scope="row">418</th>
<td><em>I'm a teapot/我是杯具</em></td>
<td>本操作码是在1998年作为IETF的传统愚人节笑话,并不需要在真实的HTTP服务器中定义。</td>
<td>我就是个杯具啊</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">421</th>
<td><em>There are too many connections from your internet address/该IP发起的链接过多。</em></td>
<td>从当前客户端所在的IP地址到服务器的连接数超过了服务器许可的最大范围。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">422</th>
<td><em>Unprocessable Entity/错误实体</em></td>
<td>请求格式正确，但是由于含有语义错误，无法响应。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">423</th>
<td><em>Locked/锁定</em></td>
<td>当前资源被锁定。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">424</th>
<td><em>Failed Dependency/错误关联</em></td>
<td>由于之前的某个请求发生的错误，导致当前请求失败。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">425</th>
<td><em>Unordered Collection/乱序集合</em></td>
<td>在WebDav Advanced Collections草案中定义，但是未出现在《WebDAV顺序集协议》（RFC 3658）中。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">426</th>
<td><em>Upgrade Required/升级要求</em></td>
<td>客户端应当切换到TLS/1.0。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">428</th>
<td>Precondition Required/要求先决条件</td>
<td>先决条件是客户端发送 HTTP 请求时，如果想要请求能成功必须满足一些预设的条件。</td>
<td>主人~~不要这么快么~人家还没湿呢。</td>
</tr>
<tr><th scope="row">429</th>
<td>Too Many Requests /太多请求</td>
<td>当你需要限制客户端请求某个服务数量时，该状态码就很有用，也就是请求速度限制。</td>
<td>主人~~我快要受不了了~</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">431</th>
<td>Request Header Fields Too Large /请求头字段太大</td>
<td>某些情况下，客户端发送 HTTP 请求头会变得很大，那么服务器可发送 431状态码 来指明该问题。</td>
<td>主人~~这么大方不进去的~~</td>
</tr>
<tr><th scope="row">449</th>
<td><em>Retry With/稍后重试</em></td>
<td>由微软扩展，代表请求应当在执行完适当的操作后进行重试。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">451</th>
<td>Unavailable for Legal Reasons/正被审查</td>
<td>代表那些因为法律原因而倒下的网站。</td>
<td>不要啦我们还没领证呀</td>
</tr>
<tr><th scope="row" colspan="4">5XX—表示服务器错误。代表服务器在处理请求的过程中异常状态发生。</th></tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">500</th>
<td>Internal Server Error/内部服务器错误</td>
<td>服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。</td>
<td>糟了,身体变得有点奇怪了</td>
</tr>
<tr><th scope="row">501</th>
<td>Not Implemented/未实现</td>
<td>服务器不支持当前请求所需要的某个功能。</td>
<td>&nbsp;</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">502</th>
<td>Bad Gateway/错误的网关</td>
<td>作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。</td>
<td>进错了吗？</td>
</tr>
<tr><th scope="row">503</th>
<td>Service Unavailable/服务无法获得</td>
<td>表示服务器由于在维护或已经超载而无法响应。</td>
<td>不要...人家还没准备好啦</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">504</th>
<td>Gateway Timeout/网关超时</td>
<td>指出接收服务器没有从远端服务器得到及时的响应。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">505</th>
<td>HTTP Version Not Supported/不支持的 HTTP 版本</td>
<td>表示服务器并不支持在请求中所标明 HTTP 版本。</td>
<td>放开我,放开我,不要中出啊,会怀孕的(但其实是男生,不会怀孕)</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">506</th>
<td>Variant Also Negotiates</td>
<td>代表服务器存在内部配置错误：被请求的协商变元资源被配置为在透明内容协商中使用自己，因此在一个协商处理中不是一个合适的重点。</td>
<td>&nbsp;</td>
</tr>
<tr><th scope="row">507</th>
<td>Insufficient Storage</td>
<td>服务器无法存储完成请求所必须的内容。</td>
<td>都流出来了…</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">509</th>
<td>Bandwidth Limit Exceeded</td>
<td>服务器达到带宽限制。这不是一个官方的状态码，但是仍被广泛使用。</td>
<td>今天不接客了</td>
</tr>
<tr><th scope="row">510</th>
<td>Not Extended</td>
<td>获取资源所需要的策略并没有没满足。</td>
<td>没车没钱还想泡妞？</td>
</tr>
<tr style="background-color: rgb(233, 238, 244);"><th scope="row">511</th>
<td>Network Authentication Required /要求网络认证</td>
<td>在你想使用web服务的时候需要重定向到认证页面，在走HTTP通信中都是这么做的，</td>
<td>主人~~不要蒙住我的眼睛~会好兴奋的！~</td>
</tr>
</tbody>
</table>

注：

1.  RFC-Request For Comments是由Internet
    Society（ISOC）赞助发行，用于定义基本的互联网通信协议的一些列文件。文中所用的RFC文件地址如下：
    -   RFC2295：[http://tools.ietf.org/html/rfc2295](http://tools.ietf.org/html/rfc2295)
    -   RFC2518：[http://tools.ietf.org/html/rfc2518](http://tools.ietf.org/html/rfc2518)
    -   RFC2612：[http://tools.ietf.org/html/rfc2612](http://tools.ietf.org/html/rfc2612)
    -   RFC2817：[http://tools.ietf.org/html/rfc2817](http://tools.ietf.org/html/rfc2817)
    -   RFC2774：[http://tools.ietf.org/html/rfc2774](http://tools.ietf.org/html/rfc2774)
    -   RFC2918：[http://tools.ietf.org/html/rfc2918](http://tools.ietf.org/html/rfc2918)
    -   RFC6585：[http://tools.ietf.org/html/rfc6585](http://tools.ietf.org/html/rfc6585)

2.  表格中，斜体字的"中英双解"是我自己翻译的。如果不正确，请留指正。
3.  428、429、431以及511是2012年4月发布的 RFC6585手册中新增的4个状态码。
    详见：[http://www.oschina.net/news/28660/new-http-status-codes](http://www.oschina.net/news/28660/new-http-status-codes)

4.  451是XML标准发明人之一、Android开发人员Tim
    Bray提议设立一个新的HTTP错误代码。这个还没有成为正式标准。
    -   详见：[http://news.mydrivers.com/1/231/231669.htm](http://news.mydrivers.com/1/231/231669.htm)

参考资料

-   [豆瓣：HTTP 状态码](http://www.douban.com/note/224620321/)
-   [维基百科](http://zh.wikipedia.org/zh/HTTP状态码)
-   [HTTP状态码大全](http://www.cnblogs.com/lxinxuan/archive/2009/10/22/1588053.html)
