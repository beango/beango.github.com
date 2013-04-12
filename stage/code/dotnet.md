---
layout: page
section: Code
category: Favorite
date: 2013-04-09
title: ".net纠错"
description: ".net纠错"
summary: ".net纠错"
---
 
-   获取文件绝对路径

<label></label>
    System.IO.Path.Combine(HttpRuntime.AppDomainAppPath,"App_Data\\test.txt");

-   EF下修改指定的字段

<label></label>
    NorthwindEntities entities = new NorthwindEntities();

    entities.Products.Attach(product);
    var entry = entities.ObjectStateManager.GetObjectStateEntry(product);
    entry.SetModifiedProperty("ProductName"); 
    entry.SetModifiedProperty("Discontinued");
    entities.SaveChanges();
