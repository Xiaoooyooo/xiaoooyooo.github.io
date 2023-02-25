---
title: JavaScript中不同数据类型之间的运算和比较
date: 2019-09-25 22:32:27
#index_img: https://demos.xiaoooyooo.site/picture?tag=008
tags:
    - JavaScript
    - 数据类型转换
categories:
    - JavaScript
---
# JavaScript中不同数据类型之间的运算和比较

## 前言

首先来看几个例子

```js
console.log(+{})				//NaN
console.log({} == {})			//false
console.log({} == 'test')		//false
console.log({} === 'test')		//false
console.log({} == '[object Object]')	//true
console.log([] == ![])			//true
console.log(['a','b'] == 'a,b')	//true
console.log({} == 1)			//false
console.log('1' == 1)			//true
```

上面的部分结果刚开始看起来我是很诧异的，直到弄清楚了其中的规律才恍然大悟！

在开始之前，我们有必要知道js中的**原始数据类型**（Primitive value）：

> null
> undefined
> number
> string
> boolean
> symbol		(ES6新增，还没去了解过)

## JS中不同数据类型比较原理

在编写JS代码时，我们或多或少会遇到一些与预期不符的情况出现，好吧，我承认是我太菜了。。。

话不多说，先上转换规则

|   比较类型一   | 比较类型二  |                           比较规则                           |
| :------------: | :---------: | :----------------------------------------------------------: |
|      对象      |    对象     |                   比较是不是同一个内存地址                   |
|      对象      |   字符串    |             对象先转为字符串，在和字符串进行比较             |
|      对象      |    布尔     | 两边都要先转为数值，false为0，true为1，对象需要先隐式调用toString()，在用toNumber()转换为数值 |
|      数字      |    布尔     |                 布尔转为数值，再与数值作比较                 |
|      数字      |   字符串    |             对字符串使用Number()，再与数值作比较             |
|      布尔      | 数字/字符串 |                       都转为数值作比较                       |
|      null      |  undefined  |                             true                             |
| null/undefined |    其他     |                            false                             |
|      NaN       |     NaN     |                            false                             |

**可以这么记：对象  --->  字符串  --->  数字  <---  布尔**。当比较的两者数据类型不同时，数据类型的转换偏向于箭头指向一方。

补充一点说明：**除了“”（空字符串）、0、NaN、null、undefined、false转为Boolean类型为false，其他全部为true**

知道了这些原理，开头举的作比较的例子也就很简单去理解了

```js
{} == {}		//都是临时创建的对象，地址不同，false
{} == 'test'	//[object Object]' == 'test'  =>  false
{} == '[object Object]'		//'[object Object]' == '[object Object]'  =>  true
[] == ![]	//[] == !true  =>  [] == false	=>  0 == 0  =>  true
['a','b'] == 'a,b'	//'a,b' == 'a,b'  =>  true
{} == 1		//toNumber('[object Object]') == 1  => NaN == 1  =>  false
'1' == 1	// toNumber('1') == 1  =>  1 == 1  =>  true
```

这里需要补充的一点是，**如果在比较运算中出现了!（感叹号），那么系统首先要处理这部分数据**，例如上面的[] == ![]，具体做法就是先将感叹号后面的数据转为布尔类型，再取反。

但是，相信许多小伙伴依然有许多不明白的 地方，比如例子中的 {} 是如何转换为 '[object Object]'，而 ['a','b'] 又是如何转换为 'a,b' 的，不急，且看我慢慢道来。

## JS中对象的类型转换

开始之前，我再举几个例子

```js
var obj = {}
console.log(obj)	//{}
console.log(+obj)	//NaN
console.log('1' + obj)	//1[object Object]
alert(obj)			//[object Object]
```

这里涉及到两个问题

1. 一个是在 "+" 运算符面前，不同的数据类型应该作何转换

2. 另一个是 obj 这个对象到底是如何转换为 '[object Object]' 的

首先看第一个问题，其实很简单，只有两种情况：

+ 数值相加
+ 字符串相加

+ 其他的情况下都会被强制转为这两种数据类型

关于第二个问题，下面就是我个人总结的内容。

### JS中对象类型转换机制

在JS中存在两种大类数据类型，一种是原始数据类型，另一种是复合数据类型，也就是我们所熟悉的对象。那么对象是如何进行类型转换的呢？

结论是系统默认调用了对象的内置方法toString() 和 valueOf()。

