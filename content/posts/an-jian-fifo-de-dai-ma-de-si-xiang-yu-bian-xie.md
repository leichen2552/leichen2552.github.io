---
title: '按键FIFO的代码的思想与编写'
date: 2021-01-14 21:15:23
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
@[toc]
# 总览
对安富莱按键FIFO的代码进行了分析综合与运用

首先说一句，面对对象的编程思想真的相当重要。相当后悔毕业之后才接触了面对对象编程的思想，其实在大一大二的时候，就喜欢原子和野火的代码，逻辑简单也好用。看到安富莱的stm32代码，有点懵逼的的，就感觉为什么一个简单的按键检测搞这么麻烦，初始化按键的GPIO之后再加一句简单的GPIO_ReadInputDataBit不就行了么，还搞这搞那这么麻烦！当时也不懂什么叫数据结构，也没有人指导。可是学到后来，就觉得仅仅一个GPIO_ReadInputDataBit真的不能解决所有的事情，当然了，按一下再弹起或许可以，但是如果有长按功能呢？有连续按的功能呢？
当时觉得STM32还写得不错，就开始向S3C2440进军，看看uboot，玩玩linux，看看内核代码，在看内核的时候，发现充斥着大量的结构体与数据结构，当时就在想，为啥用这么多的结构体呢，好不明白。立马觉得自己阅读代码的能力不够，就把C语言重新回顾了几遍，又去把C++学了一遍。当明白了面对对象的编程思想之后，才发现过去面对过程编写的思想真的是小儿科啊。

其实用结构体的方式，方便就在好管理！
## 按键对象
回归正题，编写按键程序的时候，首先想到的就是按键有几种状态，第二是对按键的操作方法。
| 按键对象 |  |  |  |
| ------ | ------ | ------ | ------ |
| 按键状态： | 按下 | 弹起 |长按 |
| 按键操作： | 按一下 | 长按 | 连续按 |
对这个有一个意识之后，面对对象的编程思想就来了，我需要一个按键类型，就像C语言里面的int、char一样，可以声明一种按键类型，那么下面的代码就出来了：

### 按键数量
开发板上有两个按键，把这两个按键枚举出来：
```c
typedef enum
{
    KID_K1 = 0,
    KID_K2
}KEY_ID_E;

//两个按键，再加上组合按键，共有三种方式
//组合键这个可加可不加，加的话这个值就是3，不加就是2
#define KEY_COUNT       3  
```


### 按键对象类型
利用C语言的typedef和struct：
```c

/*
	按键滤波时间50ms, 单位10ms。
	只有连续检测到50ms状态不变才认为有效，包括弹起和按下两种事件
	即使按键电路不做硬件滤波，该滤波机制也可以保证可靠地检测到按键事件
*/
#define KEY_FILTER_TIME     5
#define KEY_LONG_TIME       100 /* 单位10ms， 持续1秒，认为长按事件 */

typedef struct
{
    /*下面是一个函数指针*/
    uint8_t (*IsKeyDownFunc)(void);/*按键按下的判断函数，1表示按下*/
    
    uint8_t  Count;         /* 滤波计数器 */
    uint16_t LongCount;     /* 长按计数器 */
    uint16_t LongTime;      /* 按键按下的持续时间，0表示不检测长按 */
    uint8_t  State;         /* 按键当前状态（按下还是弹起） */
    uint8_t  RepeatSpeed;   /* 连续按键周期 */
    uint8_t  RepeatCount;   /* 连续按键计时器 */
}KEY_Typedef;
```
### 按键状态
利用枚举定义每个按键的状态，按下、弹起、长按：
```c
typedef enum
{
    KEY_NONE = 0,
    
	KEY_1_DOWN,				/* 1键按下 1*/
	KEY_1_UP,				/* 1键弹起 2*/
	KEY_1_LONG,				/* 1键长按 3*/

	KEY_2_DOWN,				/* 2键按下 4*/
	KEY_2_UP,				/* 2键弹起 5*/
	KEY_2_LONG,				/* 2键长按 6*/   
    
    /*组合键*/
    KEY_3_DOWN,				/* 组合1、2键按下 7*/
	KEY_3_UP,				/* 组合1、2键弹起 8*/
	KEY_3_LONG				/* 组合1、2键长按 9*/     
}KEY_ENUM;
```
 ### 按键状态存储数据结构
 把按键每次的按下的状态数据存储FIFO数据结构中，然后从这个FIFO中读取按键事件，这个FIFO定义一个长度为10的数组：
 ```c
 /* 按键FIFO用到变量 */
#define KEY_FIFO_SIZE   10
typedef struct
{
    uint8_t Buf[KEY_FIFO_SIZE];     /* 键值缓冲区 */
    uint8_t Read;                   /* 缓冲区读指针1 */
    uint8_t Write;                  /* 缓冲区写指针 */
    uint8_t Read2;                  /* 缓冲区读指针2 */
}KEY_FIFO_Typedef;
 ```
