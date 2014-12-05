---
layout: post
section: Archive
category: default
date: 2012-03-12
title: "TokyoTyrant的管理工具tcrmgr使用"
description: "TokyoTyrant的管理工具tcrmgr使用"
tags: [memcached, tokyo tyrant, tcrmgr]
---

<li>查看服务器统计信息</li>
    tcrmgr inform -port 20000 -st 192.168.0.100

<li>写入数据</li>
    tcrmgr put -port 20000 192.168.0.100 key1 value1  

<li>读取数据</li>
    tcrmgr get -port 20000 192.168.0.100 key1  

<li>删除数据</li>
    tcrmgr out -port 20000 192.168.0.100 key1  

<li>查看所有的key</li>
    tcrmgr list -port 20000 192.168.0.100  

<li>清空所有数据</li>
    tcrmgr vanish -port 20000  192.168.0.100

<li>备份数据</li>
注意：路径是服务器上的绝对路径，否则显示“./tcrmgr: error: 9999:miscellaneous error” 
    tcrmgr copy -port 20000 192.168.0.100 /temp/test2.tch

<li>优化数据库文件</li>
    tcrmgr optimize -port 20000 192.168.0.100

<li>同步内存数据到磁盘（没搞懂有什么特别之处，可能是当ttserver使用-uas参数异步写入日志的时候起作用）</li>
    tcrmgr sync -port 20000 192.168.0.100 

<li>数据导入</li>
注意：tsv格式的文件以TAB分隔，如：test2\\tvalue2\\n  
注意：路径是本地路径，所以不必是绝对路径  
    tcrmgr importtsv -port 20000 192.168.0.100 /data/ttserver/db.tsv 

<li>通过ulog日志恢复数据</li>
	注意：路径是服务器上的绝对路径  
    tcrmgr restore -port 20000 192.168.0.100 /data/ttserver/ulog/00000010.ulog 

<li>打印更新日志（挂起，一直显示日志）</li>
可能是用于实时查看ttserver有哪些操作，相当于tail -f    
    tcrmgr repl -port 20000 -ph 192.168.0.100 

<li>下一个实验：启动一个带复制功能的ttserver，以前面启动的ttserver为master</li>
    ttserver -host 192.168.0.100 -port 20001 -mhost 192.168.0.100 -mport 20000 -rcc -rts /data/ttserver/temp_1/test_1.rts -thnum 4 -dmn -ulim 1024m  -ulog /data/ttserver/temp_1/ -log /data/ttserver/temp_1/test_1.log -pid /data/ttserver/temp_1/test_1.pid -sid 10 /data/ttserver/temp_1/test_1.tch#bnum=1000#rcnum=0#xmsiz=0m 

<li>再启动一个普通的ttserver，不与其他服务器相关</li>
    ttserver -host 192.168.0.100 -port 20002 -thnum 4 -dmn -ulim 1024m -ulog /data/ttserver/ulog_2/ -log /data/ttserver/temp_2/test_2.log -pid /data/ttserver/temp_2/test_2.pid -sid 11 /data/ttserver/temp_2/test_data_2.tch#bnum=1000#rcnum=0#xmsiz=0m 

<li>修改某个ttserver的master</li>
    tcrmgr setmst -port 20001 -mport 20002 192.168.0.100 192.168.0.100  
	  
注意：只有以复制方式启动的ttserver，修改master后才能从新的数据库复制数据  
注意：每个ttserver只能有一个master，修改后，不能再从以前的master复制数据
