---
title: CentOS7环境下nginx服务器的搭建
date: 2019-09-11 20:08:09
#index_img: https://demos.xiaoooyooo.site/picture?tag=005
tags:
    - linux
    - 服务器
    - nginx
categories:
    - nginx
---
# Nginx安装准备

## 安装make
>``` bash
> yum -y install gcc automake autoconf libtool make
>```
## 安装g++
>``` bash
> yum install gcc gcc-c++
>```

## 安装PCRE库
> ``` bash
> wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.43.tar.gz
>
> tar -zxvf pcre-8.43.tar.gz
> cd pcre-8.43
> ./configure
> make && make install
> ```
## 安装zlib库
> ``` bash
> wget http://zlib.net/zlib-1.2.11.tar.gz
> tar -zxvf zlib-1.2.11.tar.gz
> cd zlib-1.2.11
> ./configure
> make && make install
> ```
## 安装ssl
> ``` bash
> wget https://www.openssl.org/source/openssl-1.1.1c.tar.gz
> tar -zxvf openssl-1.0.1t.tar.gz
> //无后续操作
> ```



# 安装nginx
## 开始安装
>``` bash
>wget http://nginx.org/download/nginx-1.16.0.tar.gz
>tar -zxvf nginx-1.16.0.tar.gz
>cd nginx-1.16.0
>
>./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-pcre=/usr/local/nginx_src/pcre-8.43 --with-zlib=/usr/local/nginx_src/zlib-1.2.11 --with-openssl=/usr/local/nginx_src/openssl-1.1.1c
>
>make && make install
>```



## 将Nginx注册为服务随系统启动

### 创建服务文件
> ``` bash
> vim /lib/systemd/system/nginx.service
> ```
### 在nginx.service中写入以下内容
> ```
> [Unit]
> Description=nginx service
> After=network.target 
>
> [Service] 
> Type=forking 
> ExecStart=/usr/local/nginx/sbin/nginx
> ExecReload=/usr/local/nginx/sbin/nginx -s reload
> ExecStop=/usr/local/nginx/sbin/nginx -s quit
> PrivateTmp=true 
>    
> [Install] 
> WantedBy=multi-user.target
> ```
### 常用操作

> **service nginx start	启动服务**
>
> **service nginx stop	关闭服务**
>
> **service nginx reload	重启服务**
>
> systemctl start nginx.service　         启动nginx服务
> systemctl stop nginx.service　          停止服务
> systemctl restart nginx.service　       重新启动服务
> systemctl list-units --type=service     查看所有已启动的服务
> systemctl status nginx.service          查看服务当前状态
> systemctl enable nginx.service          设置开机自启动
> systemctl disable nginx.service         停止开机自启动