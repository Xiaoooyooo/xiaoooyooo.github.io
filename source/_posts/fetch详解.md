---
title: fetch详解
date: 2022-3-25 20:12:36
categories:
	- JavaScript
tags:
	- JavaScript
	- 浏览器
  - 网络
---

# fetch详解

`fetch`为一种新的获取网络资源的接口，它提供了相比与`XMLHTTPRequest`更为丰富灵活的功能。Fetch 提供了对 `Request` 和 `Response`（以及其他与网络请求有关的）对象的通用定义。它同时还为有关联性的概念，例如 CORS 和 HTTP 原生头信息，提供一种新的定义，取代它们原来那种分离的定义。

## 使用

`fetch`接收两个参数：

+ `url:`字符串，表示网络资源的实际地址

+ `initOption:`可选参数，类型为对象，其中的可选字段为：
  
  + `method`: 请求使用的方法，如 `GET`、`POST`。
  - `headers`: 请求的头信息，形式为 `Headers` 的对象或包含 [`ByteString`](https://developer.mozilla.org/zh-CN/docs/conflicting/Web/JavaScript/Reference/Global_Objects/String) 值的对象字面量。
  - `body`: 请求的 body 信息：可能是一个 `Blob`、`BufferSource` 、`FormData`、`URLSearchParams` 或者 `USVString`对象。注意 GET 或 HEAD 方法的请求不能包含 body 信息。
  - `mode`: 请求的模式，如 `cors`、`no-cors` 或者 `same-origin`。
  - `credentials`: 请求的 credentials，如 `omit`、`same-origin` 或者 `include`。为了在当前域名内自动发送 cookie，必须提供这个选项，从 Chrome 50 开始，这个属性也可以接受 `FederatedCredential` 实例或是一个 `PasswordCredential` 实例。
  - `cache`:  请求的 cache 模式：`default`、 `no-store`、 `reload` 、 `no-cache`、 `force-cache` 或者 `only-if-cached`。
  - `redirect`: 可用的 redirect 模式：`follow` (自动重定向), `error` (如果产生重定向将自动终止并且抛出一个错误），或者 `manual` (手动处理重定向)。在 Chrome 中默认使用 `follow`（Chrome 47 之前的默认值是 `manual`）。
  - `referrer`: 一个 `USVString`可以是 `no-referrer`、`client` 或一个 URL。默认是 `client`。
  - `referrerPolicy`: 指定了 HTTP 头部 referer 字段的值。可能为以下值之一：`no-referrer`、 `no-referrer-when-downgrade`、`origin`、`origin-when-cross-origin`、 `unsafe-url`。
  - `integrity`: 包括请求的 [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) 值（例如： `sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=`）。
  - `signal`: 与`AbortController`结合，用于取消请求。

## 响应

无论`fetch`的结果如何，它都将返回一个`Promise`，并resolve一个`Response`对象，其中包含的信息如下：

+ `headers` 只读，包含此 Response 所关联的 `Headers` 对象。

+ `ok` 只读,包含了一个布尔值，标示该 Response 成功（HTTP 状态码的范围在 200-299）。

+ `redirected` 只读，表示该 Response 是否来自一个重定向，如果是的话，它的 URL 列表将会有多个条目。

+ `status` 只读，包含 Response 的状态码（例如 `200` 表示成功）。

+ `statusText` 只读，包含了与该 Response 状态码一致的状态信息（例如，OK 对应 `200`）。

+ `type` 只读，包含 Response 的类型（例如，`basic`、`cors`）。

+ `url` 只读，包含 Response 的 URL。

+ `useFinalURL` 包含了一个布尔值，来标示这是否是该 Response 的最终 URL。

+ `body` 只读，一个简单的 getter，用于暴露一个 [`ReadableStream`](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream) 类型的 body 内容。

+ `bodyUsed` 只读，包含了一个布尔值来标示该 Response 是否读取过 `Body`。

**注意：** 如果是请求已经发出，但是未找到目标服务器ip，或目标服务器未实现接口，导致`fetch`未接收到response，那么它会reject一个错误。

## 封装实践

```js
/**
 * @param {string} method 
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns {Promise}
 */
async function request(method = "get", url, options = {}) {
  let res, err;
  await fetch(url, {
    method: method,
    ...options,
  })
    .then(
      async function responseHanlder(response) {
        console.log(response);
        if (!response.ok) {
          // 接收到了响应，但是不是成功的响应（HTTP 状态码的范围不在 200-299）
          const text = await response.text();
          const error = {
            code: response.status,
            statusText: response.statusText,
          };
          try {
            // 假设服务器响应数据格式为 { code, message, data }
            const json = JSON.parse(text);
            return Promise.reject({
              ...error,
              message: json.message,
            });
          } catch (err) {
            return Promise.reject({
              ...error,
              text: text,
            });
          }
        }
        return response.json();
      },
      function requestErrorHandler(err) {
        // 请求已被发出，但是未接收到任何响应
        return Promise.reject({
          code: 0,
          message: err.message,
        });
      }
    )
    .then((_res) => {
      res = _res;
    })
    .catch((_err) => {
      err = _err;
    });
  if (res) {
    // TODO 处理成功
    console.log(res);
  } else if (err) {
    // TODO 处理失败
    console.log("error", err);
  }
}
```

## 参考资料

+ [fetch - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch)

+ [Request - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Request/Request)

+ [Response - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)

+ [Headers - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Headers)


