---
title: '回顾（28）：友元的尴尬能力'
date: 2020-02-14 11:41:54
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-you-yuan-de-gan-ga-neng-li.jpg
isTop: false
---
@[toc]
# 友元的概念
- 什么是友元
    - 友元是C++中的一种关系
    - 友元关系发生在函数与类之间或者类与类之间
    - 友元关系是单项的，不能传递

# 友元的用法
- 在类中以friend关键字声明友元
- 类的友元可以是其他类或者是具体函数
- 友元不是类的一部分
- 友元不受类中访问级别的限制
- 友元可以直接访问具体类的所有成员

- 在类中用friend关键字对函数或类进行声明

```c++
#include <iostream>
#include <math.h>
#include <string>
using namespace std;

class Point{
private:
	double x;
	double y;
public:
	Point(double x, double y)
	{
		this->x = x;
		this->y = y;
	}
	double getX()
	{
		return x;	
	}
	double getY()
	{
		return y;
	}
	friend double func(Point& p1, Point& p2);	
    //体验了一下，main()函数也可以当做friend
    friend int main(int argc, char *argv[]);
};

double func(Point& p1, Point& p2)
{
	double ret = 0;

//在C++初期，程序员都用C语言写代码，大家特别希望能够像p1.x一样调用，
//而不是像这样调用八次函数，效率降低。早期的程序员看到C++这样，所以就不用了。
//并且C++自诞生就背负着一个重要的责任就是兼容C语言，所以就出现了friend关键字。	
//	ret = (p1.getX() - p2.getX())*(p1.getX() - p2.getX()) + 
//        (p1.getY() - p2.getY())*(p1.getY() - p2.getY());

//有了friend关键字，就可以了无限制的访问类的私有成员          
	ret = (p1.x - p2.x)*(p1.x - p2.x) + 
          (p1.y - p2.y)*(p1.y - p2.y);
	      
	ret = sqrt(ret);
	
	return ret;		  	
}

int main(int argc, char *argv[])
{
	Point p1(1,2);
	Point p2(10,20);
	
    //检测main()函数被friend
    cout << "p1(x,y) = "<< "(" << p1.x<< ","<< p1.y <<")"<< endl;

	cout << "p1(x,y) = "<< "(" << p1.getX()<< ","<< p1.getY() <<")"<< endl; 
	cout << "p2(x,y) = "<< "(" << p2.getX()<< ","<< p2.getY() <<")"<< endl;
	
	cout << "|(p1, p2)| = " << func(p1,p2) << endl;
	
	return 0;
}
```
# 友元的尴尬
- 友元是为了兼顾C语言的高效而诞生的
- 友元的超能力<font size = 4 color = red>**直接破坏**</font>了面向对象的<font color = purple size = 3>**封装性**</font>
- 友元在实际产品中的高效是得不偿失的
- 友元在现在软件工程中<font color = purple size = 3>已经逐渐被遗弃</font>


# 注意事项
- 友元关系不具备传递性
- 类的友元可以是其他类的成员函数
- 类的友元可以是某个完整的类
    - 所有的成员函数都是友元

```c++
#include <iostream>
#include <string>
using namespace std;

class classC
{
private:	
	const char* n;
public :
	classC(const char* n)
	{
		this->n = n;
	}
	
	friend class classB;//B是C的友元，那么B就可以访问C的私有成员
};

class classB
{
private:	
	const char* n;
public :
	classB(const char* n)
	{
		this->n = n;
	}
	
	void getClassCName(classC& c)
	{
		cout << "classC : " << c.n << endl; 
	}	
	friend class classA;//A是B的友元，那么A就可以访问B的私有成员	
};

class classA
{
private:	
	const char* n;
public :
	classA(const char* n)
	{
		this->n = n;
	}
	
	void getClassBName(classB& b)
	{
		cout << "classB : " << b.n << endl; 
	}	
    /*那是B是C的友元，A是B的友元，那么A是C的友元吗？实验测试：不是
	void getClassCName(classC& c)
	{
		cout << "classB : " << c.n << endl; 
	}
    */
};

int main(int argc, char *argv[])
{
	classA A("classA");
	classC C("classC");
	classB B("classB");
	
	A.getClassBName(B);
	B.getClassCName(C);
	return 0;
}
```

# 小结
- 友元是为了兼顾C语言的高效而诞生的
- 友元直接破坏了面向对象的封装性
- 友元关系不具备传递性
- 类的友元可以是其他类的成员函数
- 类的友元课以是某个完整的类