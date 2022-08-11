---
title: 如何实现一个websocket服务器
date: 2022-06-15 17:15:31
categories: 服务器
tags:
    - WebSocket
    - NodeJs
---

# 如何实现一个websocket服务器

本文将就如何搭建一个`WebSocket`服务器做较为细致的说明，关于`WebSocket`的定义以及优缺点不在此做说明。废话不多说，咱们进入正题。

## 连接建立

客户端的实现利用`WebSocket`API很简单就能完成，难点主要在服务端，因为它与平常的`GET`或`POST`请求不一样。相同的是它们都基于http协议，不同的是`WebSocket`多了一些额外的请求头：`Upgrade`以及一些以`Sec-WebSocket`开头的，后者我们主要关注的是`Sec-WebSocket-Key`。

服务端接收到了该请求后，需要根据`Sec-WebSocket-Key`生成唯一的`Sec-WebSocket-Accept`头部返回给客户端，除此之外还有`Upgrade`和`Connection`，响应的状态码则是`101`。

关于`Sec-WebSocket-Accept`是如何生成的，首先需要拿到客户端的`Sec-WebSocket-Key`，并将它与`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`拼接得到一个新的字符串，再将该字符串通过`SHA-1`算法加密，最后将加密后的字符串再进行`Base64`编码即可得到。如果客户端发送的`Sec-WebSocket-Key`为`vEkgOIDVZcUj1Z+v5BnEnA==`，那么服务端响应的`Sec-WebSocket-Accept`应该为`i8L6RCkmdYEUXgBdVajZ9/nMg1U=`。

> 在Node中进行`SHA-1`加密的算法：
> 
> ```js
> import { createHash } from "crypto";
> 
> function sha1(data) {
>   return createHash("sha1").update(data).digest();
> }
> ```

## 数据交换

在连接建立成功之后，在客户端尝试向服务端发送数据，会发现服务端接收到的数据是乱码（如果以字符串形式打印的话），这是因为客户端将数据进行编码了，我们还需要解码才能拿到其中的数据。

### 解码数据

### 第一个字节

1. 第1位为FIN码，表示是否为最后一帧数据；

2. 第2-4位为RSV码，用于扩展，可以忽略；

3. 第5-8位为操作码，能够表示的操作如下：
   
   + 0x0: 表示一个延续帧。当 Opcode 为 0 时，表示本次数据传输采用了数据分片，当前收到的数据帧为其中一个数据分片
   
   + 0x1: 表示这是一个文本帧
   
   + 0x2: 表示这是一个二进制帧
   
   + 0x3-0x7: 保留的操作码，暂时无意义
   
   + 0x8: 表示连接被断开
   
   + 0x9: 表示这是一个心跳请求(ping)
   
   + 0xa: 表示这是一个心跳响应(pong)
   
   + 0xb-0xf: 保留的操作码，暂时无意义

### 第二个字节

1. 第1位为MASK码，表示是否使用掩码，客户端发送的数据帧必须使用掩码(1)，否则服务端应该主动断开连接，而服务端发送的数据帧不需要

2. 第2-8位表示载荷长度，最大能够表示`0b1111111`，因而分几种情况：
   
   + 如果该部分数据小于十进制数字125，那么它就是有效载荷的长度
   
   + 如果该部分数据等于十进制数字126，那么**第3、第4个字节**表示的数字即为有效载荷的长度
   
   + 如果该部分数据等于十进制数字127，那么**第3、第4、第5、第6个字节**所表示的数字即为有效载荷的长度

在解码出MASK码和载荷长度之后，接下来的四个字节即为`Masking key`，它被用来解码真正的载荷数据，解码步骤为：遍历载荷数据，记当前遍历字节为`i`(从0开始)，将当前字节与`Masking key`的第`i % 4`个字节做异或运算`^`

### 解码算法

下面的代码只做了文本帧数据的解码，二进制帧解码类似。

```js
export function client(buffer) {
  // 解读第一位 FIN 码
  const firstByte = buffer.readUint8(0); // 或者buffer[0]
  if ((firstByte >> 7) & 0b1) {
    console.log("解码数据：这是最后一个数据帧");
  }
  // 解读操作码
  const op = firstByte & 0b1111;
  if (op === 0x8) {
    console.log("解码数据：这是一个中断操作");
    // 中断连接操作码
    this.end();
    return;
  }
  if (op === 0x1) {
    console.log("解码数据：这是一个文本帧");
    // 文本帧
    const secondByte = buffer.readUInt8(1);
    // 检查是否有 MASK 码
    if (!((secondByte >>> 7) & 0x1)) return;
    console.log("解码数据：该数据帧有 MASK 码");
    const payloadLen = secondByte & 0b1111111;
    console.log("解码数据：payloadLen", payloadLen);
    let maskingKeyOffset = 2;
    let maskingKey;
    if (payloadLen <= 125) {
      console.log("解码数据：payloadLen 小于等于 125");
      maskingKeyOffset += 0;
    } else if (payloadLen === 126) {
      console.log("解码数据：payloadLen 等于 126");
      maskingKeyOffset += 2;
    } else if (payloadLen === 127) {
      console.log("解码数据：payloadLen 等于 127");
      maskingKeyOffset += 4;
    }
    maskingKey = buffer.slice(maskingKeyOffset, maskingKeyOffset + 4);
    const payload = buffer.slice(maskingKeyOffset + 4);
    const data = [];
    for (let i = 0, len = payload.byteLength; i < len; i++) {
      data.push(payload[i] ^ maskingKey[i % 4]);
    }
    return Buffer.from(data).toString();
  }
  return "";
}
```

