---
title: '回顾（11）：新型的类型转换'
date: 2020-02-03 16:08:18
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-11xin-xing-de-lei-xing-zhuan-huan.jpg
isTop: false
---
# 强制类型转换
## C方式的强制类型转换
- ( Type ) ( Expression )
- Type( Expression ) 

## C方式强制类型转换存在的问题
- 过于粗暴
    - 任意类型之间都可以进行转换，编译器很难判断其正确性
- 难于定位
    - 在源代码中无法快速定位所有使用强制类型转换的语句
```
强制类型在实际工程中是很难完全避免的！！！
```

## 新式类型转换
- static_cast
- const_cast
- dynamic_cast
- reinterpret_cast

### static_cast
- 用于基本类型间的转换
- 不能用于基本类型指针间的转换
- 用于有继承关系类对象之间的转换和类指针之间的转换
```c++
void static_cast_demo()
{
    int i = 0x12345;
    char c = 'c';
    int* pi = &i;
    char* pc = &c;
    
    c = static_cast<char>(i);
    pc = static_cast<char*>(pi);//Error
}
```
### const_cast
- 用于去除变量的只读属性
- 强制转换的目标类型必须是指针或引用
```c++
void const_cast_demo()
{
    const int& j = 1;
    int& k = const_cast<int&>(j);
    
    const int x = 2;
    int& y = const_cast<int&>(x);
    
    int z = const_cast<int>(x);//Error
    
    k = 5;
    
    printf("k = %d\n", k);
    printf("j = %d\n", j);
    
    y = 8;
    
    printf("x = %d\n", x);
    printf("y = %d\n", y);
    printf("&x = %p\n", &x);
    printf("&y = %p\n", &y);
}
```
### reinterpret_cast
- 用于指针类型间的强制转换
- 用于整数和指针类型间的强制转换
```c++
void reinterpret_cast_demo()
{
    int i = 0;
    char c = 'c';
    int* pi = &i;
    char* pc = &c;
    
    pc = reinterpret_cast<char*>(pi);
    pi = reinterpret_cast<int*>(pc);
    pi = reinterpret_cast<int*>(i);
    c = reinterpret_cast<char>(i); //Error
}

```
### dynamic_cast
- 用于有继承关系的类指针间的转换
- 用于有交叉关系的类指针间的转换
- 具有类型检查的功能
- 需要虚函数的支持
- 具有类型检查的功能，如果类型转换失败的话，会被转换成**空指针**
```c++
void dynamic_cast_demo()
{
    int i = 0;
    int* pi = &i;
    char* pc = dynamic_cast<char*>(pi);//Error
}

int main()
{
    static_cast_demo();
    const_cast_demo();
    reinterpret_cast_demo();
    dynamic_cast_demo();
    
    return 0;
}
```

# 小结
- C方式的强制类型转换
    - 过于粗暴
    - 潜在的问题不易被发现
    - 不易在代码中定位
- 新式类型转换以C++关键字的方式出现
    - 编译器能够帮助检查潜在的问题
    - 非常方便的在代码中定位
    - 支持动态类型识别（dynamic_cast）