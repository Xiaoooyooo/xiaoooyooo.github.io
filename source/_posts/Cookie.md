---
title: Cookie
date: 2020-04-09 14:11:32
tags:
	- 浏览器
	- 服务器
	- 数据存储
categories:
	- 数据存储
---

# Cookie

## Cookie是什么

HTTP Cookie（也叫Web  Cookie或浏览器Cookie）是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态。Cookie使基于[无状态](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#HTTP_is_stateless_but_not_sessionless)的HTTP协议记录稳定的状态信息成为了可能。

Cookie主要用于以下三个方面：

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

Cookie曾一度用于客户端数据的存储，因当时并没有其它合适的存储办法而作为唯一的存储手段，但现在随着现代浏览器开始支持各种各样的存储方式，Cookie渐渐被淘汰。由于服务器指定Cookie后，浏览器的每次请求都会携带Cookie数据，会带来额外的性能开销（尤其是在移动环境下）。 

## 如何创建Cookie

当服务器收到HTTP请求时，服务器可以在响应头里面添加一个`Set-Cookie`选项。浏览器收到响应后通常会保存下Cookie，之后对该服务器每一次请求中都通过`Cookie`请求头部将Cookie信息发送给服务器。另外，Cookie的过期时间、域、路径、有效期、适用站点都可以根据需要来指定。

以下是在koa中创建Cookie的示例：

```js
app.use(async (ctx,next)=>{
    //创建cookie
    ctx.cookies.set("test","Hello World")
    
    //获取cookie
    ctx.cookies.get('test')
})
```
上面的代码创建了一个名为`test`的cookie，其值为`Hello World`，在浏览器接收到该响应头时，会自动保存这条cookie记录，并且在下次访问（请求）该页面时自动在请求头中带上这条cookie。

koa中`ctx.cookies.set`的第三个参数为一个对于该条cookie的藐视对象，该对象有以下属性：

+ maxAge：该条cookie的最长有效时间，毫秒值
+ signed：布尔值，指示该cookie是否为签名字符串
+ expires：该条cookie的失效时间
+ path： 指定了主机下的哪些路径可以接受Cookie
+ domain： 指定了哪些主机可以接受Cookie。默认为当前文档的主机（不包含子域名）
+ secure：标记为 `Secure` 的Cookie只应通过被HTTPS协议加密过的请求发送给服务端
+ httpOnly：标记为`httpOnly`的Cookie不能被本地JavaScript脚本调用
+ overwrite：是否重写与当前cookie重名的cookie
+  sameSite：布尔值或字符串（true：strict，false：lax），指示cookie是否为“相同站点” cookie

## 参考资料

+ [HTTP cookies](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)