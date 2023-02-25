---
title: Vue Router 进阶
date: 2019-10-15 21:14:57
#index_img: https://demos.xiaoooyooo.site/picture?tag=012
tags:
	- Vue
	- Vue Router
categories:
	- Vue
---

# Vue Router 进阶

## 导航守卫

简单来说就是在路由进行转跳或取消时执行的一系列函数，导航守卫分为三类：全局的，单个路由的，以及组件级的

需要注意的时，当仅仅只有参数或者查询字符串发生变化时并不会触发导航守卫

### 全局前置守卫

在Router的实例上进行注册，例如：

```js
const router = new Router({/*...*/})

router.beforeEach(function(to,from,next){
    //...
    next()
})
```

`router.beforeEach`接收三个参数：

+ `to`：即将进入的路由对象（$route）
+ `from`：正要离开的路由对象
+ `next`：函数，一系列的操作完毕后一定要调用`next()`来resolve这个导航守卫，否则将不会正确转跳到点击的路由页面。`next()`还可接收字符串或路由对象作为参数：
  + `next(false)`：中断当前导航
  + `next(str)`：中断当前导航，并转跳到字符串（例如'/root/aa/bb'）所表明的路径
  + `next(obj)`：中断当前导航，并转跳到obj（***路由信息对象**）所表明的路径，这个对象可以有`replace:true`，`name:index`等额外配置
  + `next(Error)`：如果传入的对象是一个Error实例，那么该导航会被终止并将Error对象传入到`router.onError()`注册过的回调

### 全局解析守卫

使用`router.beforeResolve`注册一个全局解析守卫，这和`router.beforeEach`类似，区别是在导航被确认之前，**同时在所有组件内守卫和异步路由组件被解析之后**，解析守卫就被调用

```js
router.beforeResolve((to, from, next) => {
    //...
    next()
})
```

### 全局后置钩子

使用`router.afterEach`来注册一个全局后置钩子，和上面两个不同的是，该钩子函数的回调仅有两个参数：`to`和`from`，因此这个钩子函数不能更改或中断导航，仅仅在导航完成后触发

```js
router.afterEach((to, from) => {
    //...
})
```

### 路由独享守卫

定义路由时，在每个路由对象中使用`beforeEnter`来定义一个独享守卫，该守卫仅仅在导航进入该路由之前触发，该钩子函数接收三个参数：`to`，`from`和`next`，所以可以在该钩子中修改或中断导航，**在全局前置守卫触发之后调用**

```js
new Router({
    routes:[{
        path: '/',
        component: () => import('./home.vue'),
        beforeEnter(to, from, next) {
        	//...
        	next()
    	}
        //...
    }]
})
```

### 组件内的守卫

在各个组件中使用`beforeRouteEnter`，`beforeRouteUpdate`和`beofreRouteLeave`来定义仅仅在该组件内有效的守卫，这三个钩子都接收三个参数：`to`，`from`和`next`

+ `beforeRouteEnter`：在路由独享守卫触发后调用
  
  + 不能访问组件实例`this`
  
  + 但是可以通过给`next()`传递回调，该回调接收该组件实例作为参数
  
  + **仅仅在这个钩子函数中，`next()`能接收一个回调作为参数**
  
    ```js
    beforeRouteEnter(to,form,next){
        //...
        next(vm => {
            //通过vm访问组件实例
        })
    }
    ```
+ `beforeRouteUpdate`：在路由发生变化，但组件被复用的情况下调用（一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候）
  
  + 可以访问组件实例`this`
+ `beofreRouteLeave`：导航离开该组件时调用
  
  + 可以访问组件实例`this`
  
  + 这个离开守卫通常用来禁止用户在还未保存修改前突然离开
  
    ```js
    beforeRouteLeave(to,from,next){
        let answer = window.confirm("Wanna leave this page?")
        if(answer)
            next()
        else
            next(false)
    }
    ```

### 完整的导航解析流程

