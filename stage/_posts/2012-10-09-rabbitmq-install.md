---
layout: post
section: Archive
category: default
date: 2012-10-09
title: "RabbitMQ安装及使用"
description: "RabbitMQ安装及使用"
tags: [rabbitmq]
---
{% include JB/setup %}

<h3 id="blockquote">介绍：</h3>

rabbitMQ是一个在AMQP协议标准基础上完整的，可服用的企业消息系统。他遵循Mozilla Public License开源协议。采用 Erlang 实现的工业级的消息队列(MQ)服务器。

RabbitMQ的官方站：[http://www.rabbitmq.com/](http://www.rabbitmq.com/)

<h3 id="blockquote">RabbitMQ安装（windows）</h3>

*   首先需要下载erlang运行时环境(Windows binary): [http://erlang.org/download.html](http://erlang.org/download.html)
    下面设置一下环境变量：变量名：ERLANG_HOME，变量值：安装路径

*   接着下载RabbitMQ Server（目前最新版本为2.8.7），链接如下：[http://www.rabbitmq.com/server.html](http://www.rabbitmq.com/server.html)
    安装并启动服务。

<h3 id="blockquote">RabbitMQ安装（CentOS）</h3>

*   安装erlang：

<label/>
    tar zxvf otp_src_R15B02.tar.gz  
    cd otp_src_R15B02  
    ./configure  
    make  
    make install

*   安装rabbitmq-server，可以直接下载Binary(rabbitmq-server-generic-unix-2.8.7.tar.gz)，解压并运行sbin/rabbitmq-server即可
    
<label/>
    tar zxvf rabbitmq-server-generic-unix-2.8.7.tar.gz  
    ln -s /usr/local/rabbitmq/sbin/* /usr/local/bin/ 
    
*   安装管理插件，访问地址：[http://localhost:55672/mgmt](http://localhost:55672/mgmt)用户名guest，密码guest  
    
<label/>
    rabbitmq-plugins enable rabbitmq_management

*   修改或创建rabbitmq-env.conf  

<label/>
    #!/bin/sh  
    # I am a complete /etc/rabbitmq/rabbitmq-env.conf file.  
    # Comment lines start with a hash character.  
    # This is a /bin/sh script file - use ordinary envt var syntax  
    NODENAME=beango  
    RABBIT_HOME=/usr/local/rabbitmq  
    MNESIA_BASE=/usr/local/rabbitmq/data  
    LOG_BASE=/usr/local/rabbitmq/log  
    CONFIG_FILE=/usr/local/rabbitmq/etc/rabbitmq/rabbitmq  

*   修改或创建/usr/local/rabbitmq/etc/rabbitmq/rabbitmq.config  

<label/>
    {rabbit,  
        [  
            {vm_memory_limit,0.6},  
            {disk_free_limit,100000000}  
        ]}  
    ].

*   启动与关闭服务  

启动：
    nohup rabbitmq-server start > /usr/local/rabbitmq/log/system.log \ 2>/usr/local/rabbitmq/log/system.log &  

关闭：  
    rabbitmqctl stop

<h3 id="blockquote">RabbitMQ配置</h3>

*   首先创建vhosts，命令如下：

添加创建虚拟主机  
    D:\rabbitmq\sbin>rabbitmqctl add_vhost dnt_mq  #删除 rabbitmqctl delete_vhost vhostpath

用下面指定就可以显示出所有虚拟主机信息：
    D:\rabbitmq\sbin>rabbitmqctl list_vhosts  
    Listing vhosts ...  
    /   （根目录）  
    dnt_mq

下面添加用户和密码(用户名admin, 密码：111111)：
    D:\rabbitmq\sbin>rabbitmqctl add_user admin 111111  
    //修改用户密码：rabbitmqctl change_password username newpassword

绑定用户权限： 
    D:\rabbitmq\sbin>rabbitmqctl set_permissions -p dnt_mq admin ".*" ".*" ".*"  
    Setting permissions for user "admin" in vhost "dnt_mq" ...

列出用户权限：
    D:\rabbitmq\sbin>rabbitmqctl list_user_permissions daizhj  
    //清除用户权限 rabbitmqctl clear_permissions [-p vhostpath] username
    Listing permissions for user "daizhj" ...
    dnt_mq  .*      .*      .*      client
    
<h3 id="blockquote">RabbitMQ使用</h3>

*   Main

<label/>
    private const string exchange = "dnt_mq";  
    private const string queuename = "com.iuwebs.queue1";  
      
    public static int Main(string[] args1)  
    {  
        ConnectionFactory cf = new ConnectionFactory();  
        cf.Uri = "amqp://192.168.1.121:5672";  
        int msgCount = 10;  
        using (IConnection conn = cf.CreateConnection())  
        {  
            using (IModel ch = conn.CreateModel())  
            {  
                ensureQueue(ch);  
    
                sendMessages(ch, queuename, 2 * msgCount);  
                using (Subscription sub = new Subscription(ch, queuename,false))//创建订阅，不会自动ack响应  
                {  
                    enumeratingReceiveMessages(sub, msgCount);  
                }  
            }  
        }  
        return 0;  
    }  

*   ensureQueue

<label/>
    private static void ensureQueue(IModel ch)  
    {  
        ch.ExchangeDeclare("dnt_mq", "direct");  
        //durable:是否持久化消息队列，即服务器重启后，这个queue及其中的消息是否存在  
        //exclusive:排他性队列（Exclusive Queue)，只对首次声明它的连接（Connection）可见；会在其连接断开的时候自动删除。  
        //autoDelete:这个queue不再使用的时候会被删除  
        ch.QueueDeclare(queuename, true, false, false, null);  
        ch.QueueBind(queuename, exchange, queuename, null);  
    }

*   sendMessages

<label/>
    private static void sendMessages(IModel ch, string queueName, long msgCount)  
    {  
        var basicPro = ch.CreateBasicProperties();  
        basicPro.DeliveryMode = 2;//是否持久化消息，1不是，2是  
        while (msgCount-- > 0)  
        {  
            ch.BasicPublish(exchange, queueName, basicPro, Encoding.UTF8.GetBytes("Welcome to Caerbannog!-持久化"));  
        }  
    }

*   enumeratingReceiveMessages

<label/>
    private static void enumeratingReceiveMessages(Subscription sub, long msgCount)  
    {  
        foreach (BasicDeliverEventArgs ev in sub)  
        {  
            Console.WriteLine("Message {0}: {1}", i, Encoding.UTF8.GetString(ev.Body));  
            sub.Ack(ev); //发回响应，否则消息队列还将存在  
        }  
    }