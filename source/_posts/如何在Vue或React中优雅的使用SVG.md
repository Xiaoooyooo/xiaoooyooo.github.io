---
title: 如何在Vue或React中优雅的使用SVG
date: 2022-2-23 21:48:25
tag:
  - React
  - Vue
  - Webpack
categories:
  - Webpack
---

# 如何在Vue或React中优雅的使用SVG

最近做的项目中使用了很多的[SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG)，按照我以往的做法，我会直接将SVG代码拷贝到所需要的HTML(React JSX或Vue Template)文件中，但是最近这个项目使用的太多了，挨个拷贝不仅很麻烦，而且还会导致代码量十分巨大，这部分代码显然是没必要的。于是我尝试寻找减少代码量的方法，并将其记录在此。

**注：**本文以React示例，Vue同理。

首先安装`svg-sprite-loader`：

```bash
yarn add svg-sprite-loader --dev
```

这个loader帮我们将svg图片打包合并在一起，并全部添加到`<head />`中，我们可以在后文以`<use href="xxx" />`的形式使用其中的图片。

然后修改Webpack配置文件，添加一条rule：

```js
rules: [
    {
        test: /\.svg/,
        use: ["svg-sprite-loader"]
    }
]
```

然后定义一个组件`SvgIcon`：

```jsx
function SvgIcon (props) {
  const { icon } = props;
  const iconName = `#${icon}`;
  return (
    <svg>
      <use href={iconName} />
    </svg>
  );
}
```

注意`SvgIcon`中的代码，这个组件接受一个参数，及所需要使用的图片的**id**（注意id前面有个`#`），这个id默认情况下是该svg图片的文件名称，但是我们可以修改它。添加`svg-sprite-loader`的options字段：

```js
rules: [
    {
        test: /\.svg/,
        use: [{
            loader: "svg-sprite-loader",
            options: {
                // 可以是一个字符串，或一个返回字符串的函数
                symbolId: filename => {
                  return path.basename(filename).replace(/\.svg$/, "");
                }
                // or just use 
                // symbolId: "[name]",
            }
        }]
    }
]
```

接下来我们就可以在组件中用以下方式使用svg图片，例如我有一个svg图片`icon.svg`，我们只需在入口文件引入该图片，即可在任何地方使用该图片：

```jsx
// main.jsx
import "./svgs/icon.svg";

// App.jsx
function App() {
  return (
    <div>
      <SvgIcon icon="icon" />
    </div>
  );
}
```

## 引入优化

svg文件太多的情况下，挨个引入也是一件麻烦事，这里我们可以使用`require.context`自动引入所有的svg图片。关于`require.context`的说明，请看[这里](https://webpack.js.org/guides/dependency-management/#requirecontext)。

比如我们有如下文件结构：

> |---svg
>        |---a.svg
>        |---b.svg
>        |---c.svg

只需要在svg文件夹内新增一个js文件，这里我命名为`index.js`：

```js
function importAll (r) {
    r.keys().forEach(r);
}

const context = require.context("./", false, /\.svg$/);
importAll(context);
```

并在入口文件引入该js文件:

```js
// main.jsx
import "svg/index.js";
```

这个方式webpack或自动帮我们引入svg文件夹下以`.svg`结尾的文件，从而减少我们的代码量。

最后附上[本文源码](https://github.com/Xiaoooyooo/demos/tree/master/svg-sprite)

## 参考资料

+ [svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader)
+ [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG)
+ [require.context](https://webpack.js.org/guides/dependency-management/#requirecontext)

