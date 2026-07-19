---
title: '回顾（33）：C++中的字符串类'
date: 2020-02-18 16:41:59
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-33czhong-de-zi-fu-chuan-lei.jpg
isTop: false
---
@[toc]
# 历史遗留问题
- C语言不支持真正意义上的字符串
- C语言用字符数组和一组函数实现字符串操作
- C语言不支持自定义类型，因此无法获得字符串类型

## 解决方案
- 从C到C++的进化引入了自定义类型
- 在C++中可以通过类完成字符串类型的定义

```
问题：
C++中的原生类型系统是否包含字符串类型？
```

# 标准库中的字符串类
## 字符串基本操作
- C++语言<font color = blue>直接支持</font>C语言的所有概念
- 因为C++自诞生以来的沉重使命就是兼容C语言，所以C++语言中<font color = red>没有原生的字符串类型</font>
- C++标准库提供了string类型
    - string直接支持<font color = purple>字符串连接</font>
    - string直接支持<font color = ff8c00>字符串比较大小</font>
    - string直接支持<font color = ff6eb4>字符串查找和提取</font>
    - string直接支持<font color = f4a460>字符串的插入和替换</font>

```c++
#include <iostream>
#include <string>
using namespace std;

void string_sort(string a[], int len)
{
	for(int i=0; i<len; i++)
	{
		for(int j=i; j<len; j++)
		{
			if(a[i] > a[j])//标准库里重载了 > 这个操作符
			{
				swap(a[i], a[j]);
			}
		}
	}	
}

string string_add(string a[], int len)
{
	string ret = "";
	
	for(int i=0; i<len; i++)
	{
		ret = ret + a[i] + ";";//标准库里重载了 + 这个操作符
	}
	
	return ret;	
}

int main(int argc, char *argv[])
{
	string sa[7] = 
	{
        "Hello World",
        "D.T.Software",
        "C#",
        "Java",
        "C++",
        "Python",
        "TypeScript"
	};
	
	string_sort(sa,7);
	
	for(int i=0; i<7; i++)
	{
		cout << sa[i] << endl;	
	}
	cout << endl;
	cout << string_add(sa, 7) << endl;
	
	return 0;
}
```
打印结果：
```
C#
C++
D.T.Software
Hello World
Java
Python
TypeScript

C#;C++;D.T.Software;Hello World;Java;Python;TypeScript;
```
## 字符串与数字的转换
- 标准库中提供了相关的类对字符串和数字进行转换
- 字符串流泪（sstream）用于string的转换
    - ```<sstream>``` - 相关头文件
    - ```istringstream```- 字符串输入流
    - ```ostringstream``` - 字符串输出流
- 使用方法
    - string $\rightarrow$ 数字
        ```c++
        istringstream iss("123.45");
         double num;
         iss >> num;
         ```
    - 数字 $\rightarrow$ string
        ```c++
        ostringstream oss;
         oss <<543.21;
         string s = oss.str();
        ``` 
```c++
#include <iostream>
#include <sstream>
#include <string>
using namespace std;
//采用直接调用构造函数的方法形成临时对象，生命周期只有这一行语句的时间 
#define TO_NUMBER(s, n) (istringstream(s) >> n)

//这一行里的(ostringstream&)强制类型转换，
//如果没有的话，编译器会报错，因为如果没有的话，返回的就不是一个ostringstream类型
#define TO_STRING(n) (((ostringstream&)(ostringstream() << n)).str())

//函数模板支持多种类型
template <typename T>
string to_string(T n)
{
	ostringstream oss;
	oss << n;
	return oss.str();	
}

//函数模板支持多种类型
template <typename T>
bool to_number(const string& s, T& n)
{
	istringstream iss(s);

	return iss >> n;
} 

int main(int argc, char *argv[])
{
//采用函数模板 
/***************************************************/	
	double m = 0;
	if(TO_NUMBER("123.789", m)) 
	{
		cout << "m = "<< m <<endl;
	}
	cout << endl;
/***************************************************/
	
//采用函数模板 
/***************************************************/
	int n = 0;
	cout << "to_number<int>(" << "123456,n) = " << to_number<int>("123456",n) << endl;		
	cout <<  "n = " << n << endl;
	cout << endl;
	
	float f = 0;
	cout << "to_number<float>(" << "123.456,f) =" << to_number<float>("123.456",f) << endl;		
	cout <<  "f = " << f << endl;
	cout << endl;
	
	double d = 0;
	cout << "to_number<double>(" << "123.4789,d)"<< to_number<double>("123.4789",d) << endl;		
	cout << "d = " << d << endl;
	cout << endl;
/***************************************************/

	string s1 = TO_STRING(12345);
	string s2 = to_string(12345);
	
	cout << "s1 = " << s1 << endl; 
	cout << "s2 = " << s2 << endl; 
	
	return 0;
}
```
打印结果：
```
m = 123.789

to_number<int>(123456,n) = 1
n = 123456

to_number<float>(123.456,f) =1
f = 123.456

to_number<double>(123.4789,d)1
d = 123.479

s1 = 12345
s2 = 12345
```
# 面试题分析
abcdefg $\rightarrow$ efgabcd，需要循环右移三位
```c++
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

string operator >> (const string& s, unsigned int n)
{
	string ret;
	unsigned int pos = 0;
	
	//abc ==> 1 cab
	//abc ==> 4 cab
	n = n % s.length();//先取余
	pos = s.length() - n;//再取位置
	
	ret = s.substr(pos);//提取位置之后的字串
	
	ret = ret + s.substr(0,pos);//再把ret加上从0到pos的字串
	
	//abcdefg ==> 8
	//sbcdefg ==> 1
	//8 % 7 == > 1
	//7-1 = 6
	//abcdef g
	//ret ==> g
	//ret = g + abcdef
	//ret = gabcdef 
	
	return ret;
}

int main(int argc, char *argv[])
{
	string r = "abcdefg";
	
	string s = r >> 3;
	
	cout << s << endl;
	return 0;
}
```
打印结果：
```
r = abcdefg
s = efgabcd
```
# 小结
- 应用开发中大多数的情况都在进行字符串处理
- C++中<font color = red>没有直接支持</font>原生的字符串类型
- 标准库中通过<font color = blue size = 4> **string** </font>类支持字符串的概念
- string类支持**字符串**和**数字**的相互转换
- string类的应用使得问题的求解变得简单

# 字符串反转
- 要求：
    - 使用string类完成
- 示例：
    - "we;tonight;you" $\rightarrow$ "ew;thginot;uoy"
- 提示：
    - string类中提供了成员函数可以查找目标字符的位置

