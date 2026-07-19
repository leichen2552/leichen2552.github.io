---
title: 'FPGA之BCD码计数器'
date: 2020-03-12 21:48:49
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/fpga-zhi-bcd-ma-ji-shu-qi.jpg
isTop: false
---
@[toc]

# 代码
```c
module BCD_Counter(Clk, Cin, Rst_n, Cout, q);

	input Clk;			//计数基准时钟
	input Cin;			//计数器进位输入
	input Rst_n;		//系统复位 
	
	output Cout;	//计数进位输出
	output [3:0]q;		//计数器值输出

	reg [3:0]cnt;
//执行计数过程	
	always@(posedge Clk or negedge Rst_n)
	if(Rst_n == 1'b0)
		cnt <= 4'd0;
	else if(Cin == 1'b1)begin
		if(cnt == 4'd9)
			cnt <= 4'd0;
		else
			cnt <= cnt + 1'b1;
	end
	else
		cnt <= cnt;

//不要在不同的always块中对同一个变量赋值
//不要在同一个always块中同时使用阻塞赋值与非阻塞赋值		
//时序逻辑电路always块中被赋值的变量必须是reg
/*
always时序逻辑电路中用 <= 非阻塞赋值，在时序逻辑电路中用 = 阻塞赋值
简单理解就是：在边沿敏感的always块中用非阻塞赋值，在电平敏感的always块中用阻塞赋值
*/	
/*
always的敏感列表中包括多个电平敏感事件，也可以同时包括多个电平敏感事件，但是不能同时有电平和边沿敏感事件。
另外，敏感列表中，同时包含一个信号的上升沿和下降沿也是不允许的，因为这两个事件可以合并成一个电平事件
*/

//产生进位输出信号
	//这是把之前的时序逻辑电路（注释内）改成组合逻辑电路
	assign Cout =(Cin == 1'b1 && cnt == 4'd9);		
/* 
	always@(posedge Clk or negedge Rst_n)
	if(Rst_n == 1'b0)
		Cout <= 1'b0;
	else if(Cin == 1'b1 && cnt == 4'd9)	
		Cout <= 1'b1;
	else
		Cout <= 1'b0;
*/		
	assign q = cnt;	
endmodule

```


# 用时序逻辑电路的波形问题
进位链的问题
![](https://leichen2552.github.io//post-images/1584021084132.jpg)

# 改用组合逻辑电路的正确波形
![](https://leichen2552.github.io//post-images/1584021113091.jpg)