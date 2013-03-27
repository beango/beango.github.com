---
layout: page
section: Code
category: Favorite
date: 2012-01-09
title: "正则大全"
description: "正则大全"
summary: "正则大全"
---
 
-   代码  

<label/>
    /* 正则检查表单案例 */
    function checkform(){
        $element = document.getElementById("telephone");
        $m = $element.value.match(/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/);
        if($m == null){
            alert("电话号码不正确");return false;
        }
        else{
            alert("恭喜！电话号码正确");return false;
        }
    }


-   正则  

<label/>
    email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,

    phone : /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,

    mobile : /^((\(\d{3}\))|(\d{3}\-))?13[0-9]\d{8}?$|15[89]\d{8}?$/,

    //url : /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,

    idCard : "this.isIdCard(value)",

    currency : /^\d+(\.\d+)?$/,

    number : /^\d+$/,

    zip : /^[1-9]\d{5}$/,

    ip : /^[\d\.]{7,15}$/,

    qq : /^[1-9]\d{4,8}$/,

    integer : /^[-\+]?\d+$/,

    double : /^[-\+]?\d+(\.\d+)?$/,

    english : /^[A-Za-z]+$/,

    chinese : /^[\u0391-\uFFE5]+$/,

    userName : /^[a-z_ ]\w{3,}$/i,

    //unSafe : /^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/,

    //unSafe : /[<>\?\#\$\*\&;\\\/\[\]\{\}=\(\)\.\^%,]/,

    //safeStr : /[^#\'\"~\.\*\$&;\\\/\|]/,*/