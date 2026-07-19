---
title: '运算电路'
date: 2020-03-27 21:30:35
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
# 运算类型
<font color = red>Summation(加法求和)，Subtraction(减法)</font>
<font color = red>Intgration(积分)</font>，differentation(微分)
<font color = red>Logarithmic(对数)</font>，exponential(指数)
<font color = red>Multiplier(模拟乘法器)</font>：
Multiplication(乘)，division(除)
square(平方)，square root(开方)

## 加法电路
- 两个输入端的电阻必须要满足比例系数
![](https://leichen2552.github.io//post-images/1585384073839.png)
## 加法电路应用
![](https://leichen2552.github.io//post-images/1585384231515.png)
## 减法电路
![](https://leichen2552.github.io//post-images/1585385146193.png)
- 为了提升输入电阻，可以用放大倍数为1的电压跟随器组合起来，这个输入电阻就位无穷大
![](https://leichen2552.github.io//post-images/1585387822424.png)
- 但是这要同时调整两个$R$和$R_f$，所以加入了如下三个电阻
![](https://leichen2552.github.io//post-images/1585387381466.png)

