---
title: '回顾（29）：类中的函数重载'
date: 2020-02-15 10:37:25
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-29lei-zhong-de-han-shu-chong-zai.jpg
isTop: false
---
@[toc]
# 函数重载回顾
- 函数重载的本质为互相独立的不同函数
- C++中通过<font color = blue size = 4>**函数名**</font>和<font color = green size = 4>**函数参数**</font>确定函数调用
- 无法直接通过函数名得到重载函数的入口地址
- 函数重载必然发生在同一个作用域中


## 类中的成员函数可以进行重载
- 构造函数的重载
- 普通成员函数的重载
- 静态成员函数的重载

```
问题：
全局函数、普通成员函数以及静态成员函数之间是否可以构成重载？
```
## 实验测试
```c++
#include <iostream>
#include <string>
using namespace std;

void func()
{
	cout << "std::func()" << endl;
}
void func(int i)
{
	cout << "std::func(),i = " << i << endl;
}

class Test
{
private:
	int i;
public:
	Test()
	{
		cout << "Test::Test()" << endl;
	}
	Test(int v)
	{
		this->i = v;
		cout << "Test::Test(int v),i = " << i <<endl;
	}	
	Test(const Test& obj)
	{
		this->i = obj.i;
		cout << "Test::Test(const int& obj),i = " << i <<  endl;
	}
	
	static void func()
	{
		cout << "Test::static void func()" << endl;
	}
	
	void func(int i)
	{
		cout << "Test::func(),i = " << i << endl;
	}
};

int main(int argc, char *argv[])
{
	func();
	func(2);
	
	cout << endl;
	
	Test t1;
	Test t2(2);
	Test t3(t1);
	
	cout << endl;
	
	Test::func();
	t1.func();
	t1.func(3);
	
	return 0;
}
```
```
打印结果：
std::func()
std::func(),i = 2

Test::Test()
Test::Test(int v),i = 2
Test::Test(const int& obj),i = 1998216124

Test::static void func()
Test::static void func()
Test::func(),i = 3
请按任意键继续. . .
```
- 万变不离其宗
    1. 重载函数的本质为多个不同的函数
    2. **函数名**和**参数列表**是唯一的标识
    3. 函数重载**必须发生在同一作用域中**

- 静态成员函数和普通成员函数之间可以构成重载
- 全局函数和类的成员函数不能构成重载，因为命名空间不一样

# 深度的意义
- 重载的意义：就是通过函数名大概推出函数的功能，通过函数名提示开发者这个函数时干什么用的，通过参数列表告诉开发者这个函数该怎么使用
    1. 通过函数名对函数功能进行提示
    2. 通过参数列表对函数用法进行提示
    3. 扩展系统中已经存在的函数功能，本质上虽然是提供新的函数，但是从更高层次来说，还是扩展了函数功能 
## 实例演示
- 实现字符串拷贝的功能
```c++
#include <iostream>
#include <string>
using namespace std;

int main(int argc, char *argv[])
{
	const char* s = "D.T.Software";
	char buf[16] = {0};
	
	strcpy(buf, s);
	
	cout << buf << endl;
	
	return 0;
}
```

- 但是，如果把buf[16]换成buf[4]，像这样：
```c++
#include <iostream>
#include <string>
using namespace std;

int main(int argc, char *argv[])
{
	const char* s = "D.T.Software";
	char buf[4] = {0};
	
	strcpy(buf, s);
	
	cout << buf << endl;
	
	return 0;
}
```
- 运行结果就会出错，在Linux平台下肯定会出内存错误

- 所以，我们换一个函数strncpy
```c++
#include <iostream>
#include <string>
using namespace std;

int main(int argc, char *argv[])
{
	const char* s = "D.T.Software";
	char buf[4] = {0};
	
	strncpy(buf, s, sizeof(buf)-1);
	
	cout << buf << endl;
	
	return 0;
}
```
- 这样就只会复制"D.T"这三个字符

- 如果我们用上了重载，就扩展系统中已经存在的函数功能
```c++
#include <iostream>
#include <string>
using namespace std;

char* strcpy(char* buf, const char* str, unsigned int n)
{
	return strncpy(buf, str, n);
}

int main(int argc, char *argv[])
{
	const char* s = "D.T.Software";
	char buf[4] = {0};
	
	strcpy(buf, s, sizeof(buf)-1);//对于开发者而言，调用的还是同一个函数
	
	cout << buf << endl;
	
	return 0;
}
```

# 思考
- 重载能够扩展系统中已经存在的函数功能！

- 那么重载是否也能够扩展其他更多的功能？

## 复数类解决方案
![](https://leichen2552.github.io//post-images/1581739873099.jpg)
但是复数的相加减，C++的编译器是做不到的，这个下次再说

# 小结
- 类的成员函数之间可以进行重载
- 重载必须发生在同一作用域当中
- 全局函数和成员函数不能构成重载关系
- 重载的意义在于扩展已经存在的功能