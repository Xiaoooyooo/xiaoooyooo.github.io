---
title: HTTP CORS
date: 2024-02-04 17:34:32
tags:
	- HTTP
	- CORS
  - 预检请求
categories:
	- HTTP
---

# HTTP CORS

> **跨源资源共享**（[CORS](https://developer.mozilla.org/zh-CN/docs/Glossary/CORS)，或通俗地译为跨域资源共享）是一种基于 [HTTP](https://developer.mozilla.org/zh-CN/docs/Glossary/HTTP) 头的机制，该机制通过允许服务器标示除了它自己以外的其他[源](https://developer.mozilla.org/zh-CN/docs/Glossary/Origin)（域、协议或端口），使得浏览器允许这些源访问加载自己的资源。跨源资源共享还通过一种机制来检查服务器是否会允许要发送的真实请求，该机制通过浏览器发起一个到服务器托管的跨源资源的**预检请求**。在预检中，浏览器发送的头中标示有 HTTP 方法和真实请求中会用到的头。

两个`url`地址的协议、域名、端口不同，那么这两个地址便会被认为不是同源的，出于安全性考虑，浏览器会限制向跨源地址发起的http请求，**除非响应报文头部包含了正确的CORS头部**。

触发CORS有以下情况：

1. 由`XMLHttpRequest`或`Fetch API`发起的跨源 HTTP 请求。
2. Web 字体（CSS 中通过 `@font-face` 使用跨源字体资源）。
3. [WebGL 贴图](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL)。
4. 使用 `drawImage()`将图片或视频画面绘制到 canvas。
5. [来自图像的 CSS 图形](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shapes/Shapes_from_images)。

在发起跨源请求时，浏览器会在某些请求正式发送前自动发起一个[预检请求（Preflight request）](https://developer.mozilla.org/zh-CN/docs/Glossary/Preflight_request)，而一些请求则不会。对此，MDN的解释是：

> 某些请求不会触发 CORS 预检请求。在废弃的 [CORS 规范](https://www.w3.org/TR/2014/REC-cors-20140116/#terminology)中称这样的请求为*简单请求*，但是目前的 [Fetch 规范](https://fetch.spec.whatwg.org/)（CORS 的现行定义规范）中不再使用这个词语。
>
> HTML 4.0 中的 `form` 元素（早于跨站 `XMLHttpRequest` 和 `fetch`）可以向任何来源提交简单请求，所以任何编写服务器的人一定已经在保护`跨站请求伪造攻击（CSRF）`。在这个假设下，服务器不必选择加入（通过响应预检请求）来接收任何看起来像表单提交的请求，因为 CSRF 的威胁并不比表单提交的威胁差。然而，服务器仍然必须提供 `Access-Control-Allow-Origin`的选择，以便与脚本*共享*响应。

如果一个请求**同时满足以下内容的所有条件**，那么这个请求就可被认为是一个简单请求：

1. 请求方法为`GET`，`HEAD`，`POST`之一；
2. 除了用户代理自动设置的标头字段（如`Connection`、`User-Agent`或其他在 Fetch 规范中定义为[禁用标头名称](https://fetch.spec.whatwg.org/#forbidden-header-name)的标头），允许人为设置的字段为 Fetch 规范定义的[对 CORS 安全的标头字段集合](https://fetch.spec.whatwg.org/#cors-safelisted-request-header)，其内容为：
   + `Accept`
   + `Accept-Language`
   + `Content-Language`
   + `Content-Type`，只允许为`text/plain`、`multipart/form-data`或`application/x-www-form-urlencoded`三者之一
   + `Range`，（只允许[简单的范围标头值](https://fetch.spec.whatwg.org/#simple-range-header-value) 如 `bytes=256-` 或 `bytes=127-255`）
3. 如果请求为`XMLHttpRequest`发起的，在其返回实例对象的`upload`属性上没有注册任何的事件监听器；
4. 发送的数据对象不能是一个`ReadableStream`对象。

## 预检请求

与简单请求不同，需要预检的请求要求必须首先使用`OPTIONS`方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求。预检请求是使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。

一个预检请求通常包含这几个请求首部：`Access-Control-Request-Method`、`Access-Control-Request-Headers`以及`Origin`，如果服务器允许这种方式的请求，那么它应该成功响应该预检请求，并在响应头部中标识对应的`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers`以及`Access-Control-Allow-Origin`字段，这几个响应头部字段一般也是必须的，否则即使服务端返回了200的状态码，浏览器也会认为该预检请求未通过。例如下面的示例：

+ 原始请求：

  ```js
  fetch("http://127.0.0.1:8888/post", {
    method: "post",
    headers: {
      "x-hello-world": "hello world",
      "content-type": "application/json",
    },
  })
    .then((response) => response.text())
    .then(console.log);
  ```

  当发起跨源请求时，它不是一个简单请求，它相比于简单请求多了一个自定义头部字段`x-hello-world`，并且它的`content-type`不为简单请求的允许值。下面是它的预检请求报文：

  + 浏览器请求报文：

    ```http
    OPTIONS /post HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate, br
    Accept-Language: en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7,ig;q=0.6
    Access-Control-Request-Headers: content-type,x-hello-world
    Access-Control-Request-Method: POST
    Connection: keep-alive
    Host: 127.0.0.1:8888
    Origin: http://localhost:8888
    Referer: http://localhost:8888/
    Sec-Fetch-Dest: empty
    Sec-Fetch-Mode: cors
    Sec-Fetch-Site: cross-site
    User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36
    ```

    上面的`Access-Control-Request-Method`和`Access-Control-Request-Headers`用于告知服务器实际请求将使用的请求方法`POST`以及携带的自定义请求标头`content-type`和`x-hello-world`。

  + 服务端响应报文：

    ```http
    HTTP/1.1 200 OK
    Access-Control-Allow-Origin: http://localhost:8888
    Access-Control-Allow-Methods: POST
    Access-Control-Allow-Headers: content-type, x-hello-world
    Date: Sun, 04 Feb 2024 08:09:03 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5
    Transfer-Encoding: chunked
    ```

    上面的`Access-Control-Allow-Origin`用于限制请求的源域，`Access-Control-Allow-Methods`限制了请求的方法，最后`Access-Control-Allow-Headers`限制了请求的自定义头部，如果某一项限制与实际请求不符，那么浏览器便会认为该预检请求未通过，从而不发送实际的请求。

## 带身份凭证的请求

一般而言，对于跨源 `XMLHttpRequest` 或 `Fetch` 请求，浏览器**不会**发送身份凭证信息（通常是`cookie`），如果要发送凭证信息，需要设置 `XMLHttpRequest` 对象的某个特殊标志位，或在构造 [`Request`](https://developer.mozilla.org/zh-CN/docs/Web/API/Request) 对象时设置。在发起这类请求时，如果服务端的响应标头中未携带`Access-Control-Allow-Credentials: true`，那么该请求将会受到CORS的限制，浏览器将**不会**把响应内容返回给请求的发送者。

对于预检请求来说，它并不能包含用户身份凭据，但是它的响应必须指定`Access-Control-Allow-Credentials: true`来表明可以携带凭据进行实际的请求，否则实际的请求将会被终止。

在服务器响应携带身份凭证的请求时还有一些额外的限制，如果服务器的响应不满足这些限制，实际的请求同样也会被终止：

+ 服务器**不能**将 `Access-Control-Allow-Origin` 的值设为通配符“`*`”，而应将其设置为特定的域，如：`Access-Control-Allow-Origin: https://example.com`。
+ 服务器**不能**将 `Access-Control-Allow-Headers` 的值设为通配符“`*`”，而应将其设置为标头名称的列表，如：`Access-Control-Allow-Headers: X-PINGOTHER, Content-Type`。
+ 服务器**不能**将 `Access-Control-Allow-Methods` 的值设为通配符“`*`”，而应将其设置为特定请求方法名称的列表，如：`Access-Control-Allow-Methods: POST, GET`。

## 参考资料

+ [本文测试 demo 源码](https://github.com/Xiaoooyooo/demos/tree/master/cors-demo)

+ [跨源资源共享（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
+ [预检请求 Preflight request](https://developer.mozilla.org/zh-CN/docs/Glossary/Preflight_request)
+ [Set-Cookie](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie)
