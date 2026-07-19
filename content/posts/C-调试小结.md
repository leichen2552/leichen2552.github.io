---
title: 'C++调试小结【C++】error:cannot declare variable ‘l’ to be of abstract type ‘xxx’'
date: 2021-03-25 09:37:15
tags: [C++]
published: true
hideInList: false
feature: 
isTop: false
---

# 问题
【C++】error: cannot declare variable ‘l’ to be of abstract type ‘xxx’

# 解答
追根溯源可能是某个抽象类的纯虚函数没有得到实现！
