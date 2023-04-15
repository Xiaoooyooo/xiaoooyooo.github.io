---
title: 记 aes 加密实践
date: 2023-01-12 21:34:41
tags:
    - 加密
    - aes
categories: 
    - 加密
---

```js
var encrypt, decrypt;
(async function (root) {
  const keyStr = "1234567890ABCDEF"; // 加密的 key
  const ivStr = "ABCDEF1234567890"; // aes cbc 加密必需 iv 参数
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keyStr),
    {
      name: "AES-CBC",
      length: 128,
    },
    false,
    ["encrypt", "decrypt"]
  );
  // console.log(key);
  root.encrypt = async function (data) {
    const res = await crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: encoder.encode(ivStr),
      },
      key,
      encoder.encode(data)
    );
    // console.log(res);
    const hashArr = Array.from(new Uint8Array(res));
    const hashStr = hashArr
      .map((el) => el.toString(16).padStart(2, "0"))
      .join("");
    return hashStr;
  };

  root.decrypt = async function (data) {
    // todo data 格式校验
    const hexArr = [];
    const reg = /\w{2}/g;
    let m = reg.exec(data);
    while (m) {
      hexArr.push(m[0]);
      m = reg.exec(data);
    }
    // console.log(hexArr);
    const hashArr = hexArr.map((el) => parseInt(el, 16));
    const uint8Arr = new Uint8Array(hashArr);
    // console.log(uint8Arr);
    const res = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: encoder.encode(ivStr),
      },
      key,
      uint8Arr
    );
    const resStr = decoder.decode(res);
    return resStr;
  };

  const enc = await encrypt("123");
  console.log(enc);
  const dec = await decrypt(enc);
  console.log(dec);
})(window);

```

## 参考资料

+ [Crypto - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Crypto)
+ [subtle - Crypto - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle)