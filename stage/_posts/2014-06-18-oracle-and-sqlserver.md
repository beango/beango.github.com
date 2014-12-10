---
layout: page
category: code
date: 2014-06-18
title: "Oracle与SQLServer语法区别"
description: "Oracle与SQLServer语法区别"
summary: "Oracle与SQLServer语法区别"
---

-  Oracle:nvl SqlServer:isnull 

-  insert，update，delete等用分号隔开的sql语句，必须前加begin，后加commit;end;并且去掉中间所有的\r\n。  
select时，一个sql语句中不能包含多个select语句

        /// <summary>  
        /// 将在SqlServer中，用分号隔开的多句sql语句，改为在Oracle中执行的Sql  
        /// 前面加begin，后面加end，去掉所有的\r\n  
        /// </summary>  
        /// <param name="_sqlserverSql"></param>  
        /// <returns></returns>  
        public static string ConvertMultipleSqlFromSqlserverToOracle(string _sqlserverSql) {  
            if (Global.CacheServerConfiger.IsOracle) {  
                _sqlserverSql = _sqlserverSql.Trim();  
                if (!_sqlserverSql.EndsWith(";")) {  
                    _sqlserverSql += ";";  
                }  
                _sqlserverSql = _sqlserverSql.Replace("\r\n", " ").Replace("\n", " ");  
                _sqlserverSql = "begin " + _sqlserverSql + " commit;end;";  
            }  
            return _sqlserverSql;  
        }

- 当数据类型为nvarchar2时，最好前面加N，例如

        insert into a(nvarchar2field) values(N'中文')

    查询时where子句也如此，例如where name = N'张三'

- sql语句中的+，改为\|\|

-   Oracle中做除法时，需要进行以下操作，否则c#中会算术溢出 

        round(count(*)/(cast(3 as float)), 28) 

    cast(3 as float)是为了和sqlserver保持一致，28是最大精度，不能大于28

-   日期在SqlServer中可以按照字符串操作，但在Oracle中不行 
    
    Oracle中插入时也必须做如下转换

        Oracle:to_date('2010-12-21 12:02:30','YYYY-MM-DD HH24:MI:SS')    

    SqlServer插入或者where子句中都可以直接使用字符串，但where子句中使用字符串，会加快查询速度 

        SqlServer:convert(datetime,''2010-12-21 12:02:30') 

-   想要保存一个时间的毫秒数，Oracle中的字段类型必须为timestamp，不能为date，因为date只保存时间值到秒。 

    Oracle中插入时也必须做如下转换 

        to_timestamp('2010-12-21 12:02:30.230940','YYYY-MM-DD HH24:MI:SS.FF')  

    SqlServer插入或者where子句中都可以直接使用字符串，但where子句中使用字符串，会加快查询速度

        SqlServer:Convert(datetime,'2010-12-21 12:02:30.230940') 

-   sql中日期想减得到秒的方法

    Oracle：

        CAST((sysdate- to_date('2010-12-21 12:02:30','YYYY-MM-DD HH24:MI:SS'))*24*60*60  as float)    

    SqlServer:

        CONVERT(float, datediff(second, to_date('2010-12-21 12:02:30','YYYY-MM-DD HH24:MI:SS'), getdate()))

-   Oracle中字段不允许存入''，即空字符串，只有null值，所以where子句中判断空值方法为： 

            Oracle：字段名 is null  
            SqlServer：(字段名 is null or 字段名 = '')    

    判断不为空值的方法 

        Oracle：字段名 is not null  
        SqlServer：(字段名 is not null and 字段名 != '')

-   Oracle中Top N的写法：  

    注意：Order by要写在子查询里，rownum是从1开始的 

        select * from 
        (
            select * from c_itcomp order by d_controladderss
        ) where rownum<100    

    排序后从第4条记录取至第9条记录  

        select * from (    
            select rownum as num, t.* from   
            (
                select a.* from a order by b   
            ) t 
        ) where num> 3 and num< 10 

-   Oracle中，给表定义别名的时候不能加as  例如：select * from 表名 as 别名！！！！  
    注意，这是错误的，正确的应该是  select * from 表名  别名

-   Oracle中，字段的别名不能加单引号  
    例如：select 字段名 as '别名' from dual！！！！  
    注意，这是错误的，正确的应该是 select 字段名 as 别名 from dual

-   Oracle中没有select sysdate as nowDate的写法，正确的应该是加个虚表dual 

        select sysdate as nowDate from dual

-   Oracle中，字段名都是大写的，即使select语句中是小写，得到的结果也是大写。因此，select到DataTable中后，binding到wpf时如果大小写不同，会绑定失败。在DataTable中分组和排序，也会失败。因此，尽量将DataTable中的字段名 称改为大写。

-   Oracle中的Integer类型，在C#中是Decimal，因此，在C#中从DataTable取值进行类型转换时： 若要转成Int类型，需使用Convert.ToInt32，而不能使用(int)，否则会报错  若要转成Bool类型，需使用Convert.ToBoolean，而不能使用(bool)，否则会报错 