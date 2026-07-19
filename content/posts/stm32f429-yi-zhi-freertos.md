---
title: 'stm32f429移植FreeRTOS'
date: 2021-01-07 20:53:33
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
@[toc]
## 第一步 
从官方下载的freertos文件中找到如下目录，我们只需要FreeRTOS目录下的Source目录下的文件，至于FreeRTOS-Plus目录下的，咱们不用管。
![](https://leichen2552.github.io//post-images/1610025381010.jpg)

## 第二步
- 在原有的某工程目录下新建一个FreeRTOS文件夹
  ![](https://leichen2552.github.io//post-images/1610026183467.jpg)
- 在这个文件夹下，把刚才Source目录下的文件全部复制过来
  ![](https://leichen2552.github.io//post-images/1610026075955.png)
- portable目录下只保留三个文件夹
  ![](https://leichen2552.github.io//post-images/1610026165083.png)
- RVDS目录下，我们需要的是M4F这个文件夹
  ![](https://leichen2552.github.io//post-images/1610026254473.jpg)
   
## 第三步
在原有的工程目录里新建两个组，如图，并把刚才Freertos目录下的文件放入，也如图所示
![](https://leichen2552.github.io//post-images/1610026399947.jpg) 

## 第四步
把下载下来的FreeRTOS文件夹下Demo（找到CORTEX_M4F_STM32F407ZG-SK这个Demo就可以了）中的的FreeRTOSconfig.h放进工程中新建FreeRTOS文件夹下

## 第五步
### 修改FreeRTOSConfig.h文件内容
#### 第一处：88~91行改成如下
```c
#if defined (__ICCARM__)||(__CC_ARM)||(__GNUC__)
	#include <stdint.h>
	extern uint32_t SystemCoreClock;
#endif
```
#### 第二处：config开头宏修改
把这四项改成0
![](https://leichen2552.github.io//post-images/1610026754623.jpg)

### 开启F429的FPU
#### 第一处
在system_stm32f4xx.c文件的SystemInit函数里，也就是该文件的第478行，有一个__FPU_USED，选中Go To Definetion会跳转core_cm4.h中，把core_cm4.h文件中的第123行修改为__FPU_USED的值修改为1就行
#### 第二处
修改MDK软件的选项
![](https://leichen2552.github.io//post-images/1611580228056.jpg)

到此为止，修改完成

### 工程文件里面不能有有关系统滴答定时器SysTick_Handler的函数，有的话需要屏蔽掉！

## 测试
```c
#include "bsp.h"
#include "FreeRTOS.h"
#include "task.h"

#define START_TASK_PRIO     1           //任务优先级
#define START_STK_SIZE      256         //任务堆栈大小
TaskHandle_t StartTask_Handler;         //任务句柄
void start_task(void *pvParameters);    //任务函数

#define LED0_TASK_PRIO      2           //任务优先级
#define LED0_STK_SIZE       256          //任务堆栈大小
TaskHandle_t LED0Task_Handler;          //任务句柄
void led0_task(void *p_arg);            //任务函数

#define LED1_TASK_PRIO      3           //任务优先级
#define LED1_STK_SIZE       256          //任务堆栈大小
TaskHandle_t LED1Task_Handler;         //任务句柄
void led1_task(void*p_arg);             //任务函数

#define FLOAT_TASK_PRIO     4           //任务优先级
#define FLOAT_STK_SIZE      256         //任务堆栈大小
TaskHandle_t FLOATTask_Handler;         //任务句柄
void float_task(void *p_arg);           //任务函数

int main(void)
{
    BspInit();
    
    //创建开始任务
    xTaskCreate((TaskFunction_t )start_task,            //任务函数
                (const char*    )"start_task",          //任务名称
                (uint16_t       )START_STK_SIZE,        //任务堆栈大小
                (void*          )NULL,                  //传递给任务函数的参数
                (UBaseType_t    )START_TASK_PRIO,       //任务优先级
                (TaskHandle_t*  )&StartTask_Handler);   //任务句柄              
    vTaskStartScheduler();          //开启任务调度
}

//开始任务任务函数
void start_task(void *pvParameters)
{
    taskENTER_CRITICAL();           //进入临界区
    //创建LED0任务
    xTaskCreate((TaskFunction_t )led0_task,     	
                (const char*    )"led0_task",   	
                (uint16_t       )LED0_STK_SIZE, 
                (void*          )NULL,				
                (UBaseType_t    )LED0_TASK_PRIO,	
                (TaskHandle_t*  )&LED0Task_Handler);   
    //创建LED1任务
    xTaskCreate((TaskFunction_t )led1_task,     
                (const char*    )"led1_task",   
                (uint16_t       )LED1_STK_SIZE, 
                (void*          )NULL,
                (UBaseType_t    )LED1_TASK_PRIO,
                (TaskHandle_t*  )&LED1Task_Handler);        
    //浮点测试任务
    xTaskCreate((TaskFunction_t )float_task,     
                (const char*    )"float_task",   
                (uint16_t       )FLOAT_STK_SIZE, 
                (void*          )NULL,
                (UBaseType_t    )FLOAT_TASK_PRIO,
                (TaskHandle_t*  )&FLOATTask_Handler);  
    vTaskDelete(StartTask_Handler); //删除开始任务
    taskEXIT_CRITICAL();            //退出临界区
}

//LED0任务函数 
void led0_task(void *pvParameters)
{
    while(1)
    {
        LED4_TOGGLE;
        //printf("==--**\r\n");
        vTaskDelay(500);
    }
}   

//LED1任务函数
void led1_task(void *pvParameters)
{
    while(1)
    {
        printf("led1_task--------------\r\n");
        vTaskDelay(500);
    }
}

//浮点测试任务
void float_task(void *pvParameters)
{
	static float float_num=0.00;
	while(1)
	{
		float_num+=0.01f;
		printf("float_num的值为: %.4f\r\n",float_num);
        vTaskDelay(500);
	}
}
```
配合串口助手，就能看到现象。

### 注意
给每个任务分配的栈空间尽量大，起码256起步！