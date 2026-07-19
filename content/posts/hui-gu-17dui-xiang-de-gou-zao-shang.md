---
title: '回顾（17）：对象的构造（上）'
date: 2020-02-06 21:28:03
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-17dui-xiang-de-gou-zao-shang.jpg
isTop: false
---
# 对象的初始化
```
问题：对象中的成员变量初始值是多少？
```
试验一下就知道了！
```c++
class Test
{
private:
    int i;
    int j;
public:
    void int getI() {return i;}
    void int getJ() {return j;}
}

//类得到的其实是数据类型

Test gt;//因为存储空间在全局数据区

int main()
{
    printf("gt.i = %d\n",gt.getI());
    printf("gt.j = %d\n",gt.getJ());

    Test t1;//因为存储空间在栈上面

    printf("t1.i = %d\n",t1.getI());
    printf("t1.j = %d\n",t1.getJ());

    Test* pt = new Test;

    printf("pt->i = %d\n",pt->getI());
    printf("pt->j = %d\n",pt->getJ());

    delete pt;
    return 0;
}
//打印结果
//i = 0
//j = 0
//i = 1236584
//j = 1256981
//i = 0，这个0只是一个巧合
//j = 0，这个0只是一个巧合
```

- 从程序设计角度，对象只是变量，因此：
    - 在栈上创建对象，成员变量初始为随机值
    - 在堆上创建对象，成员变量初始为随机值
    - 在静态存储区创建对象，成员变量初始值为0

# 对象如何初始化
- 生活中的对象都是初始化后上市的
- 初始状态（出厂设置）是对象普遍存在的一个状态

```
问题：程序中如何对一个对象进行初始化
```
## 一个public的initialize函数
- 一般而言，对象需要一个确定的初始状态
- 解决方案
    - 再类中提供一个public的initialize函数
    - 对象创建后理解调用initialize函数进行初始化
```c++
class Test
{
private:
    int i;
    int j;
public:
    void initialize() {i = 0; j = 0;}
    void int getI() {return i;}
    void int getJ() {return j;}
};
```
- 存在的问题
    - initialize只是一个普通函数，必须显示调用
    - 如果未调用initialize函数，运行结果是不确定的

**通过人手工来调用这个初始化函数太麻烦了！有没有那种刚创建完对象就自动来调用初始化的函数**

## 构造函数
- C++中可以定义与类名相同的特殊成员函数
    - 这种特殊的成员函数叫做构造函数
        - 构造函数没有任何返回类型的声明
        - 构造函数在对象定义时自动被调用

```c++
class Test
{
private:
    int i;
    int j;
public:
    void int getI() {return i;}
    void int getJ() {return j;}
    Test() 
    {
        printf("Test() Enter\n");
        i = 0; 
        j = 0;
        printf("Test() Exit\n");
    }
};
```
# 小结
- 每个对象在使用之前都应该初始化
- 类的构造函数用于对象的初始化
- 构造函数与类同名并且没有返回值
- 构造函数在对象定义时自动被调用