1. 导航被触发
2. 在将要离开的组件中调用`beforeRouteLeave`
3. 调用全局的`router.beforeEach`
4. 在重用的组件中调用`beforeRouteUpdate`
5. 调用路由配置中的`beforeEnter`
6. 解析异步路由组件
7. 在被激活的组件里调用`beforeRouteEnter`
8. 调用全局的`router.beforeResolve`
9. 导航被确认
10. 调用全局的`router.afterEach`
11. 触发DOM更新
12. 调用步骤7中传给`next()`的回调

## 路由元信息

在定义路由对象时，可以在`meta`字段中定义一些元信息，用于记录当前路由下的组件的一些验证等信息，例如是否需要登录之后才能访问这个路由，并在路由进行转跳前通过一些钩子函数进行检查，例如下面的例子：

```js
//假如用户即将进入一个关于用户个人信息页面的路由
router.beforeEach(to, from, next){
    //当用户点击了进入该页面的链接之后，即将前往的路由对象已经记录在 to 参数中
    //检测 to 对象中的 matched 属性，并遍历其中各个路由记录查找有无需要登录权限的路由
    if(to.matched.some(el => el.meta.needLogIn)){
        //检测到有需要登录的路由
        //接下来判断用户是否已经登录
        if(isLoggedIn){
            //已经登录，则直接进入
            next()
        }else{
            //用户没有登录，则转跳到登录页面
            next({
                path: '/login',
                query: {
                    //将当前页面的路径传递过去，方便登陆后直接返回该页面
                    redirect: to.fullPath
                }
            })
        }
    }else{
        //没有检测到需要登录的组件，则直接进入
        next()
    }
}
```

## 过渡动效

1. **给所有组件设置相同的动效**，只需将`<router-view>`用一个`<transition>`标签包裹起来，然后再设置动效

   ```vue
   <template>
   	<div>
           <transition name='fade'>
       		<router-view></router-view>
       	</transition>
       </div>
   </template>
   ```

2. **不同的组件拥有不同的动效**，只需在各个组件中自定义各自的动效

   ```vue
   <template>
   	<transition name='fade'>
       	<div>
           	<!-- ... -->
   	    </div>
       </transition>
   </template>
   ```

3. **基于路由动态应用动效**，在父组件中使用`watch`监听`$route`的变化，根据即将前往的路由动态改变`<trnasition>`的`name`属性

   ```vue
   <template>
   	<div>
           <transition :name='transitionName'>
       		<router-view></router-view>
       	</transition>
       </div>
   </template>
   <script>
   export default {
       data(){
           return {
               transitionName: undefined
           }
       },
       watch:{
           "$route"(to,from){
               if(to.name == 'a')
                   this.transitionName = 'slide'
               else
                   this.transitionName = 'fade'
           }
       }
   }
   </script>
   ```


## 数据获取

两种方式获取数据：导航完成前获取，导航完成后获取

1. 导航完成前获取

   此方法可以在`beforeRouteEnter`钩子获取数据，并通过该钩子的`next()`回调中处理数据

2. 导航完成后获取

   在组件的`created`钩子中获取数据

## 滚动行为

创建Router实例时，使用`scrollBehavior`来创建一个控制滚动行为的函数，该函数接收三个参数：`to`，`from`和`savedPosition`，其中`savedPosition`当且仅当 `popstate` 导航 (通过浏览器的 前进/后退 按钮触发) 时才可用

+ 该函数仅在html5`history`模式中有效

+ 该函数在路由切换时触发

+ 该函数返回`false`可阻止滚动

+ 该函数可返回一个包含位置信息的对象，例如：

	```js
	//仅包含偏移量
	{
    	x: 0,
    	y: 0
	}

	//包含具体元素信息和偏移量
	{
        selector: '#app',
        offset: {	//offset可选
            x: 0,
            y: 0
        }
    }
	```

### 异步滚动

``scrollBehavior`可返回一个`Promise`，在其中返回位置信息

```js
scrollBehavior(to,from,savedPosition){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                x: 0,
                y: 0
            })
        },5000)
    })
}
```

更多[例子](https://github.com/vuejs/vue-router/blob/dev/examples/scroll-behavior/app.js)

## 参考资料

+ [Vue Router 进阶](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)