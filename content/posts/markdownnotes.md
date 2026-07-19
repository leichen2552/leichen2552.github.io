---
title: 'markdownNotes'
date: 2020-01-06 13:50:11
tags: [markdown]
published: true
hideInList: false
feature: /post-images/markdownnotes.jpg
isTop: false
---
**目录** 
@[toc] 

# Markdown 笔记


## 生成目录
    @[toc] 或者 [toc]

## 代码高亮
tab键上面的的那个按键
    
    ```C
    ```

void function1()  \\\就是C语言高亮
{

}

## 无序标号和有序标号
星号*加一个空格
* 我
* 爱
* RTOS

数字后面一个点再一个空格
1. 我
2. 爱
3. RTOS

## 文字加粗
    **这时加粗字体**
    
## 斜体字
    *这是斜体字*

## 自定义字体大小
<font size = 4>我是变大字体</font>

 ## 字体变大变小标签
 <small>字体变小</small>
 <big>字体变大</big>
 ## 换行
 空格+空格+回车

## 字体大小与颜色
<font face="黑体">我是黑体字</font>
<font face="微软雅黑">我是微软雅黑</font>
<font face="STCAIYUN">我是华文彩云</font>
<font color=#0099ff size=6 face="黑体">color=#0099ff size=72 face="黑体"</font>
<font color=#00ffff size=50>color=#00ffff</font>
<font color=gray size=50>color=gray</font>

## 表格
```
| 一个普通标题 | 一个普通标题 | 一个普通标题 |
| ------ | ------ | ------ |
| 短文本 | 中等文本 | 稍微长一点的文本 |
| 稍微长一点的文本 | 短文本 | 中等文本 |
```
| 一个普通标题 | 一个普通标题 | 一个普通标题 |
| ------ | ------ | ------ |
| 短文本 | 中等文本 | 稍微长一点的文本 |
| 稍微长一点的文本 | 短文本 | 中等文本 |

# latex 笔记
## latex调大字体
* 七号 　　5.25pt 　　    1.845mm　　　　\tiny
* 六号 　　7.875pt 　　  2.768mm　　　　\scriptsize
* 小五号 　9pt 　　　　  3.163mm　　　　\footnotesize
* 五号 　　10.5pt 　　    3.69mm　　　　  \small
* 小四号 　12pt 　　　　4.2175mm　　　 \normalsize
* 四号 　　13.75pt 　　  4.83mm　　　　  \large
* 三号 　　15.75pt 　　  5.53mm　　　　  \Large
* 二号 　　21pt 　　      7.38mm                \LARGE
* 一号 　　27.5pt 　　   9.48mm　　　　   \huge
* 小初号 　36pt 　　　  12.65mm　　　　 \Huge

## 积分号、下标、上下限
    \Large {\int_{birth}^{death} study dtime = life} 
 $$\Large {\int_{birth}^{death} study dtime = life} $$ 

## 罗马字符
首先展示几个小写的罗马数字：
$\romannumeral1$
\romannumeral3、
\romannumeral6；

下面看对应的大写罗马数字：
\uppercase\expandafter{\romannumeral1}、
\uppercase\expandafter{\romannumeral3}、
\uppercase\expandafter{\romannumeral6}。

 更新会继续添加！
