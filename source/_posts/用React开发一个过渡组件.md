---
title: 用React开发一个通用过渡组件
date: 2023-05-20 15:36:24
tags:
  - 前端
  - React
categories:
  - React
---

# 用React开发一个通用过渡组件

用过Vue的开发者都知道它和React的一个区别，那就是Vue已经为开发者准备好了一个`transition`组件用于实现过渡效果，但是React并没有，取而代之的是一些额外的依赖，例如`react-spring`，`framer-motion`，`react-transition-group`，`react-motion`等，我们也可以使用这些依赖来实现丰富的过渡效果。但是这里就不介绍这些依赖的具体用法了，我们自己动手来实现一个类似的过渡组件。

## 组件设计

想象一个任意的过渡效果，它的过程可以分为三个阶段：准备过渡，过渡进行中，过渡完成。考虑到过渡还分为进入和离开两种状态，因此就一个完整的过渡周期而言一共有6个阶段，不妨将其定义为以下6个常量：

```js
const beforeEnter = "before-enter";
const enterActive = "enter-active";
const enterDone = "enter-done";
const beforeLeave = "before-leave";
const leaveActive = "leave-active";
const leaveDone = "leave-done";
```

同时还需要一个变量`visible`来表示此时的过渡状态是进入还是离开，这里使用布尔值即可，`true`表示进入状态，反之表示离开状态。

在组件的用法上，我们通过改变`visible`变量的值来控制过渡状态的进行，通过`visible`的变化在组件内部控制组件过渡的`stage`，即上面的6个阶段，并在各个`stage`为需要过渡的组件添加合适的`class`从而实现过渡效果。为此我们还需要7个变量，分别对应6个阶段的需要为过渡组件添加`class`和组件内部的`stage`，不妨定义为`beforeEnterClass`，`enterActiveClass`，`enterDoneClass`，`beforeLeaveClass`，`leaveActiveClass`，`leaveDoneClass`以及`stage`。`stage`得有一个初始值，最好的办法是根据传入的`visible`的初始值来决定，这里定义为：初始`visible`为`true`，那么`stage = "enter-done"`，反之`stage = "leave-done"`。最后该组件的返回内容取决于此时的`stage`。

## 组件实现

基于组件的设计方案，可以定义出组件接受的参数类型：

```typescript
type TransitionProps = {
  visible: boolean;
  children: JSX.Element;
  beforeEnterClass: string;
  enterActiveClass: string;
  enterDoneClass: string;
  beforeLeaveClass: string;
  leaveActiveClass: string;
  leaveDoneClass: string;
};
```

以及各个过渡状态对应的类型：

```typescript
type TransitionStage =
  | "before-enter"
  | "enter-active"
  | "enter-done"
  | "before-leave"
  | "leave-active"
  | "leave-done";
```

此时我们可以在组件中写入以下内容：

```tsx
function Transition(props: TransitionProps) {
  const {
    visible,
    children,
    beforeEnterClass,
    enterActiveClass,
    enterDoneClass,
    beforeLeaveClass,
    leaveActiveClass,
    leaveDoneClass,
  } = props;
  const [stage, changeStage] = useState<TransitionStage>(visible ? "enter-done" : "leave-done");
  let content: JSX.Element | null;
  switch (stage) {
    case "before-enter": {
      content = (
        <div className={beforeEnterClass}>
          {children}
        </div>
      );
      break;
    }
    case "enter-active": {
      content = (
        <div className={`${enterActiveClass} ${enterDoneClass}`}>
          {children}
        </div>
      );
      break;
    }
    case "enter-done": {
      content = children;
      break;
    }
    case "before-leave": {
      content = (
        <div className={beforeLeaveClass}>
          {children}
        </div>
      );
      break;
    }
    case "leave-active": {
      content = (
        <div className={`${leaveActiveClass} ${leaveDoneClass}`}>
          {children}
        </div>
      );
      break;
    }
    case "leave-done": {
      content = null;
    }
  }
  return createPortal(content, document.body);
}
```

