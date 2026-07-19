---
title: '小插曲之“康斯特引用（const&）”'
date: 2020-02-16 21:42:30
tags: [C++]
published: true
hideInList: false
feature: /post-images/xiao-cha-qu-zhi-kang-si-te-yin-yong-constand.jpg
isTop: false
---
@[toc]
先来回顾下之前最后修改的复数类代码
```c++
#include <iostream>
#include <string>
using namespace std;

class Complex
{
private:
	int a;
	int b;
public:
	Complex(int a = 0, int b = 0)
	{
		this->a = a;
		this->b = b;
	}
	int getA()
	{
		return a;
	}
	int getB()
	{
		return b;
	}
	Complex operator +(const Complex& p)/********************/
	{
		cout << "Complex operator +(Complex& p2)" << endl;
		Complex ret;
		
		ret.a = this->a + p.a;
		ret.b = this->b + p.b;	
		
		return ret;
	}
	
	friend Complex operator +(const Complex& p1,const Complex& p2);
} ;


Complex operator +(const Complex& p1, const Complex& p2)/********************/
{
	cout << "friend Complex operator +(Complex p1, Complex p2);" <<endl;
	Complex ret;
	
	ret.a = p1.a + p2.a;
	ret.b = p1.b + p2.b;	
	
	return ret;
}

int main(int argc, char *argv[])
{
	Complex c1(1,2);
	Complex c2(3,4);
	
	Complex c3 = c1 + c2;//编译器能自己选择用哪个函数 
	
	cout << "c3 = " << "(" << c3.getA() << "," << c3.getB() << ")" << endl;	
	return 0;
}
```
关注我在代码后面加了/********************/这个标记的，拿出来看下，就是这两行
```c++
Complex operator +(const Complex& p)
Complex operator +(const Complex& p1, const Complex& p2)
```
把这两行代码里的const去掉，像这样带回源代码，发现编译器就会报错
```c++
Complex operator +(Complex& p)
Complex operator +(Complex& p1, Complex& p2)
//带回源代码
#include <iostream>
#include <string>
using namespace std;

class Complex
{
private:
	int a;
	int b;
public:
	Complex(int a = 0, int b = 0)
	{
		this->a = a;
		this->b = b;
	}
	int getA()
	{
		return a;
	}
	int getB()
	{
		return b;
	}
/*
	Complex operator +(const Complex& p)
	{
		cout << "Complex operator +(Complex& p2)" << endl;
		Complex ret;
		
		ret.a = this->a + p.a;
		ret.b = this->b + p.b;	
		
		return ret;
	}*/
	
	Complex operator +(Complex& p)
	{
		cout << "Complex operator +(Complex& p2)" << endl;
		Complex ret;
		
		ret.a = this->a + p.a;
		ret.b = this->b + p.b;	
		
		return ret;
	}
	
	//friend Complex operator +(const Complex& p1,const Complex& p2);
	friend Complex operator +(Complex& p1, Complex& p2);
} ;


/*
Complex operator +(const Complex& p1, const Complex& p2)
{
	cout << "friend Complex operator +(Complex p1, Complex p2);" <<endl;
	Complex ret;
	
	ret.a = p1.a + p2.a;
	ret.b = p1.b + p2.b;	
	
	return ret;
}*/

Complex operator +(Complex& p1, Complex& p2)
{
	cout << "friend Complex operator +(Complex p1, Complex p2);" <<endl;
	Complex ret;
	
	ret.a = p1.a + p2.a;
	ret.b = p1.b + p2.b;	
	
	return ret;
}

int main(int argc, char *argv[])
{
	Complex c0; 
	Complex c1(1,2);
	Complex c2(3,4);
	
	Complex c3 = c1 + c2;
	
	cout << "c3 = " << "(" << c3.getA() << "," << c3.getB() << ")" << endl;	
	return 0;
}
//错误信息
//[Error] ..\main.cpp:81: error: ambiguous overload for 'operator+' in 'c1 + c2'
//[Warning] ..\main.cpp:37: note: candidates are: Complex Complex::operator+(Complex&)
//[Warning] ..\main.cpp:65: note:                 Complex operator+(Complex&, Complex&)
```
我在Linux平台下用g++编译器尝试，还是报一样的错误！
这个问题我还没解决，去群里问了老师，他也没给出合理的解释！

<font color = blue size =4>在我学C++的时候，有人说C++这门语言，连C++之父都没完全弄懂，我一开始不这样觉得，现在我懂了</font>