问题是我们怎么去判断是不是调用了这两个方法呢，为了测试，我们可以对Object对象的自带这两个方法进行重写，也可以新建一个对象，在新对象里面创建这两个方法。下面看测试代码

```js
var obj = {
    toString(){
        console.log("调用了toString 方法")
        return Object.prototype.toString.call(this)
    },
    valueOf(){
        console.log("调用了 valueOf 方法")
        return Object.prototype.valueOf.apply(this)
    }
}
console.log(obj)
//仅仅输出 obj 对象
console.log(+obj)
/* 
	调用了 valueOf 方法
	调用了 toString 方法
	NaN
*/
console.log('1' + obj)
/* 
	调用了 valueOf 方法
	调用了 toString 方法
	1[object Object]
*/
alert(obj)
/*
	调用了toString 方法
*/
```

现在知道了对象的数据类型转换的基本机制，但是还有个问题，**在什么情况下只调用toString()，在什么情况下只调用valueOf()，又在什么情况下两个都调用呢？**

这里就涉及到了JS中的隐式类型转换了，以及另外的一个函数 toPrimitive()，这个函数在js内部视情况自动执行，开发者不能直接调用。

**toPrimitive(input [, preferredType])**
这个函数的作用是将输入的值 input 转换为原始数据类型，第二个参数要么是string要么是number，如果不填则默认为number（除了Date对象为string）。
如果传入的preferrdType为number，则该函数这样执行：

1. 如果 input 值为原始类型，则返回input。否则继续
2. 调用input.valueOf()，如果结果为原始类型，则返回该结果。否则继续
3. 调用input.toString()，如果结果为原始类型，则返回该结果。否则继续
4. 抛出异常 TypeError

如果传入的preferredType为string，则该函数这样执行：

1. 如果 input 值为原始类型，则返回input。否则继续
2. 调用input.toString()，如果结果为原始类型，则返回该结果。否则继续
3. 调用input.valueOf()，如果结果为原始类型，则返回该结果。否则继续
4. 抛出异常 TypeError

可见只是调用toString() 和 valueOf() 方法的顺序不同。

这里又得补充一句**由于toPrimitive在js内部自动执行，所以第二个参数是视情况而定的，具体要看当前执行的语句的情况进行判断，**例如当进行加号运算时，js期望的数据类型是number，所以如果涉及到类型转换时，toPrimitive的第二个参数就是number。

再回到开始提出的问题上：

```js
['a','b'] == 'a,b'	//'a,b' == 'a,b'  =>  true
{} == 1		//toNumber('[object Object]') == 1  => NaN == 1  =>  false
```

​	**{} 是如何转换为 '[object Object]'，而 ['a','b'] 又是如何转换为 'a,b' 的？**

第一个：

+ 对象和字符串比较，首先将对象隐式转换为字符串
  + 隐式转换，调用toPrimitive()，preferredType默认为number

第二个：

+ 对象和数字比较，首先将对象转为字符串，再将结果转为数字隐式转换
  + 隐式转换对象转字符串，调用toPrimitive()，preferredType默认为number
  + 隐式转换字符串转数字，调用toNumber()

## 总结

在不是人为的影响下，涉及到类型转换最多的就是数据之间的比较了，这种类型转换时js内部自动帮我们完成的，隐式转换涉及到的函数有：

+ ToPrimitive ( input [ , PreferredType ] )
+ ToBoolean ( argument )
+ ToNumber ( argument )
+ ToString ( argument )        *这个函数不是我们常用的toString()

这些函数都是js内部的函数，开发者不能直接调用，具体的调用要看执行的代码语句的上下文环境，例如在if语句中用于条件判断的语句，js的期望数据类型是Boolean类型，所以如果不是Boolean类型的数据，js会自动帮我们调用ToBoolean()方法将语句转换为布尔值。



## 参考资料

+ [JS中不同类型作比较的规律 （比较运算符）](https://blog.csdn.net/wulove52/article/details/84972152)

+ [valueOf() vs. toString() in Javascript](https://stackoverflow.com/questions/2485632/valueof-vs-tostring-in-javascript)

+ [JavaScript 对象转换,toString,valueOf](https://www.zhuwenlong.com/blog/article/5534ec4efd9753d106000002)

+ [彻底理解js中的数据类型与类型转换](https://www.jianshu.com/p/b161aeecb6d6)

+ [JS的类型转换，强制转换和隐式转换](https://www.cnblogs.com/yangguoe/p/8465092.html)

