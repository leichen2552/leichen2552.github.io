---
title: 'SRAM、DRAM和SDRAM的区别'
date: 2020-10-26 09:38:18
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
SRAM ：静态RAM，不用刷新，速度可以非常快，像CPU内部的cache，都是静态RAM，缺点是一个内存单元需要的晶体管数量多，因而价格昂贵，容量不大。
DRAM：动态RAM，需要刷新，容量大。
SDRAM：同步动态RAM，需要刷新，速度较快，容量大。
DDR SDRAM：双通道同步动态RAM，需要刷新，速度快，容量大。



- 什么是SRAM
    SRAM 的英文全称是"Static RAM"，翻译成中文就是'静态随机存储器'。SRAM主要用于制造Cache。
- 什么是PSRAM
    PSRAM就是伪SRAM，内部的内存颗粒跟SDRAM的颗粒相似，但外部的接口跟SDRAM不同，不需要SDRAM那样复杂的控制器和刷新机制，PSRAM的接口跟SRAM的接口是一样的。PSRAM 内部自带刷新机制。
    - 容量模式
    PSRAM容量有4Mb,8Mb,16Mb,32Mb，64Mb, 128Mb等等，容量没有SDRAM那样密度高，但肯定是比SRAM的容量要高很多的，速度支持突发模式，并不是很慢，APmemory，Hynix，Fidelix,Coremagic, WINBOND .MICRON. CY 等厂家都有供应，价格只比相同容量的SDRAM稍贵一点点，比SRAM便宜很多。
- 什么是SDRAM
    SDRAM 的英文全称是'Synchronous DRAM'，翻译成中文就是'扩充数据输出内存'，它比一般DRAM和EDO RAM速度都快，它已经逐渐成为PC机的标准内存配置。
-  什么是Cache
    Cache 的英文原意是'储藏'，它一般使用SRAM制造，它与CPU之间交换数据的速度高于DRAM，所以被称作'高速缓冲存储器'，简称为'高速缓存'。由于CPU的信息处理速度常常超过其它部件的信息传递速度，所以使用一般的DRAM来作为信息存储器常常使CPU处于等待状态，造成资源的浪费。Cache就是为了解决这个问题而诞生的。在操作系统启动以后，CPU就把DRAM中经常被调用的一些系统信息暂时储存在Cache里面，以后当CPU需要调用这些信息时，首先到Cache里去找，如果找到了，就直接从Cache里读取，这样利用Cache的高速性能就可以节省很多时间。大多数CPU在自身中集成了一定量的Cache，一般被称作'一级缓存'或'内置Cache'。这部分存储器与CPU的信息交换速度是最快的，但容量较小。大多数主板上也集成了Cache，一般被称作'二级缓存'或'外置Cache'，比内置Cache容量大些，一般可达到256K，现在有的主板已经使用了512K～2M的高速缓存。在最新的Pentium二代CPU内部，已经集成了一级缓存和二级缓存，那时主板上的Cache就只能叫作'三级缓存'了。
- 什么是闪存
    闪存 目前主板上的BIOS大多使用Flash Memory制造，翻译成中文就是'闪动的存储器'，通常把它称作'快闪存储器'，简称'闪存'。这种存储器可以直接通过调节主板上的电压来对BIOS进行升级操作。
    FLASH：非易失存储器，简单的讲就是掉电之后里面的存储数据不会丢失，在嵌入式系统中用作存储Bootloader以及操作系统或者程序代码或者直接 当硬盘使用（U盘）。一般主要使用的FLASH有NOR和NAND，一般小容量的用NOR因为其读取速度快，多用来存储操作系统等重要信息，大容量的用 NAND，如U盘，可以在线擦除。FLASH的存贮组织为分页型的，对其的操作分为擦除和编程，必须先擦除再编程，操作方式是通过向FLASH写入一定的 命令序列来实现不同的操作。
