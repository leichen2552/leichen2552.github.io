---
title: '回顾（19）：对象的构造（下）'
date: 2020-02-07 15:56:13
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-19dui-xiang-de-gou-zao-xia.jpg
isTop: false
---
@[toc]
# 特殊的构造函数
## 无参构造函数
- 没有参数的构造函数
    - 当类中没有定义构造函数，编译器默认提供一个无参构造函数，并且其函数体为空
```c++
#include <stdio.h>
class Test
{
private:
    int i;
    int j;
public:
    int getI(){ return i;}
    int getJ(){ return j;}
    //编译器为什么能编译器通过。
    //我们没有定义任何的构造函数时，编译器就提供了默认的无参构造函数
    /*
    Test()
    {}
    */

    //类中并没有手工构造函数，就提供一个默认的拷贝构造函数，
    //但是如果只有一个手工拷贝构造函数，编译器就不会提供默认的无参构造函数
    //但是编译会出错，还需要一个手工无参构造函数
      /*
    Test(const Test& t)
    {
        i = t.i;
        j = t.j;
    }
    */
};    

int main()
{
    Test t1;
    Test t2 = t1;

    cout << "t1.i = " << t1.i << "t1.j" << t1.j;
    cout << "t2.i = " << t2.i << "t2.j" << t2.j;

    return 0;
}
```
## 拷贝构造函数
- 参数为const class_name& 的构造函数
    - 当类中没有定义拷贝构造函数，编译器默认提供一个拷贝构造函数，简单的进行成员变量的值的赋值

## 拷贝构造函数的意义
- 兼容C语言的初始化方式
- 初始化行为能够符合预期的逻辑

- 浅拷贝
    - 拷贝后对象的物理状态相同
- 深拷贝
    - 拷贝后对象的逻辑状态相同

**编译器提供的拷贝构造函数只进行浅拷贝**
```c++
#include <iostream>
#include <string>
using namespace std;
#include <stdio.h>
class Test
{
private:
    int i;
    int j;
    int* p; 
public:
    int getI(){ return i;}
    int getJ(){ return j;}
    int* getP(){return p;}
    Test(int v)
    {
        i = 1;
        j = 2;
        p = new int;

        *p = v;
    }
    Test(const Test& t)
    {
        i = t.i;
        j = t.j;
        p = new int;

        *p = *t.p;
    }   
    void free()
    {
        delete p;
    }
};    //类的创建一定要加分号

int main()
{
    Test t1(3);
    Test t2 = t1;

    cout << "t1.i = " << t1.getI() << ",t1.j =" << t1.getJ() << ",t1.p = "<< t1.getP() << ",*t1.p = "<< *t1.getP() << endl;
    cout << "t2.i = " << t2.getI() << ",t2.j =" << t2.getJ() << ",t2.p = "<< t2.getP() << ",*t2.p = "<< *t2.getP() << endl;

    t1.free();
    t2.free();
   
    return 0;
}
```
**这两个指针指向了一个内存空间，并且被释放了两次，采用浅拷贝编译器会报错，如图所示**
![](https://leichen2552.github.io//post-images/1581067898285.png)

### 什么时候需要深拷贝
- 对象中有成员指代了系统中的资源
    - 成员指向了动态内存空间
    - 成员打开了外存中的文件
    - 成员使用了系统中的网络端口

### 数组类改进
因为上一节课的数组类中有对堆空间的申请，所以需要添加深拷贝构造函数
#### IntArray.h
```c++
#ifndef INTARRAY_H
#define INTARRAY_H

class IntArray{
private:
	int m_length;
	int* m_pointer;
public:
	IntArray(int len);
	int length();
	bool get(int index, int& value);
	bool set(int index, int value);	
    IntArray(const IntArray& ob);
    void free();
};//类的创建一定要加分号！！！

#endif
```

#### IntArray.cpp
```c++
#include "IntArray.h"

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

void IntArray::free()
{
	delete[] m_pointer;
}
```
#### main.cpp
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
	a.free();
	b.free();
	return 0;
}
```
# 小结
- C++编译器会默认提供构造函数
- 无参构造函数用于定义对象的默认初始状态，编译器发现没有任何的构造函数时，才会提供无参构造函数
- 拷贝构造函数在创建对象时拷贝对象的状态
- 对象的拷贝有深拷贝和浅拷贝两种方式
    - 浅拷贝使得对象的物理状态相同
    - 深拷贝使得对象的逻辑状态相同，如果使用了系统资源，就必须手动提供深拷贝函数