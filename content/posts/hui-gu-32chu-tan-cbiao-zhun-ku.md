---
title: '回顾（32）：初探C++标准库'
date: 2020-02-17 16:19:27
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-32chu-tan-cbiao-zhun-ku.jpg
isTop: false
---
# 有趣的重载
操作符<<的原生意义是按位左移，例如：1 << 2
```
意义是把 1 按位左移 2 位
0001 << 2   -->     0100 
```
重载左移操作符，将变量或者常量左移到一个对象中
```c++
#include <stdio.h>

class Console
{
public :
	void operator << (int i)
	{
		printf("%d",i);
	}
	void operator << (char c)
	{
		printf("%c",c);
	}		
};

Console cout;

int main(int argc, char *argv[])
{
	cout << 1;
	cout << '\n';
	
	//cout << 1 << '\n';//像这样连续左移就不支持，所以采用这样
	return 0;
}
```
采用返回当前对象的方式支持连续左移
```c++
#include <stdio.h>

class Console
{
public :
	Console& operator << (int i)
	{
		printf("%d",i);
		return *this;
	}
	Console& operator << (char c)
	{
		printf("%c",c);
		return *this;
	}		
};

Console cout;

int main(int argc, char *argv[])
{
	cout << 1 << '\n';
	return 0;
}
```
但是生平最讨厌输入换行符'\n'，加入const char endl = '\n'
```c++
#include <stdio.h>

const char endl = '\n';

class Console
{
public :
	Console& operator << (int i)
	{
		printf("%d",i);
		return *this;
	}
	Console& operator << (char c)
	{
		printf("%c",c);
		return *this;
	}	
	Console& operator << (const char* s)
	{
		printf("%s",s);
		return *this;
	}
	Console& operator << (double d)
	{
		printf("%f",d);
		return *this;
	}	
};

Console cout;

int main(int argc, char *argv[])
{
	double a = 0.777;
	
	cout << 1 << endl;
	cout << "112233, " << a <<endl;
	return 0;
}
```
<font color = blue size = 4>但是重复造轮子并不是一件有创造性的事，</font>
<font color = blue size = 4>站在巨人的肩膀上解决问题会更加有效！</font>

# c++标准库
- C++标准库不是C++语言的一部分，是那些做编译器的厂商在开发编译器的时候添加的，就是你做编译器，就要提供标准库
    - C++标准库是由类库和函数库组成的集合
    - C++标准库中定义的类和对象都位于std命名空间中
    - C++标准库的头文件都不带.h后缀，这是因为C++自诞生以来就背负的沉重使命就是兼容C语言
    - C++标准库涵盖了C库的功能


- C++编译环境组成
![](https://leichen2552.github.io//post-images/1581929564115.png)


- C++标准库预定义了多数常用的数据结构
![](https://leichen2552.github.io//post-images/1581929709852.png)
```c++
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <cmath>

//使用的是标准库，所以要打开这个命名空间
using namespace std; 


int main(int argc, char *argv[])
{
	printf("Hello world");
	
	char* p = (char*)malloc(16);
	
	strcpy(p, "I love you");
	
	free(p);
	 
	return 0;
}

```
- 使用cout和cin
![](https://leichen2552.github.io//post-images/1581930295253.png)
```c++
#include <iostream>
#include <cmath>
//使用的是标准库，所以要打开这个命名空间
using namespace std; 


int main(int argc, char *argv[])
{
	cout << "Hello world！" <<endl;
	double a = 0;
	double b = 0;
	
	cout << "Input a: ";
	cin >> a;
	
	cout << "Input b: ";
	cin >> b;
	
	double c = sqrt(a*a + b*b);
	
	cout << "c = " << c << endl; 
	return 0;
}
```
打印结果：
Hello world!
Input a: 3
Input a: 4
c = 5

# 小结
- C++标准库是由类库和函数库组成的集合
- C++标准库包含经典算法和数据结构的实现
- C++标准库涵盖了C库的功能
- C++标准库中的所有类库和函数都位于<font color = blue size = 5>**std**</font>这个命名空间当中