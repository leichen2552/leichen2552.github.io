---
title: '让gitbash走全局代理'
date: 2021-03-19 08:30:13
tags: []
published: true
hideInList: true
feature: 
isTop: false
---
## Gridea日常同步失败
没错，Gridea同步总会出问题，那是因为Gridea在进行仓库连接的时候，因为某种特殊力量，总会连接不上。也就在“远程”那个选项里，“检测远程连接”总会出问题，楼主两天测试了上百次，也仅仅就成功了三次。

## 解决办法
因为我是把Gridea的文件夹放在onedrive里面的，便于各个电脑之间同步文件。既然Gridea的同步功能会失败，那我就手动把代码上传到github上。
1. 在Gridea文件夹的output子文件夹里面，打开gitbash，用命令“git pull origin master”先拉一下远程仓库，果不其然，这是会失败的。
2. 然后我们打开神秘力量，再次使用命令“git pull origin master”发现还是不行，明明已经开启了神秘力量，怎么就是不行呢？这是因为gitbash并没有走神秘力量的全局代理。
3. 设置gitbash走全局代理，一般情况用全局的
```c
    git config --global http.proxy 127.0.0.1:1080 为全局的 git 项目都设置代理
    git config --local http.proxy 127.0.0.1:1080  为某个 git 项目单独设置代理
```
4. 完美解决![](https://leichen2552.github.io//post-images/1616115028836.png)
5. 再次打开gridea，写一篇文章之后，点击预览，其实就是Gridea把写好的文章中心编译放进output文件夹里。然后git push -u origin master，上传代码就OK！
6. 再也不需要看到Gridea日常同步失败了！妈妈再也不用担心我的学习！