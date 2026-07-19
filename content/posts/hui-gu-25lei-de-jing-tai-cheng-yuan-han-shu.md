---
title: '回顾（26）：类的静态成员函数'
date: 2020-02-12 14:20:55
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-25lei-de-jing-tai-cheng-yuan-han-shu.jpg
isTop: false
---
@[toc]
# 未完成的需求
先来看看上篇博客里面客户的三个需求：
```
# 新的需求：小实例
1. 统计在程序期间某个类的对象数目【完成】
2. 保证程序的安全性（不能使用全局变量）【完成】
3. 随时获取当前对象的数目【未完成】
```

```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	static int mCount;
public:
	Test()
	{
		mCount++;	
	} 
	~Test()
	{
		mCount--;
	}		
	int getCount()
	{
		return mCount;
	}
};

int Test::mCount = 0;

int main(int argc, char *argv[])
{

	return 0;
}
```
```
问题：如果这个程序里面没有任何的对象，那么在主函数里面应该返回0个对象
```
## 解决方案一
```c++
class Test
{
private:-->改成public
	static int mCount;
public:
}
```
```
但是这样又会面临一个问题：这个static int mCount变量就可以在外部任意地方改动
```
```c++
//比如：改成1000表示在程序中会有1000个对象吗？
int main(int argc, char *argv[])
{
	cout << "Test :: mCount = " << Test::mCount << endl;
	Test::mCount = 1000;
	cout << "Test :: mCount = " << Test::mCount << endl;
	return 0;
}
```
```
所以这种解决方案失败！这样的代码安全性拿不出手，也拿不出手！
```

## 问题分析
- 不依赖对象就可以访问静态成员变量
- 必须保证静态成员变量的安全性，像上面那种把属性改成public的方式太暴力
- 方便快捷的获取静态成员变量的值

## 静态成员函数
- 在C++中课以定义静态成员函数
    - 静态成员函数是类中特殊的成员函数
    - 静态成员函数属于整个类所有
    - 可以通过类名直接访问共有静态成员函数
    - 可以通过对象名访问共有静态成员函数

- 静态成员函数的定义
    - 直接通过static关键字修饰成员函数
```c++
class Test
{
public :
    static void Func1() {}
    static int Func2() {}
}

int Test::Func2()
{
    return 0;
}
```
- 静态成员函数不能访问**普通成员变量**

- <font color = Purple size = 5>**静态成员函数**</font> <font size = 4>**VS**</font> <font color = Green size = 5>**普通成员函数**</font>

| | <font color = Purple size = 4>静态成员函数</font> | <font color = Green size = 4>普通成员函数</font> |
| ------ | ------ | ------ |
| 所有对象共享 | <font color = Blue size = 3>**Yes**</font> | <font color = Blue size = 3>**Yes**</font> |
| 隐含this指针 | <font color = Red size = 3>**No**</font> | <font color = Blue size = 3>**Yes**</font> |
| 访问普通成员变量（函数） | <font color = Red size = 3>**No**</font> | <font color = Blue size = 3>**Yes**</font> |
| 访问静态成员变量（函数） | <font color = Blue size = 3>**Yes**</font> | <font color = Blue size = 3>**Yes**</font> |
| 通过类名直接调用 | <font color = Blue size = 3>**Yes**</font> | <font color = Red size = 3>**No**</font> |
| 通过对象名直接调用 | <font color = Blue size = 3>**Yes**</font> | <font color = Blue size = 3>**Yes**</font> |

## 最终解决方案
```c++
#include <iostream>
#include <string>
using namespace std;

class Test
{
private:
	static int mCount;
public:
	Test()
	{
		mCount++;	
	} 
	~Test()
	{
		mCount--;
	}		
	static int getCount()
	{
		return mCount;
	}
};

int Test::mCount = 0;

Test gTest;

int main(int argc, char *argv[])
{
	cout << "Test :: mCount = " << Test::getCount() << endl;
	
	Test t;
	cout << "Test :: mCount = " << Test::getCount() << endl;
	
	Test* p = new Test();
	cout << "Test :: mCount = " << Test::getCount() << endl;
	
	delete p;
	
	cout << "Test :: mCount = " << Test::getCount() << endl;
	
	return 0;
}
```

# 小结
- 静态成员函数是类中特殊的成员函数
- 静态成员函数没有隐藏的this指针
- 静态成员函数可以通过类名直接访问
- 静态成员函数只能访问静态成员变量与静态成员函数，也正是利用了这个特性，完成了客户的需求