> 注意，这里组件的实现在`stage`为`leave-done`阶段时返回了`null`，这不是必须的，你也可以使用一个额外的参数来确定是否返回`null`。 
>
> 并且，在组件返回使用了`createPortal`，这表示需要过渡的的元素将会被挂载到`document.body`，这里也可以使用一个额外的参数来决定是否需要使用`createPortal。`

因为变量`stage`是由参数`visible`驱动的，为此我们需要监听`visible`参数的变化，并更新`stage`至对应的阶段，从而更改组件的返回内容来刷新画面。每次`visible`的变化即表示一次过渡的开始，这可以简单用以下代码实现：

```tsx
useEffect(() => {
  if (visible) {
    changeStage("before-enter");
  } else {
    changeStage("before-leave");
  }
}, [visible]);
```

同时，各个阶段完成时也要在恰当的时机进入到下一个阶段，为此我们还需要监听`stage`变量的变化，就一个进入过程来说，它的初始阶段为`before-enter`，在什么时候进入到`enter-active`阶段呢？显然最快是`before-enter`阶段绘制到页面上的下一帧。那么又是什么时候进入到`enter-done`阶段呢，显然是等待过渡完成了。

基于此我们的组件有了以下更新：

```diff
function Transition(props: TransitionProps) {
  const {
    visible,
    children,
    beforeEnterClass,
    enterActiveClass,
    enterDoneClass,
    beforeLeaveClass,
    leaveActiveClass,
    leaveDoneClass,
  } = props;
  const [stage, changeStage] = useState<TransitionStage>(
    visible ? "enter-done" : "leave-done"
  );
+  const ref = useRef<HTMLDivElement>(null);
+  useEffect(() => {
+    if (visible) {
+      changeStage("before-enter");
+    } else {
+      changeStage("before-leave");
+    }
+  }, [visible]);
+  useEffect(() => {
+    if (stage === "before-enter") {
+      requestAnimationFrame(() => {
+        changeStage("enter-active");
+      });
+    } else if (stage === "enter-active") {
+      ref.current.addEventListener(
+        "transitionend",
+        function () {
+          changeStage("enter-done");
+        },
+        { once: true }
+      );
+    } else if (stage === "before-leave") {
+      requestAnimationFrame(() => {
+        changeStage("leave-active");
+      });
+    } else if (stage === "leave-active") {
+      ref.current.addEventListener(
+        "transitionend",
+        function () {
+          changeStage("leave-done");
+        },
+        { once: true }
+      );
+    }
+  }, [stage]);
  let content: JSX.Element | null;
  switch (stage) {
    case "before-enter": {
-      content = <div className={beforeEnterClass}>{children}</div>;
+      content = <div ref={ref} className={beforeEnterClass}>{children}</div>;
      break;
    }
    case "enter-active": {
-      content = <div className={enterActiveClass}>{children}</div>;
+      content = <div ref={ref} className={enterActiveClass}>{children}</div>;
      break;
    }
    case "enter-done": {
-      content = <div className={enterDoneClass}>{children}</div>;
+      content = <div ref={ref} className={enterDoneClass}>{children}</div>;
      break;
    }
    case "before-leave": {
-      content = <div className={beforeLeaveClass}>{children}</div>;
+      content = <div ref={ref} className={beforeLeaveClass}>{children}</div>;
      break;
    }
    case "leave-active": {
-      content = <div className={leaveActiveClass}>{children}</div>;
+      content = <div ref={ref} className={leaveActiveClass}>{children}</div>;
      break;
    }
    case "leave-done": {
      content = null;
    }
  }
  return createPortal(content, document.body);
}
```

> 注意，在这里我们使用了监听 transitionend 事件的方式来得知过渡完成的时机并更新 stage 至下一个阶段，你也可以选择使用一个表示过渡时长的参数并使用 setTimeout 来实现

到此为止是时候测试测试我们的组件了，下面时我们的测试例子：

