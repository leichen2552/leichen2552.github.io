---
title: '回顾（25）：类的静态成员变量'
date: 2020-02-12 11:25:13
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-25lei-de-jing-tai-cheng-yuan-bian-liang.jpg
isTop: false
---
# 成员变量回顾
- 通过对象名都能够访问public成员变量
- 每个对象的成员变量都是专属的
- 成员变量不能在对象之间共享

# 新的需求：小实例
- 统计在程序期间某个类的对象数目
- 保证程序的安全性（不能使用全局变量）
- 随时获取当前对象的数目

## 尝试第一种方案
```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	int mCount;
public:
	Test():mCount(0)
	{
		mCount++;	
	} 
	~Test()
	{
		mCount--;
	}		
	int getCount()
	{
		return mCount;
	}
};

Test gTest;

int main(int argc, char *argv[])
{
	Test t1;
	Test t2;
	
	cout << "count = " << gTest.getCount() << endl;
	cout << "count = " << t1.getCount() << endl;
	cout << "count = " << t2.getCount() << endl;
	
	return 0;
}
//结果是三个1，因为成员变量是每个对象私有一套的
```

## 尝试第二种方案
```c++
#include <iostream>
#include <string>
using namespace std;

int gCount;

class Test
{
private:
	int mCount;
public:
	Test():mCount(0)
	{
		gCount++;	
	} 
	~Test()
	{
		gCount--;
	}		
	int getCount()
	{
		return gCount;
	}
};

Test gTest;

int main(int argc, char *argv[])
{
	Test t1;
	Test t2;
	
	cout << "count = " << gTest.getCount() << endl;
	cout << "count = " << t1.getCount() << endl;
	cout << "count = " << t2.getCount() << endl;
	
	return 0;
}
//打印结果三个3，但是用的是全局变量，
//在当代的软件设计当中是不能使用全局变量的，因为在任何地方都能访问全局变量
//所以不能使用全局变量
```

# 静态成员变量
- 在C++中课以定义静态成员变量
    - 静态成员变量属于整个类所有，是属于整个类
    - 静态成员变量的生命期不依赖任何对象，就是程序的运行周期
    - 可以**通过类名直接访问**共有静态成员变量
    - *所有对象共享类的静态成员变量*
    - 可以**通过对象名访问**共有静态成员变量
- 静态成员变量的特性
    - 在定义时直接通过static关键字修饰
    - 静态成员变量需要在类外单独分配空间
    - 静态成员变量在程序内部位于全局数据区
- 语法规则：
```c++
Type ClassName::VarName = value;
```
## 尝试第三种方案
```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	static int mCount;
public:
	Test()
	{
		mCount++;	
	} 
	~Test()
	{
		mCount--;
	}		
	int getCount()
	{
		return mCount;
	}
};

//如果不加这句，编译器就会报链接器的错误
int Test::mCount = 0;//这是在类的外部单独定义这个静态成员变量并初始化为0
//

Test gTest;

int main(int argc, char *argv[])
{
	Test t1;
	Test t2;
	
	cout << "count = " << gTest.getCount() << endl;
	cout << "count = " << t1.getCount() << endl;
	cout << "count = " << t2.getCount() << endl;

	Test* pt = new Test();
	cout << "count = " << pt->getCount() << endl;
	delete pt;
	
	cout << "count = " << gTest.getCount() << endl;	
	return 0;
}
//[Error] E:\User\exercise_Cpp\25jingtaichengyuan\main.cpp:(.text$_ZN4TestD1Ev[Test::~Test()]+0x5): undefined reference to `Test::mCount'
//[Error] E:\User\exercise_Cpp\25jingtaichengyuan\main.cpp:(.text$_ZN4Test8getCountEv[Test::getCount()]+0x4): undefined reference to `Test::mCount'
//[Error] E:\User\exercise_Cpp\25jingtaichengyuan\main.cpp:(.text$_ZN4TestC1Ev[Test::Test()]+0x5): undefined reference to `Test::mCount'
//[Error] collect2: ld returned 1 exit status
//这是链接器找不到static int mCount的内存空间，
//需要在类的外部单独定义，以便于分配空间
```

# 小结
- 类中可以通过static关键字定义静态成员变量
- 静态成员变量隶属于类所有，需要在外部进行分配空间
- 每一个对象都可以访问静态成员变量
- 静态成员变量在全局数据区分配空间
- 静态成员变量的生命期为程序运行期