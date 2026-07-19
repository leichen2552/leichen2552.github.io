---
title: '回顾（2）：C到C++的升级'
date: 2020-01-12 13:36:30
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-2.jpg
isTop: false
---
@[toc]

# C与C++的关系
* C++<font color = blue size = 4>继承了所有的C特性</font>
* C++在C的基础上<font color = purple size = 4>提供了更多的语法和特性</font>
* C++的设计目标是<font color = red size = 4>运行效率与开发效率的统一</font>

<font size = 5>以<font color = red size = 7>C</font>语言为基础，<font color = red size = 7>+</font>面对对象支持，<font color = red size = 7>+</font>类型加强、函数加强、异常处理等等 = <font color = red size = 7>C + +</font></font>

# C到C++的升级
## 变量定义
* C++更强调语言的实用性
* 所有变量都可以在需要使用时在定义，对比C语言中的所有变量必须在作用域开始的位置定义

## register关键字
* <font color = blue>register</font>关键字请求编译器将局部变量存储在寄存器中，在C++中依然支持<font color = blue>register</font>关键字，但是在C++编译器有自己的优化方式，**C语言中无法获取**<font color = blue>register</font>变量的地址，**C++中可以取得**<font color = blue>register</font>变量的地址
* <font color = 990000>C++编译器发现程序中需要取<font color = blue>register</font>变量的地址时，<font color = blue>register</font>对变量的声明变得无效</font>
* <font color = 1fffdd>在早期C语言编译器不会对代码进行优化，因此<font color = blue>register</font>变量是一个很好的补充</font>

## 全局变量的定义
* 在C语言中，<font color = 991122>重复定义多个同名的全局变量是合法的</font>。<font color = 991122>C语言中多个同名的全局变量最终会被链接到同一个地址空间上</font>
* 在C++中，<font color = purple>不允许定义多个同名的全局变量</font>

## struct关键词的加强
* C语言中的<font  face = "Courier New" color = blue size = 4>**struct**</font>定义了**一组变量的集合**
* C语言中的<font face = "Courier New" color = blue size = 4>**struct**</font>定义的<font color = green>标识符</font>并不是<font color = purple>一种新的类型</font>
* C++中的<font face = "Courier New" color = blue size = 4>**struct**</font>用于<font color = blue>定义一个全新的类型</font>
### C语言中的struct
```c
struct _tag_student//这只是定义一个标签，并不是一个全新的类型
{
    const char* name;
    int age;
} ;
typedef struct _tag_student Student;//C语言只是利用typedef把一个标签变成一个类型，
                            //只是当做一个类型来用，而C语言并不认为Student是一个类型
```
### C++中的struct
```c++
struct Student//直接就是一个全新的类型
{
    const char* name;
    int age;
};
```
## int f()与int f(void)的区别

## 类型
* C++中<font color = blue>所有的标识符都必须显示的声明类型</font>
* C语言中的<font color = red>默认类型<font color = green>在C++中</font>是不合法的</font>
```c
f(i)
{
    printf("i = %d\n",i);
}

g()
{
    return 5;
}
//函数f的返回值和参数分别是什么类型？函数在没有给出返回值时，默认类型为int
//函数g可以接受多少个参数？任意多的参数
```
思考题：int f() 与 int f(void)有什么区别？
解答：他们有没有区别看什么编译器
* 如果是C语言编译器，那么$f()$就是接受任意多的参数，并且返回值是int类型的函数，$f(void)$是不接收参数并且返回值是int类型的函数
* 如果是C++编译器，那它们两个就没什么区别

### 在C语言中
* <font color = blue>int</font> f() 表示<font color = blue>返回值</font>为<font color = blue>int</font>类型，<font color = 888888>接受任意参数的函数</font>
* f(<font color = blue>void</font>)表示返回值为<font color = blue>int</font>的<font color = purple>无参函数</font>

### 在C++中
* <font color = blue>int</font> f() 和 <font color = blue>int</font> f(<font color = blue>void</font>)具有<font color = 979700>相同的意义</font>，表示返回值为<font color = blue>int</font>的无参函数

## 小结
* C++更<font color = blue>强调实用性</font>，可以在<font color = cd0000>任意地方声明变量</font>
* C++中的<font color = blue>register</font>只是一个兼容的作用，C++兼容C语言只是为了兼容C语言，因为C++有自己的优化方式，他不需要register这个关键字来指示优化
* C++编译器能够<font color = ff00ff>更好的进行优化</font>
* C++中<font color = 71c671>任意的标识符都必须显示的指明类型</font>
