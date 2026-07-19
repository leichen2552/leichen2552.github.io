---
title: '回顾（30）：操作符重载的概念'
date: 2020-02-16 16:00:17
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-30cao-zuo-fu-chong-zai-de-gai-nian.jpg
isTop: false
---
@[toc]
# 复数的问题
上节课复数的类问题，重载最重要的意义之一就是可以拓展系统当中的功能
![](https://leichen2552.github.io//post-images/1581842743648.jpg)
但是面对这个复数的加法，编译器肯定不知道怎么办，所以结合前面的友元等一些知识，利用函数显示加法来实现这一功能
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
	Complex()
	{
		a = 0;
		b = 0;
	}
	Complex(int a, int b)
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
	
	friend Complex add(const Complex& p1, const Complex& p2);
} ;

Complex add(Complex p1, Complex p2)
{
	Complex ret;
	
	ret.a = p1.a + p2.a;
	ret.b = p1.a + p2.b;	
	
	return ret;
}

int main(int argc, char *argv[])
{
	Complex c1(1,2);
	Complex c2(3,4);
	
	Complex c3 = add(c1,c2);
	
	cout << "c3 = " << "(" << c3.getA() << "," << c3.getB() << ")" << endl;	
	return 0;
}
```
这个确实实现了这个功能，但是c3 = add(c1,c2)这种表现形式不好看，而且利用友元也大大破坏了类的封装性。所以总的来看，这样的解决方案也不是最好的解决方案。

## 思考
Add函数可以解决Complex对象相加的问题，但是Complex是现实世界中确实存在的复数，并且复数在数学中地位和普通的实数相同，<font color = blue size = 4>那有没有办法让 <font color=red size = 5>**+**</font> 这个操作符也支持复数相加呢？</font>

# 操作符重载
- C++中能重载操作符的功能
- 操作符重载以函数的方式进行
- 本质：
    - 用特殊形式的函数扩展操作符的功能，意思就是写一个函数，这个函数认为是＋操作符进行的动作
- 通过operator关键字可以定义特殊的函数
- operator的本质是通过函数重载操作符
- 语法：
```c++
Type operator Sign(const Type p1, const Type p2)
{
    Type ret;

    return ret;
}
```
<font color = brown size = 4>*Sign*</font>为系统中<font color = red>预定义的操作符</font>，如：+，-，*，/，等

## 复数类代码修改
```c++
friend Complex add(const Complex& p1, const Complex& p2); 
//改成
friend Complex operator +(Complex p1, Complex p2);

Complex add(Complex p1, Complex p2)
//改成
Complex operator +(Complex p1, Complex p2);

Complex c3 = add(c1,c2);
//先修改成
Complex c3 = operator +(c1,c2);
//再修改成
Complex c3 = c1 + c2;//改成这样就十分完美了，就相当于编译器知道这是复数类相加了
```
- 但是这种解决方案依然使用了友元

## 复数类再次修改
- 使用类成员函数来代替全局函数，既保持了类的封装性，又不使用友元
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
	Complex operator +(const Complex& p)
	{
		cout << "Complex operator +(Complex& p2)" << endl;
		Complex ret;
		
		ret.a = this->a + p.a;
		ret.b = this->b + p.b;	
		
		return ret;
	}
	
	friend Complex operator +(const Complex& p1,const Complex& p2);
} ;


Complex operator +(const Complex& p1, const Complex& p2)
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
这部分代码在从编译器上复制到这篇博客上时，发生了一些小插曲，小插曲在下篇博客里面写。

# 小结
- 操作符重载是C++的最强大的特性之一
- 操作符重载的本质是通过函数拓展操作符的功能
- operator关键字是实现操作符重载的关键，用operator实现特殊的函数
- 操作符重载遵循相同的函数重载规则
- 全局函数和成员函数都可以实现对操作符的重载