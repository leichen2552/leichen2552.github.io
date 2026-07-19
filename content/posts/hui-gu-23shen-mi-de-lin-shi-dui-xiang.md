---
title: '回顾（23）：神秘的临时对象'
date: 2020-02-10 16:09:45
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-23shen-mi-de-lin-shi-dui-xiang.jpg
isTop: false
---
# 神秘的临时对象
## 问题
```c++
class Test
{
private :
    int mi;
public :
    Test(int v)
    {
        mi = v;
    }
    Test()
    {
        Test(0);
    }
    void print()
    {
        printf("mi = %d\n", mi);
    }
};

int main()
{
    Test t;

    t.print();

    return 0;
}
```
- 程序意图
    - 在Test()中以0作为参数调用Test(int i)
    - 将成员变量mi的初始值设置为0
- 运行结果
    - 成员变量mi的值为随机值
```
究竟什么地方出了问题？
```

## 思考
- 构造函数是一个特殊的函数
    - 是否可以直接调用？这个是可以的，之前初始化一个数组的时候就是手工调用构造函数
    - 是否可以在构造函数中调用构造函数？
    - 直接调用构造函数的行为是什么？

## 答案
- 直接调用构造函数将产生一个临时对象
- 临时对象的生命周期只有一条语句的时间
- 临时对象的作用域只在一条语句当中
- 临时对象是C++中值得警惕的灰色地带
```c++
//上面的代码中
Test()
{
    Test(0);//这条语句产生了一个临时对象
}
```

```c++
//上面有问题的代码需要这样改：提供一个init()函数
class Test
{
private :
    int mi;

    void init(int i)
    {
        mi = i;
    }
public :
    Test(int v)
    {
        init(v);
    }
    Test()
    {
        init(0);
    }
    void print()
    {
        printf("mi = %d\n", mi);
    }
};

int main()
{
    Test t;

    t.print();

    return 0;
}
```

## 练习
```c++
class Test
{
private :
    int mi;

    void init(int i)
    {
        mi = i;
    }
public :
    Test(int v)
    {
        cout << "Test(int v)" << endl;
        init(v);
    }
    Test()
    {
        cout << "Test()" << endl;
        init(0);
    }
    void print()
    {

        printf("mi = %d\n", mi);
    }
    ~Test()
    {
        cout << "~Test()" << endl;
        init(0);
    }
};

int main()
{
    Test();//临时对象
    Test(10);//临时对象

    Test().print();//临时对象的print()
    Test(10).print();//临时对象的print()

    return 0;
}
```
打印结果：
Test()
~Test()
Test(int v)
~Test()

Test()
mi = 0;
~Test()
Test(int v)
mi = 10;
~Test()

- 现在的C++编译器会减少临时对象的产生，C++继承了C语言的高效，所以该杜绝临时对象的地方就会杜绝
```c++
#include <stdio.h>

class Test
{
    int mi;
public:
    Test(int i)
    {
        printf("Test(int i) : %d\n", i);
        mi = i;
    }
    Test(const Test& t)
    {
        printf("Test(const Test& t) : %d\n", t.mi);
        mi = t.mi;
    }
    Test()
    {
        printf("Test()\n");
        mi = 0;
    }
    int print()
    {
        printf("mi = %d\n", mi);
    }
    ~Test()
    {
        printf("~Test()\n");
    }
};

Test func()
{
    return Test(20);
}

int main()
{
    Test t = Test(10); // ==> Test t = 10（这也是推荐写法）;
                       //本来应该是拷贝构造函数出现临时对象，
                       //但是当代的C++编译器会尽力避开临时对象的产生
    Test tt = func();  // ==> Test tt = Test(20); ==> Test tt = 20;
    
    t.print();
    tt.print();
    
    return 0;
}
```

# 小结
- 直接调用构造函数将产生一个临时对象。在C语言中出现bug的原因就是野指针，而在C++中的bug就是临时对象
- 临时对象是性能的瓶颈，也是bug的来源之一
- 现代C++编译器会尽力避开临时对象
- 实际工程开发需要人为的避开临时对象

