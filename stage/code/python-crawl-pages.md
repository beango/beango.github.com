---
layout: page
section: Archive
categories: [Python]
date: 2012-12-24
title: "python爬虫"
description: "python爬虫，使用BeautifulSoup分析HTML，并保存到mongo"
tags: [python,BeautifulSoup,mongodb]
---
{% include JB/setup %}

*   module.py  

<a href="#" onclick="javascript:toggle(this);">+ 点击展开</a>
<div style="display:none;">
{% highlight python %}
#!/usr/bin/env python  
#coding:utf-8  

from mongoengine import *

class books(Document): 
    bookid = IntField()
    bookname = StringField()
    bookurl = StringField()
    def tostring(self):
        return {"bookid":self.bookid,"bookname":self.bookname,"bookurl":self.bookurl}

class bookgroup(Document): 
    groupid = IntField()
    bookid = ObjectIdField()
    groupname = StringField()
    def tostring(self):
        return {"bookid":self.bookid,"groupid":self.groupid,"groupname":self.groupname}

class booktitle(Document):
    titleno = IntField()
    bookid = ObjectIdField()
    #groupid = ObjectIdField()
    booktitle = StringField()
    titleurl = StringField()
    def tostring(self):
        return {"titleno":self.titleno,"bookid":self.bookid,"booktitle":self.booktitle,"titleurl":self.titleurl}

class charpter(Document):
    titleno = IntField()
    titleid = ObjectIdField()
    content = StringField()
    def tostring(self):
        return {"titleno":self.titleno,"titleid":self.titleid,"content":self.content}
{% endhighlight %}
</div>

*   crawl.py  

<a href="#" onclick="javascript:toggle(this);">+ 点击展开</a>
<div style="display:none;">
{% highlight python %}
#!/usr/bin/env python  
#coding:utf-8  

import re
import sys
from time import sleep, ctime
import time
import Queue
import gridfs
import thread, threading
import urllib, urllib2  
from bs4 import BeautifulSoup  
from pymongo import Connection
from module import *
from bson import ObjectId
config = {  
            'input':sys.stdin,   
            'output':'./samples',   
            'location':'xxx',   
            'has-fn':False,   
            'options':{'connect.timeout':60, 'timeout':3600},   
            'log':file('logs.txt', 'w'),   
        }  

hosts = ["http://www.58xs.com/html/75/75623/index.html",
         "http://www.58xs.com/html/180/180531/index.html",
         "http://www.58xs.com/html/177/177945/index.html",
         "http://www.58xs.com/html/195/195623/index.html",
         "http://www.58xs.com/html/187/187344/index.html",
         "http://www.58xs.com/html/196/196689/index.html",
         "http://www.58xs.com/html/117/117423/index.html",
         ]  

class ThreadUrl(threading.Thread):
    """Threaded Url Grab"""
    def __init__(self, queue_url, queue_charpter, bucket):
        threading.Thread.__init__(self)
        self.queue_url = queue_url
        self.queue_charpter = queue_charpter
        self.bucket = bucket
    def run(self):
        while not self.queue_url.empty():
            try:
                #grabs host from queue
                host = self.queue_url.get(False)

                #grabs urls of hosts and then grabs chunk of webpage
                url = urllib2.urlopen(host)
                chunk = url.read()

                #parse the chunk
                soup = BeautifulSoup(chunk,from_encoding="utf8")#"<head><title>1vca23</title></head>"  
                bookid = int(re.split("(/)",host)[-3:-2][0])
                title = soup.h1.string.encode("utf-8").strip().replace("最新章节","")

                oldbook = db.books.find_one({"bookid":bookid})
                if oldbook is None:
                    book1 = books(bookid=bookid, bookname=title, bookurl=host)
                    bookid = db.books.insert(book1.tostring())
                else:
                    bookid = ObjectId(oldbook["_id"])

                #print time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))+": "+str(bookid)
                
                content = soup.find("table","t")
                grouptitle = content.find_all("td")  
                i = 0
                j = 1
                groupid=1
                for g in grouptitle:
                    if 'class' not in g.attrs:
                        if not g.a or g.a["href"].find("http://")==0:
                            continue
                        else:
                            self.queue_charpter.put([bookid,host,g])
                self.queue_url.task_done()
            except Exception:
                self.bucket.put(sys.exc_info())
                    

