---
title: axios简单整理
date: 2019-09-11 21:39:32
#index_img: https://demos.xiaoooyooo.site/picture?tag=004
tags:
    - Vue
    - axios
categories: 
    - Vue
---
# Axios

+ axios(config)

+ axios.request(config)

+ axios.get(url[,config])

+ axios.delete(url[,config])

+ axios.head(url[,config])

+ axios.post(url[,data[,config]])

+ axios.put(url[,data[,config]])

+ axios.patch(url[,data[,config]])

## axios(config)

```js
axios({
    url:'http://xxxxx.xxx',
    method:"get/post/...",
    params:{
        key1:value1,
        key2:value2,
        //...
    },
    timeout:1000,//超时时间 ms
    
}).then(res => {
    //成功代码
}).catch( err => {
    //失败代码
})
```

## axios.get(url[,config])

```js
axios.get('http://xxxxx.xxx',{
    
})
```

## axios 发送并发请求

```js
axios.all([
    axios({
        //...
    }),
    axios({
        //...
    })
]).then( axios.spread((res1, res2) => {
    //res1为第一个请求返回的数据
    //res2为第二个请求返回的数据
    //请求都返回结果后才执行这里的代码
})).catch( err => {
    
})
```

## axios 全局配置

```js
//全局配置会自动添加到每个 axios 请求的配置信息中
//常用全局配置信息：
axios.defaults.baseURL = 'xxxx'
axios.defaults.timeout = 1000
axios.defaults.methods = 'get'
axios.defaults.headers = {
    'content-type':'application/json',
    //...
}
axios.defaults.params = {
    //查询对象
}
axios.defaults.transformRequest = [(data) => {
 	//向服务器发送前，修改请求数据
    //必须返回字符串
    //只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
    return data
}]
axios.defaults.transformResponse = [(data) => {
    //在传递给 then/catch 前，允许修改响应数据
    //对data进行任意处理
    return data
}]
```

## axios创建实例

```js
const test = axios.create({
    //一些实例通用配置
    baseURL:'http://111.222.33.44:80',
    timeout:5000
})

//使用实例
test({
    url:'/home',
    //其他配置
}).then( res => {
    //...
}).catch( err => {
    //...
})
```

## axios 拦截器

```js
//全局请求拦截
axios.interceptors.request.use( config => {
    //拦截成功发送前的请求
    
    //1.对请求的 config 信息做一些处理
    //2.在请求时对某些页面做一些处理
    
    //最后一定要把 config 返回，否则发送的请求拿不到该配置信息
    return config
},err => {
    //拦截发送失败的请求，网络原因
})
//某个实例请求拦截
实例名.interceptors.request.use(/*代码同上*/)



//全局响应拦截
axios.interceptors.response.use( res => {
    //拦截成功响应结果
    
    //处理完响应数据后必须将结果返回，否则发送的请求拿不到数据
    return res
}, err => {
    //拦截失败响应结果
})
//某个实例响应拦截
实例名.interceptors.response.use(/*代码同上*/)
```