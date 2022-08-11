---
title: Vue中的Render函数
date: 2021-04-07 18:34:03
tags:
	- 前端框架
	- Vue
categories:
	- Vue
---

# Vue中的Render函数

Vue建议我们尽量使用`template`模板创建我们的HTML结构，但在一些场景则显得不是很灵活，这时候我们就可以使用JS的完全编程能力，而Vue就为此实现了`render`选项。

`render`为Vue实例选项中的属性之一，它是一个函数，返回一个`VNode`，接受一个形参`cereateElement`，这个形参也是一个函数。

在基于Webpack的Vue项目的入口文件中，我们就经常使用到这个render函数：

```js
new Vue({
    el: "#app",
    render: createElement => createElement(App)
})
```

它的作用是将返回的`VNode`作为HTML编译模板，并渲染到页面中，并且`render`函数的优先级比`template`和`el`中的模板更高。

## createElement函数

在`render`函数中Vue会默认传递一个参数`createElement`，用于创建一个`VNode`，即“虚拟节点（virtual node）”，顾名思义，这不是一个真的DOM元素，而是一个DOM节点的描述信息。

### 参数介绍

`createElement`能接受三个参数：

```js
createElement(){
    /** 
     * @param {String | Object | Function}
     *   一个 HTML 标签名、组件选项对象，或者 resolve 了上述任何一种的一个 async 函数。必填项。
     * @parma {Object}
     *   一个与模板中 attribute 对应的数据对象。可选。
     * @param {String | Array}
     *   子级虚拟节点 (VNodes)，由 `createElement()` 构建而成，也可以使用字符串来生成“文本虚拟节点”。可选。
     * @returns {VNode}
     */
}
```

关于它的第二个参数对象的内容具体如下：

+ `class`：与 `v-bind:class` 的 API 相同，接受一个字符串、对象或字符串和对象组成的数组
+ `style`：与 `v-bind:style` 的 API 相同，接受一个字符串、对象，或对象组成的数组
+ `attrs`：普通的 HTML attribute
+ `props`：传递给组件的 prop
+ `domProps`：DOM属性，如`innerHTML, value`
+ `on`：定义事件监听器，但不再支持如 `v-on:keyup.enter` 这样的修饰器。需要在处理函数中手动检查 keyCode。
+ `nativeOn`：仅用于组件监听原生事件，而不是在组件内使用`vm.$emit` 触发的事件。
+ `directives`：使用自定义指令，无法对 `binding` 中的 `oldValue` 赋值，因为 Vue 已经自动为你进行了同步。
+ `scopedSlots`：传入插槽
+ `slot`：如果组件是其它组件的子组件，需为插槽指定名称
+ `key`：列表渲染
+ `ref`：引用
+ `refInfo`：如果你在渲染函数中给多个元素都应用了相同的 ref 名，那么 `$refs.myRef` 会变成一个数组。

### 一个示例

```js
// 渲染HTML
createElement("h1", {
    class: ["test", {test1:true}],
    style: "color: red",
    attrs: {
        id: "test"
    },
    on: {
        click: function(){
            console.log("Clicked!")
        }
    },
    ref: "test"
}, "这是一个标题")

//渲染组件 例如一个输入框组件 myInut
createElement(myInput, {
    props: {
        foo: "foo"
    },
    nativeOn: {
        click: function(){
            console.log("Component Clicked!")
        }
    },
    directives: [{
        name: "red"
    }],
    scopedSlots: {
        default: props => createElement("span", props.text)
    },
    slot: "myInput",
    ref: "myInput"
})
```

### 约束

**VNode必须唯一**

```js
//不合法的写法
render: function (createElement) {
  var myParagraphVNode = createElement('p', 'hi')
  return createElement('div', [
    // 错误 - 重复的 VNode
    myParagraphVNode, myParagraphVNode
  ])
}
```

## JSX

在某些情况下，使用`render`函数会使我们的代码十分不美观，例如下面的例子：

```js
createElement(
  'anchored-heading', {
    props: {
      level: 1
    }
  }, [
    createElement('span', 'Hello'),
    ' world!'
  ]
)
```

而与此对应的jsx模板为：

```jsx
<anchored-heading :level="1">
  <span>Hello</span> world!
</anchored-heading>
```

孰好孰坏一目了然。Babel中就有一个插件，可以让我们在Vue中使用JSX语法，使用此语法上面的模板完整写法可为：

```jsx
import AnchoredHeading from './AnchoredHeading.vue'

new Vue({
  el: '#demo',
  render: function (h) {
    return (
      <AnchoredHeading level={1}>
        <span>Hello</span> world!
      </AnchoredHeading>
    )
  }
})
```

> 将 `h` 作为 `createElement` 的别名是 Vue 生态系统中的一个通用惯例，实际上也是 JSX 所要求的。从 Vue 的 Babel 插件的 [3.4.0 版本](https://github.com/vuejs/babel-plugin-transform-vue-jsx#h-auto-injection)开始，我们会在以 ES2015 语法声明的含有 JSX 的任何方法和 getter 中 (不是函数或箭头函数中) 自动注入 `const h = this.$createElement`，这样你就可以去掉 `(h)` 参数了。对于更早版本的插件，如果 `h` 在当前作用域中不可用，应用会抛错。

### 如何使用

```bash
npm install @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props
```

然后再babel配置文件中添加：

```js
module.exports = {
  presets: ['@vue/babel-preset-jsx'],
}
```

**注意事项：**jsx模板需要写在新的`.jsx`文件中，而不能仅仅将`.vue`文件中的`script`部分的`lang`设置为jsx。

## 参考资料

+ [渲染函数 & JSX](https://cn.vuejs.org/v2/guide/render-function.html)
+ [Vue/Babel Preset JSX](https://github.com/vuejs/jsx#installation)