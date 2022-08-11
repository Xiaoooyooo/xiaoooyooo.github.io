---
title: 浏览器中的事件循环（Event Loop）
date: 2019-10-12 21:16:47
#index_img: https://demos.xiaoooyooo.site/picture?tag=003
tags:
    - 浏览器
    - Event Loop
categories:
    - 浏览器
---
# 浏览器中的事件循环（Event Loop）

## JavaScript运行机制

JavaScript是一门单线程语言，这意味着在同一时间只能做一件事，这是JavaScript这门语言的特点。虽然多线程可以提高效率，但是JavaScript的单线程与它的用途有关。因为JavaScript这门语言主要运行在浏览器上，主要用途就是与用户进行交互以及操作DOM，如果JavaScript是多线程语言，那么如果在一个线程上JavaScript在DOM的一个节点添加了内容，而在另一个线程又删除了这个节点，这时浏览器该如何判断以以哪个为准呢？

所以为了避免更多的复杂性，JavaScript从诞生之初就是一门单线程语言，将来也不会改变。

JavaScript的单线程也就意味着，所有的任务都必须“排队”，只有前一个任务执行完毕了之后，才会开始执行下一个任务，而如果前一个任务执行时间太长，后面的任务也不得不等着。鉴于此，JavaScript的设计者将任务类型分为两种：同步任务和异步任务。同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。大致过程如下图所示。

