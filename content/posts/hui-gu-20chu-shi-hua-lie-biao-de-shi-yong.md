---
title: '回顾（20）：初始化列表的使用'
date: 2020-02-08 16:12:46
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-20chu-shi-hua-lie-biao-de-shi-yong.jpg
isTop: false
---

@[toc]
# 问题
```
问题：类中能否定义const成员变量？
```
```c++
#include <iostream>
using namespace std;

class Test
{
private:
	const int ci;
public:  
	Test()
	{
		ci = 10;
	}  
	int getI() 
	{
		return ci;
	}
};

int main(int argc, char *argv[])
{
	
	Test t;
    return 0;
}
//如果没有构造函数，编译器会报错，因为t中存在没有初始化的const成员变量
//如果有构造函数对ci进行初始化，编译器会报错，只读变量是不能出现在赋值符号的左边
```

# 初始化列表
- C++中提供了初始化列表对成员变量进行初始化
- 语法规则
```c++
className::className():m1(v1),m2(v1,v2),m3(v3)
{
    //some other initialize operation
}
```
```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	const int ci;
public:  
	Test():ci(10)
	{

	}  
	int getI() 
	{
		return ci;
	}
};

int main(int argc, char *argv[])
{
	
	Test t;
	cout << "t.getI() = "<< t.getI() <<endl;
    return 0;
}

//这个const变量是只读变量，依然是可以通过指针来修改值
Test():ci(10)
{
    int* p = const_cast<int*>(&ci);
    *p = 5;
}  
```
## 注意事项
- 成员的初始化顺序与成员的声明顺序相同
- 成员的初始化顺序与初始化列表的位置无关
- 初始化列表先于构造函数的函数体执行
```c++
#include <stdio.h>

class Value
{
private:
    int mi;
public:
    Value(int i)
    {
        printf("i = %d\n", i);
        mi = i;
    }
    int getI()
    {
        return mi;
    }
};

class Test
{
private:
    Value m2;
    Value m3;
    Value m1;
public:
    Test() : m1(1), m2(2), m3(3)//成员的初始化顺序与成员的声明顺序相同,2,1,3
    {
        printf("Test::Test()\n");
    }
};
```
- 类中的const成员会被分配空间
- 类中的const成员的本质是只读变量
- 类中的const成员只能在初始化列表中指定初始值
```
编译器无法得到const成员的初始值，因为无法进入符号表成为真正意义上的常量
```
## 初始化和赋值不同
- 初始化：对正在创建的对象进行初值设置
- 赋值：对已经存在的对象进行值设置

# 小结
- 类中可以使用初始化列表对成员进行初始化
- 初始化列表先于构造函数体执行
- 类中可以定义const成员变量
- const成员变量必须在初始化列表中指定初值
- const成员变量为只读变量，依然可以通过指针来修改
