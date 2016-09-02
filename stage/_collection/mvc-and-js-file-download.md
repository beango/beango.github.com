---
layout: post
title: mvc+js文件下载
date: 2015-10-25
location: 廣州
pulished: true
excerpt_separator: "```"
---

js代碼：

```js
function filedown(urlPost, data, method)
{
    if (urlPost && data) {
        // data 是 string 或者 array/object
        data = typeof data == 'string' ? data : jQuery.param(data);
        var inputs = '';
        jQuery.each(data.split('&'), function () {
            var pair = this.split('=');
            inputs += '<input type="hidden" name="' + pair[0] + '" value="' + pair[1] + '"/>';
        });
        jQuery('<form action="' + urlPost + '" method="' + (method || 'post') + '">' 
          + inputs + '</form>').appendTo('body').submit().remove();
    }
}

// 第二种方式
function filedown(url, filename) {
    var contentType = 'application/octet-stream';
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}
```

後端：

```c#
public ActionResult Download(string url, string filename)
{
    var sc = ScLiu(url);
    if (sc!=null)
    {
        return File(sc, "application/octet-stream", filename);
    }
    return Content("文件不存在！");
}

public Stream ScLiu(string path)
{
    using (System.IO.MemoryStream memStream = new System.IO.MemoryStream())
    {
        WebClient webClient = new WebClient();
        var obj = webClient.OpenRead(path);
        return obj;
    }
}
```

调用：

```js
var urlPost = "Download";
var data = "url=" + url + "&filename=" + FILENAME;
var method = null;
filedown(urlPost, data, method);
```
