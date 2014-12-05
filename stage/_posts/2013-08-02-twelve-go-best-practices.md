---
layout: post
category: default
date: 2013-08-02
title: "Go 语言 12 条最佳实践"
description: "Go 语言 12 条最佳实践"
tags: [go]
redirecturl: http://blog.jobbole.com/44608/
---
{% include JB/setup %}

本文来自 Google 工程师 Francesc Campoy Flores 分享的幻灯片。内容包括：代码组织、API、并发最佳实践和一些推荐的相关资源。

### 最佳实践

维基百科的定义是：“最佳实践是一种方法或技术，其结果始终优于其他方式。”

写Go代码的目标就是：

-   简洁
-   可读性强
-   可维护性好

### 样例代码

<label />
    type Gopher struct {
        Name     string
        Age      int32
        FurColor color.Color
    }
     
    func (g *Gopher) DumpBinary(w io.Writer) error {
        err := binary.Write(w, binary.LittleEndian, int32(len(g.Name)))
        if err == nil {
            _, err := w.Write([]byte(g.Name))
            if err == nil {
                err := binary.Write(w, binary.LittleEndian, g.Age)
                if err == nil {
                    return binary.Write(w, binary.LittleEndian, g.FurColor)
                }
                return err
            }
            return err
        }
        return err
    }

### 避免嵌套的处理错误

<label />
    func (g *Gopher) DumpBinary(w io.Writer) error {
        err := binary.Write(w, binary.LittleEndian, int32(len(g.Name)))
        if err != nil {
            return err
        }
        _, err = w.Write([]byte(g.Name))
        if err != nil {
            return err
        }
        err = binary.Write(w, binary.LittleEndian, g.Age)
        if err != nil {
            return err
        }
        return binary.Write(w, binary.LittleEndian, g.FurColor)
    }

减少嵌套意味着提高代码的可读性

### 尽可能避免重复

功能单一，代码更简洁

    type binWriter struct {
        w   io.Writer
        err error
    }
     
    // Write writes a value into its writer using little endian.
    func (w *binWriter) Write(v interface{}) {
        if w.err != nil {
            return
        }
        w.err = binary.Write(w.w, binary.LittleEndian, v)
    }
     
    func (g *Gopher) DumpBinary(w io.Writer) error {
        bw := &binWriter{w: w}
        bw.Write(int32(len(g.Name)))
        bw.Write([]byte(g.Name))
        bw.Write(g.Age)
        bw.Write(g.FurColor)
        return bw.err
    }

### 使用类型推断来处理特殊情况

<label />
    // Write writes a value into its writer using little endian.
    func (w *binWriter) Write(v interface{}) {
        if w.err != nil {
            return
        }
        switch v.(type) {
        case string:
            s := v.(string)
            w.Write(int32(len(s)))
            w.Write([]byte(s))
        default:
            w.err = binary.Write(w.w, binary.LittleEndian, v)
        }
    }
     
    func (g *Gopher) DumpBinary(w io.Writer) error {
        bw := &binWriter{w: w}
        bw.Write(g.Name)
        bw.Write(g.Age)
        bw.Write(g.FurColor)
        return bw.err
    }

### 类型推断的变量声明要短

<label />
    // Write write the given value into the writer using little endian.
    func (w *binWriter) Write(v interface{}) {
        if w.err != nil {
            return
        }
        switch v := v.(type) {
        case string:
            w.Write(int32(len(v)))
            w.Write([]byte(v))
        default:
            w.err = binary.Write(w.w, binary.LittleEndian, v)
        }
    }

### 函数适配器

<label />
    func init() {
        http.HandleFunc("/", handler)
    }
     
    func handler(w http.ResponseWriter, r *http.Request) {
        err := doThis()
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            log.Printf("handling %q: %v", r.RequestURI, err)
            return
        }
     
        err = doThat()
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            log.Printf("handling %q: %v", r.RequestURI, err)
            return
        }
    }
     
    func init() {
        http.HandleFunc("/", errorHandler(betterHandler))
    }
     
    func errorHandler(f func(http.ResponseWriter, *http.Request) error) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            err := f(w, r)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                log.Printf("handling %q: %v", r.RequestURI, err)
            }
        }
    }
     
    func betterHandler(w http.ResponseWriter, r *http.Request) error {
        if err := doThis(); err != nil {
            return fmt.Errorf("doing this: %v", err)
        }
     
        if err := doThat(); err != nil {
            return fmt.Errorf("doing that: %v", err)
        }
        return nil
    }

如何组织代码
------------

### 将重要的代码放前面

版权信息，构建信息，包说明文档

Import 声明，相关的包连起来构成组，组与组之间用空行隔开。

    import (
        "fmt"
        "io"
        "log"
     
        "code.google.com/p/go.net/websocket"
    )

接下来代码以最重要的类型开始，以工具函数和类型结束。

### 如何编写文档

包名之前要写相关文档

    // Package playground registers an HTTP handler at "/compile" that
    // proxies requests to the golang.org playground service.
    package playground

