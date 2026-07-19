---
title: '科学FPGA开发流程'
date: 2020-03-03 18:46:33
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/ke-xue-fpga-kai-fa-liu-cheng.jpg
isTop: false
---
@[toc]
# 科学FPGA开发流程
1. 设计定义
2. 设计输入
3. 分析和综合
4. 功能仿真（modelsim-altera）
5. 布局布线
6. 时序仿真（modelsim-altera）
7. IO分配以及配置文件的生成
8. 配置（烧写FPGA）
9. 在线调试

## 二选一多路器
### 设计定义
两个输入IO，a、b。可以是高电平，也可以是低电平
输入按键按下时，LED灯与a端口报纸一致
输入按键释放时，LED灯与b端口报纸一致

### 代码编写
#### led_test.v
```c
module led_test(a, b, key_in, led_out);//模块名 工程名（端口名）
	
	//input a, b;//这样也行，就是输入端口a,b
	input a;//输入端口a
	input b;//输入端口b
	
	input key_in;//按键输入，也叫做选择信号，实现输入通道的选择
	
	output led_out;//led控制输出端口
	
	//当key_in == 0，led_out = a;
	assign led_out = (key_in == 0)? a : b;//assign是连续赋值语句
	
endmodule
```
### 仿真代码编写
#### led_test_tb.v
```c
`timescale 1ns/1ps//定义延时和仿真精度

//#100.1//这个就是延时100纳秒.仿真精度

//testbench文件是一种仿真手段

module led_test_tb;//这是一个基于led_test这个工程的testbench文件
	
//激励信号定义，对应连接到待测试模块的输入端口	
	reg signal_a;
	reg signal_b;
	reg signal_c;

//待检测信号定义，对应连接到待测试模块的输出端口	
	wire led;

//例化待测试模块	
	led_test led_test0(
		.a(signal_a),//接线
		.b(signal_b),//接线
		.key_in(signal_c),//接线
		.led_out(led)//接线
	);
	
//产生激励	
	initial begin
		signal_a = 0;signal_b = 0;signal_c = 0;
		#100;//延时100纳秒
		signal_a = 0;signal_b = 0;signal_c = 1;
		#100;
		signal_a = 0;signal_b = 1;signal_c = 0;
		#100;
		signal_a = 0;signal_b = 1;signal_c = 1;
		#100;
		signal_a = 1;signal_b = 0;signal_c = 0;
		#100;
		signal_a = 1;signal_b = 0;signal_c = 1;
		#100;
		signal_a = 1;signal_b = 1;signal_c = 0;
		#100;
		signal_a = 1;signal_b = 1;signal_c = 1;
		#200;
		$stop;//系统函数停止仿真
	end	
endmodule
```
然后点击编译Start Analysis and Synthesis

## 开始仿真
点击Tools$\rightarrow$Run EDA Simulation Tool$\rightarrow$EDA RTL Simulation
如果出来下面这幅图，就说明你没有安装ModelSim-Altera，去安装就可以了
![](https://leichen2552.github.io//post-images/1583389087279.jpg)
然后设置Tools$\rightarrow$Options$\rightarrow$EDA Tool Options
![](https://leichen2552.github.io//post-images/1583389680297.jpg)
在ModelSim-Altera那儿设置路径。

这中间还有个门级电路仿真，条件更苛刻，会出现延时，以后再说！

### 仿真结果
![](https://leichen2552.github.io//post-images/1583390005256.jpg)
这个仿真结果跟之前分析的一样。

## 分配管脚
点击Assignmengs$\rightarrow$Pin Planner
![](https://leichen2552.github.io//post-images/1583390552457.jpg)

## 下载程序
点击Tools$\rightarrow$Programmer
![](https://leichen2552.github.io//post-images/1583392519646.jpg)
这就OK，然后在板子上看现象就行