class ThreadCharpter(threading.Thread):
    """Threaded Url Grab"""
    def __init__(self, queue_charpter, bucket):
        threading.Thread.__init__(self)
        self.queue_charpter = queue_charpter
        self.bucket = bucket
    def run(self):
        while not self.queue_charpter.empty():
            try:
                #grabs host from queue
                _item = self.queue_charpter.get(False)
                bookid = _item[0]
                host = _item[1]
                g = _item[2]

                charpterurl = "".join(re.split('(/)',host)[0:-1])+g.a["href"]
                titleno = int("".join(re.split('(\.)',"".join(re.split('(/)',charpterurl)[-1:]))[0:1]),0)
                oldtitle = db.booktitle.find_one({"titleno":titleno,"bookid":bookid})
                if oldtitle is None:
                    title1 = booktitle(titleno=titleno, bookid=bookid, booktitle=g.string.strip(), titleurl=charpterurl)
                    titleid = db.booktitle.insert(title1.tostring())#title1.save()["id"]
                else:
                    titleid = ObjectId(oldtitle["_id"])
                try:
                    charid = re.split('(\.)',re.split('(/)',charpterurl)[-1:][0])[0]
                    oldchar = db.charpter.find_one({"titleno":int(charid,0)})
                    if oldchar is None:
                        url2 = urllib2.urlopen(charpterurl)  
                        chunk2 = url2.read()
                        soup2 = BeautifulSoup(chunk2)
                        content = soup2.find("div",id="content")
                        
                        obj = content.find("fieldset")
                        if obj:
                            obj.replaceWith("")

                        obj = content.find("table")
                        if obj:
                            obj.replaceWith("")

                        obj = content.find("script")
                        if obj:
                            obj.replaceWith("")

                        obj = content.find("script")
                        if obj:
                            obj.replaceWith("")

                        obj = content.find("div")
                        if obj:
                            obj.replaceWith("")

                        obj = content.find("div")
                        if obj:
                            obj.replaceWith("")

                        charptercontent = content.prettify().replace("58xs.com","")
                        charpter1 = charpter(titleno=titleno,titleid=titleid,charpterid=int(charid,0), content=charptercontent)
                        charid = db.charpter.insert(charpter1.tostring())
                        
                        for img in soup2.find_all("img"):
                            u = urllib2.urlopen(img["src"])
                            r = u.read()
                            imgfile = "".join(re.split('(/)',img["src"])[-1:])
                            oid = fs.put(r, filename=imgfile, charpterid=charid)
                except IOError:
                    print charpterurl
                except:
                    print charpterurl
                    raise
                self.queue_charpter.task_done()
            except Queue.Empty:
                pass
            except Exception:
                self.bucket.put(sys.exc_info())
            
start = time.time()

conn = Connection("192.168.1.200")
db = conn.book
fs = gridfs.GridFS(db, collection='charpter')

def main():
    bucket = Queue.Queue()
    queue_url = Queue.Queue()
    queue_charpter = Queue.Queue()
    '''
    db.books.drop()
    db.bookgroup.drop()
    db.booktitle.drop()
    db.charpter.drop()
    db.charpter.files.drop()
    db.charpter.chunks.drop()
    '''
    threadsize=10

    for host in hosts:
        queue_url.put(host)
    threads = [] 
    
    while threadsize>0:
        t = ThreadUrl(queue_url, queue_charpter, bucket)
        t.start()
        threads.append(t)
        threadsize -= 1
   
    threadjoin(bucket,threads)
    
    threadsize = 10
    while threadsize>0:
        ct = ThreadCharpter(queue_charpter, bucket)
        ct.start()
        threads.append(ct)
        threadsize -= 1

    threadjoin(bucket,threads)

def threadjoin(bucket,threads):
    end = True
    while True:
        try:
            exc = bucket.get(block=False)
            raise Exception(exc)
        except Queue.Empty:
            pass
        for t in threads:
            if t.isAlive(): 
                end = False; 
                break;
        if end: 
            break; 
        else:
            end = True
            continue
main()
print "Elapsed Time: %s" % (time.time() - start)
{% endhighlight %}
</div>
