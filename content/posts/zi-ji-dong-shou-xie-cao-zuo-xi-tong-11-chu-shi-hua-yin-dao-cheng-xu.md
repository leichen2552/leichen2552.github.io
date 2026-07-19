---
title: '自己动手写操作系统11-初始化引导程序'
date: 2022-08-14 10:56:51
tags: []
published: true
hideInList: true
feature: 
isTop: false
---


```s
	#include "boot.h"

  	// 16位代码,务必加上
  	.code16
 	.text
	.global _start
_start:
	# gcc 汇编语法，与微机原理中学的汇编语法可能不太一样，目的操作数与源操作数的顺序是反的，但我觉得这样更方便阅读
	mov $0, %ax	
	mov %ax, %ds
	mov %ax, %ss
	mov %ax, %es
	mov %ax, %fs
	mov %ax, %gs

	mov $_start, %esp

	jmp .				# 原地跳转的动作
	
	// 引导结束段
	.section boot_end, "ax"
boot_sig: .byte 0x55, 0xaa

```