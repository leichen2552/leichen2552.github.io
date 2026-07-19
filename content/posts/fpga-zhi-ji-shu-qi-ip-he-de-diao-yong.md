---
title: 'FPGA之计数器IP核的调用（超详细过程）'
date: 2020-03-10 13:53:59
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/fpga-zhi-ji-shu-qi-ip-he-de-diao-yong.jpg
isTop: false
---
@[toc]
# LPM_counter IP核使用
Quartus 软件日工的LPM_counter IP核的使用

- FPGA设计方式：
    - 原理图（不推荐）
    - Verilog HDL 设计方式
    - IP核的设计方式

# 新建工程
![](https://leichen2552.github.io//post-images/1583852010421.png)
![](https://leichen2552.github.io//post-images/1583852018096.jpg)


这一页如果没有文件的话，可以不用管
![](https://leichen2552.github.io//post-images/1583852024800.png)
![](https://leichen2552.github.io//post-images/1583852030609.jpg)
![](https://leichen2552.github.io//post-images/1583852036541.jpg)
![](https://leichen2552.github.io//post-images/1583852042988.jpg)
![](https://leichen2552.github.io//post-images/1583852051737.png)

# 新建LPM_counter IP核
![](https://leichen2552.github.io//post-images/1583852167865.png)
![](https://leichen2552.github.io//post-images/1583852177133.png)
![](https://leichen2552.github.io//post-images/1583852181532.png)
![](https://leichen2552.github.io//post-images/1583852186167.png)
![](https://leichen2552.github.io//post-images/1583852192772.png)
![](https://leichen2552.github.io//post-images/1583852198343.png)
![](https://leichen2552.github.io//post-images/1583852203559.png)
![](https://leichen2552.github.io//post-images/1583852209769.png)
![](https://leichen2552.github.io//post-images/1583852326713.png)

这就是生成的ip核文件

## 把生成的ip核文件设置为顶层文件
![](https://leichen2552.github.io//post-images/1583852354899.png)

## 新建testbench文件
![](https://leichen2552.github.io//post-images/1583852394249.png)
![](https://leichen2552.github.io//post-images/1583852402087.png)

### counter_ip_tb文件
```c
`timescale 1ns/1ns
`define clock_period 20

module counter_ip_tb;
	
	reg cin;
	reg clk;
	
	wire cout;
	wire [3:0]q;
	
	Counter_IP Counter_IP0(
		.cin(cin),
		.clock(clk),
		.cout(cout),
		.q(q)
	);

	initial clk = 1;
	always #(`clock_period/2) clk = ~clk;
	
	initial begin
		repeat(30)begin
			cin = 0;
			#(`clock_period * 5) cin = 1;
			#(`clock_period) cin = 0;
		end
		
		#(`clock_period * 200);
		$stop;
	end
	
endmodule
```
## 编译一次，开始分析综合
![](https://leichen2552.github.io//post-images/1583854416464.png)
分析综合没有错误，就可以进行下一步

## 设置TestBench文件
![](https://leichen2552.github.io//post-images/1583854071372.png)
- 点击Simulation
- 点击TestBenches
![](https://leichen2552.github.io//post-images/1583854079070.png)

- 点击New
![](https://leichen2552.github.io//post-images/1583854085949.png)

- 点击 Add
![](https://leichen2552.github.io//post-images/1583854089755.png)

- 设置显示
![](https://leichen2552.github.io//post-images/1583854103857.png)

## 仿真
- 进行RTL仿真
![](https://leichen2552.github.io//post-images/1583854549616.png)

- 仿真波形如下，确实是16位的计数器，从0计数到15就清零
![](https://leichen2552.github.io//post-images/1583854556058.png)







