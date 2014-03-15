---
layout: page
section: Archive
categories: Archives
date: 2012-12-10
title: "SQL － 基础(不断补充)"
description: "SQL － 基础(不断补充)"
tags: [SQL]
---

游标和事务  
----------

<a href="#" onclick="javascript:toggle(this);" class="linkcodetoggle">+ 点击展开</a>
    begin try
      begin transaction -- 事务开启 
      declare cur cursor 
      local static read_only forward_only--只进只读
      for (select * from #table)
      declare @id int

      OPEN cur;
      fetch next from cur into @id
      WHILE (@@fetch_status = 0) begin
        if @@error > 0 begin -- @@rowcount =0 没有更新任何行
          CLOSE cur
          DEALLOCATE cur
          RAISERROR('error',16,1)
        end
        fetch next from cur into @id
      end
      CLOSE cur
      DEALLOCATE cur;
      commit transaction; -- 提交事务  
    end try
    begin catch
      if @@ERROR > 0 begin
        -- 判断是否存在开启的事务，避免如果事务在这之前已提交或者已回滚，再次回滚会抛异常
        if(@@TRANCOUNT <> 0) begin
          rollback transaction; --事务回滚
          print error_message()
        end
      end
    end catch

说明：FETCH_STATUS检索到数据返回0，失败返回-1，可判断是否滚动未到结尾。

临时过程/表  
----------

用 \# 和 \#\#命名，可以由任何用户创建。创建过程后，局部过程的所有者是唯一可以使用该过程的用户。

    CREATE TABLE #DMPARHED(...)


创建临时表的另类方法

    select * into #temp from Employees

利用with找出记录及其上（或下）级
------------------------------

    WITH CategoryInfo AS(
      SELECT id,text,parentid FROM Recursive WHERE id = 10008
      UNION ALL
      SELECT a.id,a.text,a.parentid FROM Recursive AS a,CategoryInfo AS b WHERE a.parentid = b.id
    )

    SELECT * FROM CategoryInfo

索引
----------

    /*在OrderID上面创建聚集索引，索引列为OrderID*/  
    create unique clustered index IX_OrderID on Orders(OrderID)  

    /*在Orders表上创建非聚集索引IX_OrderDate*/  
    create index IX_OrderDate on Orders(OrderDate)

时间格式化
----------

<a href="#" onclick="javascript:toggle(this);" class="linkcodetoggle">+ 点击展开</a>
    Select CONVERT(varchar(100), GETDATE(), 0): 05 16 2006 10:57AM  
    Select CONVERT(varchar(100), GETDATE(), 1): 05/16/06  
    Select CONVERT(varchar(100), GETDATE(), 2): 06.05.16  
    Select CONVERT(varchar(100), GETDATE(), 3): 16/05/06  
    Select CONVERT(varchar(100), GETDATE(), 4): 16.05.06  
    Select CONVERT(varchar(100), GETDATE(), 5): 16-05-06  
    Select CONVERT(varchar(100), GETDATE(), 6): 16 05 06  
    Select CONVERT(varchar(100), GETDATE(), 7): 05 16,06  
    Select CONVERT(varchar(100), GETDATE(), 8): 10:57:46  
    Select CONVERT(varchar(100), GETDATE(), 9): 05 16 2006 10:57:46:827AM  
    Select CONVERT(varchar(100), GETDATE(), 10): 05-16-06  
    Select CONVERT(varchar(100), GETDATE(), 11): 06/05/16  
    Select CONVERT(varchar(100), GETDATE(), 12): 060516  
    Select CONVERT(varchar(100), GETDATE(), 13): 16 05 2006 10:57:46:937  
    Select CONVERT(varchar(100), GETDATE(), 14): 10:57:46:967  
    Select CONVERT(varchar(100), GETDATE(), 20): 2006-05-16 10:57:47  
    Select CONVERT(varchar(100), GETDATE(), 21): 2006-05-16 10:57:47.157  
    Select CONVERT(varchar(100), GETDATE(), 22): 05/16/06 10:57:47 AM  
    Select CONVERT(varchar(100), GETDATE(), 23): 2006-05-16  
    Select CONVERT(varchar(100), GETDATE(), 24): 10:57:47  
    Select CONVERT(varchar(100), GETDATE(), 25): 2006-05-16 10:57:47.250  
    Select CONVERT(varchar(100), GETDATE(), 100): 05 16 2006 10:57AM  
    Select CONVERT(varchar(100), GETDATE(), 101): 05/16/2006  
    Select CONVERT(varchar(100), GETDATE(), 102): 2006.05.16  
    Select CONVERT(varchar(100), GETDATE(), 103): 16/05/2006  
    Select CONVERT(varchar(100), GETDATE(), 104): 16.05.2006

CTE批量插入
--------------------

<a href="#" onclick="javascript:toggle(this);" class="linkcodetoggle">+ 点击展开</a>  
    WITH Seq (num,CustomerNumber, CustomerName, CustomerCity) AS
        (SELECT 1,cast('00001'as CHAR(5)),cast('Customer 1' AS NVARCHAR(50)),cast('X-City' as NVARCHAR(20))
        UNION ALL
        SELECT num + 1,Cast(REPLACE(STR(num+1, 5), ' ', '0') AS CHAR(5)),
        cast('Customer ' + cast(num+1 as CHAR(5)) AS NVARCHAR(50)),
        cast(CHAR(65 + (num % 26)) + '-City' AS NVARCHAR(20))
        FROM Seq
        WHERE num < 10000
    )

    INSERT INTO Customers (CustomerNumber, CustomerName, CustomerCity)
    SELECT CustomerNumber, CustomerName, CustomerCity
    FROM Seq
    OPTION (MAXRECURSION 0)

删除，修改
----------

<label/>
    DELETE t1 FROM productappraise t1 INNER JOIN  product t2 ON t1.productid=t2.productid WHERE t2.companyid=@companyid 
<label/>
    update t1 set t1.name='Liu' from t1 inner join t2 on t1.id = t2.tid

判断数据库是否存在 
--------------------

<label/>
    if exists(select * from master..sysdatabases where name=N'库名') 
      print 'exists' 
    else 
      print 'not exists' 

判断要创建的表名是否存在
------------------------

<label/>
    if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[表名]') and OBJECTPROPERTY(id, N'IsUserTable') = 1) 
      drop table [dbo].[表名] -- 删除表 
    GO 

判断要创建临时表是否存在 
------------------------

<label/>
    If Object_Id('Tempdb.dbo.#Test') Is Not Null 
      print '存在' 
    Else 
      print '不存在' 

判断要创建的存储过程名是否存在 
------------------------------

<label/>
    if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[存储过程名]') and OBJECTPROPERTY(id, N'IsProcedure') = 1) 
      -- 删除存储过程 
      drop procedure [dbo].[存储过程名] 
    GO 
 
判断要创建的视图名是否存在
------------------------------

    if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[视图名]') and OBJECTPROPERTY(id, N'IsView') = 1) 
      -- 删除视图 
      drop view [dbo].[视图名] 
    GO 
 
判断要创建的函数名是否存在
---------------

    if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[函数名]') and xtype in (N'FN', N'IF', N'TF')) 
      -- 删除函数 
      drop function [dbo].[函数名] 
    GO 

查询表引用到的外键
---------------
    SELECT 主键列ID=b.rkey ,主键列名=(SELECT name FROM syscolumns WHERE colid=b.rkey AND id=b.rkeyid) ,
    外键表ID=b.fkeyid ,外键表名称=object_name(b.fkeyid) ,外键列ID=b.fkey ,a.name 外键名,
    外键列名=(SELECT name FROM syscolumns WHERE colid=b.fkey AND id=b.fkeyid) 
    FROM sysobjects a join sysforeignkeys b on a.id=b.constid 
    join sysobjects c on a.parent_obj=c.id 
    where a.xtype='f' AND c.xtype='U' and object_name(b.rkeyid)='表名'

获取表的主外键
---------------

     exec sp_helpconstraint '表名' 

跨服务器查询
----------

<a href="#" onclick="javascript:toggle(this);" class="linkcodetoggle">+ 点击展开</a>
     
    EXEC  sp_addlinkedserver  
        @server='DBVIP',--被访问的服务器别名   
        @srvproduct='',   
        @provider='SQLOLEDB',  
        @datasrc="192.168.1.110"   --要访问的服务器  

    EXEC sp_addlinkedsrvlogin   
        'DBVIP', --被访问的服务器别名  
        'false',  
        NULL,  
        'sa', --帐号  
        'thankyoubobby' --密码  

    Select * from DBVIP.Northwind.dbo.orders  
    
    --删除连接
    Exec sp_droplinkedsrvlogin DBVIP,Null  
    Exec sp_dropserver DBVIP 