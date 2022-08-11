---
title: ES6-async
date: 2019-10-08 15:08:45
tags:
	- JavaScript
	- ES6
categories:
	- JavaScript
---

# ES6-async

ES2017 标准引入了 async 函数，使得异步操作变得更加方便。

async 函数是什么？一句话，它就是 Generator 函数的语法糖。`async`函数对 Generator 函数的改进，体现在以下四点：

+ 内置执行器

  `async`函数的执行，与普通函数一模一样，只要一行

  ```js
  async function asyncFn(){}
  //执行async函数
  asyncFn()
  ```

+ 更好的语义

  `async`和`await`，比起星号和`yield`，语义更清楚了。`async`表示函数里有异步操作，`await`表示紧跟在后面的表达式需要等待结果。

+ 更广的适用性

  `async`函数的`await`命令后面，可以是 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）。

+ 返回值是 Promise 

  `async`函数的返回值是 Promise 对象，这比 Generator 函数的返回值是 Iterator 对象方便多了。你可以用`then`方法指定下一步的操作。

## 基本用法

`async`函数返回一个 Promise 对象，可以使用`then`方法添加回调函数。当函数执行的时候，一旦遇到`await`就会先返回，等到异步操作完成，再接着执行函数体内后面的语句。

```js
function timeout(time){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("Hello World!")
        },time)
    })
}
async function asyncFn(){
    let msg = await timeout(1000)
    console.log(msg)
}
asyncFn()
//1秒后输出：Hello World!
```

由于`async`函数返回的是 Promise 对象，可以作为`await`命令的参数。所以，上面的例子也可以写成下面的形式：

```js
async function timeout(ms){
    let msg = await new Promise(resolve => {
        setTimeout(()=>{
            resolve("Hello World!")
        },ms)
    })
    return msg	//这里的msg是Promise对象，不是resolve的结果
}
async function asyncFn(ms){
    let msg = await timeout(ms)
    console.log(msg)
}
asyncFn(2000)
//2秒后输出：Hello World!
```

## 语法

### 返回Promise对象

`async`函数返回一个 Promise 对象，并且函数内部`return`语句返回的值，会成为`then`方法回调函数的参数。

```js
async function asyncFn(){
    return "Hello World!"
}
asyncFn().then(msg => {
    console.log(msg)
})
//Hello World!
```

`async`函数内部抛出错误，会导致返回的 Promise 对象变为`reject`状态。抛出的错误对象会被`catch`方法回调函数接收到。

```js
async function asyncFn(){
    throw 'Error'
}
asyncFn().then(msg => console.log(msg)).catch(err => console.log(err))
//Error
```

### Promise 对象的状态变化

`async`函数返回的 Promise 对象，必须等到内部所有`await`命令后面的 Promise 对象执行完，才会发生状态改变，除非遇到`return`语句或者抛出错误。也就是说，只有`async`函数内部的异步操作执行完，才会执行`then`方法指定的回调函数。

### await命令

正常情况下，`await`命令后面是一个 Promise 对象，返回该对象的结果。如果不是 Promise 对象，就直接返回对应的值。

```js
async function f() {
  // 等同于
  // return 123;
  return await 123;
}

f().then(v => console.log(v))
// 123
```

另一种情况是，`await`命令后面是一个`thenable`对象（即定义`then`方法的对象），那么`await`会将其等同于 Promise 对象。

```js
let obj = {
    then:function(resolve,reject){
        setTimeout(()=>{
            resolve("Hello World!")
        },1000)
    }
}
let asyncFn = async function(){
    let msg = await obj
    log(msg)
}
asyncFn()
//1秒后输出：Hello World!
```

上面代码中，`await`命令后面是一个`Sleep`对象的实例。这个实例不是 Promise 对象，但是**因为定义了`then`方法，`await`会将其视为`Promise`处理**。

`await`命令后面的 Promise 对象如果变为`reject`状态，则`reject`的参数会被`catch`方法的回调函数接收到。任何一个`await`语句后面的 Promise 对象变为`reject`状态，那么整个`async`函数都会中断执行。

```js
async function asyncFn(){
    await Promise.reject("Error")
    //下面的代码不会被执行
    return await new Promise((resolve,reject) => {
        setTimeout(()=>{
            resolve("Hello")
        },1000)
    })
}
asyncFn().then(res => console.log(res)).catch(err => console.log(err))
//Error
```

有时，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时有两种解决办法：

+ 将可能出错的语句放入try...catch结构中

  ```js
  async function asyncFn(){
      try{
          await Promise.reject("Error")
      }catch(e){
          console.log(e)
      }
      return new Promise((resolve,reject) => {
          resolve("message")
      })
  }
  asyncFn().then(res => console.log(res))
  //Error
  //message
  ```

+ 在可能出错的语句后面加上catch方法

  ```js
  async function asyncFn(){
      Promise.reject("Error").catch(err => console.log(err))
      return new Promise((resolve,reject) => {
          resolve("message")
      })
  }
  asyncFn().then(res => console.log(res))
  //Error
  //message
  ```

### 错误处理

如果`await`后面的异步操作出错，那么等同于`async`函数返回的 Promise 对象被`reject`。

`async`函数内部任何错误都会被视为返回的Promise对象被`reject`

```js
async function asyncFn(){
    await new Promise((resolve,reject) => {
        throw 'Error'
    })
}
asyncFn().catch(err => console.log(err))
//Error
```

### 注意事项

1. `await`命令后面的`Promise`对象，运行结果可能是`rejected`，所以最好把`await`命令放在`try...catch`代码块中，或者在可能出错的Promise对象后面加上`catch`方法。

2. 多个`await`命令后面的异步操作，如果不存在继发关系，最好让它们同时触发。

   ```js
   // 写法一
   let [foo, bar] = await Promise.all([getFoo(), getBar()]);
   
   // 写法二
   let fooPromise = getFoo();
   let barPromise = getBar();
   let foo = await fooPromise;
   let bar = await barPromise;
   ```

3. `await`命令只能用在`async`函数之中，如果用在普通函数，就会报错。

4. async 函数可以保留运行堆栈。