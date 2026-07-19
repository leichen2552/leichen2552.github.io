---
title: '回顾（35）：函数对象分析——重载函数调用操作符（( )）'
date: 2020-02-25 16:11:25
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-35han-shu-dui-xiang-fen-xi-chong-zai-han-shu-diao-yong-cao-zuo-fu.jpg
isTop: false
---
@[toc]
# 客户需求
- 函数可以获得斐波那契数列每项的值
- 每调用一次返回一个值
- 函数可根据需要重复使用

```c++
#include <iostream>
#include <string>
using namespace std;

int fib()
{
	static int a0 = 0;
	static int a1 = 1;//使用静态局部变量，可以使数据返回时不被摧毁，从而避免使用全局变量 
	
	int ret = a1;
	
	a1 = a0 + a1;
	a0 = ret;
	
	return ret;
} 

int main(int argc, char *argv[])
{
	for(int i=0; i<10; i++)
	{
		cout << fib() << endl;
	}
	
	return 0;
}
```

# 存在的问题
- 函数一旦开始就无法重来
    - 静态局部变量处于函数内部，外界无法改变
    - 函数为全局函数，是唯一的，无法多次独立使用
    - 无法指定某个具体的数列项作为初始值

# 解决方案
## 函数对象
- 使用具体的类对象取代函数
- 该类的对象具备函数调用的行为
- 构造函数指定具体数列项的起始位置
- 多个对象相互独立的求解数列项

## 重载函数调用操作符（( )）
- 只能通过类的成员函数重载
- 可以定义不同参数的多个重载函数

```c++
#include <iostream>
#include <string>
using namespace std;

class fib
{
	int a0;
	int a1;//使用静态局部变量，可以使数据返回时不被摧毁，从而避免使用全局变量 
public:	
	fib()
	{
		a0 = 0;
		a1 = 1;
	}
	
	fib(int n)
	{
		a0 = 0;
		a1 = 1;
		
		for(int i=2; i<=n; i++)
		{
			int t=a1;
			
			a1 = a0 + a1;
			a0 = t;
		}
	}
	
	int operator()()
	{
		int ret = a1;
	
		a1 = a0 + a1;
		a0 = ret;
		
		return ret;
	}
};

int main(int argc, char *argv[])
{
	fib a;
	
	for(int i=0; i<10; i++)
	{
		cout << a() << endl;
	}
	
	fib b(10);
	
	for(int i=0; i<5; i++)
	{
		cout << b() << endl;
	}
	return 0;
}
```
# 小结
- 函数调用操作符（<font color = red size = 4>( )</font>）是可以重载的
- 函数调用操作符智能通过<font color = blue size = 4>类的成员函数重载</font>
- 函数调用操作符可以定义不同参数的<font color = ff3030 size = 4>多个重载函数</font>
- 函数对象在工程中<font color = ff00ff size = 4>取代函数指针</font>
