---
title: 在NodeJs中操作MongoDB
date: 2019-10-21 22:17:04
#index_img: https://demos.xiaoooyooo.site/picture?tag=011
tags:
	- NodeJs
	- MongoDB
categories:
	- MongoDB
---

## 安装依赖

```bash
npm i mongodb -S
```

## 链接数据库

```js
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/testdb'

MongoClient.connect(url,{},(err,database)=>{
    if(err)
        throw err
    console.log("Connecting success!")
    databse.close()
})
```

## 新建集合

使用`createCollection([collection_name],[callback])`来创建集合

```js
MongoClient.connect(url,{},(err,database)=>{
    //连接到test文档
    let test = database.db('test')
    //新建集合
    test.createCollection('first',(err,res)=>{
        if(err)
            throw err
        console.log("Success!")
        database.close()
    })
})
```

## 删除集合

使用`<collection>.drop([callback])`来删除集合

也可使用`<database>.dropCollection([collection_name],[callback])`来删除集合

```js
MongoClient.connect(url,(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    //使用方法一
    test.collection('first').drop((err,res)=>{
        if(err)
            throw err
        if(res == true)
            console.log("Collection Dropped Success!")
        database.close()
    })
    
    //使用方法二
    test.dropCollection('first',(err,res)=>{
        if(err)
            throw err
        if(res == true)
            console.log("Collection dropped Success!")
        database.close()
    })
})
```



## 增删改查

### 增

使用`insertOne([obj],[callback])`向集合中插入一条数据

使用`insertMany([arr],callback)`向集合中插入多条数据

```js
MongoClient.connect(url,{},(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    let obj = {
        name: 'Tom',
        age: 21,
        gender: 'male'
    }
    test.collection('first').insertOne(obj,(err,res)=>{
        if(err)
            throw err
        database.close()
        console.log('Insert Success!')
    })
})
```

### 删

使用`deleteOne([query],[callback])`来删除一条数据

使用`deleteMany([query],[callback])`来删除多个数据

```js
MongoClient.connect(url,(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    test.collection('first').deleteOne({ name: /强$/},(err,res)=>{
        if(err)
            throw err
        console.log("Delete Success!")
        database.close()
    })
    
    test.collection('first').deleteMany({gender:"famale"},(err,res)=>{
        if(err)
            throw err
        console.log("Delete Success!")
        console.log(res.result)
        database.close()
    })
})
```

### 改

使用`updateOne([query],[new_values],[callback])`来更新数据

使用`updatemany([query],[new_values],[callback])`来更新多个数据

+ 使用`$set`，则仅指定的字段会被更新

```js
MongoClient.connect(url,(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    //更新一条数据
    test.collection('first').updateOne({name:"猴砸"},{$set:{name:"猴大傻"}},(err,res)=>{
        if(err)
            throw err
        console.log(res.result)
        console.log("Update Success!")
    })
    
    //更新多条数据
    test.collection('first').updateMany({name:/傻$/},{$set:{name:"这下一改全都改了怎么办"}},(err,res)=>{
        if(err)
            throw err
        console.log("Update Success!")
        console.log(res.result)
        database.close()
    })
})
```

### 查

使用`findOne([query_options],[callback])`来查找符合条件的第一条数据

使用`find([query_options],[fields]).toArray([callback])`来查找符合条件的所有数据

+ 第一个参数`[query_options]`为查询条件，其中若条件为字符串则可使用正则表达式
+ `find()`的第二个参数`[fields]`为描述输出结果的应该包含的字段对象
+ 使用`limit([number])`来限制返回的文档数量

```js
MongoClient.connect(url,{},(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    //findOne()
    test.collection('first').findOne({age:21},(err,res)=>{
        if(err)
            throw err
        console.log(res)
        database.close()
        console.log('Find Success!')
    })
    //find()
    let rules = {
        projection:{
            _id: 0,
            name: 1,
            gender: 1
        }
    }
    test.collection('first').find({age:21},rules).toArry((err,res)=>{
        if(err)
            throw err
        console.log(res)
        database.close()
        console.log('Find Success!')
    })
})
```

#### 查找并排序

使用`find([query]).sort([sortQuery])`来将查找结果进行排序

+ `sort()`的第一个参数`[sortQuery]`为要用来进行排序的字段，1为升序，-1为降序

```js
MongoClient.connect(url,(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    test.collection('first').find({}).sort({age: 1}).toArray((err,res)=>{
        if(err)
           throw err
        console.log("Find Success!")
        console.log(res)
        database.colse()
    })
})
```

## MongoDB Join

即将两个集合相互关联起来，虽然mongoDB不是关系型数据库，但可以用这种方式模拟

例如有以下两个集合：`oeders`和`products`

**orders**

```json
[
    {
        _id: 1,
        product_id: 154,
        status: 1
    }
]
```

**products**

```json
[
    { _id: 154, name: 'Chocolate Heaven' },
  	{ _id: 155, name: 'Tasty Lemons' },
  	{ _id: 156, name: 'Vanilla Dreams' }
]
```

再使用以下代码：

+ 使用`aggregate([arr_Obj])`

```js
MongoClient.connect(url,(err,database)=>{
    if(err)
        throw err
    let test = database.db('test')
    test.collection('orders').aggregate([
        {
            $lookup:{
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'oerderdetails'
            }
        }
    ]).toArray((err,res)=>{
        if(err)
            throw err
        console.log(JSON.stringify(res))
        database.close()
    })
})
```

上面代码输出的结果为：

```json
[
  	{
        "_id": 1,
    	"product_id": 154,
     	"status": 1,
        "orderdetails": [
            { "_id": 154, "name": "Chocolate Heaven" } 
        ]
    }
]
```

