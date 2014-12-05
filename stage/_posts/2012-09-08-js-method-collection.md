---
layout: post
category: code
date: 2012-09-08
title: "js方法收集"
description: "js常用方法"
summary: "js常用方法集合."
tags: [javascript]
---
 
##### 一、取URL中的参数

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)')
                        .exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

##### 二、设置URL中的参数

    function setUrlParam(oldurl, paramname, pvalue) {
        var reg = new RegExp("(\\?|&)" + paramname + "=([^&]*)(&|$)", "gi");
        var pst = oldurl.match(reg);
        if ((pst == undefined) || pst == null) {
            return oldurl + ((oldurl.indexOf("?") == -1 ? "?" : "&") + paramname + "=" + pvalue);
        }
        var t = pst[0];
        var retxt = t.substring(0, t.indexOf("=") + 1) + pvalue;
        if (t.charAt(t.length - 1) == "&")
            retxt += "&";
        return oldurl.replace(reg, retxt);
    }

##### 三、用JavaScript对URL进行编码

    var myUrl = "http://example.com/index.html?param=1&anotherParam=2";
    var myOtherUrl = "http://example.com/index.html?url=" + encodeURIComponent(myUrl);

##### 四、JavaScript删除数组中的项 delete vs splice

    var myArray=["a","b","c"];
    delete myArray[0];
    for(var i=0,j=myArray.length;i<j;i++){
        console.log(myArray[i]);
        /*
        undefined
        b
        c
        */
    }

    var myArray2=["a","b","c"];
    myArray2.splice(0,1);
    for(var i=0,j=myArray2.length;i<j;i++){
        console.log(myArray2[i]);
        /*
        b
        c
        */
    }

##### 五、jquery取radio

    $('input[name="testradio"]:checked').val();  

    $('input[@name="testradio"][checked]');  

    $('input[name="testradio"]').filter(':checked');  

    //遍历name为testradio的所有radio  
    $('input[name="testradio"]').each(function(){  
      alert(this.value);  
    });

    //取第二个radio的值  
    $('input[name="testradio"]:eq(1)').val()  

    //设置radio  
    $('input:radio[name=sex]:nth(0)').attr('checked',true);  
    $('input:radio[name=sex][value="1"]').attr('checked',true);  
    $('input:radio[name=sex]:nth(0)')[0].checked = true;

##### 六、设置jquery.ajax编码

    $.ajax({
        type: "POST",
        url: "Handler/Handler.ashx",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: { 
            action: "TodoItemAdd",
            receiveUserID: $("#tdreceiveuser").find("select").val()
        },
        success: function (res) {
            alert(res);
        }
    });

##### 七、实时监听输入框值变化

　　这两个事件在 IE9 中都有个小BUG，那就是通过右键菜单菜单中的剪切和删除命令删除内容的时候不会触发，而 IE 其他版本都是正常的

    $('textarea').bind('input propertychange', function() {
        $('.msg').html($(this).val().length + ' characters');
    });
