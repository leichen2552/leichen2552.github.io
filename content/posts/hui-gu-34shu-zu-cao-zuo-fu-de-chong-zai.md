---
title: '回顾（34）：数组操作符的重载'
date: 2020-02-23 16:44:54
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-34shu-zu-cao-zuo-fu-de-chong-zai.jpg
isTop: false
---
@[toc]
# 数组操作符的重载
```
问题：
string类对象还具备C方式字符串的灵活性吗？还能访问单个字符吗？意思就是通过[]访问单个字符
```
## 字符串类的兼容性
- string类最大限度的考虑了C字符串的兼容性
- 可以按照使用C字符串的方式使用string对象
```c++
#include <iostream>
#include <string>
using namespace std;

int main(int argc, char *argv[])
{
	string s = "abcdefg1234";
	int n = 0;
	
	for(int i=0;i<s.length(); i++)
	{
		if(isdigit(s[i]))
		{
			n++;
		}	
	} 
	
	cout << n << endl;
	
	return 0;
}
//编译通过，说明string支持这种访问
```
```
问题：
类的对象怎么能和数组操作符[]在一起使用呢？
```
## 重载数组访问操作符
- 被忽略的事实
    - 数组访问操作符是C/C++中内置操作符
    - 数组访问操作符的原生意义是<font color = ff00ff size = 4>数组访问</font>和<font color = ff00ff size = 4>指针运算</font>
- 变换公式
<font color = red size = 4>a[n]</font> $\leftarrow \rightarrow$<font color = red size = 4> * (a + n)</font>$\leftarrow \rightarrow$ <font color = red size = 4>*(n + a) </font>$\leftarrow \rightarrow$ <font color = red size = 4>n[a]</font>
```c++
#include <iostream>
#include <string>

using namespace std;

int main()
{
    int a[5] = {0};
    
    for(int i=0; i<5; i++)
    {
        a[i] = i;
    }
    
    for(int i=0; i<5; i++)
    {
        cout << *(a + i) << endl;    // cout << a[i] << endl;
    }
    
    cout << endl;
    
    for(int i=0; i<5; i++)
    {
        i[a] = i + 10;    // a[i] = i + 10;
    }
    
    for(int i=0; i<5; i++)
    {
        cout << *(i + a) << endl;  // cout << a[i] << endl;
    }
    
    return 0;
}
```
- 数组访问操作符（[ ]）：重载一个操作符不能违背它的原生语义
    - 只能通过类的成员函数重载
    - 重载函数能且仅能使用一个参数
    - 可以定义不同参数的多个重载函数

```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
	int a[5];
public:
	int& operator [] (int i)
	{
		return a[i];//通过特殊的技术返回一个函数的返回值，如果真的想返回这个数组里面的值，就该使用引用 
	}	
	int& operator [] (const string& s)
	{
		if(s == "1st")
		{
			return a[0];
		}
		if(s == "2nd")
		{
			return a[1];
		}
		if(s == "3rd")
		{
			return a[2];
		}
		if(s == "4th")
		{
			return a[3];
		}
		if(s == "5th")
		{
			return a[4];
		}
	}
	
	int lenrth()
	{
		return 5;
	}
};


int main(int argc, char *argv[])
{
	Test t;
	
	for(int i=0; i<t.lenrth(); i++)
	{
		t.operator[](i) = i; //在重载函数的返回值不是引用的时候，把一个值赋给函数的返回值，绝对的不合法 
		t[i] = i;
	}
	
	for(int i=0; i<t.lenrth(); i++)
	{
		cout << t[i] << endl;
	}
	
	cout <<t["1st"]<<endl;
	cout <<t["2nd"]<<endl;
	cout <<t["3rd"]<<endl;
	cout <<t["4th"]<<endl;
	cout <<t["5th"]<<endl;//通过字符串来访问数组，在c#、D语言中，如果看到这个不要觉得惊奇 
	
	return 0;
}

//测试成功，编译器没有报错
```
## 再次升级数组类
### IntArray.h
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
	int& operator [](int index);
	IntArray& self(); //返回自身，从而减少使用指针
	~IntArray();
};

#endif
```

### IntArray.cpp
```c++
#include <iostream>
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

int& IntArray::operator [](int index)
{
	return m_pointer[index];
}

IntArray& IntArray::self()
{
	return *this;
}

IntArray::~IntArray()
{
	delete[] m_pointer;
}
```
### main.cpp
```c++
#include <iostream>
#include "IntArray.h"

using namespace std;

int main(int argc, char *argv[])
{
	IntArray* a = IntArray::NewInstance(5);//但是即使这样 
	cout << "a->length() = " << a->length() << endl;
	
	if(a != NULL)//在堆空间中创建的对象，我们给他娶个别名 
	{
		IntArray& array = a->self();
		
		array[0] = 1;
		
		
		for(int i=0; i<array.length(); i++)
		{
			cout << "array["<< i <<"] = " << array[i] << endl;
		}
		
		//再次总结对于这句IntArray* a = IntArray::NewInstance(5);
		//但是即使这样，还是出现了指针，在后面会有智能指针的技术来改善
	}
/*
	(*a)[0] = 1;//但是这样子访问看着很别扭，在C++开发中，尽可能的不使用指针*，所以我们再提供一个self()成员函数来返回自身 
	
	for(int i=0; i<a->length(); i++)
	{
		cout << "a["<< i <<"] = " << (*a)[i] << endl;
	}*/
	
	delete a;
	
	return 0;
}
```

# 小结
- string类<font color = blue size = 4>最大程度的兼容</font>了C字符串的用法
- 数组访问福的重载能够<font color = purple size = 4>使得对象模拟数组的行为</font>
- 只能通过<font color = ff4500 size = 4>类的成员函数重载数组访问符</font>
- 重载函数<font color = ff00ff size = 4>能且仅能</font>使用一个参数