导出的标识符（译者按：大写的标识符为导出标识符）会出现在 `godoc`中，所以要正确的编写文档。

    // Author represents the person who wrote and/or is presenting the document.
    type Author struct {
        Elem []Elem
    }
     
    // TextElem returns the first text elements of the author details.
    // This is used to display the author' name, job title, and company
    // without the contact details.
    func (p *Author) TextElem() (elems []Elem) {

[生成的文档示例](http://godoc.org/code.google.com/p/go.talks/pkg/present#Author)

[Gocode: 文档化Go代码](http://blog.golang.org/godoc-documenting-go-code)

 

### 越简洁越好

长代码往往不是最好的.试着使用能自解释的最短的变量名.

-   用 `MarshalIndent` ，别用 `MarshalWithIndentation`.

别忘了包名会出现在你选择的标识符前面

-   In package `encoding/json` we find the type `Encoder`, not `JSONEncoder`.

-   It is referred as `json.Encoder`.

有多个文件的包

需要将一个包分散到多个文件中吗?

-   避免行数非常多的文件

标准库中 `net/http` 包有47个文件，共计 15734 行.

-   拆分代码并测试

`net/http/cookie.go` 和 `net/http/cookie_test.go`  都是 `http `包的一部分.

测试代码 只有 在测试时才会编译.

-   多文件包的文档编写

如果一个包中有多个文件, 可以很方便的创建一个 `doc.go `文件，包含包文档信息.

### 让包可以”go get”到

一些包将来可能会被复用，另外一些不会.

定义了一些网络协议的包可能会在开发一个可执行命令时复用.

[github.com/bradfitz/camlistore](https://github.com/bradfitz/camlistore)

接口
----

### 你需要什么

让我们以之前的Gopher类型为例

    type Gopher struct {
        Name     string
        Age      int32
        FurColor color.Color
    }

我们可以定义这个方法

    func (g *Gopher) DumpToFile(f *os.File) error {

但是使用一个具体的类型会让代码难以测试，因此我们使用接口.

    func (g *Gopher) DumpToReadWriter(rw io.ReadWriter) error {

进而，由于使用的是接口，我们可以只请求我们需要的.

    func (g *Gopher) DumpToWriter(f io.Writer) error {

### 让独立的包彼此独立

<label />
    import (
        "code.google.com/p/go.talks/2013/bestpractices/funcdraw/drawer"
        "code.google.com/p/go.talks/2013/bestpractices/funcdraw/parser"
    )
     
     // Parse the text into an executable function.
        f, err := parser.Parse(text)
        if err != nil {
            log.Fatalf("parse %q: %v", text, err)
        }
     
        // Create an image plotting the function.
        m := drawer.Draw(f, *width, *height, *xmin, *xmax)
     
        // Encode the image into the standard output.
        err = png.Encode(os.Stdout, m)
        if err != nil {
            log.Fatalf("encode image: %v", err)
        }

### 解析

<label />
    type ParsedFunc struct {
        text string
        eval func(float64) float64
    }
     
    func Parse(text string) (*ParsedFunc, error) {
        f, err := parse(text)
        if err != nil {
            return nil, err
        }
        return &ParsedFunc{text: text, eval: f}, nil
    }
     
    func (f *ParsedFunc) Eval(x float64) float64 { return f.eval(x) }
    func (f *ParsedFunc) String() string         { return f.text }

### 描绘

<label />
    import (
        "image"
     
        "code.google.com/p/go.talks/2013/bestpractices/funcdraw/parser"
    )
     
    // Draw draws an image showing a rendering of the passed ParsedFunc.
    func DrawParsedFunc(f parser.ParsedFunc) image.Image {

使用接口来避免依赖.

    import "image"

    // Function represent a drawable mathematical function.
    type Function interface {
        Eval(float64) float64
    }

    // Draw draws an image showing a rendering of the passed Function.
    func Draw(f Function) image.Image {

### 测试

使用接口而不是具体类型让测试更简洁.

    package drawer
     
    import (
        "math"
        "testing"
    )
     
    type TestFunc func(float64) float64
     
    func (f TestFunc) Eval(x float64) float64 { return f(x) }
     
    var (
        ident = TestFunc(func(x float64) float64 { return x })
        sin   = TestFunc(math.Sin)
    )
     
    func TestDraw_Ident(t *testing.T) {
        m := Draw(ident)
        // Verify obtained image.

### 在接口中避免并发

<label />

    func doConcurrently(job string, err chan error) {
        go func() {
            fmt.Println("doing job", job)
            time.Sleep(1 * time.Second)
            err <- errors.New("something went wrong!")
        }()
    }
     
    func main() {
        jobs := []string{"one", "two", "three"}
     
        errc := make(chan error)
        for _, job := range jobs {
            doConcurrently(job, errc)
        }
        for _ = range jobs {
            if err := <-errc; err != nil {
                fmt.Println(err)
            }
        }
    }

如果我们想串行的使用它会怎样?

    func do(job string) error {
        fmt.Println("doing job", job)
        time.Sleep(1 * time.Second)
        return errors.New("something went wrong!")
    }
     
    func main() {
        jobs := []string{"one", "two", "three"}
     
        errc := make(chan error)
        for _, job := range jobs {
            go func(job string) {
                errc <- do(job)
            }(job)
        }
        for _ = range jobs {
            if err := <-errc; err != nil {
                fmt.Println(err)
            }
        }
    }

暴露同步的接口，这样异步调用这些接口会简单.

并发的最佳实践
--------------

### 使用goroutines管理状态

使用chan或者有chan的结构体和goroutine通信

    type Server struct{ quit chan bool }
     
    func NewServer() *Server {
        s := &Server{make(chan bool)}
        go s.run()
        return s
    }
     
    func (s *Server) run() {
        for {
            select {
            case <-s.quit:
                fmt.Println("finishing task")
                time.Sleep(time.Second)
                fmt.Println("task done")
                s.quit <- true
                return
            case <-time.After(time.Second):
                fmt.Println("running task")
            }
        }
    }
     
    func (s *Server) Stop() {
        fmt.Println("server stopping")
        s.quit <- true
        <-s.quit
        fmt.Println("server stopped")
    }
     
    func main() {
        s := NewServer()
        time.Sleep(2 * time.Second)
        s.Stop()
    }

### 使用带缓存的chan，来避免goroutine内存泄漏

<label />
    func sendMsg(msg, addr string) error {
        conn, err := net.Dial("tcp", addr)
        if err != nil {
            return err
        }
        defer conn.Close()
        _, err = fmt.Fprint(conn, msg)
        return err
    }
     
    func main() {
        addr := []string{"localhost:8080", "http://google.com"}
        err := broadcastMsg("hi", addr)
     
        time.Sleep(time.Second)
     
        if err != nil {
            fmt.Println(err)
            return
        }
        fmt.Println("everything went fine")
    }
     
    func broadcastMsg(msg string, addrs []string) error {
        errc := make(chan error)
        for _, addr := range addrs {
            go func(addr string) {
                errc <- sendMsg(msg, addr)
                fmt.Println("done")
            }(addr)
        }
     
        for _ = range addrs {
            if err := <-errc; err != nil {
                return err
            }
        }
        return nil
    }

-   goroutine阻塞在chan写操作
-   goroutine保存了一个chan的引用
-   chan永远不会垃圾回收

    func broadcastMsg(msg string, addrs []string) error {
        errc := make(chan error, len(addrs))
        for _, addr := range addrs {
            go func(addr string) {
                errc <- sendMsg(msg, addr)
                fmt.Println("done")
            }(addr)
        }
     
        for _ = range addrs {
            if err := <-errc; err != nil {
                return err
            }
        }
        return nil
    }

如果我们不能预测channel的容量呢?

### 使用quit chan避免goroutine内存泄漏

<label />
    func broadcastMsg(msg string, addrs []string) error {
        errc := make(chan error)
        quit := make(chan struct{})
     
        defer close(quit)
     
        for _, addr := range addrs {
            go func(addr string) {
                select {
                case errc <- sendMsg(msg, addr):
                    fmt.Println("done")
                case <-quit:
                    fmt.Println("quit")
                }
            }(addr)
        }
     
        for _ = range addrs {
            if err := <-errc; err != nil {
                return err
            }
        }
        return nil
    }

### 12条最佳实践

 ​1. 避免嵌套的处理错误  
 2. 尽可能避免重复  
 3. 将重要的代码放前面  
 4. 为代码编写文档  
 5. 越简洁越好  
 6. 讲包拆分到多个文件中  
 7. 让包”go get”到  
 8. 按需请求  
 9. 让独立的包彼此独立  
 10. 在接口中避免并发  
 11. 使用goroutine管理状态  
 12. 避免goroutine内存泄漏

### 

### 一些链接

资源

-   Go 首页 [golang.org](http://golang.org/)
-   Go 交互式体验 [tour.golang.org](http://tour.golang.org/)

其他演讲

-   用go做词法扫描 [video](http://www.youtube.com/watch?v=HxaD_trXwRE)
-   并发不是并行 [video](http://vimeo.com/49718712)
-   Go并发模式 [video](http://www.youtube.com/watch?v=f6kdp27TYZs)
-   Go高级并发模式 [video](http://www.youtube.com/watch?v=QDDwwePbDtw)

### 

### 谢谢

Francesc Campoy Flores

Gopher at Google

[@campoy83](http://twitter.com/campoy83)

[http://campoy.cat/+](http://campoy.cat/+)

[http://golang.org](http://golang.org/)

原文链接： [Francesc Campoy Flores](http://t.cn/zQ6eR2E)   
翻译：[伯乐在线](http://blog.jobbole.com) - [Codefor](http://blog.jobbole.com/author/codefor/)  
译文链接：[http://blog.jobbole.com/44608/](http://blog.jobbole.com/44608/)
