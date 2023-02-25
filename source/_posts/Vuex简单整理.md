---
title: Vuex简单整理
date: 2019-09-11 21:46:28
#index_img: https://demos.xiaoooyooo.site/picture?tag=014
tags:
    - Vue
    - Vuex
categories:
    - Vue
---
# 适用情况
多个页面共享状态，  
如仅仅是父子组件共享状态则可不用Vuex

# 基本使用
> ```js
>     import Vue from 'vue'
>     import Vuex from 'vuex'
> 
>     //在 Vue 中安装插件
>     Vue.use(Vuex)
>     
>     //新建一个 Vuex 仓库
>     const store = new Vuex.Store({
>         state:{/*代码片段*/},
>         mutations:{/*代码片段*/},
>         actions:{/*代码片段*/},
>         getters:{/*代码片段*/},
>         modules:{/*代码片段*/}
>     })
> 
>     export default store
> ```
# Vuex.Store 中属性的说明
## state:

> 用于保管全局需要使用到的状态（属性）值
> **注意：**如果需要修改这里的值，那么只能通过 mutations 中的方法进行修改
> 虽然也可以直接用 $store.state.counter = xxx 的方式修改，但是不推荐。
```js
Vuex.Store({
    state:{
        counter:100,
        //...
    },
    //......
})
```
## mutations

> 定义一些方法，用于修改 state 中的状态
> 定义方法：
> 		'事件类型 '：回调函数
> 		'increment ': function(){...}
> ```js
>     mutations:{
>         //定义一个 increment 方法，用来将state中的数据 +1
>         'increment':function(state){
>             state.counter++
>         },
>         /* 简写如下：
>         increment(state){
>             state.counter++
>         }
>         */,
>         //mutations 中的方法接收传递的参数作为第二个参数
>         incrementCount(state,count){
>             state.counter += count
>         }
>     }
> 
>     //在组件中如何触发这个方法：
>     methods:{
>         //当组件中触发了add方法，那么就会触发Store中数据的更新
>         add(){
>             this.$store.commit('increment')
>         },
>         addCount(count){
>             this.$store.commit('incrementCount',count)
>             //如果需要传递的参数过多
>             //则需要将这些参数包装为一个对象再进行传递 Payload
>         }
>     }
> 
> 	// commit 的另外一种使用方法
> 	// 以这种方式触发的 mutation 方法中获取到的参数稍有不同
>         $store.commit({
>             type:'increment',
>             {/*参数对象*/}
>         })
> ```
> 
## getters
类似于 Vue 中的计算属性
> ```js
> getters:{
>     //定义一个power方法，返回 state 中的 couter 属性值的平方
>     power(state){
>         return state.counter * state.counter
>     },
>     //getters 中的函数接受第二个参数为 getters
>     powerType(state,getters){
>         //返回 power 的数据类型
>         return typeof getters.power
>     },
>     //如果要想向 getters 中的函数传递参数的话，则可以让这个函数返回另一个函数，但是此类 getters 的结果不会被缓存
>     /*
>     	在组件中的使用：
>     	$store.getters.powerNum(10)
>     */
>     powerNum(state,getters){
>         return (num) => {
>             return state.counter * num
>         }
>     },
> }
> 
> /*组件中如何获取 getters 中的数据：
> 	$store.getters.power
> 	或者
> 	$store.getters['power']
> */
> 
> ```

## actions
类似于 mutations ，只不过用来代替 mutations 来执行异步操作
> ```js
> actions:{
>     //actions 中的函数接收 context 作为第一个参数，意为上下文
>     //第二个参数为携带的数据
>     asyncFunc(context，payload){
>         //在这里不能直接修改 state 中的数据
>         //而是要通过调用 mutation 进行修改
>         setTimeOut(() => {
>         	context.commit('power')
>         },1000)
>     }
> }
> ```

## modules
用于将 store 分为各个小的模块
> ```js
> modules:{
>     moduleA:{
>         state:{},
>         getters:{
>             /*模块中的getters的前三个参数分别是：
>             state（本模块中的的状态）
>             getters（本模块中的getters）
>             rootstate（父级模块中的状态）
>             */
>             test(state，getters，rootstate){
>                 //...
>             }
>         },
>         mutations:{},
>         actions:{
>             testAction(context){
>                 context.state//访问模块内状态
>                 context.commit()//访问模块内mutations
>                 context.rootstate//访问根模块内状态
>             }
>         }
>     },
>     modulesB:{
>         state:{},
>         getters:{},
>         mutations:{},
>         actions:{}
>     },
>     //....
> }
> 
> //访问模块中的状态
> $store.state.moduleA.name	//获取到模块A中state中的name属性
> $store.state.moduleA.name	//获取到模块B中state中的name属性
> 
> //访问模块中的getters
> 
> //调用模块中的mutations
> $store.commit('type',payload)	//
> 
> //调用模块中的actions
> $store.dispatch('type')	//
> ```

# Vuex 数据响应式原理
**vuex 只会将已经在 state 中初始化好的数据进行响应式地渲染**  
> ```js
> //例子：
> Vuex.Store({
>     state:{
>         one:'one',
>         two:{
>             two_1:'two_1',
>             two_2:'two_2'
>         }
>     }
> })
> //上面定义地属性 one two 都会被添加到 Vuex 的响应式系统中，值一但发生变化，页面上的数据也会随之变化
> 
> //如果通过 mutations 的方法往 state 中添加一个从未拥有的数据，则页面不会将新的数据渲染出来
> //如果突然将 state 中的某个数据删除掉，页面也不会实时将数据删除掉
> mutations:{
>     update(state){
>         //添加一条新的数据，页面不会实时显示出来
>         state.three = 'three'
>         
>         //如果需要实时更新页面，则需要用如下方式添加
>         //Vue.set(需要更新的数据对象，键名或数组下标，值)
>         Vue.set(state,'three','three')
>         
>         //删除一条数据,页面任然显示该数据
>         delete state.one
>         //如果需要实时更新页面，则需要用如下方式删除
>         //Vue.delete(需要删除数据的数据对象，键名或数组下标)
>         Vue.delete(state,'one')
>     }
> }
> ```