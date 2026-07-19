---
title: '回顾（3）：进化后的const分析'
date: 2020-01-13 15:53:45
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-3jin-hua-hou-de-const-fen-xi.jpg
isTop: false
---
@[toc]
# 进化后的const分析

## C语言中的const
* <font  face = "Courier New" color = blue size = 4>**const**</font>修饰的变量是只读的，本质还是变量
* <font  face = "Courier New" color = blue size = 4>**const**</font>修饰的局部变量在栈上分配空间
* <font  face = "Courier New" color = blue size = 4>**const**</font>修饰的全局变量在只读存储器分配空间
* <font  face = "Courier New" color = blue size = 4>**const**</font>只在编译器有用，在运行期无用
* <font  face = "Courier New" color = blue size = 4>**const**</font>修饰的变量不是真正的常量，它只告诉编译器该变量不能出现在赋值符号的左边
* C语言中的<font  face = "Courier New" color = blue size = 4>**const**</font>使得变量具有只读属性
* <font  face = "Courier New" color = blue size = 4>**const**</font>将具有全局生命周期的变量存储于只读存储区
* <font  face = "Courier New" color = blue size = 4>**const**</font>不能定义真正意义上面的常量！

<font color = ff0000>C语言上定义**真正意义上的常量**只能用<font color = 007f00 size = 5>**枚举**</font></font>

## C++语言中的const
* C++在C的基础上对<font  face = "Courier New" color = blue size = 4>**const**</font>进行了进化处理
    - 当碰见<font  face = "Courier New" color = blue size = 4>**const**</font>声明时在符号表中放入常量
    - 编译过程中若发现使用常量则直接以符号表中的值替换
    - 编译过程中若发现下述情况则给对应的常量分配存储空间
        1. 对<font  face = "Courier New" color = blue size = 4>**const**</font>常量使用了extern
        2. 对<font  face = "Courier New" color = blue size = 4>**const**</font>常量使用&操作符
 C++编译器虽然可能为<font  face = "Courier New" color = blue size = 4>**const**</font>分配空间，但不会使用其存储空间的值  

## C语言中的const变量
* C语言中的<font  face = "Courier New" color = blue size = 4>**const**</font>变量是<font color = 007fff size = 3>只读<font color = green size = 4>变量</font></font>，本质仍然是变量，会分配存储空间
## C++中的const变量
* 可能会分配存储空间。当<font  face = "Courier New" color = blue size = 4>**const**</font>常量为全局，并且需要其他文件中使用。当使用 & 操作符对const常量取地址
* C++中的<font  face = "Courier New" color = blue size = 4>**const**</font>常量类似于宏定义。const int c = 5;$\approx$#define   c   5
* C++中的<font  face = "Courier New" color = blue size = 4>**const**</font>常量在与宏定义不同。<font  face = "Courier New" color = blue size = 4>**const**</font>常量是由编译器处理，编译器对<font  face = "Courier New" color = blue size = 4>**const**</font>常量进行类型检查和作用域检查
* 宏定义由预处理器处理，单纯的文本替换

# 小结
- 与C语言不同，C++中的<font  face = "Courier New" color = blue size = 4>**const**</font><font color = 7f0000>不是只读变量</font>，而C语言中const只带了只读属性，本质上还是一个变量。
- C++中的<font  face = "Courier New" color = blue size = 4>**const**</font>是一个<font color = purple>**真正意义上的常量**</font>
- C++编译器<font size = 4>**可能**</font>会为<font  face = "Courier New" color = blue size = 4>**const**</font>常量分配空间
- C++<font color = green>完全兼容</font>C语言<font  face = "Courier New" color = blue size = 4>**const**</font>常量的<font color = green>语法特性</font>


