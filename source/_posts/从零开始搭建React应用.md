---
title: 从零开始搭建一个React APP
date: 2021-03-21 12:58:26
tags:
	- 前端框架
	- React
categories:
	- React
---

# 从零开始搭建一个React APP

Facebook早已为开发者提供了一个搭建React APP的工具，即[create-react-app](https://github.com/facebook/create-react-app)，但怀着学习的态度，我还是想要了解一下如何使用Node从零搭建一个React APP的开发环境，因此我写下了这篇日志。

## 准备工作

1. 创建应用文件夹

2. 使用`npm init`初始化当前文件夹，使用`git init`初始化git仓库

3. 创建目录结构如下：

   > .
   >
   > +-- public
   > +-- src

4. 考虑到在提交至git仓库时我们并不希望打包后的文件和node模块中的文件被一同提交，我们在当前目录新建一个`.gitignore`文件用于排除特定的文件，其内容如下：

   > /node_modules
   >
   > /dist

5. `public`文件夹用于保存一些静态资源文件，最重要的是保存用于呈现我们的React APP的index.html文件，index.html文件的内容如下：

   ```html
   <!-- sourced from https://raw.githubusercontent.com/reactjs/reactjs.org/master/static/html/single-file-example.html -->
   <!DOCTYPE html>
   <html>
   
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
     <title>React Starter</title>
   </head>
   
   <body>
     <!-- 呈现React应用 -->
     <div id="root"></div>
     <noscript>
       You need to enable JavaScript to run this app.
     </noscript>
     <!-- 导入打包后的文件 -->   
     <script src="../dist/bundle.js"></script>
   </body>
   
   </html>
   ```

## Babel

使用`npm install --save-dev @babel/core@7.1.0 @babel/cli@7.1.0 @babel/preset-env@7.1.0 @babel/preset-react@7.0.0`安装Babel及其一些功能包（@后面是版本号，用于手动指定安装版本）。其中`babel-core`是babel的主要功能包，`babel-cli`允许我们在命令行编译文件，`preset-env`及`preset-react`帮我们预设了一些代码转换风格，不同的是后者是将JSX语法转为传统的JS语法。

在工程文件根目录创建`.babelrc`，告诉babel我们将要使用`env`与`react`转换风格

```json
{
    "presets": ["@babel/env","@babel/preset-react"]
}
```

## Webpack

安装webpack所需要的一些包`npm install --save-dev webpack@4.19.1 webpack-cli@3.1.1 webpack-dev-server@3.1.8 style-loader@0.23.0 css-loader@1.0.0 babel-loader@8.0.2`。webpack使用不同的loader来处理不同类型的文件以进行打包。新建`webpack.config.js`文件，其内容如下：

```js
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/dist/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3000,
    publicPath: "http://localhost:3000/dist/",
    hotOnly: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};
```

## React

首先安装React的两个依赖：`react`和`react-dom`，然后在index.js文件中引入react，并告诉react我们需要呈现内容的位置：

```js
import React from 'react';
import ReactDom from 'react-dom';
import App from './App.js'

ReactDom.render(App, document.getElementById('root'))
```

`ReactDom.render`是一个函数，用于告诉react我们用什么在何处呈现内容，例如此处意思是我们将要使用一个叫App的组件（稍后创建）渲染在`id=root`的元素中。

现在，在src文件夹中创建一个App.js文件，其内容如下：

```js
import React, {Component} from 'react';
import './App.css';

class App extends Components {
    render(){
        return (
        	<div className='app'>
            	<h1>Hello React</h1>
            </div>
        )
    }
}
export default App
```

注意上文中引入了css文件。

至此我们拥有了一个能够运行的React APP，此时我们的目录结构应该是这样的：

> .
> +-- public
> | +-- index.html
> +-- src
> | +-- App.css
> | +-- App.js
> | +-- index.js
> +-- .babelrc
> +-- .gitignore
> +-- package-lock.json
> +-- package.json
> +-- webpack.config.js

使用`npx webpack serve`运行。

## 结语

至此，一个不需要使用`create-react-app`的React APP已经搭建完成了。

## 参考资料

+ [Creating a React App… From Scratch.](https://blog.usejournal.com/creating-a-react-app-from-scratch-f3c693b84658)

