---
title: '深入理解linux内核链表'
date: 2025-08-24 15:03:01
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
@[toc]

# 双向链表
## 一般双向链表

核心就是一个node结构体，里面有两个指针，指向前后节点，另外包含了一个存储数据的成员变量。
```c
struct Data {
    int a;
};

struct Node {
    struct Data data;
    struct Node *prev, *next;
}
```

但是C没有模板，这意味着不同类型的数据，Node结构体都是不同类型，用来实现链表逻辑的函数得为每种类型的都写一遍。

### Linux内核链表

linux的实现是反过来，把节点指针存在数据里面。

```c
struct Node {
	struct Node *next, *prev;
};

struct Data {
	struct Node data_list;
	int age;
};

struct list_head student_list_head;
```

node里面的指针是指向Data里面的data_list成员，所以要获取所在Data的指针，需要做一些指针偏移何强制类型转换。注意，data_list也可以是其他类型的链表，它就是链表的头。

```c
#define offsetof(TYPE, MEMBER) ((int) &((TYPE *)0)->MEMBER)
#define member_size(TYPE, MEMBER) sizeof(((TYPE *)0)->MEMBER)

#ifdef __GNUC__
#define member_type(type, member) __typeof__ (((type *)0)->member)
#else
#define member_type(type, member) const void
#endif

#define container_of(ptr, type, member) ((type *)( \
    (char *)(member_type(type, member) *){ ptr } - offsetof(type, member)))
```


```c
#include "list.h"

struct student{
	struct list_head entry;
	int age;
};

struct list_head student_list_head;

int main()
{
	INIT_LIST_HEAD(&student_list_head);
	struct student s1={.age = 1};
	struct student s2={.age = 2};
	struct student s3={.age = 3};
	struct student s4={.age = 4};

	list_add_tail(&s1.entry, &student_list_head);
	list_add_tail(&s2.entry, &student_list_head);
	list_add_tail(&s3.entry, &student_list_head);
	list_add_tail(&s4.entry, &student_list_head);

	return 0;
}

```
如下图所示，把几个student用链表链起来的是student结构体中的entry，s1中entry中的next指针指向s2中的entry。通过entry链起来，通过entry来访问每个strudent的其他结构体成员。


![](https://leichen2552.github.io/post-images/1756035176924.png)