---
title: 'ESP8266入门体验'
date: 2020-01-06 20:11:43
tags: [ESP8266]
published: true
hideInList: false
feature: /post-images/esp8266-ru-men-ti-yan.jpg
isTop: false
---
由于项目需要把有线传输改成无线传输，蓝牙传输容易丢包，所以就用现在很火的WiFi芯片——ESP8266。

前前后后购置了三样东西
![](https://leichen2552.github.io//post-images/1578316456867.png)
![](https://leichen2552.github.io//post-images/1578316462777.png)
![](https://leichen2552.github.io//post-images/1578313188960.png)

随机打开安信可串口调试助手，发送AT+RST，一定要先发这个保证初始化。
![](https://leichen2552.github.io//post-images/1578314172950.png)

看到最后的ready。这时，固件启动完成。

中间有一串乱码，这串乱码可以再74880的波特率下查看系统日志信息。

* rst cause :  红框种的数值
1   上电
2   外部复位
3   硬件看门狗复位
* Boot mode : 启动模式后面有两个参数，只看第一个参数即可
1   下载模式
3   运行模式
* chksum : chksum和csum值相等，表明启动过程中flash读值准确