### 小结
从按键对象上手，总结出按键对象类型、按键状态以及按键状态存储数据结构，上述代码在头文件中实现。

 ## 实现方法
### 一：用宏 定义按键的时钟、端口、引脚
```c
#define RCC_ALL_KEY                 (RCC_AHB1Periph_GPIOA|RCC_AHB1Periph_GPIOC)

#define GPIO_PORT_K1                GPIOA
#define GPIO_PIN_K1                 GPIO_Pin_0

#define GPIO_PORT_K2                GPIOC
#define GPIO_PIN_K2                 GPIO_Pin_13
```

### 二：定义按键个数和按键的FIFO数据结构
```c
static KEY_Typedef s_tBtn[KEY_COUNT];   //两个按键和二合一组合键一共三个按键
static KEY_FIFO_Typedef s_tKey;         //定义一个FIFO数据结构
```

### 三：用简便的语句实现按键是否被按下
```c
//其实本质上，这就是GPIO_ReadInputDataBit实现方法。不过if语句中的判断是否相等，得看硬件电路，
//如果按键按下后，引脚检测是低电平，则就是等于0，如果按键按下后，引脚检测是高电平，就不等于0
static uint8_t IsKeyDown1(void)  {if((GPIO_PORT_K1->IDR & GPIO_PIN_K1) != 0) {return 1;} else {return 0;}}
static uint8_t IsKeyDown2(void)  {if((GPIO_PORT_K2->IDR & GPIO_PIN_K2) != 0) {return 1;} else {return 0;}}
static uint8_t IsKeyDown3(void)  {if(IsKeyDown1() && IsKeyDown2()) {return 1;} else {return 0;}}
```
### 四：往FIFO中写入一个键值
```c
void BspPutKey(uint8_t _KeyCode)
{
    s_tKey.Buf[s_tKey.Write] = _KeyCode;
    
    if(++s_tKey.Write >= KEY_FIFO_SIZE)
    {
        s_tKey.Write = 0;
    }
}
```
### 五：从按键FIFO缓冲区读取一个键值
```c
uint8_t BspGetKey(void)
{
    uint8_t ret;
    
    if(s_tKey.Read == s_tKey.Write)
    {
        return KEY_NONE;
    }
    else
    {
        ret = s_tKey.Buf[s_tKey.Read];
        
        if(++s_tKey.Read >= KEY_FIFO_SIZE)
        {
            s_tKey.Read = 0;
        }
        
        return ret;
    }        
}

/*
*********************************************************************************************************
*	函 数 名: bsp_GetKey2
*	功能说明: 从按键FIFO缓冲区读取一个键值。独立的读指针。
*	形    参:  无
*	返 回 值: 按键代码
*********************************************************************************************************
*/
uint8_t BspGetKey2(void)
{
    uint8_t ret;
    
    if(s_tKey.Read2 == s_tKey.Write)
    {
        return KEY_NONE;
    }
    else
    {
        ret = s_tKey.Buf[s_tKey.Read2];
        
        if(++s_tKey.Read2 >= KEY_FIFO_SIZE)
        {
            s_tKey.Read2 = 0;
        }
        
        return ret;
    }        
}
```
对于这个第二个读指针，从功能说明上看，是独立的读指针，与之前那个读指针有区别。

