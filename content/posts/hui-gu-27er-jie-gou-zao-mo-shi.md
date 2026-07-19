---
title: '回顾（27）：二阶构造模式'
date: 2020-02-13 15:12:22
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-27er-jie-gou-zao-mo-shi.jpg
isTop: false
---
@[toc]
# 构造函数的回顾
## 关于构造函数
- 类的构造函数用于对象的初始化
- 构造函数与类同名并且没有返回值
- 构造函数在对象定时自动被调用
```
问题：
1. 如何判断构造函数的执行结果？就目前来说是没有办法来捕捉这个执行结果!
2. 在构造函数中执行return语句会发生什么？
3. 构造函数执行结束是否意味着对象构造成功？
```
- 构造函数
    - 只提供自动初始化成员变量的机会
    - 不能保证初始化逻辑一定成功
    - 执行return语句后构造函数立即结束
```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	int mi;
	int mj;
	
	bool mstatus;//强行让构造函数有个返回值，来判断构造函数是否构造成功 
public:
	Test(int i, int j):mstatus(false)
	{
		return;
		mi = i;
		mj = j;
		
		mstatus = true;
	}
	int getI()
	{
		return mi;
	}	
	int getJ()
	{
		return mj;
	}
	int status()
	{
		return mstatus;
	}
};

int main(int argc, char *argv[])
{
	Test t1(1,2);
	if(t1.status())
	{
		cout << "t1.mi = " << t1.getI() << endl;
		cout << "t1.mj = " << t1.getJ() << endl;
	}

	return 0;
}
```
<font size = 4>**构造函数**能决定的<font color = red size = 5>**只是对象的初始状态**</font>，<font color = blue size = 5>**而不是对象的诞生**！</font></font>
## 半成品对象的概念
- 初始化操作不能按照预期完成而得到的对象
- 半成品对象是合法的C++对象，也是Bug的重要来源

## 解决方案：二阶构造
- 工程开中的构造过程可分为
    - 资源无关的初始化操作
        - 不可能出现异常情况的操作
    - 需要使用系统资源的操作
        - 可能出现异常情况，如：内存申请，访问文件


![](https://leichen2552.github.io//post-images/1581582529088.png =600x600)

```c++
class TwoPhaseCons
{
private:
    TwoPhaseCons()
    {   //这个构造函数放在了private里面，就不能在外界被调用，
        //不能够直接地通过类名来定义变量

        //第一阶段构造函数，与资源无关的初始化操作
    }
    bool construct()
    {
        //第二阶段构造函数，与资源相关的初始化操作
        return true;
    }
public:
    static TwoPhaseCons* NewInstance();//静态的对象创建函数，返回一个对象指针，
                                       //就是真正意义上的创建函数，用于创建对象
};

TwoPhaseCons* TwoPhaseCons::NewInstance()
{
    TwoPhaseCons* ret = new TwoPhaseCons();

    //若第二阶段构造失败，返回NULL
    if( !(ret && ret->construct()) )
    {
        delete ret;
        ret = NULL;
    }

    return ret;
}
```

### 实例展示二阶构造
```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	int mi;
	int* mp;
	
	Test()
	{
		mi = 0;
	}
	bool construct()
	{
		mp = new int;
		if(mp)
		{
			return true;
		}
		return false;
	}
public:
	static Test* NewInstance();
};

Test* Test::NewInstance()
{
	Test* ret = new Test();
	
	if( !(ret && ret->construct()) )
	{
		delete ret;
		ret = NULL;
	}
	
	return ret;
}

int main(int argc, char *argv[])
{
	Test* t = Test::NewInstance();//静态成员函数只能通过类名::或者对象调用 
	
	cout << "t = " << t << endl; 
	 
	return 0;
}
```
<font color = blue size = 3>静态成员函数</font>只能通过<font color = red size = 4>**类名::**</font>或者<font color = red size = 4>**对象**</font>调用


### 再次修改数组类
#### IntArray.h
```c++
#ifndef INTARRAY_H
#define INTARRAY_H

class IntArray{
private:
	int m_length;
	int* m_pointer;
	
	IntArray(int len);
	//IntArray(const IntArray& ob);
	bool construct();
public:
	static IntArray* NewInstance(int length);
	int length();
	bool get(int index, int& value);
	bool set(int index, int value);	
	~IntArray();
};

#endif
```
#### IntArray.cpp
```c++
#include "IntArray.h"

IntArray::IntArray(int len)
{
	m_length = len;	
}

bool IntArray::construct()
{
	bool ret = true;
	
	m_pointer = new int[m_length];
	
	if(m_pointer)
	{
		for(int i = 0;i < m_length; i++)
		{
			m_pointer[i] = 0;
		}
	}
	else
	{
		ret = false;
	}
	
	return ret;
}

IntArray* IntArray::NewInstance(int length)
{
	IntArray* ret = new IntArray(length);
	
	if( !(ret && ret->construct()) )
	{
		delete ret;
		ret = NULL;
	}
	
	return ret;
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
	IntArray* a = IntArray::NewInstance(5);

	for(int i=0; i<a->length(); i++)
	{
		a->set(i,i+1);//这个函数返回的是bool类型值
	}
	cout << "a->length() = " << a->length() << endl;	
	
	for(int i=0; i<a->length(); i++)
	{
		int v = 0;
		a->get(i,v);//这个函数返回的是bool类型值 
		cout << "a["<< i <<"] = " << v << endl;
	}
	
	delete a;
	
	return 0;
}



#endif

```
大多数人又要问，使用了二阶构造之后，产生的对象只能在堆空间，就不能再栈空间了。这样恰恰是最好的，这些巨大的对象，是不适用于放在栈空间的，应该放在堆空间里面。

# 小结
- 构造函数只能决定对象的初始化状态
- 构造函数中初始化操作的失败不影响对象的诞生
- 初始化不完全的半成品对象是Bug的重要来源
- 二阶构造是人为的将初始化过程分为两部分
- 二阶构造能够确保创建的对象都是完整初始化的
