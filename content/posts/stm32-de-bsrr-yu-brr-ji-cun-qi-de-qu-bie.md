---
title: 'STM32的BSRR与BRR寄存器的区别'
date: 2020-07-01 08:56:13
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
使用BRR和BSRR寄存器可以方便地快速地实现对端口某些特定位的操作，而不影响其它位的状态。

比如希望快速地对GPIOE的位7进行翻转，则可以：
```c
    GPIOE->BSRR = 0x80; // 置'1'
    GPIOE->BRR = 0x80; // 置'0'
```
如果使用常规'读-改-写'的方法：
```c
    GPIOE->ODR = GPIOE->ODR | 0x80; // 置'1'
    GPIOE->ODR = GPIOE->ODR & 0xFF7F; // 置'0'
```
有人问是否BSRR的高16位是多余的，请看下面这个例子：

假如你想在一个操作中对GPIOE的位7置'1'，位6置'0'，则使用BSRR非常方便：
```
    GPIOE->BSRR = 0x00400080;
```
如果没有BSRR的高16位，则要分2次操作，结果造成位7和位6的变化**不同步**！
```c
    GPIOE->BSRR = 0x80;
    GPIOE->BRR   = 0x40;
```

## 规则

1. 置GPIOD->BSRR低16位的某位为'1'，则对应的I/O端口置'1'；而置GPIOD->BSRR低16位

的某位为'0'，则对应的I/O端口不变。

2. 置GPIOD->BSRR高16位的某位为'1'，则对应的I/O端口置'0'；而置GPIOD->BSRR高16位

的某位为'0'，则对应的I/O端口不变。

3. 置GPIOD->BRR低16位的某位为'1'，则对应的I/O端口置'0'；而置GPIOD->BRR低16位的

某位为'0'，则对应的I/O端口不变。


例如：

1. 要设置D0、D5、D10、D11为高，而保持其它I/O口不变，只需一行语句：
```c
    GPIOD->BSRR = 0x0C21；// 使用规则一
```
2. 要设置D1、D3、D14、D15为低，而保持其它I/O口不变，只需一行语句：
```c
    GPIOD->BRR = 0xC00A；// 使用规则三
```
3. 要同时设置D0、D5、D10、D11为高，设置D1、D3、D14、D15为低，而保持其它I/O口不变，也只需一行语句：
```c
  GPIOD->BSRR = 0xC00A0C21；// 使用规则一和规则二
```


