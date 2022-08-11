---
title: Linux服务器上安装并配置MongoDB
date: 2019-11-09 21:14:32
#index_img: https://demos.xiaoooyooo.site/picture?tag=009
tags:
	- Linux
	- MongoDB
categories:
	- MongoDB
---

# Linux上安装并配置MongoDB

本文用于测试的linux系统的CentOS6 X64
mongoDB版本为4.0.16，Linux下载链接：https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-4.0.16.tgz

## 下载

```bash
curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-4.0.16.tgz
```

## 解压

```bash
tar -zxvf mongodb-linux-x86_64-4.0.16.tgz
# 将解压后的文件改名为mongodb并移至/usr/local/目录下
mv mongodb-linux-x86_64-4.0.16.tgz /usr/local/mongodb
# 由于该版本为免安装版（其他系统及版本没试过不清楚），可执行文件就在解压后文件中的bin目录下
```

## 启动mongodb前的配置

### 建立配置文件

```bash
# 在mongodb目录中新建conf文件夹，用于存放配置文件
mkdir conf
# 同样新建logs文件夹，用于存放日志文件
mkdir logs
# 在cong目录中新建mongod.conf
cd conf
touch mongod.conf
# 在配置文件中输入以下内容
	##port 端口号
	port=23000
	##dbpath 数据库存储文件目录
	dbpath=/usr/local/mongo/mongodb/data
	##logpath 日志路径
	logpath=/usr/local/mongo/mongodb/logs/mongodb.log
	##logappend 日志追加形式  false:重新启动覆盖文件
	logappend=true
	##fork 在后台运行
	fork=true

	##设置日志级别
	##0 - 关闭性能分析，测试环境可以打开，生成环境关闭，对性能有很大影响;
    ##1 - 开启慢查询日志，执行时间大于100毫秒的语句
	##2 - 开启所有操作日志
	profile=1
```

更多可配置项详见参考资料

### 添加到系统全局环境变量

添加到全局变量后可以在命令行任何位置使用与mongodb相关的命令

```bash
# 编辑全局系统环境变量文件
vim /etc/profile
# 在末尾追加以下内容后保存
export MONGO_PATH=/usr/local/mongodb
export PATH=$MONGO_PATH/bin:$PATH

#重新加载环境变量配置文件
source /etc/profile
#没有任何输出则说明加载成功
```

## 启动mongoDB服务

```bash
# 使用以下命令启动服务,--config（简写-f）表示利用配置文件启动
mongod --config /usr/local/mongodb/conf/mongod.conf

# 直接在命令行输入mongo即可连接到mongodb
mongo
```

## 停止MongoDB服务

```bash
# 首先需要在mongo命令行内，依次执行以下命令
use admin
db.shutdownServer()
```

## 给MongoDB设置密码

在mongo终端中使用`db.createUser(username,password,roles)`来创建用户

```js
db.createUser('test','123456',roles:['readWrite'])
//可设置的权限详见参考资料
```

使用`db.auth(username,password)`来验证，输出为1表示成功，为0则失败。



## 参考资料

+ [Linux 下安装mongodb，并配置](https://www.jianshu.com/p/d8f471bdfa3b)
+ [MongoDB 通过配置文件启动](https://blog.csdn.net/zhu_tianwei/article/details/44261235)
+ [Mongodb 新版配置文件详解](https://www.03sec.com/3176.shtml)
+ [配置文件官方文档](https://docs.mongodb.com/manual/reference/configuration-options/)
+ [mongodb用户权限管理最全攻略：用户的创建、查看、删除与修改，mongodb入坑之旅](https://segmentfault.com/a/1190000015603831)