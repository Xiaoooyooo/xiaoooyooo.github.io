---
title: Vue Router
date: 2019-10-14 20:47:25
#index_img: https://demos.xiaoooyooo.site/picture?tag=013
tags:
	- Vue
	- Vue Router
categories:
    - Vue
---

# Vue Router

## 基本使用

1. 安装依赖：`vue-router`

2. 新建router.js文件并编辑：

   ```js
   import Vue from 'vue'
   import Router from 'vue-router'
   
   //加载插件
   Vue.use(Router)
   
   export default new Router({
       rules: [{
           name: 'home',
           path: '/',
           //路由重定向，当访问路径为 / 时，重定向到 /first
           redirect: '/first'
       },{
           name: 'first',
           path: '/first',
           //路由懒加载，仅有当使用该路由时才会加载
           component: () => import('./components/first.vue')
       },{
           name: 'second',
           path: './second',
           component: () => import('./components/second.vue')
       }]
   })
   ```

3. 编辑APP.vue文件

   ```vue
   <template>
   	<div>
           <!-- router-view标签的作用为展示各个路由 -->
           <!-- router-link标签的作用为点击时跳转到相应的路由 -->
           <router-view />
           <router-link to='/'>first</router-link>
           <router-link to='/second'>second</router-link>
       </div>
   </template>
   ```

4. 编辑main.js文件

   ```js
   //...
   import router from './router.js'
   new Vue({
       //...
       router,
       //...
   })
   ```

## Vue Router详细使用之API详解

### Router

#### 构造选项

