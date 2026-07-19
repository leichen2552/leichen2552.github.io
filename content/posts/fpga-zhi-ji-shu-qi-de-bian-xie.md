---
title: 'FPGA之计数器的编写'
date: 2020-03-09 20:36:49
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/fpga-zhi-ji-shu-qi-de-bian-xie.jpg
isTop: false
---
@[toc]
# 实验要求
LED，每500ms，状态翻转一次
系统时钟为50M，对应周期是20ns
500ms = 500_000_000ns / 20ns = 25_000_000

## 代码编写
```c
module Counter(Clk50M, Rst_n, led);//Rst_n表示低电平有效
	
	input Clk50M;//系统时钟：50M
	input Rst_n;//全局复位，低电平复位
	
	output reg led;//led输出
	
	reg [24:0]cnt;//定义计数器寄存器
	
//计数器技术进程	
	always@(posedge Clk50M or negedge Rst_n)//总在在时钟上升沿或者复位下降沿
	if(Rst_n == 1'b0)
		cnt <= 25'd0;
	else if(cnt == 25'd24_999_999)//从0开始，只要加到24_999_999
		cnt <= 25'd0;
	else
		cnt <= cnt + 1'b1;
		
//Led输出控制进程	
	always@(posedge Clk50M or negedge Rst_n)//总在在时钟上升沿或者复位下降沿
	if(Rst_n == 1'b0)
		led <= 1'b1;
	else if(cnt == 25'd24_999_999)
		led <= ~led;
	else 
		led <= led;	
	
endmodule
```

## 仿真文件编写
```c
`timescale 1ns/1ns
`define clock_period 20	//声明一个宏定义参数

module Counter_tb;
	
	reg clk;
	reg rst_n;
	
	wire led;
	
	Counter counter0(
		.Clk50M(clk), //这个前面的点一定要加
		.Rst_n(rst_n), 
		.led(led)
	);
	
	initial clk = 1;//初始化clk是高电平
	
	//表示时钟信号总是以#10ns翻转
	always #(`clock_period/2) clk = ~clk; //(`)这表示调用一个宏定义的参数
	
	initial begin
		rst_n = 1'b0;
		#(`clock_period * 200);
		rst_n = 1'b1;
		
		#2000000000;//延时2000毫秒
		$stop;
	end
endmodule 
```
## ModelSim仿真波形
如果是按照500ms翻转，博主已经试过，得跑四五十分钟才能看到波形，所以我们改成500us
```(cnt == 25'd24_999_999)```改成```(cnt == 25'd24_999)```
![](https://leichen2552.github.io//post-images/1583744255346.jpg)

## 数字逻辑图
Quarters软件生成的数字逻辑电路
![](https://leichen2552.github.io//post-images/1583744492018.png)
点击```RTL Viewer```，就可以该软件根据代码生成的数字逻辑图
![](https://leichen2552.github.io//post-images/1583745546612.png)
