---
title: '回顾（24）：经典问题解析二'
date: 2020-02-11 15:25:22
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-24jing-dian-wen-ti-jie-xi-er.jpg
isTop: false
---
@[toc]
# 关于析构的疑问
- 单个对象创建时构造函数的调用顺序
    1. 调用父类的构造过程（后续课程中会讲解）
    2. 调用成员变量的构造函数（调用顺序和声明顺序相同）
    3. 调用类自身的构造函数

```
析构函数与对应构造函数的调用顺序相反
```

- 多个对象析构时
    - 析构顺序与构造顺序相反


```c++
#include <iostream>

using namespace std;

class Member
{
private:
	const char* ms;
public:
	Member(const char* s)
	{
		cout << "Member(const char* s): " << s << endl;
		ms = s;
	}
	~Member()
	{
		cout << "~Member(): " << ms << endl;
	}
			
};

class Test
{
private:
	Member mA;
	Member mB;
public:
	Test():mA("mA"),mB("mB")
	{
		cout << "Test()" << endl;	
	}		
	~Test()
	{
		cout << "~Test()" << endl;
	}
};

Member gA("gA");

int main(int argc, char *argv[])
{
	Test t;
		
	return 0;
}
```

```
打印结果：
Member(const char* s): gA
Member(const char* s): mA
Member(const char* s): mB
Test()
~Test()
~Member(): mB
~Member(): mA
~Member(): gA
果然，析构顺序与构造顺序相反
```
- 对于栈对象和全局对象，类似于入栈与出栈的顺序，最后构造的对象最先被析构
- 堆对象的析构发生在使用delete的时候，与delete的使用顺序相关

# 关于const对象的疑问
```
const关键字能否修饰类的对象？
如果可以，有什么特性？
```
- const关键字能够修饰对象
- const修饰的对象为只读对象
- 只读对象的成员变量不允许被改变
- 只读对象是编译阶段的概念，运行时无效，但还可以被改变的

- C++中的const函数
    - const对象只能调用const的成员函数
    - const成员函数中只能调用const成员函数
    - const成员函数中不能直接改写成员变量的值

- const成员函数的定义：在函数之后加const
```c++
    Type ClassName::function(Type p) const
```    
类中的函数声明与实际函数声明中必须带const关键字

```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	int mi;
public:
	int mj;
	Test(int i);
	Test(const Test& t);
	int getMI()const;	//const对象只能调用const的成员函数	
};

Test::Test(int i)
{
	mi = i;
}

Test::Test(const Test& t)//这个t是const引用，使的这个t具有只读属性，
                         //所以t必须访问const成员函数
{
	mi = t.getMI();
}

int Test::getMI()const//const对象只能调用const的成员函数
{
    //mi = 2;// error: assignment of data-member `Test::mi' in read-only structure
    //const成员函数中不能直接改写成员变量的值
	return mi;
}

int main(int argc, char *argv[])
{
	const Test t(1);//const对象只能调用const的成员函数
	
	//t.mj = 1000;//error: assignment of data-member `Test::mj' in read-only structure
	
	cout << "t.getMI() = " << t.getMI() << endl;
	//error: passing `const Test' as `this' argument of `int Test::getMI()' discards qualifiers
	return 0;
}
```
# 关于类成员的疑问
```
成员函数和成员变量都是隶属于具体对象的吗？
```
- 从面向对象的角度
    - 对象由属性（成员变量）和方法（成员函数）构成，每个对象都拥有自己的一套成员变量，但是所有的对象共享一套成员函数
- 从程序运行的角度
    - 对象由数据和函数构成
        - 数据只可能可以位于栈、堆和全局数据区
        - 函数只能位于代码段。代码段是只读的，在程序运行的时候是不能被改变的。程序被编译好之后，对象可以被动态地创建和动态地删除，对数据而言，栈数据、堆数据也可以被创建或者删除。对于代码段来说，是不能随意添加或者删除的。由于程序的特性，天生的决定成员函数不是每个对象都有一套的，所以只有每个对象共享一套成员函数。

```
疑问：既然所有对象都共享一套成员函数，那成员函数是怎么知道是哪个对象调用的呢？
```
答案：既然是成员函数，肯定不同于普通的全局函数，主要区别在于成员函数里面有一个你看不见的但是隐藏了的参数，这个参数是一个指针，并且这个指针有名字：this，this指针指代当前调用这个函数的对象
- 结论
    - 每个对象拥有自己独立的属性（成员变量）
    - 所有对象共享类的方法（成员函数）
    - 方法能够直接访问对象的属性
    - 方法中隐藏参数 this用于指代当前对象

```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	int mi;
public:
	int mj;
	Test(int i);
	Test(const Test& t);
	int getMI();
	int print();		
};

Test::Test(int i)
{
	mi = i;
}

Test::Test(const Test& t)
{
	mi = t.mi;
}

int Test::getMI()
{

	return mi;
}

int Test::print()//this指代当前调用这个函数的对象的地址 
{
	cout << "this = " << this << endl;
}

int main(int argc, char *argv[])
{
	Test t1(1);
	Test t2(2);
	Test t3(3);	
	
	cout << "t1.getMI() = " << t1.getMI() << endl;
	cout << "&t1 = " << &t1 << endl;//t1对象地址
	t1.print();//this指针指代当前指向的对象的地址，就是t1的地址
	cout << "t2.getMI() = " << t2.getMI() << endl;
	cout << "&t2 = " << &t2 << endl;//t2对象地址
	t2.print();//this指针指代当前指向的对象的地址，就是t2的地址
	cout << "t3.getMI() = " << t3.getMI() << endl;
	cout << "&t2 = " << &t2 << endl;//t3对象地址
	t3.print();	//this指针指代当前指向的对象的地址，就是t3的地址
	return 0;
}
```

# 小结
- 对象的析构顺序和构造顺序相反
- const关键字能够修饰对象，得到只读对象
- 只读对象只能调用const成员函数
- 所有对象共享类的成员函数
- 同一套成员函数怎么分辨不同的对象呢，有一个特殊的参数，这个特殊的参数指向当前调用成员函数的对象，隐藏的this指针用于指向当前对象
