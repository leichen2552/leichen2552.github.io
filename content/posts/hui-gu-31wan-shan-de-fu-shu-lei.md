---
title: '回顾（31）：完善的复数类'
date: 2020-02-17 14:40:59
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-31wan-shan-de-fu-shu-lei.jpg
isTop: false
---
@[toc]
# 完善的复数类
复试地位在数学里是很高的
- 复数类应该具有的操作
    - 运算：+，-，*，/
    - 比较：== !=
    - 赋值：=
    - 求模：modulus


- 利用操作符重载
    - 统一复数与实数的运算方式
    - 统一于实数的比较方式

```c++
Complex operator + (const Cpmplex& c);
Complex operator - (const Cpmplex& c);
Complex operator * (const Cpmplex& c);
Complex operator / (const Cpmplex& c);

bool operator == (const Cpmplex& c);
bool operator != (const Cpmplex& c);

Complex& operator = (const Cpmplex& c);
```

## 完善的复数类代码
### Complex.h
```c++
#ifndef _COMPLEX_H_
#define _COMPLEX_H_

class Complex
{
private:
	double a;
	double b;
public:
	Complex(double a = 0, double b = 0);//函数声明时确定默认值，在cpp文件中实现时就不
                                        //需要声明默认值
	double getA();
	double getB();
	double getModulus();
	
	Complex operator + (const Complex& p);	
	Complex operator - (const Complex& p);	
	Complex operator * (const Complex& p);	
	Complex operator / (const Complex& p);	
	
	bool operator == (const Complex& p);	
	bool operator != (const Complex& p);	
	
	Complex& operator = (const Complex& p);	
};

#endif 
```

### Complex.cpp
```c++
#include "Complex.h"
#include "math.h" 

Complex::Complex(double a, double b)//在声明时声明默认值，实现这个函数时就不需要了 
{
	this->a = a;
	this->b = b;
}

double Complex::getA()
{
	return a;
}

double Complex::getB()
{
	return b;
}

double Complex::getModulus()
{
	return sqrt(a*a + b*b);
}	
	
Complex Complex::operator + (const Complex& p)
{
	double na = this->a + p.a;
	double nb = this->b + p.b;
	Complex ret(na, nb);
	
	return ret;
} 

Complex Complex::operator - (const Complex& p)
{
	double na = this->a - p.a;
	double nb = this->b - p.b;
	Complex ret(na, nb);
	
	return ret;
}	

Complex Complex::operator * (const Complex& p)
{
	double na = this->a * p.a - this->b * p.b;
	double nb = this->a * p.b + this->b * p.a;
	Complex ret(na, nb);
	
	return ret;
}	

Complex Complex::operator / (const Complex& p)
{
	double cm = p.a * p.a + p.b * p.b;
	double na = (this->a * p.a + this->b * p.b) / cm;
	double nb = (this->b * p.a - this->a * p.b) / cm;
	Complex ret(na, nb);
	
	return ret;
}	
	
bool Complex::operator == (const Complex& p)
{
	return ((this->a == p.a) && (this->b == p.b));
}

bool Complex::operator != (const Complex& p)
{
	//这个实现方法非常巧妙，只需要他们相等的对立面
	return !(*this == p); 
}	
	
Complex& Complex::operator = (const Complex& p)
{
	if(this != &p)
	{
		this->a = p.a;
		this->b = p.b;		
	}
	return *this;
}
```
### main.cpp
```c++
#include <iostream>
#include <string>
#include "Complex.h"

using namespace std;
int main(int argc, char *argv[])
{
	Complex c1(1,2);
	Complex c2(3,6);
	
	Complex c3 = c2 - c1;
	cout << "c3 = " << "(" << c3.getA() << ", " << c3.getB() << ")" <<endl;
	
	Complex c4 = c1 * c3;
	cout << "c4 = " << "(" << c4.getA() << ", " << c4.getB() << ")" <<endl;
	
	Complex c5 = c2 / c1;
	cout << "c5 = " << "(" << c5.getA() << ", " << c5.getB() << ")" <<endl;
	
	Complex c6(2,4);
	cout << "c3 == c6 : " << (c3 == c6) << endl;//这个(c3 == c6)是一定要加括号，
            //因为 << 比 == 优先级高，但是复数类中又没有重载<<操作符，所以会报错
	cout << "c3 == c4 : " << (c3 != c4) << endl;
	
	(c3 = c2) = c1;
	cout << "c1 = " << "(" << c1.getA() << ", " << c1.getB() << ")" <<endl;
	cout << "c2 = " << "(" << c2.getA() << ", " << c2.getB() << ")" <<endl;
	cout << "c3 = " << "(" << c3.getA() << ", " << c3.getB() << ")" <<endl;
	return 0;
}
```

## 注意事项
- C++规定<font color = 740000>赋值操作符</font>**（=）**<font color = purple><font color = blue size = 5>**只能**</font>重载为成员函数</font>
- 操作符重载<font color = red>不能改变</font>原操作符的<font color = bf0000>优先级</font>
- 操作符重载<font color = red>不能改变</font>操作数的个数
- 操作符重载<font color = red>不能改变</font>操作符的<font color = green size = 4>**原有语义**</font>

# 小结
- 复数的概念可以通过自定义类实现
- 复数中的运算操作可以通过操作符重载实现
- 赋值操作符只能通过成员函数实现，是不能通过全局函数的
- 操作符重载的本质为函数定义