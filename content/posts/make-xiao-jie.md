---
title: 'Make小结'
date: 2024-09-28 21:11:11
tags: [make]
published: true
hideInList: false
feature: 
isTop: false
---
@[toc]

# overview

其实用make作为工程管理其实是一件很难受的事情，因为现在各种的IDE都把编译链接这些东西封装起来，导致用make的人越来越少，而且学习make是一件时间成本很高的事情，以至于很多人都不愿意去学。

```c
//test.c
#include <stdio.h>

int main(){
    int distance = 100;
  
  	printf("You are %d miles away.\n", distance);
}
```

上面是一个`test.c`文件，在命令行执行`make test`，再执行`./test`你能看到如下的显示：

```sh
make test
cc     test.c   -o test

./test
You are 10 miles away.
```

很奇怪对不对，我们都没有写`Makefile`，为什么能编译出我们想要的。`make`里面内建了一些规则，它就是一个规则机器。规则说，在给定了一个`target`后，所以在`make test`中，`test`就是目标，`make`会去当前目录下寻找同名但是不同后缀名的文件，从而进行编译，但是目标`test`的依赖我们并没有去指明。这是远古传说中的隐含依赖，这些远古传说来自于几十年的C代码构建经验，我们不需要告诉make所有事情，make本来就知道怎么构建C文件。

我们可以去指定一个`Makefile`文件：

```sh
CFLAGS=-Wall -g

all: clean test

clean:
	rm -rf test
```

执行`make all`显示如下：

```sh
make all
rm -rf test
cc -Wall -g    test.c   -o test
```

显然对于目标`all`来说，有两个依赖，一个是`clean`，还有一个是`test`。对于目标`clean`来说，是删除`test`文件，但是目标`test`的依赖仍然没有指定，上面已经解释过是隐含依赖。



`CFLAGS`是一个环境变量，可以用来设置参数，把`Makefile`中`CFLAGS`那行代码前面加个`#`后注释掉，然后执行`CFLAGS="-Wall" make all`

```sh
CFLAGS="-Wall" make all

rm -rf test
cc -Wall    test.c   -o test
```

