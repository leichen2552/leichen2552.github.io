---
title: '回顾（15）：类与封装的概念'
date: 2020-02-06 12:56:03
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-15lei-yu-feng-zhuang-de-gai-nian.jpg
isTop: false
---
@[toc]
类就是日常生活中分类的思想

# 类的组合
- 电脑这个类是由硬盘、内存、CPU、主板这些类组成的

# 类通常分为以下两个部分
- 类的实现细节
- 类的使用方式

# 类的封装
- 当使用类时，不需要关心其实现细节
- 当创建类时，才需要考虑其内部实现细节

- 普通用户使用手机，只需要学习如何发短信、打电话、拍照等等
- 手机开发工程师，需要知道细节功能是如何实现的

## 封装的基本概念
- 根据经验，并不是类的每个属性都是对外公开的
    - 如：女孩子不希望别人知道自己的体重和年龄
    - 如：男孩子不希望别人知道自己的身高和收入
- 而一些类的属性是对外公开的
    - 如：人的姓名，学历，国籍，等
- 必须在类的表示法中定义属性和行为的公开级别
    - 类似文件系统中文件的权限

## C++中类的封装
- 成员变量：C++中表示类属性的变量
- 成员函数：C++中用于表示类行为的函数
- C++中可以给成员变量和成员函数定义访问级别
    - public：成员变量和成员函数可以在类的内部和外界访问和调用
    - private：成员变量和成员函数只能在类的内部被访问和调用

```c++
#include <stdio.h>

struct Biology {
    bool living;
};

struct Animal : Biology {
    bool movable;
    void findFood() { }
};

struct Plant : Biology {
    bool growable;
};

struct Beast : Animal {
    void sleep() { }
};

struct Human : Animal {
    void sleep() { }
    void work() { }
};

struct Girl : Human{
	private:
		int age;
		int weight;
	public:
		void print()
		{
			age = 22;
			weight = 48;
			
			printf("I'm girl, I'm %d years old\n",age);
			printf("My weight is %d kg\n",weight);
		}	
};

struct Boy : Human{
	private:
		int height;
		int salary;
	public:
		int age;
		int weight;
		void print()
		{
			height = 175;
			salary = 9000;
			age = 22;
			weight = 48;
			
			printf("I'm boy, my height is %d cm\n",height);
			printf("My salary is %d RMB\n",salary);
		}
};

int main(int argc, char *argv[]) {
	Girl g;//从C++语言的角度：创建了一个类的对象，
	Boy b;
	
	g.print();
	b.age = 19;
	b.weight = 120;
	
	
	b.print();
	return 0;
}
```

- 成员函数可以访问类的的成员变量

## 类的成员作用域
- 类成员的作用域只在类的内部，外部是无法访问的
- 成员函数可以直接访问成员变量和调用成员函数
- 类的外部可以通过类变量访问public成员
- 类成员的作用域与访问级别没有任何关系
    - C++中用struct定义的类中所有成员默认为public

```c++
#include <stdio.h>

int i = 1;

struct Test
{
private:
    int i;

public:
    int j;
        
    int getI()
    {
        i = 3;
        
        return i;
    }
};

int main()
{
    int i = 2;
    
    Test test;
    
    test.j = 4;
    
    printf("i = %d\n", i);              //局部 i = 2;
    printf("::i = %d\n", ::i);          //全局 ::i = 1;
    // printf("test.i = %d\n", test.i);    //不能访问 Error
    printf("test.j = %d\n", test.j);    //public可以访问 test.j = 4
    printf("test.getI() = %d\n", test.getI());  // test.getI() = 3，
                         //类成员的作用域和类成员的访问级别是两个概念
    
    return 0;
}
```

# 小结
- 类通常可以分为使用方式和内部细节两部分
- 类的封装机制使得使用方式和内部细节相分离
- C++中通过定义类成员的访问级别实现封装机制
- public成员可以在类的背部和外界访问和调用
- private成员只能在类的内部被访问和调用