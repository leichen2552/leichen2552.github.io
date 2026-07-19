---
title: '回顾（18）：对象的构造（中）'
date: 2020-02-07 14:10:50
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-18dui-xiang-de-gou-zao-zhong.jpg
isTop: false
---
@[toc]
# 构造函数

- 带有参数的构造函数
    - 构造函数可以根据需要定义参数
    - 一个类中可以存在多个重载的构造函数
    - 构造函数的重载遵循C++重载的规则
```c++
class Test
{
private:
    int i;
    int j;
public:
    Test() 
    {
    }
    Test(int v) 
    {//use v to initialize member
    }    
};
```
## 友情提醒
- 对象定义和对象声明时不同的
    - 对象定义：申请对象的空间并调用构造函数
    - 对象声明：告诉编译器存在这样一个对象
```c++
Test t;//定义对象并调用构造函数

int main()
{
    extern Test t;//告诉编译器存在名为 t 的 Test 对象

    return 0;
}
```
构造函数的自动调用
```c++
class Test
{
public:
    Test() 
    {
        printf("Test()");
    }
    Test(int v) 
    {//use v to initialize member
        printf("Test(int v)，v = %d\n",v);
    }    
};

int main()
{
    Test t;          //调用Test()
    Test t1(1);      //调用Test(int v)
    Test t2 = 1;     //调用Test(int v)

    t = t2;//赋值

    //啰嗦几句！
    int i = 1;//这个叫定义并且初始化

    int j;//这个初始化赋值是随机的
    j = 2;//这个叫做赋值

    int z(100);//这样子的初始化也合法
    printf("z = %d\n", z);

    return 0;
}    

```
**赋值和初始化是不相同！！！**

## 构造函数的调用
- 一般情况下，构造函数在对象定义时被自动调用
- 一些特殊情况下，需要手工调用构造函数
```
如何创建一个对象数组？
```
```c++
class Test
{
private:
    int m_value;
public:
    Test() 
    {
        printf("Test()");

        m_value = 0;
    }
    Test(int v) 
    {//use v to initialize member
        printf("Test(int v)，v = %d\n",v);

        m_value = v;
    }    
};

int main()
{
    Test ta[3] = {Test(), Test(1), Test(2)};//手工调用构造函数，
                                            //对数组中的每一个元素初始化

    for(int i = 0; i<3; i++)
    {
        printf("ta[%d].getValue() = %d\n", i, ta[i].getValue());        
    }
    //从打印结果也能清晰的看出初始化时的调用函数情况

    Test t = Test(100);//手工调用构造函数进行初始化
    printf("t.getValue() = %d\n", t.getValue()); 
} 
```
## 小实例
- 需求：开发一个数组类解决原生数组地安全性问题
    - 提供函数获取数组长度
    - 提供函数获取数组元素
    - 提供函数设置数组元素

### IntArray.h
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
    void free();
};//类的创建一定要加分号！！！

#endif
```

### IntArray.cpp
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
### main.cpp
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
	
	a.free();
	return 0;
}
```
其实这个类并不完善，以后会慢慢完善的

# 小结
- 构造哈数可以根据需要定义参数
- 构造函数之间可以存在重载关系
- 构造函数遵循C++中重载函数规则
- 对象定义时会触发构造函数的调用
- 在一些情况下可以手动调用构造函数
