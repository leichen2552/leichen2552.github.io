---
title: '回顾（16）：类的真正形态'
date: 2020-02-06 17:17:37
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-16lei-de-zhen-zheng-xing-tai.jpg
isTop: false
---
@[toc]
# 类的关键字
经过不停地改进，结构体struct变得越来越不像它在C语言中的样子

- 但是struct在C语言中已经有了自己的含义，必须继续兼容
- 在C++中提供了行的关键字class用于类定义
- class和struct的用法是完全相同的
```
class和struct有什么区别呢？
```
- 在struct定义类时，所有成员的默认访问级别是public
- 在class定义类时，所有成员的默认访问级别为private

```c++
struct A
{
    //default to public
    int i;
    //default to public
    int getI()
    {
        return i;
    }
};

class A
{
    //default to private
    int i;
    //default to private
    int getI()
    {
        return i;
    }
};
```

# 小实例
- 需求：开发一个用于四则运算的类
    - 提供setOperator函数设置运算类型
    - 提供setParameter函数设置运算参数
    - 提供result函数进行运算
        - 其返回值表示运算的合法性
        - 通过引用参数来返回结果

## 类的真正形态
- C++中的类支持声明和实现的分离
- 将类的实现和定义分开
    - .h头文件中只有类的声明
        - 成员变量和成员函数的声明
    - .cpp源文件中完成类的其他实现
        - 成员函数的具体实现

```
使用方式与实现细节相分离
```

### Operator.h
```c++
#ifndef OPEARTOR_H
#define OPERATOR_H

class Operator
{
private:
	char mOp;
	int mPa;
	int mPb;
	
public:
	bool setOperator(char mop);
  	bool setParameter(int mpa, int mpb);
    bool getresult(double& r);		
	
};
```
### Operator.cpp
```c++
#include "Operator.h"


bool Operator::setOperator(char mop)
{
	bool ret = true;
	
	if((mop == '/') || (mop == '+')||(mop == '-')||(mop == '*'))
	{
		ret = true;
		mOp = mop;
	}
	else
	{
		ret = false;
		mOp = '\0'		
	}
	
	return ret;
}

bool Operator::setParameter(int mpa, int mpb)
{
	mPa = mpa;
	mPb = mpb;
}

bool Operator::getresult(double& r)
{
	bool ret = true;
	if( mOp == '/' && mPb != 0 )
	{
		r = mPa/mPb;	
	}
	else
	{
		ret = false;
	}
	
	if(mOp == '+')
	{
		r = mPa+mPb;
	}
	if(mOp == '-')
	{
		r = mPa-mPb;
	}
	if(mOp == '*')
	{
		r = mPa*mPb;
	}
	
	return ret;
}	
```
### main.cpp
```c++
#include <iostream>
#include "Operator.h"

using namespace std;

int main(int argc, char *argv[])
{
	Operator o;
	double r = 0;
	
	o.setOperator('/');
	o.setParameter(6, 3);
	if(o.getresult(r))
	{
		cout << r << endl;
	}
	
	return 0;
}
```
# 小结
- C++引进新的关键字class用于定义类
- struct和class的区别在于默认访问级别不同
- C++中的类支持声明和实现的分离
    - 在.h头文件中声明类的使用方式
    - 在.cpp源文件中实现类的实现细节