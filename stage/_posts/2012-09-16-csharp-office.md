---
layout: page
category: code
date: 2012-09-16
title: "C#读取Excel"
description: "C#读取Excel"
summary: "C#读取Excel"
---
 
一、OleDb读取Excel
　　<label />
    if (fileType == ".xls")//xls
       connStr = "Provider=Microsoft.Jet.OLEDB.4.0;" + "Data Source=" + fileName + ";" + ";Extended Properties=\"Excel 8.0;HDR=YES;IMEX=1\"";
    else//xlsx
       connStr = "Provider=Microsoft.ACE.OLEDB.12.0;" + "Data Source=" + fileName + ";" + ";Extended Properties=\"Excel 12.0;HDR=YES;IMEX=1\"";

二、Com组件的方式读取Excel

　　这种方式需要先引用 Microsoft.Office.Interop.Excel

三、NPOI方式读写Excel

　　可以在无需安装OFFICE的机器操作EXCEL

四、Aspose操作读取Excel

五、开源Word读写组件DocX