### 六：获取按键的状态以及设置按键的参数
```c
/*
*********************************************************************************************************
*	函 数 名: bsp_GetKeyState
*	功能说明: 读取按键的状态
*	形    参:  _ucKeyID : 按键ID，从0开始
*	返 回 值: 1 表示按下， 0 表示未按下
*********************************************************************************************************
*/
uint8_t BspGetKeyState(KEY_ID_E _ucKeyID)
{
    return s_tBtn[_ucKeyID].State;
}

/*
*********************************************************************************************************
*	函 数 名: bsp_SetKeyParam
*	功能说明: 设置按键参数
*	形    参：_ucKeyID : 按键ID，从0开始
*			_LongTime : 长按事件时间
*			 _RepeatSpeed : 连发速度
*	返 回 值: 无
*********************************************************************************************************
*/
void BspSetKeyParam(uint8_t _ucKeyID, uint16_t _LongTime, uint8_t _RepeatSpeed)
{
    s_tBtn[_ucKeyID].LongTime = _LongTime;          /* 长按时间 0 表示不检测长按键事件 */
    s_tBtn[_ucKeyID].RepeatSpeed = _RepeatSpeed;    /* 按键连发的速度，0表示不支持连发 */
    s_tBtn[_ucKeyID].RepeatCount = 0;               /* 连发计数器 */
}
```

### 七：清空按键FIFO缓冲区
```c
/*
*********************************************************************************************************
*	函 数 名: bsp_ClearKey
*	功能说明: 清空按键FIFO缓冲区
*	形    参：无
*	返 回 值: 按键代码
*********************************************************************************************************
*/
void BspClearKey(void)
{
    s_tKey.Read = s_tKey.Write;
}
```
### 八：初始化按键硬件
```c
static void BspInitKeyHard(void)
{
	GPIO_InitTypeDef GPIO_InitStructure;
	
	/*开启按键GPIO口的时钟*/
	RCC_AHB1PeriphClockCmd(RCC_ALL_KEY,ENABLE);
	 
    /* 第2步：配置所有的按键GPIO为浮动输入模式(实际上CPU复位后就是输入状态) */
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN; 
    GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
    GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_NOPULL;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    
    GPIO_InitStructure.GPIO_Pin = GPIO_PIN_K1;
	GPIO_Init(GPIO_PORT_K1, &GPIO_InitStructure);    
  
	GPIO_InitStructure.GPIO_Pin = GPIO_PIN_K2; 
	GPIO_Init(GPIO_PORT_K2, &GPIO_InitStructure);  
}
```

### 九：初始化按键变量
```c
/*
*********************************************************************************************************
*	函 数 名: bsp_InitKeyVar
*	功能说明: 初始化按键变量
*	形    参:  无
*	返 回 值: 无
*********************************************************************************************************
*/
static void BspInitKeyVar(void)
{
    uint8_t i;
    
    s_tKey.Read = 0;
    s_tKey.Write = 0;
    s_tKey.Read2 = 0;
    
    for(i = 0; i < KEY_COUNT; i++)
    {
        s_tBtn[i].LongTime = KEY_LONG_TIME;         /* 长按时间 0 表示不检测长按键事件 */
        s_tBtn[i].Count = KEY_FILTER_TIME / 2;      /* 计数器设置为滤波时间的一半 */ 
        s_tBtn[i].State = 0;                        /* 按键缺省状态，0为未按下 */
        
        s_tBtn[i].RepeatSpeed = 0;                  /* 按键连发的速度，0表示不支持连发 */   
        s_tBtn[i].RepeatCount = 0;                  /* 连发计数器 */
    }

	/* 如果需要单独更改某个按键的参数，可以在此单独重新赋值 */
	/* 比如，我们希望按键1按下超过1秒后，自动重发相同键值 */    
    s_tBtn[KID_K1].LongTime = 100;
    s_tBtn[KID_K1].RepeatSpeed = 5;     /* 每隔50ms自动发送键值 */
    
    s_tBtn[KID_K2].LongTime = 100;
    s_tBtn[KID_K2].RepeatSpeed = 5;     /* 每隔50ms自动发送键值 */
    
    s_tBtn[0].IsKeyDownFunc = IsKeyDown1;
    s_tBtn[1].IsKeyDownFunc = IsKeyDown2;
    s_tBtn[2].IsKeyDownFunc = IsKeyDown3;   
}
```

