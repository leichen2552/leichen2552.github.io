---
title: 'FPGA之三八译码器的编写'
date: 2020-03-08 15:37:40
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/fpga-zhi-san-ba-yi-ma-qi-de-bian-xie.jpg
isTop: false
---
@[toc]
# 三八译码器真值表
| A | B | C | output |
| ------ | ------ | ------ | ------ |
| 0 | 0 | 0 | 0000_0001 |
| 0 | 0 | 1 | 0000_0010 |
| 0 | 1 | 0 | 0000_0100 |
| 0 | 1 | 1 | 0000_1000 |
| 1 | 0 | 0 | 0001_0000 |
| 1 | 0 | 1 | 0010_0000 |
| 1 | 1 | 0 | 0100_0000 |
| 1 | 1 | 1 | 1000_0000 |


# 代码编写
```c
module Decoder3_8(a, b, c, out);
	input a;
	input b;
	input c;
	
	output [7:0]out;//定义多位位宽的信号
	
	always@(a,b,c)begin
		case({a,b,c})//用花括号位拼接
			3'b000:out = 8'b0000_0001;//下划线是占位符，不代表任何意思
			3'b001:out = 8'b0000_0010;
			3'b010:out = 8'b0000_0100;
			3'b011:out = 8'b0000_1000;
			3'b100:out = 8'b0001_0000;
			3'b101:out = 8'b0010_0000;
			3'b110:out = 8'b0100_0000;
			3'b111:out = 8'b1000_0000;
			//default:out = 8'b1000_0000;
		endcase	
	end

endmodule

```
编译报错：Error (10137): Verilog HDL Procedural Assignment error at Decoder3_8.v(10): object "out" on left-hand side of assignment must have a variable data type

在always@()块中的输出信号一定要是reg型，所以```output [7:0]out;```修改成```output reg [7:0]out;```

/*
这样也行
output [7:0]out;
reg [7:0]out;
*/

# 测试文件编写
```c
`timescale 1ns/1ps//定义 延时和仿真 精度

module Decoder3_8_tb;
	
	reg a;//定义激励信号源
	reg b;//定义激励信号源
	reg c;//定义激励信号源
	
	wire [7:0] out;//定义观测信号源
	
	Decoder3_8 u1(
		.a(a), //一定要在a之前加上点
		.b(b), 
		.c(c), 
		.out(out)
	);
	
	initial begin
		a = 0;b = 0;c = 0;
		#100;	
		a = 0;b = 0;c = 1;
		#100;
		a = 0;b = 1;c = 0;
		#100;
		a = 0;b = 1;c = 1;
		#100;
		a = 1;b = 0;c = 0;
		#100;	
		a = 1;b = 0;c = 1;
		#100;
		a = 1;b = 1;c = 0;
		#100;	
		a = 1;b = 1;c = 1;
		#200;
		$stop;
	end

endmodule 
```

## RTL仿真
![](https://leichen2552.github.io//post-images/1583657266256.png)

## 门级仿真
![](https://leichen2552.github.io//post-images/1583657333533.png)
为什么门级仿真会出现电平混乱？
因为现实的电子器件，电平```0000_0001``` 跳转到 ```0000_0010```时，有可能是```0000_0001```成```0000_0011```，然后```0000_0011```再变成```0000_0010```，器件当中会存在电平跳变的时间差，所以会有这样的现象。
