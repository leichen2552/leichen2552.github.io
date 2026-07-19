---
title: '回顾（10）：C++中的新成员'
date: 2020-02-03 09:01:48
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-10czhong-de-xin-cheng-yuan.jpg
isTop: false
---
# 动态内存分配
## C++中的动态内存分配
- C++中通过new关键字进行动态内存申请
- C++中的动态内存申请是基于类型进行的
- delete关键字用于内存释放
```c++
//变量申请
Type* pointer = new Type;
//......
delete pointer;

//数组申请
Type* pointer = new Type[N];
//......
delete[] pointer;
```
```
怎么申请的就怎么释放！有没有[]要注意！！！
```
```c++
int p = new int;

p = new int[10];//这句动态内存申请，并不是表示p指向的是40个字节的一片内存空间
                //这样说的话，面试官会不给你过
                //因为动态内存分配时，分配的可能会比你申请的空间要大
                //应该这样说，p指向的内存空间至少40个字节
```
## new关键字与malloc函数的区别
- new关键字是C++的一部分
    - malloc是由C库提供的函数
- new以具体类型为单位进行内存分配
    - malloc以字节为单位进行内存分配
- new在申请单个类型变量时可进行初始化
    - malloc不具备内存初始化的特性
## new关键字的初始化
```c++
int* pi = new int(1);
float* pf = new float(2.0f);
char* pc = new char('c');
```

# C++中的命名空间
## 在C语言中只有一个全局作用域
- C语言所有的全局标识符共享同一个作用域
- 标识符之间可能发生冲突
## C++中提出了命名空间的概念
- 命名空间将全局作用域分成不同部分
- 不同命名空间中的标识符可以同名而不会发生冲突
- 命名空间可以相互嵌套
- 全局作用域也叫做默认命名空间
### C++命名空间的定义
```c++
namespace Name
{
    namespace Internal
    {
        /*  */
    }
    /**/
}
```
### C++命名空间的使用
- 使用整个命名空间：
```c++
using namespace name;
```
- 使用命名空间中的变量：
```c++
using name::varible;
```
- 使用默认命名空间中的变量：
```c++
::varible
```

```c++
#include <stdio.h>

namespace First
{
    int i = 0;
}

namespace Second
{
    int i =1;

    namespace Internal
    {
        struct P
        {
            int x;
            int y;
        };
    }
}

int main()
{
    using namespace First;
    using Second::Internal::P;

    printf("First::i = %d\n", i);
    printf("Second::i = %d\n", Second::i);

    P p = {2, 3};

    printf("p.x = %d\n", p.x);
    printf("p.y = %d\n", p.y);

    return 0;
}
```
# 小结
- C++中内置的动态内存分配的专用关键字
- C++中的动态内存分配可以同时进行初始化
- C++中的动态内存分配时基于类型进行的
- C++中命名空间概念用于解决名称冲突问题