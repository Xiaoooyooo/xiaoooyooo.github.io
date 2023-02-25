---
title: React State
date: 2021-03-21 20:40:59
tags:
	- 前端框架
	- React
categories:
	- React
---

# React State

state定义在组件的构造函数中，用于保存当前组件的一些状态，其中保存的数据都能参与到数据流当中。我们也可以随意在组件的this中添加不参与数据流的额外字段（如`this.timer`）。

```jsx
class Test extends Component {
    constructor(props){
        super(props)
        this.state = {
            // 此处定义参与数据流的字段
        }
    }
    myFn(){
        // 定义仅在当前组件有效且不参与数据流的字段
        this.hello = 'hello'
    }
}
```

## 正确地使用State

### 1.不要直接修改state

直接修改state不会将被修改地数据实时反映到页面上，如：

```jsx
// Wrong
this.state.comment = "Hello"
```

而是应该使用`setState`：

```jsx
// Correct
this.setState({
    comment: 'Hello'
})
```

### 2.State的更新可能是异步的

出于性能考虑，React可能会将多个`setState`调用合并为一个调用。

由于 `this.props` 和 `this.state` 可能会异步更新，所以我们不能依赖它们的值来更新下一个状态。

```jsx
// Wrong 此代码可能会无法更新计数器
this.setState({
  counter: this.state.counter + this.props.increment,
});
```

要解决这个问题，我们可以让`setState`接收一个函数而不是一个对象作为参数，并返回需要修改的属性集合对象，这个函数用上一个state作为第一个参数，此次更新被应用的props作为第二个参数。同时这个函数用箭头函数或普通函数都行。

```jsx
this.steState(function(state, props){
    return {
        counter: state.counter + props.increment
    }
})
```

### 3.State的更新会被合并

当我们调用`setState`时，React会将我们提供的对象合并到当前的State。

意思是说如果我们在State中定义了几个变量，而我们现在需要修改其中的一个，React会将我们提供的修改对象合并到原来的State中，而不会修改其他无需修改的数据。

```jsx
componentDidMount() {
    fetchPosts().then(response => {
      this.setState({
          //只会修改State中的posts属性
        posts: response.posts
      });
    });

    fetchComments().then(response => {
      this.setState({
          //只会修改State中的comments属性
        comments: response.comments
      });
    });
  }
```

这里的合并指的是浅合并，所以 `this.setState({comments})` 完整保留了`this.state.posts`， 但是完全替换了 `this.state.comments`。

## 数据是向下流动的

在React中，不管是父组件还是子组件，它们都无法得知对方是否是有状态的，而且它们也无法得知对方是函数组件还是class组件。这就是称state为局部的或是封装的的原因。除了拥有并设置它的组件，其余组件都无法访问。

组件可以选择将它的state作为props向下传递到它的子组件中：

```jsx
<FormattedDate date={this.state.date} />
```

`FormattedDate` 组件会在其 props 中接收参数 `date`，但是它本身无法知道`date`属性是来自于 `Clock` 的 state，或是 `Clock` 的 props，还是手动输入的：

```jsx
function FormattedDate(props) {
  return <h2>It is {props.date.toLocaleTimeString()}.</h2>;
}
```

这通常会被叫做“自上而下”或是“单向”的数据流。任何的 state 总是所属于特定的组件，而且从该 state 派生的任何数据或 UI 只能影响树中“低于”它们的组件。

在 React 应用中，组件是有状态组件还是无状态组件属于组件实现的细节，它可能会随着时间的推移而改变。你可以在有状态的组件中使用无状态的组件，反之亦然。

## 参考资料

+ [React State](https://zh-hans.reactjs.org/docs/state-and-lifecycle.html)