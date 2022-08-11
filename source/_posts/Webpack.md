---
title: Webpack
date: 2019-09-29 20:59:19
#index_img: https://demos.xiaoooyooo.site/picture?tag=015
tags:
	- Webpack
	- Node.js
categories:
	- 前端工具
---

# Webpack

## 安装及使用

```bash
npm i webpack -D
npm i webpack-cli -D
```

## 基本配置

```js
/** webpack.config.js **/
module.exports = {
    mode:"",
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    entry:"",
    output:"",
    module:{
        rules:[]
    },
    plugins:{},
}
```

## 配置参数

### mode

配置开发或生产环境，`development` 或 `production`。

### devtool

`inline-source-map`: 打包后代码运行出错时映射详细错误信息

### devServer

配置热更新相关

```js
devServer: {
    contentBase: '/dist',	//服务文件夹
    historyApiFullback: true	//当使用浏览器history模式时防止刷新出错（只返回同一个文件），值可设为对象进行详细设置
}
```

### entry

配置打包入口文件，有两种配置方式。

1. **单入口文件模式**

   字符串，入口文件的位置

   ```js
   entry:"./main.js"
   ```

2. **多入口文件模式**

   对象，对象的属性为每个入口文件 [name] ，值为每个入口文件的位置

   ```js
   entry:{
       fileOne: './fileOne.js',
       fileTwo: './fileTwo.js',
       //...
   }
   ```

### output

配置打包后的文件一些属性

```js
output:{
    publicPath: "/",	//在引入静态资源时，从根路径开始引入
    filename: 'filename.js',	//打包后的文件名
    //如果指定了多个入口文件，为了将打包后的文件相区别，可以在filename属性中嵌入一些关键字眼如[name]，例如	filename:"[filename].bundle.js"
    path: path.resolve(__dirname,'dist')	//字符串，打包后文件的路径
}
```

### module

配置一些 loader 参数

```js
module:{
    rules:[
        {
            test:/\.scss$/,	//给.scss文件应用以下的打包规则
            use: ['style-loader','css-loader','sass-loader']	//.scss文件的打包规则，这几个loader的顺序不能乱，没有则使用 npm 安装
        }
    ]
}
```

### plugins

配置一些插件，具体[请看这里](https://webpack.js.org/plugins/)，按需使用

常用插件

> [htmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin)
>
> [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin)

## 在webpack中使用Vue

1. 首先需要安装相应的依赖：`vue`，`vue-loader`，`vue-template-compiler`

2. 编辑webpack配置文件：

	```js
    /* 第一步：引入vue-loader插件 */
    const VueLoaderPlugin = require('vue-loader/lib/plugin')
    module.exports = {
        //...
        module:{
            /* 第二步：编写规则 */
            rules:[
                test: /\.vue$/,
                ues: ['vue-loader']
            ]
        },
        plugins:[
            /* 第三步：实例化插件 */
            new VueLoaderPlugin()
        ]
        //...
    }
	```

## 在webpack中使用Sass

1. 安装相应的依赖：`style-loader`，`css-loader`，`sass-loader`，`node-sass`

2. 编辑webpack配置文件：

   ```js
   module.exports = {
       //...
       module:{
           rules:[
               {
                   test: /\.scss$/,
                   use: ['style-loader','css-loader','sass-loader']
               }
           ]
       }
       //...
   }
   ```

## 在webpack中使用babel

1. 安装需要的包

   ```bash
   npm install babel-loader @babel/core @babel/preset-env -S
   # babel-loader			babel-loader
   # @babel/core			babel核心功能包
   # @babel/preset-env		babel提供的转换规则
   # @babel/polyfill		为低版本浏览器提供不支持的api
   ```

2. 编辑webpack配置文件

   ```js
   module:{
       rules:[
           {
               test:/\.js$/,
               exclude: /(node_modules|bower_components)/,	//排除一些文件夹
               use:{
               	loader:'babel-loader',
                   options:{
                       presets: ['@babel/preset-env']
                   }
               }
           }
       ]
   }
   ```

## 一个配置文件示例

```js
const path = require('path')

/**
 * 引入一些插件
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
/**
 * webpack安装：
 *  npm i webpack -D
 *  npm i webpack-cli -D
 */

module.exports = {
    //打包模式：开发环境(development)，线上环境(production)
    mode:'development',
    //打包后代码运行出错时映射详细错误信息
    devtool: 'inline-source-map',
    /** 
     * 开启热更新 npm i webpack-dev-server -D
     *  npx webpack-dev-server --open
     */
    devServer: {
        contentBase: './dist',
        historyApiFallback: true,//防止history模式刷新出错
    },
    //打包入口文件，相对路径
    // entry:'./main.js',
    entry:{
        one: './a.js',
        main: './main.js'
    },
    //打包出口文件配置
    output:{
        //统一资源引用根路径
        publicPath: '/',
        //文件名
        filename: '[name].bundle.js',
        //文件路径
        path: path.resolve(__dirname,'dist')
    },
    //插件
    plugins:[
        new HtmlWebpackPlugin({
            filename:'index.html',
            title:"摩西摩西",
            template: "./src/template.html"
        }),
        new CleanWebpackPlugin(),
        new VueLoaderPlugin()
    ],
    //模块
    module:{
        rules:[
            {
              	test: /\.vue$/,
                use: ['vue-loader']
            },
            {
                /**
                 * 处理文件名后缀为.scss 的文件
                 *  npm i style-loader css-loader sass-loader node-sass -D
                 */
                test: /\.scss$/,
                //用以下 loader 处理，顺序不能换
                use:['style-loader','css-loader','sass-loader']
            },
            {
                /**
                 * 处理图像
                 * npm i file-loader -D
                 */
                test:/\.(png|jpg)$/,
                use: ['file-loader']
            },
            {
                /**
                 * 字体处理
                 */
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use:'file-loader'
            },
            {
                test:/\.js$/,
                //排除node包文件夹
                exclude:/node_modules/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}
```

## 参考资料

+ [webpack官方文档](https://www.webpackjs.com/guides/getting-started/)

+ [在webpack中使用babel](https://www.cnblogs.com/EricZLin/p/9409235.html)