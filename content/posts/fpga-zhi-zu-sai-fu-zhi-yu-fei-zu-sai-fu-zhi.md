---
title: 'FPGA之阻塞赋值与非阻塞赋值'
date: 2020-03-13 16:06:35
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/fpga-zhi-zu-sai-fu-zhi-yu-fei-zu-sai-fu-zhi.jpg
isTop: false
---
@[toc]
# 阻塞赋值
## （d = a+b）在前，（out = d+c）在后
![](https://leichen2552.github.io//post-images/1584087038775.png)
![](https://leichen2552.github.io//post-images/1584103818545.png)
```c
module block_nonblock(Clk, Rst_n, a,b,c, out);

	input Clk;
	input Rst_n;
	input a,b,c;
	
	//out = a + b + c;
	output reg [1:0]out;
	
	//d = a + b
	//out = d + c;
	reg [1:0]d;
	
	always@(posedge Clk or negedge Rst_n)
	if(!Rst_n)
		out = 2'b0;
	else begin
		d = a + b;
		out = d + c;
	end

endmodule 
```

## （out = d+c）在前，（d = a+b）在后
![](https://leichen2552.github.io//post-images/1584087052664.png)
![](https://leichen2552.github.io//post-images/1584104806285.png)
```c
module block_nonblock(Clk, Rst_n, a,b,c, out);

	input Clk;
	input Rst_n;
	input a,b,c;
	
	//out = a + b + c;
	output reg [1:0]out;
	
	//d = a + b
	//out = d + c;
	reg [1:0]d;
	
	always@(posedge Clk or negedge Rst_n)
	if(!Rst_n)
		out = 2'b0;
	else begin
		out = d + c;
		d = a + b;
	end

endmodule 
```
# 非阻塞赋值

## （d <= a+b）在前，（out <= d+c）在后
![](https://leichen2552.github.io//post-images/1584087437779.png)
![](https://leichen2552.github.io//post-images/1584104694854.png)
```c
module block_nonblock(Clk, Rst_n, a,b,c, out);

	input Clk;
	input Rst_n;
	input a,b,c;
	
	//out = a + b + c;
	output reg [1:0]out;
	
	//d = a + b
	//out = d + c;
	reg [1:0]d;
	
	always@(posedge Clk or negedge Rst_n)
	if(!Rst_n)
		out <= 2'b0;
	else begin
		d <= a + b;
		out <= d + c;
	end

endmodule 
```

```c
`timescale 1ns/1ns
`define tp 1 //模拟电路延时
module block_nonblock(Clk, Rst_n, a,b,c, out);

	input Clk;
	input Rst_n;
	input a,b,c;
	
	//out = a + b + c;
	output reg [1:0]out;
	
	//d = a + b
	//out = d + c;
	reg [1:0]d;
	
	always@(posedge Clk or negedge Rst_n)
	if(!Rst_n)
		out <= #`tp 2'b0;
	else begin
		d <= #`tp a + b;
		out <= #`tp d + c;
	end

endmodule 
```

## （out <= d+c）在前，（d <= a+b）在后
![](https://leichen2552.github.io//post-images/1584087293324.png)
![](https://leichen2552.github.io//post-images/1584104624629.png)
```c
module block_nonblock(Clk, Rst_n, a,b,c, out);

	input Clk;
	input Rst_n;
	input a,b,c;
	
	//out = a + b + c;
	output reg [1:0]out;
	
	//d = a + b
	//out = d + c;
	reg [1:0]d;
	
	always@(posedge Clk or negedge Rst_n)
	if(!Rst_n)
		out <= 2'b0;
	else begin
		out <= d + c;
		d <= a + b;
	end

endmodule 
```

# 阻塞赋值与非阻塞赋值区别
<font size = 4 color = red>阻塞</font>和<font size = 4 color = blue>非阻塞赋值</font>的区别在：<font size = 4 color = red>阻塞是顺序执行</font>，而<font size = 4 color = blue>非阻塞是并行执行</font>。