```tsx
import { useState } from "react";
import Transition from "./Transition";

export default function App() {
  const [visible, changeVisible] = useState(false);
  return (
    <div>
      <button onClick={() => changeVisible((v) => !v)}>toggle</button>
      <Transition
        visible={visible}
        beforeEnterClass="opacity-0"
        enterActiveClass="transition-opacity duration-1000"
        enterDoneClass="opacity-100"
        beforeLeaveClass="opacity-100"
        leaveActiveClass="transition-opacity duration-1000"
        leaveDoneClass="opacity-0"
      >
        <div>This is a test.</div>
      </Transition>
    </div>
  );
}
```

代码打包后运行查看效果发现，当初始`visible`传递为`false`是，元素并没有一开始就隐藏，而是有一个从显示到隐藏过渡效果，更改初始`visible`为`true`时也有类似的问题，其次，当快速点击`toggle`按钮时，画面上的元素显示出现了诡异的行为。接下来让我们分开来看这两个问题。

首先看第一个问题，通过分析代码执行逻辑可知，初始`visible`为`false`时，监听`visible`变化的`changeStage("before-leave")`被执行了，这导致组件立即开始了一次离开的过渡效果，显然初次渲染时这里是不需要执行的，为此我们可以加一个变量来判断是否为初次渲染。还有一种方式，既然是离开的过渡效果，那么在过渡开始之前，组件应该正好处于`enter-done`的阶段，因此，我们可以在这里添加一个判断，来跳过某些情况下的执行。修改这部分的代码如下：

```diff
useEffect(() => {
  if (visible) {
-    changeStage("before-enter");
+    if (stage === "leave-done") {
+      changeStage("before-enter");
+    }
  } else {
-    changeStage("before-leave");
+    if (stage === "enter-done") {
+      changeStage("before-leave");
+    }
  }
}, [visible]);
```

重新打包代码运行查看效果后，果然第一个问题修复了。接下来看第二个问题，发现貌似第二个问题也修复了，实则不然，对于快速点击的问题还有优化的空间，在一个过渡状态进行的过程中，我们理论上也能够将其变化为另一个过渡状态。对于这个问题，同样的再加个判断就能够解决了，再将上面的代码修改以下：

```diff
useEffect(() => {
  if (visible) {
    if (stage === "leave-done") {
      changeStage("before-enter");
+    } else if (stage === "leave-active") {
+      changeStage("enter-active");
    }
  } else {
    if (stage === "enter-done") {
      changeStage("before-leave");
+    } else if (stage === "enter-active") {
+      changeStage("leave-active");
    }
  }
}, [visible]);
```

这时再查看效果，初始显示正常，快速点击也没有问题，至此我们的需求看似实现了，但是还有一些需要优化的点。

我们在`leave-active`阶段时为过渡的元素绑定了一个`transitionend`事件，当过渡阶段反转到`enter-active`时，这个事件没有被清除，你可以在`transitionend`事件处理函数里面添加一些打印内容来验证这个问题。现在需要做的就是清除这个事件，

```diff
+const onEnterTransitionendCallback = useCallback(() => {
+  changeStage("enter-done");
+}, []);
+const onLeaveTransitionendCallback = useCallback(() => {
+  changeStage("leave-done");
+}, []);
useEffect(() => {
  if (visible) {
    if (stage === "leave-done") {
      changeStage("before-enter");
    } else if (stage === "leave-active") {
+      ref.current.removeEventListener(
+        "transitionend",
+        onLeaveTransitionendCallback
+      );
      changeStage("enter-active");
    }
  } else {
    if (stage === "enter-done") {
      changeStage("before-leave");
    } else if (stage === "enter-active") {
+      ref.current.removeEventListener(
+        "transitionend",
+        onEnterTransitionendCallback
+      );
      changeStage("leave-active");
    }
  }
}, [visible]);
useEffect(() => {
  if (stage === "before-enter") {
    requestAnimationFrame(() => {
      changeStage("enter-active");
    });
  } else if (stage === "enter-active") {
    ref.current.addEventListener(
      "transitionend",
-      function () {
-        changeStage("enter-done");
-      },
+      onEnterTransitionendCallback,
      { once: true }
    );
  } else if (stage === "before-leave") {
    requestAnimationFrame(() => {
      changeStage("leave-active");
    });
  } else if (stage === "leave-active") {
    ref.current.addEventListener(
      "transitionend",
-      function () {
-        changeStage("leave-done");
-      },
+      onLeaveTransitionendCallback,
      { once: true }
    );
  }
}, [stage]);
```

