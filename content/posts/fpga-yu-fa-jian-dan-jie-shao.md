---
title: 'FPGA语法简单介绍'
date: 2020-03-05 15:22:55
tags: [FPGA]
published: true
hideInList: false
feature: /post-images/fpga-yu-fa-jian-dan-jie-shao.jpg
isTop: false
---
# Verilog文件基本结构
```c
/*****第一种定义*****/
模块声明 模块名(端口列表)
module mux2(a, b, sel, out, io);
//端口属性定义
    input [7:0]a;//定义位宽
    input [7:0]b;
    input sel;//sel = 0时，out = a;要么out = b;
    output [7:0]out;
    inout io;

    /*一般组合逻辑的信号由wire定义，时序逻辑的信号由reg来定义*/
    //定义内部信号
    wire oe;//线网型
    reg oo;

    /*连续赋值语句*/
    assign out = ( sel == 0 ) ? a : b;
    assign out = !sel ? a : b ;
    assign out = sel ? a : b;

    /*三态门控制*/
    assign = oe = sel;
    assign io = oe ? out[0] : 1'bz;

    /*Verilog HDL取位操作*/  
    //1、取某一位的数据用作数据源
    wire [2:0]m;
    assign m = out[5:3];

    //循环右移
    reg [7:0]shift_a;
    always@(posedge clk)
        shift_a <= {shift_a[0], shift_a[7:1]};

    //移位寄存器
    reg [7:0]shift_a;
    wire data;
    always@(posedge clk)
        shift_a <= {shift_a[6:0], data};

    //移位寄存器
    reg [7:0]shift_a;
    wire data;
    always@(posedge clk)
        shift_a <= {data，shift_a[7:1]};
    
    wire [3:0]x;
    wire [3:0]y;
    wire [7:0]z;
    wire [31:0]x;
    //拼接
    assign z = {x, y};

    assign n = {y, 7{x}};//下面同这种拓宽7倍的x
    assign n = {y, x, x, x, x, x, x, x};


    assign n = {y, 7{1'b1};//7倍的一个比特宽度的1

    //数据表示
    assign x = 4'b1001; //x是4个比特宽度的二进制1001
    assign x = 4'd9;    //x是4个比特宽度的十进制9
    assign x = 4'h9;    //x是4个比特宽度的十六进制9

    assign x = 4'hc;
    assign n = 32'h1234_5678;
    assign n = 8'b1101_0011;

    /***运算***/
    /*加（+）、减（-）、乘（*）、除（/）,加减乘都能用，但是除法不行，对于时效性不高的，除法可以用剪发代替，但是对于时效性高的*/

    //逻辑运算
    //与或非
    //逻辑与（&&），逻辑或（||），逻辑非（！）
    a = 4'b1011; b = 4'b0000
    wire c;
    c = a && b; = 0//逻辑只有真跟假

    //按位与，按位或，按位取反
    a = 4'b1011; b = 4'b0110;
    wire [3:0]c;
    wire [3:0]d;
    wire [3:0]e;
    c = a&b; = 4'b0010
    d = a | b; = 4'b1111
    e = ~b;    = 4'b1101

endmodule

/*****第二种定义*****/
module mux2 {
//端口属性定义
    input [7:0]a,
    input [7:0]b,
    input sel,
    output [7.0]out,
    inout io//最后一个不加逗号
}
endmodule


module mux4();
endmodule
```


**注意！always块使用注意事项 **
1. 不要在不同的always块内为同一个变量赋值。
2. 不要在同一个always块内同时使用阻塞赋值（=）和非阻塞赋值（<=）。
3. 使用always块描述组合逻辑时使用阻塞赋值（=），在使用always块描述时序逻辑时使用非阻塞赋值（<=）。简单理解就是，在电平敏感的always块内使用阻塞赋值，在边沿敏感的always块内使用非阻塞赋值。
4. 任何在always块内“被赋值的变量”都必须是寄存器型（reg）。即，<=或=左边的信号，必须是reg型。
5. always的敏感列表中可以同时包括多个电平敏感事件，也可以同时包括多个边沿敏感事件，但不能同时有电平和边沿敏感事件。另外，敏感列表中，同时包括一个信号的上升沿和它的下降沿敏感事件也是不允许的，因为这两个事件可以合并为一个电平事件。
