---
title: '回顾（8）：函数重载分析（上）'
date: 2020-02-02 10:56:41
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-8han-shu-chong-zai-fen-xi.jpg
isTop: false
---
@[toc]
# 自然语言中的上下文
## “洗”字的含义
```
洗衣服、洗脑、洗车、洗脸、洗马桶
```
## 结论
- 能和“洗”字搭配的词汇有很多
- “洗”字和不同的词汇搭配有不同的含义

# 重载（overload）
- 同一个标识符在不同的上下文有不同的意义
- 如：
    “洗”字和不同的词汇搭配有不同的含义： 洗衣服、洗脑、洗车、洗脸、洗马桶。。。
    “play”和不同的单词搭配后有不同的含义：play chess, play piano, play basketball, ...
思考：
```
重载在自然语言中随处可见的，那在程序设计中是否也有重载呢？    
```
## C++中的函数重载
### 函数重载
- 用同一个函数名定义不同的函数
- 当函数名和不同参数搭配时函数的含义不同
- 其实不止在C++中，在java、D语言、C#中，重载都是这么定义的
```c++
int func(int x)
{
    return x;
}

int func(int a, int b)
{
    return a + b;
}

int func(const char* s)
{
    return strlen(s);
}
```   
### 函数重载条件
- 参数个数不同
- 参数类型不同
- 参数顺序不同
```c++
int func(int a, const char* s)
{
    return a;
}

int func(const char* s, int a)
{
    return strlen(s);
}
//以上两个函数可以构成重载
```

问题：
```
当函数默认参数遇上函数重载会发生什么？
```
```c++
int func(int a, int b, int c = 0)
{
    return a * b *c
}

int func(int a, int b)
{
    return a + b;
}

int main()
{
    int c = func(1, 2);// which one?
    return 0;
}
//编译器编译出错，就是编译器抱怨了，因为编译器不知道该去匹配哪个函数，出现了二义性！！！
//C++中有很多特性都是冲突的，所以我们要知道如何去避开这些特性冲突
```
### 编译器调用重载函数的准则
- 将所有同名函数作为候选者
- 尝试寻找可行的候选函数
    1. 精确匹配实参
    2. 通过默认参数能够匹配实参
    3. 通过默认类型转换匹配实参
- 匹配失败
    1. 最终寻找到的候选函数不唯一，则出现二义性，编译失败
    2. 无法匹配所有候选者，函数未定义，编译失败 

### 函数重载本质
- 重载函数在本质上是相互独立的不同函数
- 重载函数的函数类型不同
- 函数返回值不能作为函数重载的依据

    ```函数重载是由函数名和参数列表决定的，跟函数返回值没有半毛钱关系!```       

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

    return 0;
}
//打印出两个函数地址不同
```
### 小结
- 函数重载是C++中引入的概念
- 函数重载用于模拟自然语言中的词汇搭配
- 函数重载使得C++具有更加丰富的语义表达能力
- 函数重载的本质为相互独立的不同函数
- C++中通过函数名和函数参数确定究竟调用那一个函数


