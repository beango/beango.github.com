---
layout: post
category: default
date: 2012-02-01
title: "完全理解关键字this"
description: "完全理解关键字this"
tags: [javascript]
redirecturl: http://blog.jobbole.com/12203/
---


今天的教程来自天才的[Cody Lindley](http://codylindley.com/)的新书：《JavaScript启蒙教程[JavaScript Enlightenment](http://javascriptenlightenment.com/)》。他讨论了令人迷惑的关键字this，以及确定和设置this的值的方法。

**概念性的概述this**

当一个函数创建后，一个关键字this就随之(在后台)创建，它链接到一个对象，而函数正是在这个对象中进行操作。换句话说，关键字this可在函数中使用，是对一个对象的引用，而函数正是该对象的属性或方法。

让我们来看这个对象：

    <!DOCTYPE html><html lang="en"><body><script>
    var cody = {
      living:true,
      age:23,
      gender:'male',
      getGender:function(){return cody.gender;}
    };
     
    console.log(cody.getGender()); // logs 'male'
     
    </script></body></html>

注意在函数getGender里，由于在cody对象内部，我们可以通过.来获取gender属性(也就是cody.gender)。也可以用this来获取cody对象，因为this正是指向cody对象。

    <!DOCTYPE html><html lang="en"><body><script>
    var cody = {
      living:true,
      age:23,
      gender:'male',
      getGender:function(){return this.gender;}
    };
     
    console.log(cody.getGender()); // logs 'male'
     
    </script></body></html>

this.gender中this指向cody对象，而getGender函数可以操作cody对象。

关于this的主题可能有点让人感到困惑，其实不必如此。仅记住，通常，this指向的对象正是包含函数的对象，而不是函数本身（当然也有例外，例如采用关键字new或者call()和apply()）。

**重要提示**

****- 关键字this就像其他的变量，唯一不同就是你不能更改它。

-
不同于传给函数的其他参数和变量，在调用函数的对象中，this是一个关键字(而不是属性)。

**如何确定this的值？**

this传递给所有的函数，它的值取决于函数运行时何时被调用。这里请注意，因为这是你需要记住的一个很特别的地方。

下面的代码中myObject对象有个属性sayFoo，它指向函数sayFoo。当在全局域中调用sayFoo函数时，this指向window对象。当myObject调用函数时，this指向的是myObject。

因为myObject有个叫foo的属性，在这里被使用。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var foo = 'foo';
    var myObject = {foo: 'I am myObject.foo'};
     
    var sayFoo = function() {
      console.log(this['foo']);
    };
     
    ￼￼// give myObject a sayFoo property and have it point to sayFoo function
    myObject.sayFoo = sayFoo;
    myObject.sayFoo(); // logs 'I am myObject.foo' 12
     
    sayFoo(); // logs 'foo'
     
    </script></body></html>

很清楚，this的值取决于函数什么时候被调用。myObject.sayFoo和sayFoo都指向同样的函数，但sayFoo()调用的上下文不同，this的值也就不同。下面是类似的代码，head对象(window)显式使用，希望对你有用。

    <!DOCTYPE html><html lang="en"><body><script>
     
    window.foo = 'foo';
    window.myObject = {foo: 'I am myObject.foo'};
    window.sayFoo = function() { ! console.log(this.foo); };
    window.myObject.sayFoo = window.sayFoo;
    window.myObject.sayFoo();
    window.sayFoo();
     
    </script></body></html>

确保当你有多个引用指向同一个函数的时候，你清楚的知道this的值是随调用函数的上下文的不同而改变。

**重要提示**

****- 除了this以外的所有变量和参数都属于静态变量范围([lexical
scope](http://en.wikipedia.org/wiki/Lexical_scope#Lexical_scoping))。

**在嵌入函数内this指向head对象**

你可能想知道在嵌入在另外一个函数的函数中使用this会发生什么事。不幸的是在ECMA 3中，this不遵循规律，它不指向函数属于的对象，而是指向head对象([浏览器](http://blog.jobbole.com/12749/ "浏览器")的window对象)。

在下面的代码，func2和func3中的this不再指向myObject，而是head对象。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var myObject = {
      func1:function() {
         console.log(this); //logs myObject
         varfunc2=function() {
            console.log(this); //logs window, and will do so from this point on
            varfunc3=function() {
               console.log(this); //logs window, as it’s the head object
            }();
         }();
      }
    };
     
    myObject.func1();
     
    </script></body></html>

然而在ECMAScript 5中，这个问题将会得到修正。现在，你应该意识到这个问题，尤其是当你将一个函数的值传递到另一个函数时。

看看下面的代码，将一个匿名函数传给foo.func1，当在foo.func1中调用匿名函数(函数嵌套在另一个函数中)，匿名函数中this将会指向是head对象。

    <!DOCTYPE html><html lang="en"><body><script>
    var foo = {
      func1:function(bar){
        bar(); //logs window, not foo
        console.log(this);//the this keyword here will be a reference to foo object
      }
    };
     
    foo.func1(function(){console.log(this)});
    </script></body></html>

现在你不会忘了，如果包含this的函数在另一个函数中，或者被另一个函数调用，this的值将会指向的是head对象(再说一次，这将在ECMAScript 5中被修正。)

**解决嵌套函数的问题**

为了使this的值不丢失，你可以在父函数中使用一个作用域链(scope chain)来保存对this进行引用。下面的代码中，使用一个叫that的变量，利用它的作用域，我们可以更好的保存函数上下文。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var myObject = {
      myProperty:'Icanseethelight',
        myMethod:function() {
       var that=this; //store a reference to this (i.e.myObject) in myMethod scope varhelperFunctionfunction(){//childfunction
       var helperFunction function() { //childfunction
          //logs 'I can see the light' via scope chain because that=this
               console.log(that.myProperty); //logs 'I can see the light'
               console.log(this); // logs window object, if we don't use "that"
            }();
        }
    }
     
    myObject.myMethod(); // invoke myMethod
     
    </script></body></html>

**控制this的值**

this的值通常取决于调用函数的上下文(除非使用关键字new，稍后会为你介绍)，但是你可以用apply()或call()指定触发一个函数时this指向的对象，以改变/控制this的值。用这两种方法就好像再说：“嘿，调用X函数，但让Z对象来作this的值。”这样做，JavaScript默认的this的值将被更改。

下面，我们创建了一个对象和一个函数，然后我们通过call()来触发函数，所以函数中的this指向的是myOjbect。在myFunction函数中的this会操作myObject而不是head对象，这样我们就改变了在myFunction中this指向的对象。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var myObject = {};
     
    var myFunction = function(param1, param2) {
      //setviacall()'this'points to my Object when function is invoked
      this.foo = param1;
      this.bar = param2;
      console.log(this); //logs Object{foo = 'foo', bar = 'bar'}
    };
     
    myFunction.call(myObject, 'foo', 'bar'); // invoke function, set this value to myObject
     
    console.log(myObject) // logs Object {foo = 'foo', bar = 'bar'}
     
    </script></body></html>

在上面的例子，我们用了call()，apply()也可适用于同样用法，二者的不同之处在于参数如何传给函数。用call()，参数用逗号分开，而用apply()，参数放在一个数组中传递。下面是同样的代码，但是用apply()。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var myObject = {};
     
    var myFunction = function(param1, param2) {
      //set via apply(), this points to my Object when function is invoked
      this.foo=param1;
      this.bar=param2;
      console.log(this); // logs Object{foo='foo', bar='bar'}
    };
     
    myFunction.apply(myObject, ['foo', 'bar']); // invoke function, set this value
    console.log(myObject); // logs Object {foo = 'foo', bar = 'bar'}
     
    </script></body></html>

**在自定义构造函数中用this**

当函数用关键字new来触发，this的值–由于在构造函数中声明–指向实例本身。换种说法：在构造函数中，我们可以在对象真正创建之前，就用this来指定对象。这样看来，this值的更改和call()或apply()相似。

下面，我们构造了一个构造函数Person，this指向创建的对象。当Person的对象创建后，this指向这个对象，并将属性name放在对象内，值为传给这个构造函数的参数值(name)。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var Person = function(name) {
      this.name = name || 'johndoe'; // this will refer to the instanc ecreated
    }
     
    var cody = new Person('Cody Lindley'); // create an instance, based on Person constructor
     
    console.log(cody.name); // logs 'Cody Lindley'
     
    </script></body></html>

这样，当用关键字new触发构造函数时，this指向“要创建的对象”。那么如果我们没有用关键字new，this的值将会指向触发Person的上下文——这时是head对象。让我们来看看下面的代码。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var Person = function(name) {
      this.name=name||'johndoe';
    }
     
    var cody = Person('Cody Lindley'); // notice we did not use 'new'
    console.log(cody.name); // undefined, the value is actually set at window.name
    console.log(window.name); // logs 'Cody Lindley'
     
    </script></body></html>

**在prototype方法内的this指向构造实例**

当一个方法作为一个构造函数的prototype属性时，这个方法中的this指向触发方法的实例。这里，我们有一个Person()的构造函数，它需要person的全名(full name)，为了获得全名(full name)，我们在Person.prototype中加入了一个whatIsMyFullName方法，所有的Person实例都继承该方法。这个方法中的this指向触发这个方法的实例(以及它的属性)。

下面我创建了两个Person对象(cody和lisa)，继承的whatIsMyFullName方法包含的this就指向这个实例。

    <!DOCTYPE html><html lang="en"><body><script>
     
    var Person = function(x){
        if(x){this.fullName = x};
    };
     
    Person.prototype.whatIsMyFullName = function() {
        return this.fullName; // 'this' refers to the instance created from Person()
    }
     
    var cody = new Person('cody lindley');
    var lisa = new Person('lisa lindley');
     
    // call the inherited whatIsMyFullName method, which uses this to refer to the instance
    console.log(cody.whatIsMyFullName(), lisa.whatIsMyFullName());
     
    /* The prototype chain is still in effect, so if the instance does not have a
    fullName property, it will look for it in the prototype chain.
    Below, we add a fullName property to both the Person prototype and the Object
    prototype. See notes. */
     
    Object.prototype.fullName = 'John Doe';
    var john = new Person(); // no argument is passed so fullName is not added to instance
    console.log(john.whatIsMyFullName()); // logs 'John Doe'
     
    </script></body></html>

在prototype对象内的方法里使用this，this就指向实例。如果实例不包含属性的话，prototype查找便开始了。

**提示**

-如果this指向的对象不包含想要查找的属性，那么这时对于任何属性都适用的法则在这里也适用，也就是，属性会沿着prototype链(prototype chain)上“寻找”。所以在我们的例子中，如果实例中不包含fullName属性，那么fullName就会查找Person.prototype.fullName，然后是Object.prototype.fullName。

英文原文：[Fully Understanding the this Keyword](http://net.tutsplus.com/tutorials/javascript-ajax/fully-understanding-the-this-keyword/?ref=vastwork) 
编译：[伯乐在线](http://www.jobbole.com) - [唐小娟](http://blog.jobbole.com/12203/)
