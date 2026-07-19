---
title: '从0到1写RTOS'
date: 2020-01-05 15:59:42
tags: [RTOS,STM32]
published: true
hideInList: false
feature: /post-images/rtos_from_zero_to_one.jpg
isTop: true
---
**目录**
@[toc]
# 从0到1写RTOS

&emsp;&emsp;在这非常感谢某个大佬出的《从0到1写RTOS》的教程，本文只是个人的学习总结。基于Cortex-M3实现一个微型的实时操作系统内核，主要适用于那些以Cortex-M3为内核的硬件平台，比如STM32、LPC等等。现在市场上也不乏有一些优秀的嵌入式实时操作系统，大多收费，免费的像Freertos、RT-thread，但是这些系统已经高度封装并且集成化，初学者一般见到就直接放弃，很难上手。所以笔者的这篇学习总结简述了更易学习的tinyOS，用一句成语来说——麻雀虽小五脏俱全，它不到2000行代码，具有实时操作系统应有的功能模块，比如事件控制块、计数信号量、互斥信号量等等。同时也希望大家能更快学习这个系统！

## 单任务系统的弊端
&emsp;&emsp;单任务系统即裸机程序，也就是说平时说的前后台程序，这种程序是把所有的完成某一功能的函数都放在一个while循环里面，在这个循环里面完成所有的处理，有的时候还需要一些中断来完成一些处理。但是单任务系统的实时性非常差，所有的任务都是排着队轮流执行，但是有的任务需要实时性非常高，有的任务则不需要，单任务系统的弊端就一点点地显现出来。
```c
int flag1;
int flag2;
int flag3;

void function1()    
{                   
    flag1 = 0;      
    delay();        
    flag1 = 1;      
    delay();        
}

void function2()
{
    flag1 = 0;
    delay();
    flag1 = 1;
    delay();
}

void function3()
{
    flag1 = 0;
    delay();
    flag1 = 1;
    delay();
}

void main()
{
    while(1)
    {
        function1();
        function2();
        function3();
    }
}
```

&emsp;&emsp;看上面的这的小工程，完成这个工程需要顺序执行三个函数——function1()、function2()和function3()，并且是顺序执行，要执行function3()就必须等待function1()和function2()的delay()函数延时结束。从这点就能看出这个顺序执行方式真的不行。
&emsp;&emsp;做硬件开发的人应该知道，为了提高实时性，可以使用定时器中断，把实时性需求很高的函数放入定时器中断服务函数里面，这样就能看成是function3()在与主循环中的函数在并行运行。但是硬件资源有限，可移植性也不高。这时就需要介绍实时性操作系统（RTOS）。


## 引入RTOS
&emsp;&emsp;因为单任务系统的弊端，就需要多任务系统（以下称RTOS）来解决这些弊端。打个比方：RTOS就像孙悟空的分身术，把一个自己变成十个，让这十个自己去完成不同的任务。但是我们的硬件内核Cortex-M3只有一个内核，并没有分身术，不能变出来十个，但是我们可以通过一些手段，让Cortex-M3看起来像是虚拟出来另外九个核，并发地处理不同的任务。其实这里的并发处理任务不是说同一时刻执行不同的任务，而是每个任务的执行时间间隔非常短，看起来像是同一时间执行了很多任务。这里就出现一个大问题，什么时刻执行什么任务，什么任务先执行，什么任务后执行，这个功能模块在RTOS里面叫做调度器，这个下面会说，它的作用就是合理地进行每个任务的调度。

## Cortex-M3内核机制
&emsp;&emsp;这个调度就是合理地切换任务，Cortex-M3内核提供了一种机制用来切换前后任务——PendSV异常。
PendSV 的典型使用场合是在上下文切换时（在不同任务之间切换）。例如，一个系统中有两个就绪的任务，上下文切换被触发的场合可以是：
1. 执行一个系统调用。
2. 系统滴答定时器（SYSTICK）中断,（轮转调度中需要）。

