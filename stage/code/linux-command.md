---
layout: page
section: Code
categories: Favorite
date: 2012-11-05
title: "Linux常用命令"
description: "Linux常用命令"
---

### 一、网络

-   查看IP或MAC地址

<label/>
    ifconfig -a   
    cat /sys/class/net/eth0/address #查看eth0的mac地址  
    cat /proc/net/arp #查看连接到本机的远端ip的mac地址

-   指定ip地址

<label/>
    vim /etc/sysconfig/network-scripts/ifcfg-eth0  
    DEVICE=eth0    
    ONBOOT=yes  
    BOOTPROTO=static  
    IPADDR=192.168.1.115  
    NETMASK=255.255.255.0  
    GATEWAY=192.168.1.1  
    TYPE=Ethernet  
    USERCTL=no  
    NETWORK=192.168.1.0  
    BROADCAST=192.168.1.255  
    PEERDNS=no  
    HWADDR=00:50:56:44:41:9b 

-   使IP地址生效

<label/>
    /sbin/ifdown eth0  
    /sbin/ifup eth0

-   配置dns解析

<label/>
    #将nameserver 211.98.1.28写入/etc/resolv.conf，重启网络服务后生效  
    echo "nameserver 211.98.1.28" >> /etc/resolv.conf 

-   网络服务重启

<label/>
    service network start  
    service network stop  
    service network restart 

-   重启后永久性生效

<label/>
    chkconfig iptables on  //开启
    chkconfig iptables off //关闭

-   即时生效，重启后失效

<label/>
    service iptables start  //开启
    service iptables stop   //关闭

-   开放端口  

<label/>
    /sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT #80为指定端口  
    /etc/rc.d/init.d/iptables save #将更改保存到iptables

-   其他 

<label/>
    /etc/rc.d/init.d/iptables stop #关闭防火墙,start,restart  
    vim /etc/sysconfig/iptables

-   防火墙配置

<label/>
    -P INPUT DROP #禁止掉服务器所有入口请求，后面的规则只允许部分常用的服务端口  
    -P OUTPUT ACCEPT #允许服务器访问出口请求  
    -A INPUT -i lo -j ACCEPT #允许本地接口访问  
    -A INPUT -p icmp -m icmp --icmp-type 8 -j DROP #禁止ping，因为ping是基于icmp协议的  
    -A INPUT -p tcp -m tcp --dport 20 -j ACCEPT #允许部分常用端口入口请求访问  
    -A INPUT -p tcp -m tcp --dport 21 -j ACCEPT  
    -A INPUT -p tcp -m tcp --dport 25 -j ACCEPT  
    -A INPUT -p tcp -m tcp --dport 53 -j ACCEPT  
    -A INPUT -p udp -m udp --dport 53 -j ACCEPT  
    -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT  
    -A INPUT -p all -m state --state ESTABLISHED,RELATED -j ACCEPT #允许所有已经连接端口请求  
    -A INPUT -p all -m state --state INVALID,NEW -j DROP  


### 二、常用命令

-   删除文件夹下所有文件  

<label/>
    rm –rf *


-   查找文件  

<label/>
    find / -name "*memcache*" //查找根目录下，文件名匹配memcache的文件

-   查找包安装位置  

<label/>
    rpm -qa | grep apache
    rpm -ql 包名

### 二、系统相关

-   centos修改为命令行启动  

<label/>
    #默认的 run level 设置中,可以看到第一行书写如:id:5:initdefault:(默认的 run level 等级为 5,即图形界面)  
    #将第一行的 5 修改为 3 即可。  
    vim /etc/inittab  