![](http://www.ruanyifeng.com/blogimg/asset/2014/bg2014100801.jpg)

如图，左边是主线程，右边是异步任务队列，对于主线程，所有的同步任务都在这里执行；对于异步任务队列，只有当一个异步任务执行完毕之后，相应的回调函数会被放入到异步任务队列末尾。等到主线程所有的任务执行完毕过后，JavaScript引擎就会读取处于异步任务队列中首位的任务并放入到主线程中执行，如此往复，这个过程就叫事件循环（Event Loop）。

## 事件循环（Event Loop）

所谓的事件循环，简单理解就是JavaScript引擎不断地读取主线程执行栈中的任务，有就执行，没有就进入下一个循环。而难点就在于异步任务队列中的任务进入主线程的时机。

对于所有的异步任务，可以分为两类：

+ 宏任务
  + setTimeout
  + setInterval
  + setImmediate（Node）
  + requestAnimationFrame（浏览器）
  + I/O
  + UI rendering（浏览器）
+ 微任务
  + process.nextTick（Node）
  + Promise
  + Object.observe
  + MutationObserver

宏任务在满足执行条件之后，会把相应的回调函数加入到宏队列中，而微任务则会加入到微队列中。本文就浏览器端做主要叙述。下图详细展示了浏览器的事件循环机制：

![]( https://user-gold-cdn.xitu.io/2018/9/5/165a8667bb6e623e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

下面是我个人对于这个过程的理解：

1. JavaScript引擎首先执行主线程中的同步任务（上图的stack），等到所有的任务执行完毕之后，此时主线程执行栈为空，进入第二步；
   + 在这个过程中，异步任务会在其他线程执行，等到执行完毕之后，就会把相应的回调函数添加到相应的异步任务队列中；
2. JavaScript引擎读取位于微任务队列（上图中的Microtask Queue）中首位的任务，并放入到主线程执行栈中执行，直到微任务队列为空，进入第三步；
   + 在这个过程中如果其他的微任务执行完毕，则相应的回调函数也会被添加的微任务队列末尾；
   + 如果遇到宏任务，则将相应回调添加到宏任务队列末尾；
3. JavaScript引擎读取宏任务队列（上图中的Task Queue）中位于首位的任务，并放入到主线程执行栈中执行，在每执行完毕一个任务之后，进入第四步；
   + 在此过程中如果遇到了其他异步任务，则同样在适当时机将回调函数添加到微任务或宏任务队列末尾；
4. JavaScript引擎检查微任务队列，如果微任务队列中有待执行任务，则回到第二步；否则回到第三步；如此往复......

了解了基本概念，接下来看几个实例：

```js
console.log(1);

setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3)
  });
});

new Promise((resolve, reject) => {
  console.log(4)
  resolve(5)
}).then((data) => {
  console.log(data);
})

setTimeout(() => {
  console.log(6);
})

console.log(7);
```

过程解析：

1. console.log(1)为同步任务，执行并输出1；

2. setTimeout为异步任务， 那么将其回调函数注册后分发到宏任务队列；

3. new Promise为同步任务，立即执行console.log(4)，输出4，then中回调在适当时机被添加到微任务队列；

4. setTimeout在适当时机回调添加到宏任务队列；

5. console.log(7)立即执行，输出7；

6. 所有同步任务执行完毕，检查微任务队列，输出5；

7. 微任务队列执行完毕，检查宏任务队列，首先执行：

   ```js
   console.log(2);
   Promise.resolve().then(() => {
       console.log(3)
   });
   ```

   输出2，并把Promise回调添加到微任务队列；

8. 微任务队列不为空，执行回调并输出3；

9. 微任务队列为空，检查宏任务队列，执行回调输出6；

10. 最终结果为：1 4 7 5 2 3 6

## 事件循环中的 async 和 await

关于async和await的用法我不打算叙述，具体可以看一下后面的参考资料。

在一个事件循环中 await 做了什么？

从字面意思上看await就是等待，await 等待的是一个表达式，这个表达式的返回值可以是一个promise对象也可以是其他值。 **实际上await是一个让出线程的标志**。await后面的函数会先执行一遍，然后就会跳出整个async函数来执行后面的本轮循环中的同步代码。等本轮事件循环执行完了之后又会跳回到async函数中等待await后面表达式的返回值，如果返回值为非promise则继续执行async函数后面的代码，否则将返回的promise放入微任务队列。结合具体的例子：

```js
async function a1 () {
    console.log('a1 start')
    await a2()
    console.log('a1 end')
}
async function a2 () {
    console.log('a2')
}

console.log('script start')

setTimeout(() => {
    console.log('setTimeout')
}, 0)

Promise.resolve().then(() => {
    console.log('promise1')
})

a1()

let promise2 = new Promise((resolve) => {
    resolve('promise2.then')
    console.log('promise2')
})

promise2.then((res) => {
    console.log(res)
    Promise.resolve().then(() => {
        console.log('promise3')
    })
})
console.log('script end')
```

过程解析：

1. 执行到`console.log("script start")`，输出“script start”；

2. setTimeout回调在适当时机放入宏任务队列；

3. Promise.resolve().then回调放入微任务队列；

4. 调用函数a1，进入函数内部

   1. 立即执行`console.log('a1 start')`，输出“a1 start”；
   2. 关键字await，立即执行函数a2，进入函数内部；
      1. 立即执行`console.log('a2')`，输出“a2”，退出函数；
   3. 交出线程，执行外部**同步代码**；

5. new Promise立即执行内部同步任务，输出“promise2”；

6. 立即执行`console.log('script end')`，输出“script end”；

7. 同步代码执行完毕，检查微任务队列，存在一个任务（3）：

   1. 执行回调：

      ```js
      () => {
          console.log('promise1')
      }
      ```

      输出“promise1”；

8. 检查宏任务队列，空，本轮事件循环结束；

9. 下一轮事件循环开始之前，回到a1函数内部awiat关键词处，awiat等到结果，继续执行函数a1：

   1. 立即执行`console.log('a1 end')`，输出“a1 end”；
   2. 函数a1执行完毕，退出函数；

10. 进入下一个事件循环，promise2.then回调放入微任务队列；

11. 检查微任务队列，存在一个任务（9）：

    1. 执行第一个回调：

       ```js
       (res) => {
           console.log(res)
           Promise.resolve().then(() => {
               console.log('promise3')
           })
       }
       ```

       执行`console.log(res)`，输出“promise2.then”，并将Promise.resolve().then回调放入微任务队列

    2. 微任务队列临时增加，所以继续执行下一个回调：

       ```js
       () => {
               console.log('promise3')
       }
       ```

       输出“promise3”，微任务队列执行完毕；

12. 进入下一事件循环，检查宏任务队列，存在一个任务（2）

    1. 执行第一个回调：

       ```js
       () => {
           console.log('setTimeout')
       }
       ```

       输出“setTimeout”，宏任务队列为空，微任务队列为空；

13. 执行完毕，最终输出顺序为：

    > script start
    > a1 start
    > a2
    > promise2
    > script end
    > promise1
    > a1 end
    > promise2.then
    > promise3
    > setTimeout



## 参考资料

+ [JavaScript 运行机制详解：再谈Event Loop]( http://www.ruanyifeng.com/blog/2014/10/event-loop.html )

+ [带你彻底弄懂Event Loop]( https://juejin.im/post/5b8f76675188255c7c653811 )

+ [从event loop到async await来了解事件循环机制]( https://juejin.im/post/5c148ec8e51d4576e83fd836 )

+ [async/await 执行顺序详解](https://www.cnblogs.com/lpggo/p/8127604.html)