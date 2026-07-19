---
title: '回顾（5）：引用本质分析'
date: 2020-01-30 09:49:37
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-5yin-yong-ben-zhi-fen-xi.jpg
isTop: false
---

# C++中的引用
## 引用的意义
- 引用作为变量别名而存在，因此在一些场合可以代替指针
- 引用相对于指针来说具有更好的可读性和实用性  
  
###  Example：Swap函数的实现对比
```c++
void Swap(int& a, int& b)
{
    int t = a;
    a = b;
    b = t;
}

void Swap(int* a, int* b)
{
    int t = *a;
    *a = *b;
    *b = t;
}
```
这两种就好像手动挡的车与自动挡的车，自动挡的车好开，这就好比是引用

注意：
- 函数的引用形参不需要进行初始化，它的初始化发生在函数调用的时候

## 特殊的引用
### const引用
- 在C++中可以声明const引用
- 语法：const Type& name = var;
- const 引用让变量拥有只读属性
```c++
int a = 4;
const int& b = a;
int* p = (int*)&b;

b = 5;              // Error，只读变量
*p = 5;             //OK，修改变量 a 的值
```
- 现在已经知道引用是另一个变量的别名，因此一个引用绝对不可能是常量值的别名。换句话说，就是不能定义一个引用然后用常量值来初始化，这里的常量是字面常量，因为从概念上来说是不可行的。但是有一个例外，就是const引用，我么可以用字面常量来对一个const引用初始化，编译器这个时候就会真真正正产生一个只读变量。
```c++
const int& b = 1;   //ok
int* p = (int*)&b;

b = 5;                  //Error，只读变量

*p = 5;                 //OK，修改变量 b 的值
```
- 当使用常量对const引用进行初始化时，C++编译器会为这个常量分配空间，并将引用名作为这段空间的别名
- 结论：使用常量对const引用初始化后将生成一个只读变量
  
## 引用有自己的存储空间吗
小测试：
```c++
#include <stdio.h>
struct TRef
{
    char& r;
};

int main()
{
    char c = 'c';
    char& rc = c;

    TRef ref = {c};

    printf("sizeof(char&) = %d\n",sizeof(char&));   //1
    printf("sizeof(rc) = %d\n",sizeof(rc));                 //1

    printf("sizeof(TRef) = %d\n",sizeof(TRef));         //4
    printf("sizeof(ref.r) = %d\n",sizeof(ref.r));           //1

    return 0;
}
```

## 引用的本质
### 引用在C++内部实现是一个指针常量
Type& name      $\leftarrow \rightarrow$        Type* const name
```c++
void f(int& a)              void f(int* const a)
{                           {
    a = 5;                      *a = 5
}                           }
```
注意：
- C++编译器在编译过程中用指针常量作为引用的内部实现，因此引用所占的空间大小与指针相同
- 从使用的角度，引用只是一个别名，C++为了实用性而隐藏了引用的存储空间这一细节

## 引用的意义
- C++中的引用旨在大多数情况下代替指针
- 功能性：可以满足多数需要使用指针的场合
- 安全性：可以避开由于指针操作不当而带来的内存错误
- 操作性：简单易用，又不失功能强大

## 实例解读
1. 不能返回局部变量的引用
```c++
int& demo()     //int* const
{
    int d = 0;

    printf("demo : d = %d\n", d);

    return d;       //return &d，返回一个局部变量的地址就是有问题
} 
```
2. 可以返回在全局存储区内变量的引用
 ```c++
int& func()     //int* const
{
    static int s = 0;

    printf("func : s = %d\n", s);

    return s;   //return &s，静态的局部变量的存储空间是一个全局的存储区，
                //所以说它的空间不会以为函数调用而摧毁，由于引用的本质是指针，
                //所以返回一个全局存储区中的地址是完全可以的
} 
```

#小结
- 引用作为别名而存在旨在代替指针
- const引用可以使得变量具有只读属性
- 引用在一起内部使用**指针常量实现**
- 引用的最终本质为指针
- 引用尽可能的避开内存错误