### 服务端发送数据

服务端发送数据与解码的操作相似，只是不用添加掩码（Masking Key）

```js
export function server(data) {
  let buffer, firstByte;
  if (!data) {
    data = "no data!";
  } else if (Buffer.isBuffer(data)) {
    firstByte = 0b10000010; // 最终帧 & 二进制帧
    console.log("加码数据：二进制数据");
    buffer = data;
  } else if (data instanceof Object) {
    firstByte = 0b10000001; // 最终帧 & 文本帧
    data = JSON.stringify(data);
    console.log("加码数据：", data);
    buffer = Buffer.from(data);
  }
  const bufferLen = buffer.byteLength;
  console.log("加码数据：数据长度", bufferLen);
  const sendData = [];
  sendData.push(firstByte);
  let secondByte = 0b00000000; // 没有掩码
  if (bufferLen <= 125) {
    secondByte ^= bufferLen;
    sendData.push(secondByte);
  } else if (bufferLen > 0b1111101 && bufferLen < 0b1111111111111111) {
    secondByte = 0b1111110;
    const len = []; // 用两个字节表示长度
    len.push((bufferLen >>> 8) & 0b11111111);
    len.push(bufferLen & 0b11111111);
    sendData.push(secondByte, ...len);
  } else {
    secondByte = 0b1111111;
    const len = []; // 用四个字节表示长度
    len.push((bufferLen >>> 24) & 0b11111111);
    len.push((bufferLen >>> 16) & 0b11111111);
    len.push((bufferLen >>> 8) & 0b11111111);
    len.push(bufferLen & 0b11111111);
    sendData.push(secondByte, ...len);
  }
  console.log("加码完成：", Buffer.from([...sendData, ...buffer]));
  return Buffer.from([...sendData, ...buffer]);
}
```

服务端的代码如下：

```js
function sha1(data) {
  return createHash("sha1").update(data).digest();
}

http
  .createServer((req, res) => {
    const { method, url, headers } = req;
    console.log(method, url);
    if (url === "/" && method === "GET") {
      res.writeHead(200, {
        "content-type": "text/html",
      });
      getFile("./index.html").then((index) => {
        res.end(index);
      });
      return;
    }
    res.statusCode = 404;
    res.end("not found");
  })
  .on("upgrade", (req, socket, head) => {
    if (req.url !== "/socket") {
      return socket.end("http/1.1 400 Bad Request");
    }
    if (req.headers["upgrade"] !== "websocket") {
      return socket.end("HTTP/1.1 400 Bad Request");
    }
    // 检查子协议
    const subProtocol = req.headers["sec-websocket-protocol"];
    console.log("子协议", subProtocol);
    if (subProtocol && subProtocol !== "json") {
      return socket.end("HTTP/1.1 400 Bad Request");
    }
    console.log("server on upgrade");
    // 读取客户端提供的Sec-WebSocket-Key
    const secWsKey = req.headers["sec-websocket-key"];
    // 使用SHA-1算法生成Sec-WebSocket-Accept
    const hash = Buffer.from(
      sha1(`${secWsKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    ).toString("base64");
    // 设置HTTP响应头
    const responseHeaders = [
      "HTTP/1.1 101 WebSocket Protocol Handshake",
      "Upgrade: WebSocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${hash}`,
    ];
    if (subProtocol) {
      responseHeaders.push("Sec-WebSocket-Protocol: json");
    }
    // 返回握手请求的响应信息
    socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");
    // sockets.emit("add", socket);
    socket.on("data", function (e) {
      console.log("ondata", e);
      const data = client.call(this, e);
      if (socket.writable) {
        console.log("ondata", data);
        const send = {
          code: 200,
          message: data,
        };
        socket.write(server(send));
      }
    });
    socket.on("close", function (e) {
      console.log("onclose", e);
    });
    socket.on("error", function (err) {
      console.log("onerror", err);
    });
  })
  .listen(8888, () => {
    console.log("\n\thttp://127.0.0.1:8888\n");
  });
```

## 参考资料

+ [编写 WebSocket 服务器 - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)

+ [你不知道的 WebSocket](https://developer.51cto.com/article/622153.html)
