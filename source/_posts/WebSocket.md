---
title: WebSocket
date: 2020-01-06 21:23:14
#index_img: https://demos.xiaoooyooo.site/picture?tag=016
categories:
	- JavaScript
tags:
	- JavaScript
	- WebSocket
---

# WebSocket

`WebSocket`是HTML5的新特性之一，是一种新的网络通信协议

特点：

+ 允许服务器主动向客户端发送数据
+ 基于HTTP协议（握手阶段采用了HTTP）
+ 数据格式简单，性能开销小，通信效率高

## 如何使用

### 浏览器端

目前主流的浏览器都已经支持`WebSocket`，使用时只需通过`WebSocket`构造函数即可

```js
const ws = new WebSocket(url[,protocols])
// url WebSocket服务器，例如 ws://127.0.0.1:8888
// protocols 一个协议字符串或者一个包含协议字符串的数组。这些字符串用于指定子协议，这样单个服务器可以实现多个WebSocket子协议（例如，您可能希望一台服务器能够根据指定的协议（protocol）处理不同类型的交互）。如果不指定协议字符串，则假定为空字符串。

ws.onopen = function() {
    //连接建立成功时执行的函数
    console.log("Connection established")
}
ws.onclose = function() {
    //连接断开时执行的函数
    console.log("Disconnected")
}
ws.onmessage = function(message) {
    //收到服务器消息时执行的函数
    console.log(message.data)
}
```

### 服务器端

服务器端较浏览器端更为灵活，目前有多种方式实现，这里以NodeJs的一个第三方库`ws`为例

```js
//npm install ws -S
const WS = require('ws')
const server = new WS.Server({ port: 8888 })

server.on("connection", function(ws, request) {
    //连接建立时执行的函数
    ws.send('Welcome!')
    let ip = request.connection.remoteAddress
    let port = request.connection.remotePort
    ws.on("message", function(message) {
        console.log(`Received message from ${ip}:${port} ==> ${message}`)
    })
})
```

## WebSocket API

### 常量

|         名称         |  值  |
| :------------------: | :--: |
| WebSocket.CONNECTING |  0   |
|    WebSocket.OPEN    |  1   |
|  WebSocket.CLOSING   |  2   |
|   WebSocket.CLOSED   |  3   |

### 方法

1. `WebSocket.close([code[,reason]])`

   关闭当前连接

   + `code`，解释连接关闭的原因的[数字状态码](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes)，默认105
   + `reason`，自定义的解释字符串，不能超过123字节

2. `WebSocket.send(data)`

   向服务器发送数据

   + `data`，需要发送的数据，其格式必须是字符串、`ArrayBuffer`、`Blob`、`ArrayBufferView`其中之一

### 属性

1. `WebSocket.binaryType`， 返回websocket连接所传输二进制数据的类型

2. `WebSocket.bufferedAmount`，**只读**，未发送到服务器的字节数

3. `WebSocket.extensions`，**只读**，服务器选择的扩展

4. `WebSocket.protocol`，**只读**，服务器选择的下属协议

5. `WebSocket.readyState`，**只读**，当前连接状态

6. `WebSocket.url`，**只读**，WebSocket的绝对路径

7. `WebSocket.onclose`，指定连接关闭的回调函数

   ```js
   WebSocket.onclose = function(event) {
     console.log("WebSocket is closed now.");
   };
   ```

8. `WebSocket.onerror`，指定连接失败后的回调函数，用法及参数同上

9. `WebSocket.onmessage`，指定当接收到服务器的消息时的回调函数，用法及参数同上

10. `WebSocket.onopen`，指定连接成功后的回调函数，用法及参数同上

#  参考资料

+ [WebSocket教程](https://www.ruanyifeng.com/blog/2017/05/websocket.html)
+ [MDN WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)