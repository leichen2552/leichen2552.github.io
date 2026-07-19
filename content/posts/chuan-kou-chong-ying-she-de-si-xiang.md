---
title: '串口重映射的思想'
date: 2021-01-07 21:03:49
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
标准库函数的默认输出设备是显示器，要实现在串口或LCD输出，必须重定义标准库函数里调用的与输出设备相关的函数。
## stm32重映射
```c
///重定向c库函数printf到串口，重定向后可使用printf函数
int fputc(int ch, FILE *f)
{
		/* 发送一个字节数据到串口 */
		USART_SendData(DEBUG_USART, (uint8_t) ch);
		
		/* 等待发送完毕 */
		while (USART_GetFlagStatus(DEBUG_USART, USART_FLAG_TXE) == RESET);		
	
		return (ch);
}
```