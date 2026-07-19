---
title: '自己动手写操作系统12-使用BIOS显示字符'
date: 2022-08-14 13:15:41
tags: []
published: true
hideInList: true
feature: 
isTop: false
---

使用int 指令产生一个软中断
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

	mov $0xe, %ah
	mov $'L', %al
	int $0x10

	jmp .				# 原地跳转的动作
	
	// 引导结束段
	.section boot_end, "ax"
boot_sig: .byte 0x55, 0xaa
```