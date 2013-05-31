---
layout: post
categories: [java]
date: 2012-09-07
title: "Java编码易疏忽的十个问题"
description: "Java编码易疏忽的十个问题"
tags: [java]
redirecturl: http://www.infoq.com/cn/articles/10-java-questions-easy-to-ignore
---
{% include JB/setup %}

在Java编码中，我们容易犯一些错误，也容易疏忽一些问题，因此笔者对日常编码中曾遇到的一些经典情形归纳整理成文，以共同探讨。

1. 纠结的同名
-------------

**现象**

很多类的命名相同（例如：常见于异常、常量、日志等类），导致在import时，有时候张冠李戴，这种错误有时候很隐蔽。因为往往同名的类功能也类似，所以IDE不会提示warn。

**解决**

写完代码时，扫视下import部分，看看有没有不熟悉的。替换成正确导入后，要注意下注释是否也作相应修改。

**启示**

命名尽量避开重复名，特别要避开与JDK中的类重名，否则容易导入错，同时存在大量重名类，在查找时，也需要更多的辨别时间。

2. 想当然的API
--------------

**现象**

有时候调用API时，会想当然的通过名字直接自信满满地调用，导致很惊讶的一些错误：

示例一：flag是true？

    boolean flag = Boolean.getBoolean("true");

可能老是false。

示例二：这是去年的今天吗（今年是2012年，不考虑闰年）？结果还是2012年：

    Calendar calendar = GregorianCalendar.getInstance();
    calendar.roll(Calendar.DAY_OF_YEAR, -365);

下面的才是去年：

    calendar.add(Calendar.DAY_OF_YEAR, -365); 

**解决办法**

问自己几个问题，这个方法我很熟悉吗？有没有类似的API?区别是什么？就示例一而言，需要区别的如下：

    Boolean.valueOf(b) VS Boolean.parseBoolean(b) VS Boolean.getBoolean(b);

**启示**

名字起的更详细点，注释更清楚点，不要不经了解、测试就想当然的用一些API，如果时间有限，用自己最为熟悉的API。

3. 有时候溢出并不难
-------------------

**现象**

有时候溢出并不难，虽然不常复现：

示例一：

    long x=Integer.MAX_VALUE+1;
    System.out.println(x);

x是多少？竟然是-2147483648，明明加上1之后还是long的范围。类似的经常出现在时间计算：

    数字1×数字2×数字3… 

示例二：

在检查是否为正数的参数校验中，为了避免重载，选用参数number,于是下面代码结果小于0，也是因为溢出导致：

    Number i=Long.MAX_VALUE;
    System.out.println(i.intValue()>0);

**解决**

1.  让第一个操作数是long型，例如加上L或者l（不建议小写字母l，因为和数字1太相似了）；
2.  不确定时，还是使用重载吧，即使用doubleValue()，当参数是BigDecimal参数时，也不能解决问题。

**启示**

对数字运用要保持敏感：涉及数字计算就要考虑溢出；涉及除法就要考虑被除数是0；实在容纳不下了可以考虑BigDecimal之类。

4. 日志跑哪了？
--------------

**现象**

有时候觉得log都打了，怎么找不到？

示例一：没有stack trace！

     } catch (Exception ex) {
        log.error(ex);
     }

示例二：找不到log！

    } catch (ConfigurationException e) {
        e.printStackTrace();
    }

**解决**

1.  替换成log.error(ex.getMessage(),ex);
2.  换成普通的log4j吧，而不是System.out。

**启示**

1.  API定义应该避免让人犯错，如果多加个重载的log.error(Exception)自然没有错误发生
2.  在产品代码中，使用的一些方法要考虑是否有效，使用e.printStackTrace()要想下终端(Console)在哪。

5. 遗忘的volatile
-----------------

**现象**

在DCL模式中，总是忘记加一个Volatile。

    private static CacheImpl instance;  //lose volatile
    public static CacheImpl getInstance() {
        if (instance == null) {
            synchronized (CacheImpl.class) {
                if (instance == null) {
                    instance = new CacheImpl (); 
                }
            }
        }
        return instance;
    }

**解决**

毋庸置疑，加上一个吧，synchronized锁的是一块代码（整个方法或某个代码块），保证的是这”块“代码的可见性及原子性，但是instance == null第一次判断时不再范围内的。所以可能读出的是过期的null。

**启示**

我们总是觉得某些低概率的事件很难发生，例如某个时间并发的可能性、某个异常抛出的可能性，所以不加控制，但是如果可以，还是按照前人的“最佳实践”来写代码吧。至少不用过多解释为啥另辟蹊径。

6. 不要影响彼此
---------------

**现象**

在释放多个IO资源时，都会抛出IOException ，于是可能为了省事如此写：

    public static void inputToOutput(InputStream is, OutputStream os,
               boolean isClose) throws IOException {
        BufferedInputStream bis = new BufferedInputStream(is, 1024);
        BufferedOutputStream bos = new BufferedOutputStream(os, 1024);  
        ….
        if (isClose) {
           bos.close();
           bis.close();
        }
    }

