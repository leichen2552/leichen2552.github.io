---
title: '回顾（9）：函数重载分析（下）'
date: 2020-02-02 16:19:39
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-9han-shu-chong-zai-fen-xi-xia.jpg
isTop: false
---
@[toc]
# 重载与指针
- 下面的函数指针将保存哪个函数的地址？
```c++
int func(int x)
{
    return x;
}

int func(int a, int b)
{
    return a +b;
}

int func(const char* s)
{
    return strlen(s);
}

typedef int(*PFUNC)(int a);//函数指针类型为int
int c = 0;
PFUNC p = func;
c = p(1); 
```
## 函数重载遇上函数指针
- 将重载函数名赋值给函数指针时
    1. 根据重载规则挑选与函数指针参数列表一致的候选者
    2. 严格匹配候选者的函数类型与函数指针的函数类型
```
这也体现出C++是强类型的语言
```
- 注意 
    - 函数重载必然发生在同一个作用域
    - 编译器需要用参数列表或函数类型进行函数选择
    - 无法直接通过函数名得到重载函数的入口地址 
```c++
int func(int a, int b, int c)
{
    return a * b * c;
}

int func(int a, int b)
{
    return a + b;
}

int main()
{
    printf("%p\n",(int(*)(int, int))add);
    printf("%p\n",(int(*)(int, int, int))add);

    //下面这两句就饿没有指定函数指针的函数类型和参数列表的类型，所以肯定会报错
    printf("%p\n",add);
    printf("%p\n",add);

    return 0;
}
//打印出两个函数地址不同
```
## C++和C相互调用
- 实际工程中C++和C代码相互调用时不可避免的
- C++编译器能够兼容C语言的编译方式
- C++编译器会优先使用C++的编译的方式
- extern关键字能强制让C++编译器进行C方式的编译
```c++
extern "C"
{
    //do C-style compilation here
}
```
- __cplusplus是C++内置的标准宏定义
- __cplusplus的意义
    - 确保C代码以统一的C方式被编译成目标文件
```c++
#ifdef __cplusplus
extern "C"{
#endif    

//C code

#ifdef __cplusplus
}
#endif
```
### 注意事项
- C++编译器不能以C的方式编译重载函数
- 编译方式决定函数名被编译后的目标名
    - C++编译方式将函数名和参数列表编译成目标名
    - C编译方式只将函数名作为目标名进行编译
```c++
//1
int func(int a, int b, int c)
{
    return a * b * c;
}

int func(int a, int b)
{
    return a + b;
}

//2
extern "C"{
    int func(int a, int b, int c)
    {
        return a * b * c;
    }

    int func(int a, int b)
    {
        return a + b;
    }
}
```
```
    利用这句g++ -c test.cpp -o test.oo将上面两部分代码进行编译后
    用 nm 命令查看test.oo中的符号表，nm test.oo
    结果第一部分代码能编译通过，二部分代码编译报错
    所以C++编译方式将函数名和参数列表编译成目标名，C编译方式只将函数名作为目标名进行编译
```

## 小结
- 函数重载是C++对C的一个重要升级
- 函数重载通过函数参数列表区分不同的同名函数
- extern关键字能够实现C和C++的相互调用
- 编译方式决定符号表中的函数名的最终目标名

# 问题
- C中如何调用C++函数？