最后附上这个过渡组件完整的代码：

```tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
type TransitionProps = {
  visible: boolean;
  children: JSX.Element;
  beforeEnterClass: string;
  enterActiveClass: string;
  enterDoneClass: string;
  beforeLeaveClass: string;
  leaveActiveClass: string;
  leaveDoneClass: string;
};

type TransitionStage =
  | "before-enter"
  | "enter-active"
  | "enter-done"
  | "before-leave"
  | "leave-active"
  | "leave-done";

export default function Transition(props: TransitionProps) {
  const {
    visible,
    children,
    beforeEnterClass,
    enterActiveClass,
    enterDoneClass,
    beforeLeaveClass,
    leaveActiveClass,
    leaveDoneClass,
  } = props;
  const [stage, changeStage] = useState<TransitionStage>(
    visible ? "enter-done" : "leave-done"
  );
  const ref = useRef<HTMLDivElement>(null);
  const onEnterTransitionendCallback = useCallback(() => {
    changeStage("enter-done");
  }, []);
  const onLeaveTransitionendCallback = useCallback(() => {
    changeStage("leave-done");
  }, []);
  useEffect(() => {
    if (visible) {
      if (stage === "leave-done") {
        changeStage("before-enter");
      } else if (stage === "leave-active") {
        ref.current!.removeEventListener(
          "transitionend",
          onLeaveTransitionendCallback
        );
        changeStage("enter-active");
      }
    } else {
      if (stage === "enter-done") {
        changeStage("before-leave");
      } else if (stage === "enter-active") {
        ref.current!.removeEventListener(
          "transitionend",
          onEnterTransitionendCallback
        );
        changeStage("leave-active");
      }
    }
  }, [visible]);
  useEffect(() => {
    if (stage === "before-enter") {
      requestAnimationFrame(() => {
        changeStage("enter-active");
      });
    } else if (stage === "enter-active") {
      ref.current!.addEventListener(
        "transitionend",
        onEnterTransitionendCallback,
        { once: true }
      );
    } else if (stage === "before-leave") {
      requestAnimationFrame(() => {
        changeStage("leave-active");
      });
    } else if (stage === "leave-active") {
      ref.current!.addEventListener(
        "transitionend",
        onLeaveTransitionendCallback,
        { once: true }
      );
    }
  }, [stage]);
  let content: JSX.Element | null;
  switch (stage) {
    case "before-enter": {
      content = (
        <div ref={ref} className={beforeEnterClass}>
          {children}
        </div>
      );
      break;
    }
    case "enter-active": {
      content = (
        <div ref={ref} className={`${enterActiveClass} ${enterDoneClass}`}>
          {children}
        </div>
      );
      break;
    }
    case "enter-done": {
      content = children;
      break;
    }
    case "before-leave": {
      content = (
        <div ref={ref} className={beforeLeaveClass}>
          {children}
        </div>
      );
      break;
    }
    case "leave-active": {
      content = (
        <div ref={ref} className={`${leaveActiveClass} ${leaveDoneClass}`}>
          {children}
        </div>
      );
      break;
    }
    case "leave-done": {
      content = null;
    }
  }
  return createPortal(content, document.body);
}
```

## 进阶

用过`react-transition-group`或`react-motion`的你应该知道，它们都支持使用函数式`children`实现过渡，这种过渡方式能够更加精准地控制各个过渡阶段的组件行为，你知道如何实现吗？
为了节省篇幅，这个问题我就不再详细解答了，该组件的实现请见参考资料中的源码。

## 参考资料

+ [本文源码参考](https://github.com/Xiaoooyooo/demos/tree/master/react-transition)