假设bos关闭失败，bis还能关闭吗？当然不能！

**解决办法**

虽然抛出的是同一个异常，但是还是各自捕获各的为好。否则第一个失败，后一个面就没有机会去释放资源了。

**启示**

代码/模块之间可能存在依赖，要充分识别对相互的依赖。

7. 用断言取代参数校验
---------------------

**现象**

如题所提，作为防御式编程常用的方式：断言，写在产品代码中做参数校验等。例如：

    private void send(List< Event> eventList)  {
        assert eventList != null;
    }

**解决**

换成正常的统一的参数校验方法。因为断言默认是关闭的，所以起不起作用完全在于配置，如果采用默认配置，经历了eventList != null结果还没有起到作用，徒劳无功。

**启示**

有的时候，代码起不起作用，不仅在于用例，还在于配置，例如断言是否启用、log级别等，要结合真实环境做有用编码。

8. 用户认知负担有时候很重
-------------------------

**现象**

先来比较三组例子，看看那些看着更顺畅？

示例一：

    public void caller(int a, String b, float c, String d) {
        methodOne(d, z, b);
        methodTwo(b, c, d);
    }
    public void methodOne(String d, float z, String b)  
    public void methodTwo(String b, float c, String d)

示例二：

    public boolean remove(String key, long timeout) {
                 Future< Boolean> future = memcachedClient.delete(key);
    public boolean delete(String key, long timeout) {
                 Future< Boolean> future = memcachedClient.delete(key);

示例三：

    public static String getDigest(String filePath, DigestAlgorithm algorithm)
    public static String getDigest(String filePath, DigestAlgorithm digestAlgorithm)

**解决**

1.  保持参数传递顺序；
2.  remove变成了delete，显得突兀了点， 统一表达更好；
3.  保持表达，少缩写也会看起来流畅点。

**启示**

在编码过程中，不管是参数的顺序还是命名都尽量统一，这样用户的认知负担会很少，不要要用户容易犯错或迷惑。例如用枚举代替string从而不让用户迷惑到底传什么string,诸如此类。

9. 忽视日志记录时机、级别
-------------------------

**现象**

存在下面两则示例：

示例一：该不该记录日志？

    catch (SocketException e)
    {
        LOG.error("server error", e);
        throw new ConnectionException(e.getMessage(), e);
    }   

示例二：记什么级别日志？

在用户登录系统中，每次失败登录：

    LOG.warn("Failed to login by "+username+");

**解决**

1.  移除日志记录：在遇到需要re-throw的异常时，如果每个人都按照先记录后throw的方式去处理，那么对一个错误会记录太多的日志，所以不推荐如此做；但是如果re-throw出去的exception没有带完整的trace(即cause)，那么最好还是记录下。
2.  如果恶意登录，那系统内部会出现太多WARN，从而让管理员误以为是代码错误。可以反馈用户以错误，但是不要记录用户错误的行为，除非想达到控制的目的。

**启示**

日志改不改记？记成什么级别？如何记？这些都是问题，一定要根据具体情况，需要考虑：

1.  是用户行为错误还是代码错误？
2.  记录下来的日志，能否能给别人在不造成过多的干扰前提下提供有用的信息以快速定位问题。

10. 忘设初始容量
----------------

**现象**

在JAVA中，我们常用Collection中的Map做Cache,但是我们经常会遗忘设置初始容量。

    cache = new LRULinkedHashMap< K, V>(maxCapacity);

**解决**

初始容量的影响有多大？拿LinkedHashMap来说，初始容量如果不设置默认是16，超过16×LOAD\_FACTOR,会resize(2\* table.length),扩大2倍：采用 Entry[] newTable = new Entry[newCapacity];transfer(newTable)，即整个数组Copy，那么对于一个需要做大容量CACHE来说，从16变成一个很大的数量，需要做多少次数组复制可想而知。如果初始容量就设置很大，自然会减少resize,不过可能会担心，初始容量设置很大时，没有Cache内容仍然会占用过大体积。其实可以参考以下表格简单计算下,初始时还没有cache内容, 每个对象仅仅是4字节引用而已。

-   memory for reference fields (4 bytes each);
-   memory for primitive fields

<laleb />
    ----------- ----------------
    Java type   Bytes required
    boolean     1
    byte         
    char        2
    short        
    int         4
    float        
    long        8
    double       
    ----------- ----------------

**启示**

不仅是map,还有stringBuffer等，都有容量resize的过程，如果数据量很大，就不能忽视初始容量可以考虑设置下，否则不仅有频繁的resize还容易浪费容量。

在Java编程中，除了上面枚举的一些容易忽视的问题，日常实践中还存在很多。相信通过不断的总结和努力，可以将我们的程序完美呈现给读者。
