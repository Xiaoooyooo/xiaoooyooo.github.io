---
title: 使用脚本签发ssl证书
date: 2024-02-04 17:33:32
tags:
	- 服务器
	- SSL
categories:
	- 服务器
---

# 使用脚本签发ssl证书

最近新搭建了一个服务器，需要加上https，碰巧之前做过一些东西，对于证书的自动化签发有了早期的认识，趁着这次机会去深入了解下其中的逻辑，于是乎发现了一个好东西`acme.sh`。

简单来说，它就是用来自动化申请ssl证书的，为了简化工作，这次就用它东西来试试。

注：本文的命令都是在服务器上运行的。

## 安装acme.sh

在终端中执行以下命令：

```bash
curl https://get.acme.sh | sh
```

这段命令会下载一段sh代码并执行，如果成功能在输出中看到`Success`等字样。

之后尝试运行命令：

```bash
acme.sh
```

如果成功安装的话，这个命令能被成功识别。如果安装成功了，但是命令未识别到，那么尝试新开一个终端，或在当前终端执行命令：

```bash
bash ~/.bashrc
```

到这里应该就能识别到命令了。

## 登录

在正式签发证书之前，可能`acme.sh`可能需要你首先进行注册/登录，这一步也是通过命令行进行的。

执行以下命令：

```bash
acme.sh --register-account -m email@example.com
```

## 申请证书

在正式开始之前，还有几个注意事项：

+ 请确保域名已经能正确的解析到当前的服务器。
+ 网站能通过`80`端口正常访问根目录下的静态资源。（起码是根目录下的`.well-known`路由）

之后，执行以下命令：

```bash
acme.sh --issue -d www.your-app.com -w /home/to/www/root
```

如果成功的话，在输出的结果中有很显眼的`Success`字样，失败同理。

## 证书安装

如果一切顺利，服务器的证书文件已经签发完成了，并且证书文件已经可以正常被使用了，但是这个脚本还未我们提供了一些遍历的命令。

`acme.sh`不仅替我们申请了证书，它还能刚我们管理证书，这对于自动化的续期很有帮助。

使用以下命令将新申请的证书安装到指定目录：

```bash
acme.sh --installcert -d www.your-app.com \
        --keypath /path/to/ssl/cert.key \
        --fullchainpath /path/to/ssl/cert.pem \
        # 证书安装成功后执行的命令
        # --reloadcmd "sudo service nginx force-reload"
```

之后再修改以下服务器的配置，加上证书文件，网站应该就能正常使用`https`了。

## 一些问题

1. 最开始网站并没有监听80端口，导致网站验证过程失败，开放了过后再继续发现始终报错，google了相关问题，尝试运行命令`acme.sh --set-default-ca --server letsencrypt`结果成功了，由于精力有限，暂时不清楚原理是啥，记录一下。

## 参考资料

+ [acme.sh - Blogs and tutorials](https://github.com/acmesh-official/acme.sh/wiki/Blogs-and-tutorials#%E4%B8%AD%E6%96%87)
+ [使用 acme.sh 给 Nginx 安装 Let’ s Encrypt 提供的免费 SSL 证书](https://ruby-china.org/topics/31983)

