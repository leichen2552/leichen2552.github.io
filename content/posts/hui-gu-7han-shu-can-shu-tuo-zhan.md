---
title: '回顾（7）：函数参数拓展'
date: 2020-02-01 10:15:32
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-7han-shu-can-shu-tuo-zhan.jpg
isTop: false
---
# 函数参数的默认值
- C++中可以在函数声明时为参数提供一个默认值
- 当函数调用时没有提供参数的值，则使用默认值
```c++
int mul(int x = 0);//提供一个参数默认值

int main()
{
    printf("%d\n", mul());  //mul(0)

    return 0;
}

int mul(int x)
{
    return x*x;
}
```
参数默认值必须在函数声明中指定，那么问题来了
问题：
```
    函数定义是否可以出现函数参数的默认值？
    当函数声明和定义中的参数默认值不同会发生什么？
```

```c++
int mul(int x = 0);
//...
int mul(int x = 5)
{
    return x*x;
}      
```

```函数参数默认值只能在声明时设置```

# 函数默认参数的规则
- 参数默认值必须从右向左提供
- 函数调用时使用了默认值，则后续参数必须使用默认值
```c++
int add(int x, int y = 1, int z = 2)
{
    return x + y+ z;
}

add(0);         //x = 0
add(2, 3);      //x = 2, y = 3
add(3, 2, 1);   //x = 3, y = 2, z = 1
```
C++是强类型语言

# 函数的占位参数
- 占位参数只有参数类型声明，而没有参数名声明
- 一般情况下，在函数体内部无法使用占位参数
```c++
int func(int x, int)
{
    return x;
}

//  ...

func(1, 2);
```

## 函数占位参数的意义
- 占位参数与默认参数结合起来使用
- 兼容C语言程序中可能出现的不规范写法

举个例子：
```c
#include <stdio.h>

void func()
{

}

int main()
{
    func();
    func(1, 2);

    return 0;
}
//这部分代码在C语言里是可以编译通过的
```
但是移植到C++环境里面，是编译不通过的，但是C++为了兼容C语言
```c++
#include <stdio.h>

void func(int = 0, int = 0)
{

}

int main()
{
    func();
    func(1, 2);

    return 0;
}
```

# 小结
- C++中支持函数参数的默认值
- 如果函数调用时没有提供参数，则使用默认值
- 参数的默认值必须从右向左提供
- 函数调用使用了默认值，则后续参数必须使用默认值
- C++中支持占位参数，用于兼容C语言中的不规范写法