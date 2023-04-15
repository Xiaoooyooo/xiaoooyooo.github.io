---
title: 在项目中使用 tailwindcss
date: 2023-04-13 09:56:51
tags:
  - css
  - tailwind
categories:
  - css
---

# tailwind 配置

## 安装

```bash
npm i autoprefixer postcss tailwindcss -D
# or
yarn add autoprefixer postcss tailwindcss --dev
```

## 配置

`tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

`postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

## 参考资料

+ [Get started with Tailwind CSS](https://tailwindcss.com/docs/installation)