详情戳这里[Router构建选项](https://router.vuejs.org/zh/api/#router-构建选项)

1. `routes`，数组

   ```js
   routes: [
       //...
       {
       	path: string,
   		component?: Component,
   		name?: string, // 命名路由
   		components?: { [name: string]: Component }, // 命名视图组件
   		redirect?: string | Location | Function,
   		props?: boolean | Object | Function, 	//给组件传递参数
   		alias?: string | Array<string>, //相当于给当前路由（path）的子路由设置的别名
   		children?: Array<RouteConfig>, // 嵌套路由
   		beforeEnter?: (to: Route, from: Route, next: Function) => void,
   		meta?: any,
   		
           // 2.6.0+
   		caseSensitive?: boolean, // 匹配规则是否大小写敏感？(默认值：false)
   		pathToRegexpOptions?: Object // 编译正则的选项
   	}
       //...
   ]
   ```

   **注：**关于`component`与`components`的区别，若该路由下仅有一个需要展示的组件则使用前者；反之若有多个组件，则用后者，并搭配`<router-view>`的`name`属性

2. `mode`，字符串，可选值`"hash","history","abstract"`

3. `base`，字符串，应用的根路径

4. `linkActiveClass`，字符串，router-link激活时应用的class

5. `linkExactActiveClass`，字符串，router-link默认的精确激活（路由精确匹配）的class

6. `scrollBehavior`，函数，[详解](https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html)

7. `parseQuery/stringifyQuery`，函数，提供自定义查询字符串的解析/反解析函数。覆盖默认行为

8. `fallback`，布尔，当浏览器不支持 `history.pushState` 控制路由是否应该回退到 `hash` 模式

#### 实例属性

1. `router.app`，Vue实例，配置了该router的根实例
2. `router.mode`，字符串，路由使用的模式
3. `router.currentRoute`，route对象，当前路由对应的路由信息对象

#### 实例方法

详见[Router实例方法](https://router.vuejs.org/zh/api/#router-实例方法)

1. `router.beforeEach,router.beforeResolve,router.afterEach`，全局导航守卫
2. `router.push,router.replace,router.go,router.back.router.forward`，动态导航到一个新的url
3. `router.getMatchedComponents`，返回目标或当前路由匹配的组件数组
4. `router.resolve`，解析目标路径
5. `router.addRoutes`，动态添加路由规则
6. `router.onReady`，当一个路由初始化完成时调用传入的回调函数
7. `router.onError`，路由导航过程中出错时调用传入的回调函数

### 路由对象 $route

一个路由对象表示当前激活的路由的状态信息

以下内容或返回值都为一个route对象：

+ 组件内`this.$route`
+ `$route`观察者回调
+ 导航守卫的参数`to,from`
+ `scrollBehavior(to,from,savedPosition)`的参数`to,from`

#### 路由对象属性

1. `$route.path`，字符串，当前路由的路径
2. `$route.params`，对象，路由传参，没有则为空对象
3. `$route.query`，对象，URL查询参数
4. `$route.hash`，字符串，当前路由的哈希值，没有则为空
5. `$route.fullPath`，字符串，包含查询参数和 hash 的完整路径
6. `$route.matched`，数组，包含当前路由的所有嵌套路径片段的路由记录
7. `$route.name`，当前路由的名字（如果有的话）
8. `$route.redirectedFrom`，如果存在重定向，则为重定向来源路由的名字

## <router-link\>与<router-view\>

### <router-link\>

***新增API：**`v-slot`

通过一个作用域插槽暴露底层的定制能力，例如：

```vue
<template>
	<!-- ...... -->
	<router-link to="{name:'test'}" v-slot='{href,route,navigate,isActive,isExactActive}'>
    <a :href='href' :class="[isActive && 'link-active', isExactActive && 'exact-active']" @click='navigate'>{{route.name}}</a>
    </router-link>
</template>
```

+ `href`：解析后的 URL。将会作为一个 `a` 元素的 `href` attribute
+ `route`：解析后的规范化的地址
+ `navigate`：触发导航的函数。**会在必要时自动阻止事件**，和 `router-link` 同理
+ `isActive`：如果需要应用激活的class则为 `true`。允许应用一个任意的 class
+ `isExactActive`：如果需要应用精确激活的class则为 `true`。允许应用一个任意的 class

#### router-link标签的属性

1. `to`，字符串|对象，目标路由的链接（包括嵌套路由），或者一个描述目标位置的对象。调用了`router.push`
2. `active-class`，字符串，当前路由激活时应用的样式
3. `exact`，布尔，是否启用路由精确匹配，仅有精确匹配的路由才会被设置2中的样式
4. `exact-active-class`，字符串，仅有路由链接精确匹配时才应用该样式（2与3结合的效果）
5. `tag`，字符串，设置router-link实际渲染出来的标签
6. `replace`，布尔，将路由操作不写入浏览器的History对象中，调用了`router.replace`而不是`router.push`
7. `append`，布尔，在原URL后追加路径|替换原有路径
8. `event`，字符串|包含字符串的数组，设置可以触发导航的事件

### <router-view\>

1. 有且仅有一个属性：`name`，字符串，如果设置了名称，则会渲染对应的路由配置中 `components` 下的相应组件

   例如：

   ```vue
   <template>
   	<router-view class="view one"></router-view>
   	<router-view class="view two" name="a"></router-view>
   	<router-view class="view three" name="b"></router-view>
   </template>
   <script>
   	//...
       const router = new VueRouter({
     		routes: [{
         		path: '/',
         		components: {
           		default: Foo,
           		a: Bar,
           		b: Baz
         		}
      		}]
   	})
       //...
   </script>
   ```

2. `<keep-alive>`，用于缓存其内部的路由组件，可与`<transition>`配合使用，此时`<transition>`在外部

## 其他细节

### 动态路由匹配

将同一模式的路由都映射到一个组件，例如`/user/foo`和`/user/bar`

只需在注册路由时使用”动态路径参数“即可实现，例如：

```js
new Router({
    routes: [{
        //动态路径参数，以冒号开头
        path: "/user/:name",
        component: UserProfileComponent
    }]
})
```

获取这个参数时可以在组件内使用`$route.params.name`即可

也可以设置多段参数路径，例如`/user/:name/age/:age`，参数获取方式同上

**需要注意的是**因为这两个路由都使用了同一个组件，因此组件会被复用（不会被摧毁），这意味着某些生命周期钩子函数不会再执行，但是可以用`watch`监听`$route`某些数据的变化，或者使用`beforeRouteUpdate`导航守卫

### 捕获所有路由

使用`*`即可匹配所有路由，例如：

```js
{
    //匹配所有路由
    path: '*'
}
{
    //匹配以 'user-' 开头的路由
    path: 'user-*'
}
```

当使用了`*`后，`$route.params`对象中便会自动添加一个`pathMatch`参数，它包含了通过`*`被匹配的部分

除了使用`*`外，路由匹配也支持正则表达式

### 嵌套路由

使用路由的`children`属性可以添加多个子路由

需要注意的时子路由的`path`属性不能以`/`开头，因为这会被误认为是根路径（这可能会出现的问题是，虽然页面效果可能会正常，但是浏览器地址栏不正确），但是在`router-link`的`to`属性中必须写包括根路径的完整路径

### 编程式导航

简单来说就是利用js代码操作路由而不是利用`router-link`，相关的方法有`router.push,router.replace,router.go`，**这三种方法都与history对象中的相应方法类似**，下表是两种操作方法在书写上的差别

|              声明式              |        编程式        |
| :------------------------------: | :------------------: |
|     <router-link to="path"\>     |  router.push(path)   |
| <router-link to="path" replace\> | router.replace(path) |

1. `router.push(location,onComplete,onAbort)`

   + `location`：字符串|描述地址的对象

     需要注意的是，如果描述地址的对象中同时带有`path`和`params`属性，那么后者会被会被忽略掉；而如果同时带有`path`和`query`属性，那么二者都能被成功读取

     ```js
     this.$router.push({ path: '/user', params: { id: 0001 }})	//params会被忽略，id不能被读取
     
     const id = 0001
     this.$router.push({ path: `/user/${id}`})	//id能被读取
     
     this.$router.push({ name: 'user', params: { id: 0001}})	//id能被读取
     ```

   + `onComplete`,`onAbort`：回调函数，分别在导航完成时和终止（导航到相同的路由、或在当前导航完成之前导航到另一个不同的路由）时调用，和下面的`router.replace`意义相同

1. `router.replace(location,onComplete,onAbort)`

   和`router.push`类似，但是该方法不会向`history`对象中添加新的记录，而是替换掉当前记录

2. `router.go(num)`

   + `num`，数字，可以为负，整数表示前进，负数表示后退

### 命名路由

略

### 命名视图

利用`<router-view>`的唯一属性`name`，在一个路由下展示多个组件，下面是一个例子：

```html
<!-- app.vue -->
<router-view></router-view>
<router-view name='profile'></router-view>
<router-view name='setting'></router-view>
```

```js
export default new Router({
    path: '/user',
    //此处使用components而不是component
    components: {
        //default组件渲染到没有命名的router-view中
        default: () => import('./home.vue'),
        //profile组件渲染到命名为profile的router-view中
        profile: () => import('./profile.vue'),
    	//seeting组件渲染到命名为setting的router-view中
		setting: () => import('./setting.vue')
    }
})
```

一个更为详细的[例子](https://jsfiddle.net/posva/22wgksa3/)

### 重定向和别名

#### 重定向

使用`redirect`属性来为一个路由实现重定向：

```js
//...
{
    path: '/',
    redirect: '/home'
    //访问 / 路径时 重定向到 /home 路径
},{
    path: '/',
    redirect: to => {
        //to 当前路由
        //do something
        return '/new-route'
    }
}
//...
```

#### 别名

使用`alias`属性来给当前路由（path）的子路由设置别名，下面是一个例子：

```js
export default new Router({
    routes: [{
        path: '/home',
        alias: 'home-alias'
        //此时访问 /home-alias 相当于访问 /home，但是浏览器上会显示 /home-alias
    }]
})
```

### 路由组件传参

使用`props`属性来为组件传参，可降低组件与对应路由的耦合性，例如下面的例子：

原路由配置：

```js
export default new Router({
    path: 'user/:id',
    component: () => import('./user.vue')
})
```

原html：

```html
<!-- 不使用 props -->
<div>
    <span>{{ $route.params.id }}</span>
</div>
```

#### 布尔模式

如果 `props` 被设置为 `true`，`route.params` 将会被设置为组件属性

使用布尔模式解耦：

```js
export default new Router({
    path: '/user/:id',
    component: () => import('./user.vue'),
    props: true
})

//如果该路由包含多个命名路由，则需要分别为各个视图设置props
components: {
    default: ()=> import('./user.vue'),
    profile: () => import('./profile.vue')
},
props: {
    default: true,
    profile: false
    //default视图能访问到参数而profile视图不能
}
```

#### 对象模式

例如：

```js
export default new Router({
    path: '/home',
    component: () => import('./home.vue'),
    props: {
    	msg: "Hello World!"
	}
})
```

此时组件内能拿到的`msg`值为`Hello World!`

#### 函数模式

自定义函数返回一个`props`对象

更多[高级用法](https://github.com/vuejs/vue-router/blob/dev/examples/route-props/app.js)