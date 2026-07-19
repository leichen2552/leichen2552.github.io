---
title: 'USB接口处D+、D-怎么接'
date: 2021-03-09 16:12:23
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
USB信号是什么类型的？ 为什么在D+，D-处要接上拉下拉电阻呢，具体阻值要如何计算。

1. usb有主从设备之分，主设备有：pc, 现在市面上的那些插u-disk即可播放mp3的“mp3”之类的，
usb 信号是差分信号，信号线为D+, D-,。 在usb host 端， D+，D- 各接一个15kohm 的下拉电阻， 而在usb device端，这时就有高速低速设备的区别了。usb1.0, 1.1,2.0协议中都有定义高低速设备以满足不同情况的需求，这些在硬件上的区别就是： 高速设备：d+ 接一个1.5kohm的上拉电阻，d-不接；低速设备则相反。
      这样当usb device 插入到host中时，如果是高速设备， 则d+被拉高，d-不变；低速设备则与之相反。 这个上拉过程需要大概2.5us的时间，host这这个时间内便检测到了该信号，即可判断有device plug in，和该device的类型，然后开始通讯，枚举。。。等。

2. USB OTG（on the go） 就是既可以做host又可以做client
我们一般是作为client接受pc传输数据，作为host时可以接打印机直接把手机中的照片打印出来
判别是host还是client是靠USB_ID这根pin

3. 当作为client时，USB_ID基本是悬空的（内部有上拉）

3. 如果侦测到USB_ID被拉低，就被认为是作为host，向外输出
所以需要外部client设备把USB_ID拉低
