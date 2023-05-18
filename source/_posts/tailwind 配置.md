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

`index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`main.tsx`
```tsx
import "./index.css";
```

`webpack.config.js`
```js
const minicss = require("mini-css-extract-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        // yarn add mini-css-extract-plugin css-loader postcss-loader --dev
        use: [minicss.loader, "css-loader", "postcss-loader"],
      },
    ]
  }
}
```

## 参考资料

+ [Get started with Tailwind CSS](https://tailwindcss.com/docs/installation)