### 十：最重要的检测按键！最重要！
```c
static void BspDetectKey(uint8_t i)
{
    KEY_Typedef *pBtn;
    
    pBtn = &s_tBtn[i];
    if(pBtn->IsKeyDownFunc())
    {
        /*这个里面执行的是按键按下的处理*/
        
        /* 下面这个if语句主要是用于按键滤波前给Count设置一个初值，
        前面说按键初始化的时候，已经设置了Count = KEY_FILTER_TIME / 2 */ 
        if(pBtn->Count < KEY_FILTER_TIME)
        {
            pBtn->Count = KEY_FILTER_TIME;
        }

        /* 这里实现KEY_FILTER_TIME时间长度的延迟 */
        else if(pBtn->Count < 2 * KEY_FILTER_TIME)
        {
            pBtn->Count ++;
        }
        /* 这里实现KEY_FILTER_TIME时间长度的延迟 */
        /*  个人理解以上两句就是软件消抖  */

        else
        {
            /* 
            ********************************************************************************** 
            这个State变量是有其实际意义的，如果按键按下了，这里就将其设置为1，如果没有按下，
            这个变量的值就会一直是0，这样设置的目的可以有效的防止一种情况的出现：比如按键K1
            在某个时刻检测到了按键有按下，那么它就会做进一步的滤波处理，但是在滤波的过程中，
            这个按键按下的状态消失了，这个时候就会进入到上面第二步else语句里面，然后再做按键
            松手检测滤波，滤波结束后判断这个State变量，如果前面就没有检测到按下，这里就不会
            记录按键弹起。  
            ********************************************************************************** 
            */
            if(pBtn->State == 0)
            {
                pBtn->State = 1;
                /* 发送按钮按下的消息 */ 
                BspPutKey((uint8_t)(3 * i + 1));
            }
            
            if(pBtn->LongTime > 0)
            {
                if(pBtn->LongCount < pBtn->LongTime)
                {
                    /* 发送按钮按下的消息 */ 
                    if(++pBtn->LongCount == pBtn->LongTime)
                    {
                        /* 键值放入按键FIFO */ 
                        BspPutKey((uint8_t)(3 * i + 3));
                    }
                }
                else
                {
                    if(pBtn->RepeatSpeed > 0)
                    {
                        if(++pBtn->RepeatCount >= pBtn->RepeatSpeed)
                        {
                            pBtn->RepeatCount = 0;
                            
                            /* 长按键后，每隔10ms发送1个按键 */ 
                            BspPutKey((uint8_t)(3 * i + 1));
                        }
                    }
                }               
            }
        }       
    }
    else
    {
        /*这个里面执行的是按键松手的处理或者按键没有按下的处理 */
        if(pBtn->Count > KEY_FILTER_TIME)
        {
            pBtn->Count = KEY_FILTER_TIME;
        }
        else if(pBtn->Count != 0)
        {
            pBtn->Count --;
        }
        else
        {
            if(pBtn->State == 1)
            {
                pBtn->State = 0;
                BspPutKey((uint8_t)(3 * i + 2));                
            }
        }  
            
        pBtn->LongCount = 0;
        pBtn->RepeatCount = 0;       
    }   
}

/* 然后就是逐一扫描按键 */
void BspKeyScan(void)
{
    uint8_t i;
    
    for(i = 0; i < KEY_COUNT; i++)
    {
        BspDetectKey(i);
    }
}
```
### 十一：初始化按键
```c
void BspInitKEY(void)
{
    BspInitKeyVar();
    BspInitKeyHard();
}
```

### 最后
定时起里对按键进行扫描，主函数对键值进行读取。
```c
//定时器扫描硬件函数部分省略了

while(1)
{    
    uint8_t  ucKeyCode = BspGetKey();
    
    if(++i > 100000)
    {
        printf(" ucKeyCode = %d\r\n",ucKeyCode);
        i = 0;
    }
    if(ucKeyCode != KEY_NONE)
    {
        switch (ucKeyCode)
        {
            case KEY_1_DOWN :
                /* User Code 1*/
                break;
            case KEY_2_DOWN :
                /* User Code 2*/
                break;
            
            default:
                break;
        }    
    }            
}
```

# 优点
- 可靠地记录每一个按键事件，避免遗漏按键事件。特别是需要实现按键的按下、长按、自动连发、弹起等事件时。 
- 读取按键的函数可以设计为非阻塞的，不需要等待按键抖动滤波处理完毕。 
- 按键FIFO程序在嘀嗒定时器中定期的执行检测，不需要在主程序中一直做检测，这样可以有效地降低系统资源消耗。
