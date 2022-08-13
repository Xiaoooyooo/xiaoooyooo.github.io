---
title: Web Components
date: 2022-04-23 19:52:12
tags:
	- 浏览器
	- HTML
categories:
	- HTML
---

# Web Components

通过`Web Components`，我们可以封装一系列的自定义组件，并在其内部维护各自的状态和行为，就像`Vue`和`React`一样。

## 如何创建一个自定义组件

这里有两种方式去定义一个自定义组件：

+ **自主定制元素**：独立元素; 它们不会从内置 HTML 元素继承。

+ **自定义内置元素**：这些元素继承自 - 并扩展 - 内置 HTML 元素。

### 自主定制元素

首先我们需要新建一个类，继承自`HTMLElement`：

```js
class MyComponent extends HTMLElement {
  constructor() {
    super();
  }
}
```

然后只需要通过`customElements`API注册这个组件：

```js
customElements.define("my-component", MyComponent);
```

接下来我们就可以在任何地方用使用这个组件：

```html
<my-component></my-component>
```

或

```js
document.createElement("my-component");
```

### 自定义内置元素

和自主定制元素类似，首先需要新建一个类，并继承自某个HTML元素：

```js
class MyComponent extends HTMLDivElement {
  constructor() {
    super();
  }
}
```

然后注册该组件：

```js
customElements.define("my-component", MyComponent, { extends: "div" });
```

与自主定制元素不同的是在这里我们需要明确指出继承的HTML元素类型`extends: div`，使用的方式也有所不同，只需要在原HTML标签上添加`is`属性指定自定义组件的名称即可：

```html
<div is="my-component"></div>
```

或

```js
document.createElement("div", { is: "my-component" });
```

这时我们的组件里面还没有任何的内容，接下来继续向其中添加一些自定义的内容。

## 向组件添加内容

我们可以在自定义类的构造函数中向自定义组件添加一些内容。这里以自主定制元素为例

```js
constructor() {
  super();
  const div = document.createElement("div");
  div.innerText = "Hello World!";
  this.appendChild(div);
}
```

不出意外的话，此时刷新页面就能看到组件中的内容了。这个例子很简单，但是到这里相信绝大多数的人已经能够实现一些比较复杂的功能组件了。接下来继续说明自定义组件的生命周期，没错就像其他的前端框架一样，它也拥有自己的生命周期，只不过比较少。

## 自定义组件的生命周期

这里首先介绍两个用的场景比较多的：`connectedCallback`和`disconnectedCallback`。

首先是`connectedCallback`，它将在元素首次被挂载到DOM后调用。

其次是`disconnectedCallback`，它将在元素从DOM卸载时调用。

在`Vue`或`React`的基础上，这两个生命周期钩子不难理解，应用的地方很多也很有道理。

除了这两个常用的生命周期钩子之外，还有`adoptedCallback`和`attributeChangedCallback`，前者将在元素被移动到新节点时调用，后者将在元素的属性增加、删除或改变时调用。

## 参考资料

+ [Web Components | MDN](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)

+ [CustomElementRegistry.define - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomElementRegistry/define)
