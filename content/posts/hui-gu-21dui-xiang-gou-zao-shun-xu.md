---
title: '回顾（21）：对象构造顺序'
date: 2020-02-09 10:21:14
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-21dui-xiang-gou-zao-shun-xu.jpg
isTop: false
---
 # 对象的构造顺序
 ```
 C++中的类可以定义多个对象，那么对象构造的顺序是怎样的？
 ```
 ## 对于局部对象
- 当程序执行流到达对象的定义语句时进行构造
```c++
class Test
{
private:
    int mi;
public:
    Test()
    {
        mi = i;
        printf("Test(int i): %d\n", mi);
    }   
    Test()
    {
        mi = obj.mi;
        printf("Test(const Test& obj): %d\n", mi);
    } 
};

int main
{
    int i = 0;
    Test a1 = i;

    while(i<3)
    {
        Test a2 = ++i;
    }

    if(i < 4)
    {
        Test a = a1;
    }
    else
    {
        Test a(100);
    }

    return 0;
}

```

## 对于堆对象
- 当程序执行流到达new语句时创建对象
- 使用new创建对象将自动触发构造函数的调用
```c++
int main
{
    int i = 0;
    Test* a1 = new Test(i);

    while(++i<10)
    {
        if(i % 2)
            new Test(i);
    }

    if(i < 4)
    {
        new Test(*a1);
    }
    else
    {
        new Test a(100);
    }

    return 0;
}
```

## 对于全局对象
- 全局对象的构造顺序是不确定的
    - 全局对象的构造顺序是不确定的
        - 全局对象的构造顺序是不确定的
- 不同的编译器使用不同的规则确定构造顺序

# 小结
- 局部对象的构造顺序依赖于程序的执行流，goto语句会破坏程序的执行流
- 堆对象的构造顺序依赖于new的使用顺序
- 全局对象的构造顺序是不确定的，也是日常工程开发bug的主要来源之一