&emsp;&emsp;让我们举个简单的例子来辅助理解。假设有这么一个系统，里面有两个就绪的任务，并且通过 SysTick 异常启动上下文切换。
![](https://leichen2552.github.io//post-images/1578272379542.PNG)
&emsp;&emsp;上图是两个任务轮转调度的示意图。但若在产生 SysTick 异常时正在响应一个中断，则SysTick异常会抢占其ISR。在这种情况下，OS不得执行上下文切换，否则将使中断请求被延迟，而且在真实系统中延迟时间还往往不可预知——任何有一丁点实时要求的系统都决不能容忍这种事。因此，如下图：在CM3中也是严禁没商量——如果OS在某中断活跃时尝试切入线程模式，将触犯用法fault异常。
![](https://leichen2552.github.io//post-images/1578272387560.PNG)
&emsp;&emsp;<font color = red>为解决此问题，早期的OS大多会检测当前是否有中断在活跃中，只有没有任何中断需要响应时，才执行上下文切换（切换期间无法响应中断）</font>。然而，<font color = green>这种方法的弊端在于，它可以把任务切换动作拖延很久（因为如果抢占了IRQ，则本次SysTick在执行后不得作上下文切换，只能等待下一次SysTick异常）</font>，尤其是当某中断源的频率和SysTick异常的频率比较接近时，会发生“共振”。
&emsp;&emsp;现在好了，PendSV来完美解决这个问题了。PendSV异常会自动延迟上下文切换的请求，直到其它的ISR都完成了处理后才放行。为实现这个机制，需要把PendSV编程为最低优先级的异常。如果OS检测到某IRQ正在活动并且被 SysTick 抢占，它将悬起一个PendSV异常，以便缓期执行上下文切换。
![](https://leichen2552.github.io//post-images/1578272395159.PNG)
&emsp;&emsp;这个过程中的事件的流水账记录如下：
&emsp;&emsp;1. 任务 A 呼叫 SVC 来请求任务切换（例如，等待某些工作完成）；
&emsp;&emsp;2. OS 接收到请求，做好上下文切换的准备，并且 pend 一个 PendSV 异常；
&emsp;&emsp;3. 当 CPU 退出 SVC 后，它立即进入 PendSV，从而执行上下文切换；
&emsp;&emsp;4. 当 PendSV 执行完毕后，将返回到任务 B，同时进入线程模式；
&emsp;&emsp;5. 发生了一个中断，并且中断服务程序开始执行；
&emsp;&emsp;6. 在 ISR 执行过程中，发生 SysTick 异常，并且抢占了该 ISR；
&emsp;&emsp;7. OS 执行必要的操作，然后 pend 起 PendSV 异常以做好上下文切换的准备；
&emsp;&emsp;8. 当 SysTick 退出后，回到先前被抢占的 ISR 中， ISR 继续执行；
&emsp;&emsp;9. ISR 执行完毕并退出后， PendSV 服务例程开始执行，并且在里面执行上下文切换；
&emsp;&emsp;10. 当 PendSV 执行完毕后，回到任务 A，同时系统再次进入线程模式。

&emsp;&emsp;以上PendSV介绍来自《Cortex-M3权威指南》，喜欢研究内核的读者可以去看看！
&emsp;&emsp;介绍完了这个内核机制，我么就知道Cortex-M3提供了一种完美的切换任务的方法，在这个方法的基础上来完善RTOS。

## RTOS中的任务
&emsp;&emsp;有了RTOS的简介和PendSV异常，还差一些东西——就是任务。任务可是RTOS中最重要的东西。

### 任务的表征
&emsp;&emsp;RTOS中的任务，如代码所示：一个任务表征就是一个永不返回的函数。其实我第一眼看到这么个东西的时候，我的内心是疑惑的，明明是一个死循环的函数，却可以被切换到另外一个任务，到底是怎么切换的，这个在下面会说。
```c
int taskFlag;
void taskEntry(void* param)
{
    for(;;)
    {
        taskFlag = 0;
        delay();
        taskFlag = 1;
        delay();
    }
}  
```
&emsp;&emsp;这个任务中利用延时函数和改变taskFlag的数值来模拟任务的运行。

&emsp;&emsp;一个任务的执行会包含许多东西，比如栈、堆、数据区、代码区，这些都是在任务执行时状态数据，数据区和代码区由编译器自动分配，栈和堆可以由程序员分配。当CPU在执行这个任务的时候，是无法顾及其他任务的的，这也就是我们通常说的<font color = red>”该任务占据了CPU的使用权“</font>，或者说<font color = red>”CPU被当前任务占有，无暇他顾“</font>。当任务占据CPU的时候，Cortex-M3内核寄存器会在某些时刻把这些数据保存到栈中，那么每个任务都需要各自独立的栈空间，但是Cortex-M3硬件上只支持两个栈空间，这个问题该如何解决？

### 任务的栈
&emsp;&emsp;所谓栈就是一片连续的内存空间（类似C语言中的数组：int stack[1024] = {0}），就像你买了一套房子，你可以在这个房子里面吃饭睡觉，这个房子就相当于栈。<font color = red>RTOS需要每个任务拥有自己单独的栈，就是每个任务有属于自己单独的活动空间，也就是说每个任务有属于自己的内存空间</font>。这个内存空间用于保存这个任务所有的独立数据。当每个任务拥有了自己独立的栈，这时候就进行任务初始化了。

### 任务的定义
&emsp;&emsp;前面我们说了一个任务表征就是一个永不返回的函数。但是一个任务到底应该包含那些东西呢，我们定义一个任务结构体，并利用typedef重新命名一个栈类型，目前任务的结构体里面只有<font color = magenta>栈</font>这一个成员变量，以后如果需要还会继续添加成员变量。这是C语言面向对象的编程思想，用一个结构体来统一管理某类对象。
```c
// Cortex-M的堆栈单元类型：堆栈单元的大小为32位，所以使用uint32_t
typedef uint32_t tTaskStack;

// 任务结构：包含了一个任务的所有信息
typedef struct _tTask {
	// 任务所用堆栈的当前堆栈指针。每个任务都有他自己的堆栈，用于在运行过程中存储临时变量等一些环境参数
	// 在tinyOS运行该任务前，会从stack指向的位置处，会读取堆栈中的环境参数恢复到CPU寄存器中，然后开始运行
	// 在切换至其它任务时，会将当前CPU寄存器值保存到堆栈中，等待下一次运行该任务时再恢复。
	// stack保存了最后保存环境参数的地址位置，用于后续恢复
    tTaskStack * stack;
}tTask;
```
### 任务的初始化
&emsp;&emsp;之前上面提到，任务在占据CPU运行的时候，Cortex-M3内核会保存任务的运行状态到任务自己的内存空间也就是栈里面，但是对于那些从未占据过CPU的任务，CPU如何取出该任务的运行状态并运行呢？

&emsp;&emsp;其实在想这个问题的时候，很多人都苦恼怎么做，在看了下面代码的时候，又苦恼为什么要这么做？这是一个追本溯源的过程。打个比方，当这个世界上没有实时操作系统只有裸机程序和中断的时候，当时的人们肯定也苦恼这个问题，后来有一个人想到了解决这个问题的办法。

&emsp;&emsp;然而我们现在作为学习者，想明白人家为什么这么做，然后举一反三就可以了。再回到刚才那个问题，CPU如何取出该之前从未被执行的任务的运行状态并运行呢？答案就是我们做一个<font color = red size =4>“虚假的”现场</font>给CPU，然后使用这个现场来恢复。

&emsp;&emsp;因为Arm采用的是满降栈模式，我们从栈顶逐一向下做一个虚假的现场。
&emsp;&emsp;这个虚假的现场包含哪些信息呢？
&emsp;&emsp;1. xPSR状态寄存器的值：《CM3权威指南》里有详细描述
&emsp;&emsp;2. 程序的入口地址
&emsp;&emsp;3. 传给程序的入口参数
&emsp;&emsp;4. 栈的地址
&emsp;&emsp;我们把这些设置好，CPU就能从这个虚假的地址开始执行任务，xPSR来自《CM3权威指南》，读者可以去了解一下。
```c
/**********************************************************************************************************
** Function name        :   tTaskInit
** Descriptions         :   初始化任务结构
** parameters           :   task        要初始化的任务结构
** parameters           :   entry       任务的入口函数
** parameters           :   param       传递给任务的运行参数
** Returned value       :   无
***********************************************************************************************************/
void tTaskInit (tTask * task, void (*entry)(void *), void *param, uint32_t * stack)
{
    // 为了简化代码，tinyOS无论是在启动时切换至第一个任务，还是在运行过程中在不同间任务切换
    // 所执行的操作都是先保存当前任务的运行环境参数（CPU寄存器值）的堆栈中(如果已经运行运行起来的话)，然后再
    // 取出从下一个任务的堆栈中取出之前的运行环境参数，然后恢复到CPU寄存器
    // 对于切换至之前从没有运行过的任务，我们为它配置一个“虚假的”保存现场，然后使用该现场恢复。

    // 注意以下两点：
    // 1、不需要用到的寄存器，直接填了寄存器号，方便在IDE调试时查看效果；
    // 2、顺序不能变，要结合PendSV_Handler以及CPU对异常的处理流程来理解
    *(--stack) = (unsigned long)(1<<24);                // XPSR, 设置了Thumb模式，恢复到Thumb状态而非ARM状态运行
    *(--stack) = (unsigned long)entry;                  // 程序的入口地址
    *(--stack) = (unsigned long)0x14;                   // R14(LR), 任务不会通过return xxx结束自己，所以未用
    *(--stack) = (unsigned long)0x12;                   // R12, 未用
    *(--stack) = (unsigned long)0x3;                    // R3, 未用
    *(--stack) = (unsigned long)0x2;                    // R2, 未用
    *(--stack) = (unsigned long)0x1;                    // R1, 未用
    *(--stack) = (unsigned long)param;                  // R0 = param, 传给任务的入口函数
    *(--stack) = (unsigned long)0x11;                   // R11, 未用
    *(--stack) = (unsigned long)0x10;                   // R10, 未用
    *(--stack) = (unsigned long)0x9;                    // R9, 未用
    *(--stack) = (unsigned long)0x8;                    // R8, 未用
    *(--stack) = (unsigned long)0x7;                    // R7, 未用
    *(--stack) = (unsigned long)0x6;                    // R6, 未用
    *(--stack) = (unsigned long)0x5;                    // R5, 未用
    *(--stack) = (unsigned long)0x4;                    // R4, 未用

    task->stack = stack;                                // 保存最终的值
}
```
&emsp;&emsp;这个虚假的现场做好后，任务初始化完毕，就可以进行接下来的一步，任务切换。

### 任务的切换
&emsp;&emsp;任务切换的本质：保存前一个任务的运行状态数据，恢复后一个任务之前的状态数据。
&emsp;&emsp;1. 举个例子，假设有两个任务task1、task2在交替运行。
&emsp;&emsp;2. 当task1在运行的时候，也就是说task1占据了CPU的使用权，task1的数据运行在CPU的那些寄存器中。
&emsp;&emsp;3. 当系统中某中断触发了PendSV异常，这时RTOS就会把当前task1的运行数据存储进入task1的独立栈中，这些数据也代表了task1的运行状态。所以这个过程叫做保存前一个任务的状态数据。
&emsp;&emsp;4. 接着就是恢复下一个任务的运行状态，把task2的独立栈中的数据弹入CPU的寄存器中，让task2占据CPU运行。
&emsp;&emsp;5. 当PendSV异常被触发时，这时会保存tsak2的运行状态，恢复task1的运行状态。
&emsp;&emsp;6. 上述就是任务切换的流程

&emsp;&emsp;Cortex-m3的PendSV异常切换任务代码如下，采用C语言和中内嵌汇编的方式。
```c
// 在任务切换中，主要依赖了PendSV进行切换。PendSV其中的一个很重要的作用便是用于支持RTOS的任务切换。
// 实现方法为：
// 1、首先将PendSV的中断优先配置为最低。这样只有在其它所有中断完成后，才会触发该中断；
//    实现方法为：向NVIC_SYSPRI2写NVIC_PENDSV_PRI
// 2、在需要中断切换时，设置挂起位为1，手动触发。这样，当没有其它中断发生时，将会引发PendSV中断。
//    实现方法为：向NVIC_INT_CTRL写NVIC_PENDSVSET
// 3、在PendSV中，执行任务切换操作。
#define NVIC_INT_CTRL       0xE000ED04      // 中断控制及状态寄存器
#define NVIC_PENDSVSET      0x10000000      // 触发软件中断的值
#define NVIC_SYSPRI2        0xE000ED22      // 系统优先级寄存器
#define NVIC_PENDSV_PRI     0x000000FF      // 配置优先级

#define MEM32(addr)         *(volatile unsigned long *)(addr)
#define MEM8(addr)          *(volatile unsigned char *)(addr)

/**********************************************************************************************************
** Function name        :   PendSV_Handler
** Descriptions         :   PendSV异常处理函数。很有些会奇怪，看不到这个函数有在哪里调用。实际上，只要保持函数头不变
**                          void PendSV_Handler (), 在PendSV发生时，该函数会被自动调用
** parameters           :   无
** Returned value       :   无
***********************************************************************************************************/
__asm void PendSV_Handler ()
{
    IMPORT  currentTask               // 使用import导入C文件中声明的全局变量
    IMPORT  nextTask                  // 类似于在C文文件中使用extern int variable

    MRS     R0, PSP                   // 加载特殊功能寄存器到通用功能寄存值，获取当前任务的堆栈指针
    CBZ     R0, PendSVHandler_nosave  // if 这是由tTaskSwitch触发的(此时，PSP肯定不会是0了，0的话必定是tTaskRunFirst)触发
                                      // 不清楚的话，可以先看tTaskRunFirst和tTaskSwitch的实现
    STMDB   R0!, {R4-R11}             // 那么，我们需要将除异常自动保存的寄存器这外的其它寄存器自动保存起来{R4, R11}
                                      // 保存的地址是当前任务的PSP堆栈中，这样就完整的保存了必要的CPU寄存器,便于下次恢复
                                      // 含义:依次压栈r0 = r0 - 4，先压r11，r0 = r11（即将r11中的内容放入r0所指的内存地址）， 
                                      // 再r0 = r0 - 4，
                                      // 再压r10，r0 = r10......r0 = r0 - 4，
                                      // 最后压r4，r0 = r4。
                                      // 则r0中就保存最新的栈顶指针值
    LDR     R1, =currentTask          // 保存好后，将最后的堆栈顶位置，保存到currentTask->stack处
    LDR     R1, [R1]                  // 由于stack处在结构体stack处的开始位置处，显然currentTask和stack在内存中的起始
    STR     R0, [R1]                  // 地址是一样的，这么做不会有任何问题

PendSVHandler_nosave                  // 无论是tTaskSwitch和tTaskSwitch触发的，最后都要从下一个要运行的任务的堆栈中恢复
                                      // CPU寄存器，然后切换至该任务中运行
    LDR     R0, =currentTask          // 好了，准备切换了
    LDR     R1, =nextTask
    LDR     R2, [R1]
    STR     R2, [R0]                  // 先将currentTask设置为nextTask，也就是下一任务变成了当前任务

    LDR     R0, [R2]                  // 然后，从currentTask中加载stack，这样好知道从哪个位置取出CPU寄存器恢复运行
    LDMIA   R0!, {R4-R11}             // 恢复{R4, R11}。为什么只恢复了这么点，因为其余在退出PendSV时，硬件自动恢复

    MSR     PSP, R0                   // 存储通用寄存器的值到特殊功能寄存器，最后，恢复真正的堆栈指针到PSP
    ORR     LR, LR, #0x04             // 标记下返回标记，指明在退出LR时，切换到PSP堆栈中(PendSV使用的是MSP)
    BX      LR                          // 最后返回，此时任务就会从堆栈中取出LR值，恢复到上次运行的位置
}

/**********************************************************************************************************
** Function name        :   tTaskRunFirst
** Descriptions         :   在启动tinyOS时，调用该函数，将切换至第一个任务运行
** parameters           :   无
** Returned value       :   无
***********************************************************************************************************/
void tTaskRunFirst()
{
    // 这里设置了一个标记，PSP = 0, 用于与tTaskSwitch()区分，用于在PEND_SV
    // 中判断当前切换是tinyOS启动时切换至第1个任务，还是多任务已经跑起来后执行的切换
    __set_PSP(0);

    MEM8(NVIC_SYSPRI2) = NVIC_PENDSV_PRI;   // 向NVIC_SYSPRI2写NVIC_PENDSV_PRI，设置其为最低优先级

    MEM32(NVIC_INT_CTRL) = NVIC_PENDSVSET;    // 向NVIC_INT_CTRL写NVIC_PENDSVSET，用于PendSV

    // 可以看到，这个函数是没有返回
    // 这是因为，一旦触发PendSV后，将会在PendSV后立即进行任务切换，切换至第1个任务运行
    // 此后，tinyOS将负责管理所有任务的运行，永远不会返回到该函数运行
}

/**********************************************************************************************************
** Function name        :   tTaskSwitch
** Descriptions         :   进行一次任务切换，tinyOS会预先配置好currentTask和nextTask, 然后调用该函数，切换至
**                          nextTask运行
** parameters           :   无
** Returned value       :   无
***********************************************************************************************************/
void tTaskSwitch()
{
    // 和tTaskRunFirst, 这个函数会在某个任务中调用，然后触发PendSV切换至其它任务
    // 之后的某个时候，将会再次切换到该任务运行，此时，开始运行该行代码, 返回到
    // tTaskSwitch调用处继续往下运行
    MEM32(NVIC_INT_CTRL) = NVIC_PENDSVSET;  // 向NVIC_INT_CTRL写NVIC_PENDSVSET，用于PendSV
}
```
在这里有了这部分切换代码，就可以实现在两个任务的切换了，先上代码，再来讲解，主要看注释。

#### "tinyOS.h"
```c
#ifndef __TINYOS_H_
#define __TINYOS_H_

#include <stdint.h>

// Cortex-M的堆栈单元类型：堆栈单元的大小为32位，所以使用uint32_t
typedef uint32_t tTaskStack;

typedef struct _tTask//任务结构体
{
    // 任务所用堆栈的当前堆栈指针。每个任务都有他自己的堆栈，用于在运行过程中存储临时变量等一些环境参数
    // 在tinyOS运行该任务前，会从stack指向的位置处，会读取堆栈中的环境参数恢复到CPU寄存器中，然后开始运行
    // 在切换至其它任务时，会将当前CPU寄存器值保存到堆栈中，等待下一次运行该任务时再恢复。
    // stack保存了最后保存环境参数的地址位置，用于后续恢复
    tTaskStack * stack;
}tTask;

extern tTask* currentTask;
extern tTask* nextTask;

void tTaskRunFirst(void);

void tTaskSwitch(void);


#endif
```

#### "switch.c"
```c
#include "tinyOS.h"
#include "ARMCM3.h"

// 在任务切换中，主要依赖了PendSV进行切换。PendSV其中的一个很重要的作用便是用于支持RTOS的任务切换。
// 实现方法为：
// 1、首先将PendSV的中断优先配置为最低。这样只有在其它所有中断完成后，才会触发该中断；
//    实现方法为：向NVIC_SYSPRI2写NVIC_PENDSV_PRI
// 2、在需要中断切换时，设置挂起位为1，手动触发。这样，当没有其它中断发生时，将会引发PendSV中断。
//    实现方法为：向NVIC_INT_CTRL写NVIC_PENDSVSET
// 3、在PendSV中，执行任务切换操作。
#define NVIC_INT_CTRL		0xE000Ed04
#define NVIC_PENDSVSET		0x10000000
#define NVIC_SYSPRI2		0xE000ED22
#define NVIC_PENDSV_PRI		0x000000FF

#define MEM32(addr)		*(volatile unsigned long *)(addr)
#define MEM8(addr)		*(volatile unsigned char *)(addr)

// 下面的代码中，用到了C文件嵌入ARM汇编
// 基本语法为:__asm 返回值 函数名(参数声明) {....}， 更具体的用法见Keil编译器手册，此处不再详注。
__asm void PendSV_Handler(void)
{
    IMPORT currentTask          // 使用import导入C文件中声明的全局变量，
    IMPORT nextTask             // 类似于在C文文件中使用extern int variable
	
    MRS R0, PSP                 //加载特殊功能寄存器到通用功能寄存器，获取当前任务的堆栈指针
    CBZ R0, PendSVHander_nosave //判断R0的值是否为0，是0就跳转PendSVHander_nosave段
	                           //如果这是由tTaskSwitch触发的(此时，PSP肯定不会是0了，
                                //0的话必定是tTaskRunFirst)触发

    STMDB R0!, {R4-R11}         //      那么，我们需要将除异常自动保存的寄存器这外的其它寄存器
                                //      自动保存起来{R4, R11}
                                //      保存的地址是当前任务的PSP堆栈中，这样就完整的保存了必要的
                                //      CPU寄存器,便于下次恢复

    LDR R1, =currentTask        //      保存好后，将最后的堆栈顶位置，保存到currentTask->stack处
    LDR R1, [R1]                //      由于stack处在结构体stack处的开始位置处，显然currentTask和
                                //      stack在内存中的起始
    STR R0, [R1]                //      地址是一样的，这么做不会有任何问题
	
// 无论是tTaskSwitch和tTaskSwitch触发的，最后都要从下一个要运行的任务的堆栈中恢复    
// CPU寄存器，然后切换至该任务中运行
// 好了，准备切换了	
PendSVHander_nosave
    LDR R0, =currentTask    //加载当前任务到R0
    LDR R1, =nextTask       //加载下个任务到R1
    LDR R2, [R1]            //把nextTask寄存器值给R2
    STR R2, [R0]            //把nextTask值给currentTask
                            //先将currentTask设置为nextTask，也就是下一任务变成了当前任务

    LDR R0, [R2]          //然后，从currentTask中加载stack，这样好知道从哪个位置取出CPU寄存器恢复运行
    LDMIA R0!, {R4-R11}  //恢复{R4, R11}。为什么只恢复了这么点，因为其余在退出PendSV时，硬件自动恢复

    MSR PSP, R0         //最后，恢复真正的堆栈指针到PSP
    ORR LR, LR, #0x04   //标记下返回标记，指明在退出LR时，切换到PSP堆栈中(PendSV使用的是MSP) 
    BX LR	             //最后返回，此时任务就会从堆栈中取出LR值，恢复到上次运行的位置
}

void tTaskRunFirst(void)
{
    //这里设置了一个标记，PSP = 0，用于与tTaskSwitch()区分，用于在PEND_SV
    //中判断当前切换是tinyOS启东时切换至第一个任务，还是多任务已经跑起来后执行的切换

    __set_PSP(0);//用于标记初始任务，如果是跑起来的多任务，PSP栈肯定是指向用户级栈的某个位置肯定不为0
	
    MEM8(NVIC_SYSPRI2) = NVIC_PENDSV_PRI;
    MEM32(NVIC_INT_CTRL) = NVIC_PENDSVSET;
	
    //可以看到，这个函数没有返回
    //这是因为，一旦触发PEND_SV后，将会在PendSV后立即进行任务切换，切换至第一个任务运行
    //此后，TinyOS将负责管理所有的任务运行，永远不会返回该函数运行
}

void tTaskSwitch() 
{
    // 和tTaskRunFirst, 这个函数会在某个任务中调用，然后触发PendSV切换至其它任务
    // 之后的某个时候，将会再次切换到该任务运行，此时，开始运行该行代码, 返回到
    // tTaskSwitch调用处继续往下运行
    MEM32(NVIC_INT_CTRL) = NVIC_PENDSVSET;  // 向NVIC_INT_CTRL写NVIC_PENDSVSET，用于PendSV
}

```


#### "main.c"
```c
#include "tinyOS.h"

tTask* currentTask;
tTask* nextTask;
tTask* taskTable[2];    //就绪表

/*任务初始化函数*/
void tTaskInit(tTask* task, void (*entry)(void *), void* param, tTaskStack* stack)
{
    // 为了简化代码，tinyOS无论是在启动时切换至第一个任务，还是在运行过程中在不同间任务切换
    // 所执行的操作都是先保存当前任务的运行环境参数（CPU寄存器值）的堆栈中(如果已经运行运行起来的话)，
    // 然后再取出从下一个任务的堆栈中取出之前的运行环境参数，然后恢复到CPU寄存器
    // 对于切换至之前从没有运行过的任务，我们为它配置一个“虚假的”保存现场，然后使用该现场恢复。

    // 注意以下两点：
    // 1、不需要用到的寄存器，直接填了寄存器号，方便在IDE调试时查看效果；
    // 2、顺序不能变，要结合PendSV_Handler以及CPU对异常的处理流程来理解

    *(--stack) = (unsigned long)(1 << 24);//xPSR寄存器，必须置为1，否则进入ARM模式，运行异常
    *(--stack) = (unsigned long)entry;    //pc寄存器 //任务的入口函数
    *(--stack) = (unsigned long)0x14;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x12;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x03;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x02;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x01;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)param;    //任务的入口参数会传给R0

            //以上是硬件自动保存	

    *(--stack) = (unsigned long)0x11;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x10;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x09;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x08;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x07;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x06;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x05;           //未用，填入便于识别的数值，对应寄存器号
    *(--stack) = (unsigned long)0x04;           //未用，填入便于识别的数值，对应寄存器号

    task->stack = stack;
}

void tTaskSched()
{
    // 这里的算法很简单。
    // 一共有两个任务。选择另一个任务，然后切换过去
    if(currentTask == taskTable[0])
    {
        nextTask = taskTable[1];
    }
    else
    {
        nextTask = taskTable[0];
    }

    tTaskSwitch();
}

void delay(int count)
{
    while(--count > 0);
}


tTask tTask1;
tTask tTask2;

tTaskStack task1Env[1024];
tTaskStack task2Env[1024];

int task1Flag;
void task1Entry(void * param)
{
    for(;;)
    {
        task1Flag = 0;
        delay(100);
        task1Flag = 1;
        delay(100);

        tTaskSched();
    }
}

int task2Flag;
void task2Entry(void * param)
{
    for(;;)
    {
        task2Flag = 0;
        delay(100);
        task2Flag = 1;
        delay(100);
        
        tTaskSched();
    }
}

int main()
{
    //初始化任务1和任务2结构，传递任务运行的起始地址，想要给任意参数，以及运行堆栈空间
    tTaskInit(&tTask1, task1Entry, (void *)0x11111111, &task1Env[1024]);
    tTaskInit(&tTask2, task2Entry, (void *)0x22222222, &task2Env[1024]);

    //接着，将任务加入到任务表中
    taskTable[0] = &tTask1;
    taskTable[1] = &tTask2;

    //我们期望先运行tTask1, 也就是void task1Entry (void * param)
    nextTask = taskTable[0];

    //切换到nextTask， 这个函数永远不会返回
    tTaskRunFirst();

    return 0;	
}
```
&emsp;&emsp;这里主函数的代码很简单，就是在任务tTask1执行完毕之后，去主动触发任务调度tTaskSched()，在tTaskSched()里面触发tTaskSwitch()从而来从当前任务跳转到另一个任务，taskTable[2]被称之为就绪表，这个小实验就是在两个任务中来回切换。

&emsp;&emsp;之前上面提到任务切换由在任务中主动调用tTaskSched()来触发PendSV异常，但是tTaskSched()总是在任务中被调用，并不是很理想，而且目前任务中还有软件延时，对于实时操作系统来说，简直就是灾难。

### 任务切换机制
&emsp;&emsp;这里有两种触发方式，事件触发和时间触发。这里举个例子，一个医院有十个病人，每个病人配有一个护工，还有一个主治医生，如果病人出现小问题，如果护工能解决就不需要去叫主治医生来解决，如果护工不能解决就需要去求助主治医生。事件触发就是护工不能解决来求助主治医生，时间触发就是主治医生每隔一个小时就是查看每个病人。试想一下，如果同时三个护工同时来找主治医生，主治医生必然一个接着一个，但是这三个病人必须立马手术，不进行手术就会死亡，所以这时主治医生就分身乏术。所以事件触发相比时间触发来说，没有时间触发高效。那么PendSV异常的触发就用Cortex-M3内核自带的SysTick定时器，我们选择10ms触发一次。

SysTick的配置：
```c
/*********************************************************************************************************
** 系统时钟节拍定时器System Tick配置
** 在我们目前的环境（模拟器）中，系统时钟节拍为12MHz
** 请务必按照本教程推荐配置，否则systemTick的值就会有变化，需要查看数据手册才了解
**********************************************************************************************************/
void tSetSysTickPeriod(uint32_t ms)
{
  SysTick->LOAD  = ms * SystemCoreClock / 1000 - 1; 
  NVIC_SetPriority (SysTick_IRQn, (1<<__NVIC_PRIO_BITS) - 1);
  SysTick->VAL   = 0;                           
  SysTick->CTRL  = SysTick_CTRL_CLKSOURCE_Msk |
                   SysTick_CTRL_TICKINT_Msk   |
                   SysTick_CTRL_ENABLE_Msk; 
}

/**********************************************************************************************************
** Function name        :   SysTick_Handler
** Descriptions         :   SystemTick的中断处理函数。
** parameters           :   无
** Returned value       :   无
***********************************************************************************************************/
void SysTick_Handler () 
{
    // 什么都没做，除了进行任务切换
    // 由于tTaskSched自动选择另一个任务切换过去，所以其效果就是
    // 两个任务交替运行，与上一次例子不同的是，这是由系统时钟节拍推动的
    // 如果说，上一个例子里需要每个任务主动去调用tTaskSched切换，那么这里就是不管任务愿不愿意，CPU
    // 的运行权都会被交给另一个任务。这样对每个任务就很公平了，不存在某个任务拒不调用tTaskSched而一直占用CPU的情况
    tTaskSched();
}

/**********************************************************************************************************
** Function name        :   tTaskSched
** Descriptions         :   任务调度接口。tinyOS通过它来选择下一个具体的任务，然后切换至该任务运行。
** parameters           :   无
** Returned value       :   无
***********************************************************************************************************/
void tTaskSched () 
{    
    // 这里的算法很简单。
    // 一共有两个任务。选择另一个任务，然后切换过去
    if (currentTask == taskTable[0]) 
    {
        nextTask = taskTable[1];
    }
    else 
    {
        nextTask = taskTable[0];
    }
    
    tTaskSwitch();
}
```

## 实现两个任务的切换
&emsp;&emsp;有了任务的切换机制，再有两个任务，task1、task2两个任务，依靠SyTick触发PendSV异常来切换任务，那任务代码就可以简化：
```c
/**********************************************************************************************************
** 应用示例
** 有两个任务，分别执行task1Entry和task2Entry。功能是分别对相应的变量进行周期性置0置1.
** 每个任务都可以占用一段时间的CPU，一旦用完了，就会被强制暂停，切换到另一个任务中去。
**********************************************************************************************************/
void delay (int count) 
{
    while (--count > 0);
}

int task1Flag;
void task1Entry (void * param) 
{
    tSetSysTickPeriod(10);
    for (;;) 
    {
        task1Flag = 1;
        delay(100);
        task1Flag = 0;
        delay(100);
    }
}

int task2Flag;
void task2Entry (void * param) 
{
    for (;;) 
    {
        task2Flag = 1;
        delay(100);
        task2Flag = 0;
        delay(100);
    }
}
```
此时这个任务中的延时依然采用软件延时函数（如图）。
![](https://leichen2552.github.io//post-images/1590394999522.png)
下面是对红绿两块进行放大后的效果：可以看见task1执行多次之后被SysTick的10ms打断，从而进入任务切换，然后task2占据CPU的使用权，继续执行，然后在进入task1。
![](https://leichen2552.github.io//post-images/1613220841497.png)
但是软件延时依然会有很高的风险，比如这个任务延时1秒，难道其他任务也得等着吗？

## 双任务延时原理与空闲任务
&emsp;&emsp;因为SysTick定时的时间是10ms，所以采用这个延时，比如延时几个10ms。在任务初始化的时候添加一个变量delayTicks，当任务遇到延时函数的时候，就把延时的时间变量传给这个delayTicks，然后就进行任务调度。在SysTick的定时中断里面对这两个任务的delayTicks自减，再进行任务调度（如图6）。如果这两个任务都进行延时，这时候需要一个空闲任务，这个空闲任务来执行一些堆栈测量或者是cpu使用量测量，这些具体下面再分析。

### tinyOS.h
&emsp;&emsp;所以在任务的结构体里面需要添加一个变量delayTicks，用来记录延时几个10ms。
```c
// 任务结构：包含了一个任务的所有信息
typedef struct _tTask {
	// 任务所用堆栈的当前堆栈指针。每个任务都有他自己的堆栈，用于在运行过程中存储临时变量等一些环境参数
	// 在tinyOS运行该任务前，会从stack指向的位置处，会读取堆栈中的环境参数恢复到CPU寄存器中，然后开始运行
	// 在切换至其它任务时，会将当前CPU寄存器值保存到堆栈中，等待下一次运行该任务时再恢复。
	// stack保存了最后保存环境参数的地址位置，用于后续恢复
    tTaskStack * stack;

    // 任务延时计数器
    uint32_t delayTicks;
}tTask;
```
### main.c
&emsp;&emsp;添加一个空闲任务以及因为空闲任务的加入导致调度函数代码变化
```c
// 用于空闲任务的任务结构和堆栈空间
tTask tTaskIdle;
tTaskStack idleTaskEnv[1024];

void idleTaskEntry (void * param) {
    for (;;)
    {
        // 空闲任务什么都不做
    }
}

/**********************************************************************************************************
** Function name        :   tTaskSched
** Descriptions         :   任务调度接口。tinyOS通过它来选择下一个具体的任务，然后切换至该任务运行。
** parameters           :   无
** Returned value       :   无
***********************************************************************************************************/
void tTaskSched () 
{       
    // 空闲任务只有在所有其它任务都不是延时状态时才执行
    // 所以，我们先检查下当前任务是否是空闲任务
    if (currentTask == idleTask) 
    {
        // 如果是的话，那么去执行task1或者task2中的任意一个
        // 当然，如果某个任务还在延时状态，那么就不应该切换到他。
        // 如果所有任务都在延时，那么就继续运行空闲任务，不进行任何切换了
        if (taskTable[0]->delayTicks == 0) 
        {
            nextTask = taskTable[0];
        }           
        else if (taskTable[1]->delayTicks == 0) 
        {
            nextTask = taskTable[1];
        } else 
        {
            return;
        }
    } 
    else 
    {
        // 如果是task1或者task2的话，检查下另外一个任务
        // 如果另外的任务不在延时中，就切换到该任务
        // 否则，判断下当前任务是否应该进入延时状态，如果是的话，就切换到空闲任务。否则就不进行任何切换
        if (currentTask == taskTable[0]) 
        {
            if (taskTable[1]->delayTicks == 0) 
            {
                nextTask = taskTable[1];
            }
            else if (currentTask->delayTicks != 0) 
            {
                nextTask = idleTask;
            } 
            else 
            {
                return;
            }
        }
        else if (currentTask == taskTable[1]) 
        {
            if (taskTable[0]->delayTicks == 0) 
            {
                nextTask = taskTable[0];
            }
            else if (currentTask->delayTicks != 0) 
            {
                nextTask = idleTask;
            }
            else 
            {
                return;
            }
        }
    }
    
    tTaskSwitch();
}

int main () 
{
    // 初始化任务1和任务2结构，传递运行的起始地址，想要给任意参数，以及运行堆栈空间
    tTaskInit(&tTask1, task1Entry, (void *)0x11111111, &task1Env[1024]);
    tTaskInit(&tTask2, task2Entry, (void *)0x22222222, &task2Env[1024]);

    // 接着，将任务加入到任务表中
    taskTable[0] = &tTask1;
    taskTable[1] = &tTask2;

    // 创建空闲任务
    tTaskInit(&tTaskIdle, idleTaskEntry, (void *)0, &idleTaskEnv[1024]);
    idleTask = &tTaskIdle;
    
    // 我们期望先运行tTask1, 也就是void task1Entry (void * param) 
    nextTask = taskTable[0];

    // 切换到nextTask， 这个函数永远不会返回
    tTaskRunFirst();
    return 0;
}
```
&emsp;&emsp;看下图。任务运行的标志反转是齐头并进的，与之前两个任务的切换图不一样，那个是间断的。这个是连续不断的。
![](https://leichen2552.github.io//post-images/1617367279265.jpg)
&emsp;&emsp;将此图放大，可见系统的实时性提高了，没有像之前那样高达1s的延时。这才是我们理想期望的那样，两个任务齐头并进的效果。
![](https://leichen2552.github.io//post-images/1590395176369.png)

## 对于共享资源的保护
&emsp;&emsp;不同的任务会对同一片共享资源进行访问，或者说任务和中断也会对同一片资源进行访问，比如任务修改了所需要的某个全局变量的值，这时候中断又把这个值改了回去，那么这个时候任务修改的就失效了。这时就需要一种机制来保护这片共享资源。
### 临界区保护
&emsp;&emsp;临界区保护就是在访问这片资源前先屏蔽所有中断，然后对共享资源进行操作，访问结束后再开启所有中断。
```c
// 下面的代码中，用到了C文件嵌入ARM汇编
// 基本语法为:__asm 返回值 函数名(参数声明) {....}， 更具体的用法见Keil编译器手册，此处不再详注。

/**********************************************************************************************************
** Function name        :   tTaskEnterCritical
** Descriptions         :   进入临界区
** parameters           :   无
** Returned value       :   进入之前的临界区状态值
***********************************************************************************************************/
uint32_t tTaskEnterCritical (void) 
{
    uint32_t primask = __get_PRIMASK();
    __disable_irq();        // CPSID I
    return primask;
}

/**********************************************************************************************************
** Function name        :   tTaskExitCritical
** Descriptions         :   退出临界区,恢复之前的临界区状态
** parameters           :   status 进入临界区之前的CPU
** Returned value       :   进入临界区之前的临界区状态值
***********************************************************************************************************/
void tTaskExitCritical (uint32_t status) {
    __set_PRIMASK(status);
}
```
### 调度锁保护
&emsp;&emsp;调度锁保护在这种开关中断保护之上，比如在访问这片共享资源的时候禁止关闭中断，所以只能采取调度锁保护，就是在访问资源前关闭调度，再对资源资源进行操作，接着开启调度。这两种方法在以后用会很常见。

## 位图数据结构实现任务优先级
上面的代码才支持两个任务，一个多任务操作系统怎么能支持两个任务，这里引入一种数据结构来支持任务的优先级——位图数据结构。
![](https://leichen2552.github.io//post-images/1590395222248.png)

## 任务的延时队列
任务的延时采用上面所说的延时原理。延时队列是什么？其实是一个双向链表，比如一个任务有延时发生，就会把这个任务插入延时队列的尾部，并把这个任务从就绪态切换为延时态，这时会继续扫描优先级任务表，取出最高优先级的任务占据CPU运行。但是如果所有的任务都在延时态，就如上面所说会执行一个空闲任务。随着SysTick触发中断，这时会去遍历这个延时队列，找出这个延时队列中的处于延时态的任务，并递减这个任务的延时变量，当延时变量递减到0时，就唤醒这个任务并转变为就绪态，并把它插入任务表中，会继续执行任务调度函数，找出最高优先级的任务，并占据CPU运行。
![](https://leichen2552.github.io//post-images/1590395274131.png)

## 支持任务同优先级
也就是多任务共优先级的时间片运行：什么叫时间片，就是把一秒钟给具体分配给这个任务假设执行多久。为了完成这个功能，在任务初始化的时候，把同优先级的任务插入每个优先级位的双向链表，这里就称之为任务队列。假设ABC三个任务，A的优先级最高，B、C的优先级相同。在任务初始化的时候，把同优先级的任务放入一个双向链表中，并初始化时间片是10（Keil代码中设定是10），B、C任务的延时是普通依靠减一个数的delay延时，A是依靠时钟节拍的延时。A任务优先级最高会占据CPU运行，A遇到延时的时候，会被插入延时列表的尾部，并清除A任务在就绪表中的位（位图数据结构），A任务从就绪态变为延时态。这时会进入调度函数，找出此时优先级最高的是B和C，会从初始化时链表的头部取出一个任务并一直占据CPU运行，这时就等待系统的SysTick中断，在中断函数里，会先遍历延时队列，检测有没有延时完成的任务，然后对当前任务的时间片进行递减和0比较，如果有延时完成的任务并且优先级比当前任务高，会让延时完成的任务占据CPU运行，如果没有延时任务会继续让当前任务运行；如果当前任务的时间片运行结束，会把这个队列中处于头节点任务移除，并插入表尾。这时会继续进入调度函数，找出最高优先级的任务占据CPU运行。
![](https://leichen2552.github.io//post-images/1590395332972.png)
![](https://leichen2552.github.io//post-images/1590395338113.png)

## 任务的挂起
任务的挂起就是就是暂停任务运行，任务的恢复就是就是恢复任务运行，任务的删除就是释放任务资源。
![](https://leichen2552.github.io//post-images/1590395368359.png)
![](https://leichen2552.github.io//post-images/1590395386168.png)

## 任务信息的查询

## 事件控制块的实现
上面已经说过，操作系统就是为任务进行合理地调度，重点就是合理，不同的任务有不同的功能，比如这个任务需要与其他的任务进行同步、这个任务里面删除其他任务、这个任务要继承其他任务的优先级等等，但是这些操作首先要被操作系统了解，我们称这些操作叫做事件，所以用一个大的结构来管理——事件控制块。事件控制块里很多类型，也就是说下面要介绍的：计数信号量事件类型、邮箱事件类型、存储块管理事件类型、事件标志组事件类型和互斥信号量事件类型。
![](https://leichen2552.github.io//post-images/1590395423235.png)

## 计数信号量的实现
计数信号量是事件控制块加一个计数器。计数器负责技术控制，事件控制块用于控制任务等待和唤醒。如果一个任务A中有信号量等待，就解除就绪态并移除就绪表，就把这个任务插入事件控制块的等待队列，如果这个任务还设置了超时等待，就插入延时队列。接着就会进入其他任务，任务B中会通知任务A，把任务A唤醒，并移除事件控制块的等待队列进入就绪态，如果唤醒的这个任务优先级更高就进行任务调度。关于时间控制块中设置超时任务，因为他在两个队列中，延时队列和事件控制块的等待队列，等待超时结束，就会在中断里进行唤醒。信号量一般用于两个任务的同步。
![](https://leichen2552.github.io//post-images/1590395471052.png)
![](https://leichen2552.github.io//post-images/1590395485209.png)

## 邮箱的实现
邮箱的功能是满足多个任务之间传递消息。邮箱里面就有两个队列，一个是等待消息的任务队列，另一就是消息缓存队列，所以邮箱应当建立在事件控制块的基础之上。邮箱无消息，任务等待；邮箱内没有任务收消息，消息缓存；考虑效率问题，保存消息的起始地址。
![](https://leichen2552.github.io//post-images/1590395522329.png)

## 存储块的实现
内存中会有很多大量细小无法使用的碎片，频繁地进行任意大小的内存分配可能会产生很多不连续的细小的外部碎片，导致无法再分配。并且代码实现比较复杂，分配和释放过程操作时间不确定。是否真的需要分配任意大小的存储空间？从程序最底层往上应用层，所有东西开发都是完全可见的，针对特定场合开发，有时存储空间分配大小的种类通常只有少量几种。比如某个任务需要4个20k的内存块，有的任务需要3个80K的内存块，有的需求3个256B的存储块。但是缺点就是这些内存块无法彼此共享。牺牲了一定的存储空间换来简单、快速、确定的分配方式。存储块结构由两部分组成，空闲存储链表和事件控制块，空闲存储列表是空闲存储块链表，事件控制块为等待存储块的任务列表。
![](https://leichen2552.github.io//post-images/1590395548547.png)
![](https://leichen2552.github.io//post-images/1590395553892.png)

## 事件标志组的实现
如何在中断ISR与任务之间传递多个任务标志？每个任务都只有它等待特有的事件集合；当没有事件没有发生时，任务就进入这个列表中等待；当任务需要等待的这个事件发生，就唤醒任务。

事件标志组是实现多任务同步的有效机制之一。也许有不理解的初学者会问采用事件标志组多麻烦，搞个全局变量不是更简单？其实不然，在裸机编程时，使用全局变量的确比较方便，但是在加上RTOS后就是另一种情况了。使用全局变量相比事件标志组主要有如下三个问题： 
- 使用事件标志组可以让RTOS内核有效地管理任务，而全局变量是无法做到的，任务的超时等机制需要用户自己去实现。 
- 使用了全局变量就要防止多任务的访问冲突，而使用事件标志组则处理好了这个问题，用户无需担心。 
- 使用事件标志组可以有效地解决中断服务程序和任务之间的同步问题。
![](https://leichen2552.github.io//post-images/1590395589445.png)
![](https://leichen2552.github.io//post-images/1590395597423.png)
![](https://leichen2552.github.io//post-images/1590395606052.png)

## 互斥信号量的实现
如何在多个任务共享资源冲突的问题？之前给过关中断、调度锁保护的解决方案，但是如果访问资源的时候净值关闭中断、或者说调度锁也不能长时间关闭的情况下，这两种方案就失效了。之前还讲过计数信号量的解决方式，但是这个方式不支持嵌套使用，也不支持该型号量的所有者，也无法解决优先级反转的问题。
解释一下优先级反转问题：比如初始时一个资源被一个低优先级任务占有。高优先级任务期望占有资源，所以必须等待低优先级的任务释放资源后才能去占有，这个时候有多个中等优先级的任务并不需要占用资源，占用CPU的使用权，这样低优先级和高优先级都无法运行，一直是中等优先级的任务在运行。
所以这里引入一个全新的概念——互斥信号量，它有四个组成部分：用于嵌套调用的锁定次数计数器，当前已经获取信号量的任务，支持有优先级继承的原始优先级和一个事件控制块。
![](https://leichen2552.github.io//post-images/1590395633228.png)
![](https://leichen2552.github.io//post-images/1590395636553.png)
![](https://leichen2552.github.io//post-images/1590395819894.png)

## 软件定时器的实现
软定时器解决某个任务需要周期性的运行，这样就节省了硬件资源。创建一个定时器任务，它维护了一个定时器列表，定时器列表去周期性的查询一个又一个的软定时器，但是定时器任务可能被更高优先级的任务抢占运行，导致刷新定时器列表的时间滞后，这个滞后的时间是不确定的。为了解决这个问题又添加了一个定时器列表，这个定时器列表在系统中断节拍的服务函数里扫描的，这个定时器列表里的任务需要执行时间较短，而定时器任务列表中的函数可以执行时间较长。
![](https://leichen2552.github.io//post-images/1590395668150.png)


## 堆栈测量的检测
栈的使用量：初始化栈的时候为0，因为ARM栈的使用是满降栈模式，所以从栈的起始地址开始到第一个不为零的地址结束就是栈的使用量。

## CPU使用量检测
统计单位时间内CPU分别有多少时间在执行应用任务的代码和空闲任务的代码，但是这个无法实现，无法得到单位时间里执行了哪些指令，硬件不支持。所以换个思路，在系统空闲时运行的时候，设计一个特殊代码块（如图26）里有个执行计数器，仅特殊代码块的计数值MAX，正常运行时获取计数值Cnt，所以cpu的百分比≈100 - Cnt*100/Max。
![](https://leichen2552.github.io//post-images/1590395737582.png)

## 内核裁剪
到这里，微型操作系统的内核差不多就实现了，为什么要裁剪呢？就是保留你需要用的功能，留下你需要用的功能。这里使用条件编译的方式，需要什么功能就使能这个功能的宏。
![](https://leichen2552.github.io//post-images/1590395773305.png)

## Hooks拓展
Hooks，即钩子函数，用于在某些内核代码中插入一个占位，当执行到该位置时，执行自定义的功能代码，避免直接就该原始的内核代码。
![](https://leichen2552.github.io//post-images/1590395778363.png)


