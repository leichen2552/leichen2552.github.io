---
title: '回顾（22）：对象的销毁'
date: 2020-02-09 11:01:05
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-22dui-xiang-de-xiao-hui.jpg
isTop: false
---
# 对象的销毁
- 生活中的对象都是被初始化之后才上市的
- 生活中的对象被销毁前会做一些清理工作
```
问题：C++中如何清理需要销毁的对象？
```
## 添加public的free函数
- 一般而言，需要销毁的对象都应该被清理
- 解决方案：
    - 为每个类都提供一个public的free函数
    - 对象不需要时立即调用free函数进行清理

```c++
class Test
{
    int* p;
public:
    Test() {p = new int}
    void free() {delete p;}
}
```
### 存在的问题
- free只是一个普通的函数，必须显示调用
- 对象销毁没有做处理，很可能造成资源泄露
```
想法：C++编译器能否自动调用某个特殊函数进行对象的清理？
```
## 析构函数
- C++的类中可以定义个特殊的清理函数
    - 这个特殊的清理函数叫做析构函数
    - 析构函数的功能与构造函数相反
- 定义：~ClassName()
    - 析构函数没有参数也没有返回值类型，直接推出这个函数不能被**重载**
    - 析构函数在对象销毁时自动被调用
```c++
class Test
{
    int i;
public:
    Test(int v) 
    {
        i = v;
        printf("Test(): i = %d\n",i);
    }
    ~Test()
    {
        printf("~Test(): i = %d\n",i);
    }
}

int main()
{
    Test t(1);

    Test* p = new Test(2);

    delete p;

    return 0;
}
```

## 修改之前的数组类
### InrArray.h
```c++
#ifndef INTARRAY_H
#define INTARRAY_H

class IntArray{
private:
	int m_length;
	int* m_pointer;
public:
	IntArray(int len);
	IntArray(const IntArray& ob);
	int length();
	bool get(int index, int& value);
	bool set(int index, int value);	
	~IntArray();
};
```
#endif


### IntArray.cpp
```c++
#include "IntArray.h"
#include <iostream>
using namespace std;//命名空间声明在此

IntArray::IntArray(int len)
{
	m_pointer = new int[len];
	
	for(int i = 0;i < len; i++)
	{
		m_pointer[i] = 0;
	}
	
	m_length = len;	
}

IntArray::IntArray(const IntArray& ob)
{
	m_length = ob.m_length;
	m_pointer = new int[ob.m_length];
	
	for(int i = 0;i < ob.m_length;i++)
	{
		m_pointer[i] = ob.m_pointer[i]; 	
	}		
}

int IntArray::length()
{
	return m_length;
}

bool IntArray::get(int index, int& value)
{
	bool ret = (0 <= index)&&(index < length());
	
	if(ret)
	{
		value = m_pointer[index];
	}
	
	return ret;
}

bool IntArray::set(int index, int value)
{
	bool ret = (0 <= index)&&(index < length());
	
	if(ret)
	{
 		m_pointer[index] = value;
	}
	
	return ret;
}

IntArray::~IntArray()
{
	cout << "~IntArray()" << endl;//在数组类实现细节的代码中加入输入输出，
                                  //必须要有命名空间的声明
	delete[] m_pointer;
}
```
### main.c
```c++
#include <iostream>
#include "IntArray.h"

using namespace std;

int main(int argc, char *argv[])
{
	IntArray a(5);
	
	for(int i=0; i<a.length(); i++)
	{
		a.set(i,i+1);	
	}
	
	for(int i=0; i<a.length(); i++)
	{
		int value = 0;
		if(a.get(i,value))
		{
			cout << "a["<< i<< "]= " <<value << endl;
		}
	}
	
	IntArray b = a;
	
	for(int i=0; i<b.length(); i++)
	{
		int value = 0;
		if(b.get(i,value))
		{
			cout << "b["<< i<< "]= " <<value << endl;
		}
	}
	return 0;
}
```
- 析构函数的定义准则
    - 当类中自定义了构造函数并且构造函数中使用了系统资源（如：内存申请，文件打开，等），需要自定义析构函数
# 小结
- 析构函数是对象销毁时进行清理的特殊函数
- 析构函数在对象销毁时自动被调用
- 析构函数是对象释放系统资源的保障，意义非常重要，可以让我们编写的软件能更加稳定！


