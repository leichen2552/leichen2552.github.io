---
title: '笔记：NULL、null、nullptr三者的区别'
date: 2022-02-13 22:35:31
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
@[toc]

其实null和NULL都是字符串（没啥区别，欢迎高手纠错！），具体看它们宏定义被定义成为什么值。

在VS中NULL被定义为0，因为习惯上把宏定义的所有字符都大写，当把NULL它赋值给指针时意思为空，当然你也可以把null定义为0了，都一样。

它们都没定义时都只能叫符号了，定义后就有另外的意思了，你把0直接赋值给指针也行，只要指针指向0就为空。

其实NULL在有些编译器中是赋为0了，这时你不能再去#define定义它了，否则就重定义了！

## 1. NULL
```cpp
#ifdef __cplusplus  
#define NULL    0  
#else  
#define NULL    ((void *)0) 
#endif  
```
在C语言环境下，由于不存在函数重载等问题，直接将NULL定义为一个void*的指针就可以完美的解决一切问题。
但是在C++环境下情况就变得复杂起来，首先我们不能写这样的代码：
FILE* fp = (void*)0; //将void*直接赋值给一个指针是不合法的，编译器会报错。
我们只能这样写代码


```cpp
FILE* fp = (FILE*)0;
// or  
FILE* fp = 0;
```

## 2. nullptr
C++11，其中有一个是新的关键字nullptr
如果我们的编译器是支持nullptr的话，那么我们应该直接使用nullptr来替代NULL的宏定义。正常使用过程中他们是完全等价的。

## 3. ""
"" 也表示空，但是和null有很大区别：null没有分配空间，""分配了空间

```cpp
String str1 = null;  //str引用为空

String str2 = "";  //str引用一个空串
```
也就是null没有分配空间，""分配了空间，因此str1还不是一个实例化的对象，而str2已经实例化。


注意：

因为null不是对象，""是对象。所以比较的时候必须是 if(str1==null){...}和if(str2.equals("")){...}。

对象用equals比较，null用等号比较。

因此，如果str1=null;下面的写法错误：

if(str1.equals("")||str1==null){//如果str1没有值，则.... } 

正确的写法是

if(str1==null||str1.equals("")){//先判断是不是对象，如果是，再判断是不是空字符串}

打个比方：一个空玻璃杯，你不能说它里面什么都没有，因为里面有空气，当然也可以把它弄成真空，null与" "的区别就象真空与空气一样。
