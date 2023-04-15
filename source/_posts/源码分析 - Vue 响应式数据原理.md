---
title: 源码分析 - Vue 响应式数据原理
date: 2022-09-30 10:56:08
tags:
	- 源码
	- Vue
categories:
	- 源码分析
---
# Vue 响应式数据原理

**本文基于[Vue@2.7.10](https://github.com/vuejs/vue/tree/v2.7.10)**

## 准备调试环境

```bash
yarn dev
# or
npm run dev
# or
pnpm dev
```

该命令会打包一份用于在浏览器端直接能够运行的代码，输出位于`dist/vue.js`，对依赖文件所做的更改都将会重新触发打包。

为了方便理解，测试所用的html文件将尽可能的简单，如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="./dist/vue.js"></script>
  <title>Vue demo</title>
</head>
<body><div id="app"><h1>hello world</h1><div>MESSAGE: {{ message }}</div></div><script>
  // 上面的模板写在一行内，减少因换行符引起的额外的"Element"的创建
    const vm = new Vue({
      el: "#app",
      data() {
        return {
          message: "This is a message."
        }
      }
    });
    // 所有在控制台的对于实例的操作都将通过该vm对象进行，例如更改msssage
    window.vm = vm;
  </script>
</body>
</html>
```

### 注意事项

1. 本文展现的vue源码相关的代码中，所有以`//===`开头的注释为我本人添加的注释，其他的均为原文注释。

## 核心

Vue的核心代码如下：

```js
function Vue(options) {
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

不同的环境还对核心的Vue进行了不同的扩展和重写，我们的测试仅仅在浏览器中进行，这个环境在`Vue`对象上新增了一系列的属性和方法，值得关注的是原型上的`$mount`方法，细节将在稍后说明，现在就从`new Vue()`开始吧。

## 实例

从核心代码可以看到，新建一个Vue实例时，其内部仅仅调用了[this._init(options)](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/init.ts#L17)方法，这个方法在[initMixin(Vue)](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/init.ts#L17)中被初始化，其中一部分内容是：

```ts
//=== 这里的 options 为我们新建实例时定义的 options，因此 _isComponent 为 false
if (options && options._isComponent) {
  // optimize internal component instantiation
  // since dynamic options merging is pretty slow, and none of the
  // internal component options needs special treatment.
  initInternalComponent(vm, options as any)
} else {
  vm.$options = mergeOptions(
    //=== 将通过 Vue.component() 注册的组件合并进来，filters、directives 同理
    //=== Vue.options 的挂载详见 src/core/global-api/index.ts 和 src/platforms/web/runtime/index.ts
    resolveConstructorOptions(vm.constructor as any),
    options || {},
    vm
  )
}
```

上面的代码在我们的实例上新建了一个`$options`属性，具体的内容可参考注释以及对应的代码。

接下来是主要的部分：

```js
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate', undefined, false)
initInjections(vm)
initState(vm)
initProvide(vm)
callHook(vm, 'created')

//=== 省略一部分与 __DEV__ 相关的代码

//=== 这里的代码值得注意，但是先不管，后面再回来继续研究
if (vm.$options.el) {
  vm.$mount(vm.$options.el)
}
```

这里主要关注的步骤为[initState](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/state.ts#L52)，这一步就是将我们定义的组件`data`变为响应式的关键操作，其中的内容如下：

```ts
export function initState(vm: Component) {
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)

  // Composition API
  initSetup(vm) //=== 组合式api，本文不研究

  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    const ob = observe((vm._data = {}))
    ob && ob.vmCount++
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

这里的`vm`就是当前Vue实例，`$options`的来源在上文中我们已经提到过了，由于我们建的实例非常简单，所以这里只需要关注[initData(vm)](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/state.ts#L122)这里，其中的代码如下：

```ts
function initData(vm: Component) {
  let data: any = vm.$options.data
  //=== 将该实例的数据对象保存到 _data 属性上
  data = vm._data = isFunction(data) ? getData(data, vm) : data || {}
  if (!isPlainObject(data)) {
    data = {}
    __DEV__ &&
      warn(
        'data functions should return an object:\n' +
          'https://v2.vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (__DEV__) {
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm)
      }
    }
    if (props && hasOwn(props, key)) {
      __DEV__ &&
        warn(
          `The data property "${key}" is already declared as a prop. ` +
            `Use prop default value instead.`,
          vm
        )
    } else if (!isReserved(key)) {
      //=== 将 vm._data 中的属性使用 getter 和 setter 代理到 vm 上
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  const ob = observe(data) //=== 到此为止，我们的实例的 data 应该为 { message: "This is a message." }
  ob && ob.vmCount++
}
```

> 这里对其中的一些工具函数做一些介绍：
> 
> isFunction: 判断传入的参数是否为函数
> isPlainObject: 通过Object.prototype.toString判断传入的参数类型是否为"[object Object]"
> hasOwn: 判断传入的第一个参数（对象）是否包含第二个参数（键名）
> isReserved: 判断传入的key是否以"\_"或"$"开始
> proxy: 以 proxy(vm, "_data", key) 为例，将对 vm[key] 的操作映射到 vm._data[key]

这里的主要关注点在于最后的[observe(data)](https://github.com/vuejs/vue/blob/v2.7.10/src/core/observer/index.ts#L105)，这是实现响应式数据的关键步骤，其中的代码如下：

```ts
export function observe(
  value: any,
  shallow?: boolean, //=== 注意文代码中的调用传参，这个参数应该为 undefined
  ssrMockReactivity?: boolean //=== 同上
): Observer | void {
  if (!isObject(value) || isRef(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  //=== __ob__ 为一个 Observer 实例的特殊标识
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve && // 该变量为一个全局变量，默认为 true
    (ssrMockReactivity || !isServerRendering()) && //=== 服务端渲染相关
    (isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value.__v_skip /* ReactiveFlags.SKIP */
  ) {
    ob = new Observer(value, shallow, ssrMockReactivity)
  }
  return ob
}
```

通过对流程的梳理，接下来运行的代码为`ob = new Observer(value, shallow, ssrMockReactivity)`，为了减少篇幅，这里只展示[Observer](https://github.com/vuejs/vue/blob/v2.7.10/src/core/observer/index.ts#L49)的构造函数的代码：

```ts
constructor(public value: any, public shallow = false, public mock = false) {
  this.dep = mock ? mockDep : new Dep()
  this.vmCount = 0
  def(value, '__ob__', this) //=== def 为 Object.defineProperty 的别名
  if (isArray(value)) {
    //=== 对数组的处理，我们的测试没有用数组，因此略
  } else {
    /**
     * Walk through all properties and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    const keys = Object.keys(value)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      //=== NO_INIITIAL_VALUE 一个常量，等于一个空对象
      defineReactive(value, key, NO_INIITIAL_VALUE, undefined, shallow, mock)
    }
  }
}
```

注意调用`Observer`构造函数时的传参，其中的`shallow`和`mock`都为`false`，因此`this.dep = mock ? mockDep : new Dep()`这段代码相当于`this.dep = new Dep()`。

继续便是大名鼎鼎的[defineReactive](https://github.com/vuejs/vue/blob/v2.7.10/src/core/observer/index.ts#L131)，这个函数很重要，虽然代码比较多，但是还是有必要贴一下：

```ts
/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
  obj: object,
  key: string,
  val?: any,
  customSetter?: Function | null,
  shallow?: boolean,
  mock?: boolean
) {
  //=== 定义一个 dep 用于收集依赖
  //=== 依赖是如何收集的？这里我们先记一下，但是现在不去研究
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if (
    (!getter || setter) &&
    (val === NO_INIITIAL_VALUE || arguments.length === 2)
  ) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val, false, mock)
  //=== 大名鼎鼎的响应式原理就在这里了
  //=== 此时只是定义了代码逻辑，还没有正式执行里面的 get 和 set
  //=== 这里我们也先记一下，后面再回来研究
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        if (__DEV__) {
          dep.depend({
            target: obj,
            type: TrackOpTypes.GET,
            key
          })
        } else {
          dep.depend()
        }
        if (childOb) {
          childOb.dep.depend()
          if (isArray(value)) {
            dependArray(value)
          }
        }
      }
      return isRef(value) && !shallow ? value.value : value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      if (!hasChanged(value, newVal)) {
        return
      }
      if (__DEV__ && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else if (getter) {
        // #7981: for accessor properties without setter
        return
      } else if (!shallow && isRef(value) && !isRef(newVal)) {
        value.value = newVal
        return
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal, false, mock)
      if (__DEV__) {
        dep.notify({
          type: TriggerOpTypes.SET,
          target: obj,
          key,
          newValue: newVal,
          oldValue: value
        })
      } else {
        dep.notify()
      }
    }
  })

  return dep
}
```

至此，有关定义响应式数据的操作就算完成了，它是如何工作的这里暂时跳过，后面再做详细说明，接下来我们回到`_init`函数中继续往下看。

## 挂载

在`_init`函数的末尾，我们可以看到之前提到过的如下代码：

```js
if (vm.$options.el) {
  vm.$mount(vm.$options.el)
}
```

注意这个`$mount`函数，查看我们的入口文件`src/platforms/web/runtime-with-compiler.ts`，这里对原本的`$mount`进行了重写：

> 下面的代码删除了一些无关紧要的内容

```ts
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  //=== 忽略与 __dev__ 相关的内容

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      //=== 没有传递 template 选项，忽略
    } else if (el) {
      // @ts-expect-error
      template = getOuterHTML(el)
    }
    if (template) {
      //=== 忽略与 __dev__ 相关的内容

      //=== compileToFunctions 函数用于将模板转换为用于生成 VNode 的函数
      //=== 它的实现与本文的目标不相关，所以这里不做仔细探讨
      //=== 我们只需要知道它是用于生成渲染函数就行了
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: __DEV__,
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        },
        this
      )
      options.render = render //=== 生成的渲染函数
      options.staticRenderFns = staticRenderFns //=== 用途暂时不确定

      //=== 忽略与 __dev__ 相关的内容
    }
  }
  return mount.call(this, el, hydrating)
}
```

关于生成的渲染函数，我们可以选择在控制台打印一下，本文示例Vue实例生成的渲染函数如下：

```js
function anonymous() {
  with (this) {
    return _c('div', { attrs: { id: 'app' } }, [
      _c('h1', [_v('hello world')]),
      _c('div', [_v('MESSAGE: ' + _s(message))])
    ])
  }
}
```

> _c: 详见[src/core/instance/render.ts](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/render.ts#L40)
>
> _v: 详见[src/core/instance/render-heplers/index.ts](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/render-helpers/index.ts#L25)
>
> _s: 同 \_v

此时`render`被保存在实例的`$options.render`上，后面将会被用到。在`$mount`函数的最后调用了`return mount.call(this, el, hydrating)`，这里的`mount`即为被重写的`$mount`，它原来的内容如下：

```ts
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

接下来又是关键函数[mountComponent](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/lifecycle.ts#L146)，我们选取它里面的关键内容进行展示：

```ts
export function mountComponent(
  vm: Component,
  el: Element | null | undefined,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    //=== 忽略，这个值之前提到过，肯定是有的
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (__DEV__ && config.performance && mark) {
    //=== 和 __DEV__ 相关，忽略
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  const watcherOptions: WatcherOptions = {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }

  if (__DEV__) {
    //=== 和 __DEV__ 相关，忽略
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(
    vm,
    updateComponent,
    noop, //=== 一个空函数，即 function noop(){}
    watcherOptions,
    true /* isRenderWatcher */
  )
  hydrating = false

  // flush buffer for flush: "pre" watchers queued in setup()
  const preWatchers = vm._preWatchers
  if (preWatchers) {
    for (let i = 0; i < preWatchers.length; i++) {
      preWatchers[i].run()
    }
  }

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

上面的代码出现了两个比较重要的函数`vm._update`和`vm._render`，它们的定义分别在：

+ **\_update**：[src/core/instance/lifecycle.ts](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/lifecycle.ts#L62)
+ **\_render**：[src/core/instance/render.ts](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/render.ts#L103)

接下来便是一个新的类`Watcher`，首先来看看它的构造函数吧：

```ts
constructor(
  vm: Component | null,
  expOrFn: string | (() => any),
  cb: Function,
  options?: WatcherOptions | null,
  isRenderWatcher?: boolean
) {
  //=== 这个是和组合式 api 相关的，这里先不研究
  recordEffectScope(
    this,
    // if the active effect scope is manually created (not a component scope),
    // prioritize it
    activeEffectScope && !activeEffectScope._vm
      ? activeEffectScope
      : vm
      ? vm._scope
      : undefined
  )
  if ((this.vm = vm) && isRenderWatcher) {
    vm._watcher = this
  }
  //=== 前面创建实例时传递的 options 中只有一个 before 属性
  // options
  if (options) {
    this.deep = !!options.deep
    this.user = !!options.user
    this.lazy = !!options.lazy
    this.sync = !!options.sync
    this.before = options.before
    if (__DEV__) {
      this.onTrack = options.onTrack
      this.onTrigger = options.onTrigger
    }
  } else {
    this.deep = this.user = this.lazy = this.sync = false
  }
  this.cb = cb
  this.id = ++uid // uid for batching
  this.active = true
  this.post = false
  this.dirty = this.lazy // for lazy watchers
  this.deps = []
  this.newDeps = []
  //=== 注意这里，depIds 和 newDepIds 的区别在于
  //=== depIds 为该 Wather 当前 deps 的 id
  //=== newDepIds 为该 Watcher 触发了 update 时重新收集到的新的 deps 的 id
  this.depIds = new Set()
  this.newDepIds = new Set()
  this.expression = __DEV__ ? expOrFn.toString() : ''
  // parse expression for getter
  if (isFunction(expOrFn)) {
    this.getter = expOrFn
  } else {
    //=== 此时的 expOrFn 是一个函数，这部分的代码不会执行
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
      this.getter = noop
      __DEV__ &&
        warn(
          `Failed watching path: "${expOrFn}" ` +
            'Watcher only accepts simple dot-delimited paths. ' +
            'For full control, use a function instead.',
          vm
        )
    }
  }
  //=== this.lazy 的值为 false，所以这里的三元表达式会执行 this.get()
  this.value = this.lazy ? undefined : this.get()
}
```

下面继续研究`Wather`类的`get`方法：

```ts
get() {
  //=== 这一行代码很重要
  //=== 请回头查看之前的 defineReactive 方法，里面出现了 Dep.target 这个引用
  //=== 这里的 this 即为 此时的 Dep.target
  //=== 这个函数的实现很简单，就是用一个栈存储一系列的 Watcher，并将 Dep.target 指向栈的顶部
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    //=== 这里的 getter 即为之前的 updateComponent: () => { vm._update(vm._render(), hydrating) }
    value = this.getter.call(vm, vm)
  } catch (e: any) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    popTarget()
    this.cleanupDeps()
  }
  return value
}
```

接下来我们继续研究`this.getter.call(vm, vm)`这行代码，`this.getter`的值如下：

```ts
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```

首先是`_render`，它的作用是生成并返回当前组件的`VNode`节点，这里没必要去研究它的每一行代码，主要是里面出现了一个之前提到的渲染函数`$options.render`。

> 关于`_render`函数的定义，详见[src/core/instance/render.ts](https://github.com/vuejs/vue/blob/v2.7.10/src/core/instance/render.ts#L103)

有关`$options.render`，它的来源之前我们提到过，这里我们再看看它的内容：

```js
function anonymous() {
  with (this) {
    return _c('div', { attrs: { id: 'app' } }, [
      _c('h1', [_v('hello world')]),
      _c('div', [_v('MESSAGE: ' + _s(message))])
    ])
  }
}
```

`_c`、`_v`、`_s`的来源上文已经说过了，这里的关注点在于`_s`这个函数，调用`_s(message)`会发生什么呢？

没错，之前定义响应式数据时，在`defineReactive`中定义的`getter`会被调用，这里我们将其中的内容单独拿出来：

```ts
get: function reactiveGetter() {
  const value = getter ? getter.call(obj) : val
  if (Dep.target) { //=== !!!
    if (__DEV__) {
      dep.depend({
        target: obj,
        type: TrackOpTypes.GET,
        key
      })
    } else {
      dep.depend()
    }
    if (childOb) {
      childOb.dep.depend()
      if (isArray(value)) {
        dependArray(value)
      }
    }
  }
  return isRef(value) && !shallow ? value.value : value
}
```

重点关注`Dep.target`，关于它的值已经提到过了，此时它应该是当前Vue实例的`renderWatcher`，然后再看看`dep.depend`中干了什么：

```ts
depend(info?: DebuggerEventExtraInfo) {
  if (Dep.target) {
    Dep.target.addDep(this)
    //=== 下面删除了与 __DEV__ 相关的内容
  }
}
```

再看看`Watcher`的`addDep`方法干了什么：

```ts
addDep(dep: Dep) {
  const id = dep.id
  //=== 这里的判断是为了防止一个组件在页面上使用了同一个数据不止一次
  if (!this.newDepIds.has(id)) {
    //=== 每次渲染时都会重新计算依赖项
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      //=== 添加 dep 的订阅列表
      dep.addSub(this)
    }
  }
}
```

再看看`Dep`的`addSub`方法：

```ts
addSub(sub: DepTarget) {
  //=== 将 watcher 添加到订阅列表
  this.subs.push(sub)
}
```

初次看到这部分代码时可能会懵，别慌，我们先理一下`Dep`和`Watcher`是干嘛的。在定义响应式数据时，每执行一次`defineReactive`就会有一个新的`Dep`实例，即`data`中的每一个值都会对应一个`Dep`实例。而`Watcher`的话，官方的注释是：

> A watcher parses an expression, collects dependencies, and fires callback when the expression value changes.
> Watcher 会解析表达式，收集依赖，并在表达式的值变化时触发回调。

当调用`_render`函数生成虚拟DOM节点时，各个节点中用到的响应式数据都会通过上面的操作，被当作依赖项被添加到`renderWatcher`的新的依赖`newDepIds`中，并在完成后通过其内部的`cleanupDeps`方法更新（其实是直接的替换操作）到当前的依赖项`depIds`中。

简单理解的一句话，`_render`就是用来生成新的`VNode`节点的，在节点的生成过程，它会同时进行依赖收集，以便于后续的响应式更新。

回到`vm._update(vm._render(), hydrating)`这里，继续看`_update`函数，它的实现也挺有意思，但是这里不做过多研究，只需要知道它是用传入的`VNode`来更新DOM的即可。到这里，页面上已经能看到渲染出来的内容了，但是还没完。

接下来先回到`Watcher`的`get`方法中，它的最后调用了`this.cleanupDeps()`这行代码，继续看看这个函数干了什么：

```ts
cleanupDeps() {
  //=== 这里的 deps 是上次渲染时用到的依赖项，初次渲染的话就没有上次这一说
  let i = this.deps.length
  while (i--) {
    const dep = this.deps[i]
    //=== 遍历上次的依赖项，检查本次渲染是否也用到了
    if (!this.newDepIds.has(dep.id)) {
      //=== 没有的话，把当前 watcher 从这个依赖项的订阅列表中移除
      dep.removeSub(this)
    }
  }
  //=== 记下本次渲染用到的依赖项（用新的替换旧的）
  let tmp: any = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
}
```

到此为止，函数栈应该回退到`mountComponent`函数中了，在它里面还剩下一个`mounted`生命周期钩子的调用，之后实例的初次挂载就算完成了。

## 更新

更新触发重新渲染就很简单了，我们可以在控制台输入以下代码来进行更新：

```js
vm.message = "this is another message";
```

更新的入口应该在`defineReactive`函数中的`setter`中，下面是它的内容：

```ts
set: function reactiveSetter(newVal) {
  const value = getter ? getter.call(obj) : val
  if (!hasChanged(value, newVal)) {
    return
  }
  if (__DEV__ && customSetter) {
    customSetter()
  }
  if (setter) {
    setter.call(obj, newVal)
  } else if (getter) {
    // #7981: for accessor properties without setter
    return
  } else if (!shallow && isRef(value) && !isRef(newVal)) {
    value.value = newVal
    return
  } else {
    val = newVal
  }
  childOb = !shallow && observe(newVal, false, mock)
  if (__DEV__) {
    dep.notify({
      type: TriggerOpTypes.SET,
      target: obj,
      key,
      newValue: newVal,
      oldValue: value
    })
  } else {
    dep.notify()
  }
}
```

关注点在最后的`dep.notify`中，下面是`notify`函数的内容：

```ts
notify(info?: DebuggerEventExtraInfo) {
  // stabilize the subscriber list first
  const subs = this.subs.slice()
  if (__DEV__ && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort((a, b) => a.id - b.id)
  }
  for (let i = 0, l = subs.length; i < l; i++) {
    if (__DEV__ && info) {
      const sub = subs[i]
      sub.onTrigger &&
        sub.onTrigger({
          effect: subs[i],
          ...info
        })
    }
    subs[i].update()
  }
}
```

实例的`renderWatcher`此时应该在该`dep`的订阅列表中，因此后面的`renderWatcher`的`update`方法将会被调用。有关`update`工作的流程这里就不展开了，如果正在看这篇文章的你有兴趣的话，可以去研究研究。

> [src/core/observer/watcher.ts - Watcher.update](https://github.com/vuejs/vue/blob/v2.7.10/src/core/observer/watcher.ts#L196)

总结一点就是，调用`update`之后，实例的`renderWatcher`会在最后调用`renderWatcher.get`方法从而触发页面的重新渲染，而这里的`get`方法，我们在之前就已经研究过了。

## 参考资料

[vue/src at v2.7.10 · vuejs/vue · GitHub](https://github.com/vuejs/vue/tree/v2.7.10/src)
