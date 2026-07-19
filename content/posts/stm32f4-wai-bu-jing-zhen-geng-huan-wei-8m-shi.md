---
title: 'stm32f4外部晶振更换为8M时'
date: 2021-05-18 09:44:55
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
程序上设置的晶振频率跟实际外部用的晶振频率不一致，会导致时钟紊乱，比如定时器定时不准，还会导致串口传输数据错误。

将晶振频率设置成12M的步骤如下：

1. 将stm32f4xx.h中语句 #define HSE_VALUE    ((uint32_t)25000000)改作#define HSE_VALUE    ((uint32_t)8000000)
2. (这一步可能需要也可能不需要)将system_stm32f4xx.c中的语句 #define HSE_BYPASS_INPUT_FREQUENCY  25000000改作 #define HSE_BYPASS_INPUT_FREQUENCY 8000000
3. 将system_stm32f4xx.c中 #define PLL_M  25     改作 #define PLL_M 8
