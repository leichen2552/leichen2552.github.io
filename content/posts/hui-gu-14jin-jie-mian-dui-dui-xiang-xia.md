---
title: '回顾（14）：进阶面对对象（下）'
date: 2020-02-05 16:20:26
tags: [C++]
published: true
hideInList: false
feature: /post-images/hui-gu-14jin-jie-mian-dui-dui-xiang-xia.jpg
isTop: false
---
@[toc]
# 类之间的关系
- 继承
    - 从已存在细分出来的类和原类之间有继承关系
    - 继承的类（子类）拥有原类（父类）的所有属性和行为
- 组合
    - 一些类的存在必须依赖于其他的类，这种关系叫组合
    - 组合的类在某一个局部上有其他的类组成

- 继承：惠普电脑、苹果电脑继承了电脑的所有属性
- 组合：电脑这个类需要硬盘、内存、主板、CPU这些类组合起来

# 类的表示法
## 如何让编译器读懂这些类的表示法
- 类的表示法
![](https://leichen2552.github.io//post-images/1580911863301.png)
- 类的表示法-改进1
![](https://leichen2552.github.io//post-images/1580911870890.png)
- 类的表示法-改进2
![](https://leichen2552.github.io//post-images/1580911881299.png)
- 类的表示法-改进3
![](https://leichen2552.github.io//post-images/1580911885439.png)
- 类的表示法-改进4
![](https://leichen2552.github.io//post-images/1580911900662.png)
- 类的表示法-改进5
![](https://leichen2552.github.io//post-images/1580911905917.png)

貌似大功告成，好像看着编译器可以识别了！

# 小结
- 类之间课已存在继承关系或者组合关系
- 继承关系中子类拥有父类的一切属性和行为
- 组合关系是类之间整体和部分的关系
- 类及类之间的关系可以有不同的表示法
- 编译器对类的表示法有具体的要求