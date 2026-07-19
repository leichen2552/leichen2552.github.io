---
title: 'stm32f429移植STemWin总结'
date: 2021-01-26 10:53:31
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
@[toc]
# 总览
连续熬了三天夜，各种找资料看文档算是把STemWin移植上了裸机和FreeRTOS上了。
我是按照《安富莱_STM32-V6emWin教程（V2.0）》这份教程来的，安富莱写得很详细，也确实在emWin教程这方面做得很好。但是有几处细节方面着重说一下。
## 裸机上移植
### 第一步
在移植之前，板载的SDRAM驱动、触摸驱动、显示屏驱动要先准备好，这些准备好了才能进行下一步工作。
### 第二步
GUIConf.c与GUIConf.h这两个文件，安富莱已经说得很详细了，这里就不再赘述。
### 第三步
LCDConf_Lin_Template.c与LCDConf_Lin_Template.h，这两个文件要着重说一下。如果是在STM32Cube_FW_F4_V1.13.0\Middlewares\ST\STemWin\Config\这个目录下复制的LCDConf_Lin_Template.c这个文件，你会发现，这个文件的代码量少得可怜，跟安富莱教程里说的大相径庭。但是在STM32Cube_FW_F4_V1.13.0\Projects\STM324x9I_EVAL\Applications\STemWin\STemWin_SampleDemo\Src这个目录下，有一个LCDConf_stm324x9i_eval_MB1063.c这个文件，这个文件是ST官方移植STemWin时的文件，我们把它复制出来然后改成LCDConf_Lin_Template.c，然后替换原来的那个文件。删除掉函数LCD_LL_Init()、HAL_LTDC_MspInit()和HAL_LTDC_MspDelnit()这三个函数，因为ST官方移植的文件中还要初始化RGB屏幕的，但是我们会使用LCD_ Init()函 数初始化RGB屏，所以这三个函数我们不需要。然后再添加两个函数LTDC_IRQHandler() 和DMA2D_IRQHandler()这两个函数，这两个函数在第一步之前就该准备好。
STM32Cube_FW_F4_V1.13.0这个库里面的LCDConf_stm324x9i_eval_MB1063.c已经是HAL库了，跟安富莱的代码有点不一样，安富莱的用的还是寄存器方式。我特意去下载了STM32Cube_FW_F4_V1.1.0的库，这个库用的还是寄存器的，主要是硬盘容量不够了，所以我只能推测安富莱的并不是V1.13的库，因为我看的是emWin2.0的教程，安富莱之前第一版的教程是V1.1.2的库，这就解释的通了。

## FreeRTOS上移植
## 第一步
移植上freeRTOS的时候，由于之前裸机的触摸屏中断用了一个exit线中断，导致一直卡死。后来采用定时器循环扫描的方式，简单实用。关于这个文件GUI_X_FreeRTOS这个文件在Keil的安装目录里面Keil_v526\ARM\PACK\Keil\MDK-Middleware\7.7.0\emWin\Sample\GUI_X

大概就这么多，暂时先写到这里！
