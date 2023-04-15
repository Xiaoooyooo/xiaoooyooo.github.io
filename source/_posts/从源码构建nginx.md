---
title: 从源码构建nginx
date: 2022-10-14 20:22:45
tags:
    - nginx
categories: 
    - 服务器
---
# 从源码构建nginx

命令：

```bash
./configure [...options]
```

​	`configure`为`nginx`源代码解压后文件中的`configure`文件。

## OPTIONS

列出一些常用的

`--help`：列出所有option

`--prefix=[PATH]`：设置安装路径，默认为`/usr/local/nginx`
    其他的path相关的路径，默认都依赖于该路径。



## 参考资料

+ [Building nginx from Sources](https://nginx.org/en/docs/configure.html)
+ [nginx 官方下载地址](http://nginx.org/en/download.html)
+ [zlib 官方下载](https://zlib.net/)
+ [pcre2 官方下载](https://github.com/PhilipHazel/pcre2/releases)
+ [openssl 官方下载](https://www.openssl.org/source/)
