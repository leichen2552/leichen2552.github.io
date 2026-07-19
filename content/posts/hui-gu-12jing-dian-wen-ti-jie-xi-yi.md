---
title: '回顾（12）：经典问题解析一'
date: 2020-02-04 10:25:56
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-12jing-dian-wen-ti-jie-xi-yi.jpg
isTop: false
---
# const
- 什么时候是只读变量？
- 什么时候是常量？

## const常量的判别标准
- 只有用字面量初始化的const常量才会进入符号表
- 使用其他变量初始化的const常量仍然是只读变量
- 被volatile修饰的const常量不会进入符号表，volatile修饰的就是易变的，是可能发生变化，可能会在外部被改变，所以通过volatile去访问这个变量就会去访问这个变量的内存。所以const修饰只是当前文件下的这个变量是只读属性

```在编译期间不能直接确定初始值的const标识符，都被作为只读变量```

## 关于const的提问
- const引用的类型与初始化变量的类型
    - 相同：初始化变量成为只读变量
    - 不同：生成一个新的只读变量
```c++
#include <stdio.h>

int main()
{
    const int x = 2;
    const int& rx = x;
    int& nrx = const_cast<int&>(rx);

    nrx = 5;

    printf("x = %d\n",x);
    printf("rx = %d\n",rx);
    printf("nrx = %d\n",nrx);
    printf("&x = %d\n",&x);
    printf("&rx = %d\n",&rx);
    printf("&nrx = %d\n",&nrx);
    
    volatile const int y = 2;
    int* p = const_cast<int*>(&y)

    *p = 6;

    printf("y = %d\n",y);
    printf("p = %p\n",p);

    const int z = y;

    p = const_cast<int*>(&z);

    *p = 7;

    printf("z= %d\n", z);
    printf("p = %p\n", p);

    char c = 'c';
    char& rc = c;
    const int& trc = c;//这已经是一个新的只读变量了

    rc = 'a';

    printf("c= %d\n", c);       //a
    printf("rc = %p\n", rc);    //a

    printf("trc = %p\n", trc);  //c
    //const引用的类型与初始化变量的类型不同，会生成一个新的只读变量

    return 0;
}
```
## 引用和指针有什么关系
- 如何理解引用的本质就是指针常量
    - 指针就是一个变量
        - 值为一个内存地址，不需要初始化，可以保存不同的地址
        - 通过指针访问对应内存地址中的值
        - 指针可以被const修饰成为常量或者只读变量
    - 引用只是一个变量的新名字
        - 对引用的操作（赋值，取地址等）都会传递到代表的变量上
        - const引用使其代表的变量具有只读属性
        - 引用必须在定义时初始化，之后无法代表其他变量
- 从不同的角度来看
    - 从使用C++语言角度的角度来看
        - 引用于指针没有任何的关系
        - 引用是变量的新名字，操作引用就是操作对应的变量
    - 从C++编译器的角度来看
        - 为了支持新概念“引用”必须要一个有效的解决方案
        - 在编译器内部，使用指针常量来实现引用
        - 因此“引用”在定义时必须初始化      
- 在工程项目开发中
    - 当进行C++编程时，直接站在使用的角度看待引用，与指针毫无关系，引用就是变量的别名
    - 当对C++代码进行调试分析时，一些特殊情况，可以考虑站在C++编译器的角度看待引用

```c++
#include <stdio.h>

int a = 1;

struct SV
{
    int& x;
    int& y;
    int& z;
};

int main()
{
    int b = 2;
    int* pc = new int(3);
    SV sv = {a, b, *pc};
    int& array[] = {a, b, *pc}; // &array[1] - &array[0] = ?  Expected ==> 4
    /*
    C语言中的数组在内存中是依次顺序排放的。
    当然在C++中，也是需要兼容C语言中的这个特性，但是唯有引用数组就破坏了这个特性。
    比如上面的， &array[1] - &array[0]是不为4的，可以利用结构体SV查看x、y、z的地址。
    所以说，C++中不支持引用数组！！！
    */
    printf("&sv.x = %p\n", &sv.x);
    printf("&sv.y = %p\n", &sv.y);
    printf("&sv.z = %p\n", &sv.z);
    
    delete pc;
    
    return 0;
}
```
<font  face = "Courier New" color = blue size = 5>**所以说，C++中不支持引用数组！**</font>

# 小结
- 指针是一个变量
- 引用就是一个变量的新名字
- const引用能够生成新的只读变量
- 在编译器内部使用指针常量实现引用，C++中为了兼容C语言数组特性——地址之差不是所期望的，所以只能抛弃引用数组
- 编译时不能直接确定初始值的const标识符都是只读变量
 