---
title: Redux：在函数组件中的使用
date: 2021-11-15 21:39:32
tags:
  - Redux
  - '@reduxjs/toolkit'
categories: 
  - Redux
---

# Redux：在函数组件中的使用

本文基于官方推荐的工具`@reduxjs/toolkit`和`react-redux`，以及`typescript`。

## 安装

```bash
yarn add @redux/toolkit react-redux
```

## 初始化store

### 创建store模块

`counterStore.ts`：创建一个存储计数器数据的store

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// PayloadAction: 官方准备好的带有payload的action类型声明
const counterStore = createSlice({
    name: "counter",
    initialState: {
        count: 0,
    },
    reducers: {
        changeCount: (state, action: PayloadAction<number | undefined>) => {
            // 在createSlice中可以直接修改state对象
            state.count += action.payload || 0;
        }
    }
});

// createSlice会根据其中的reducers自动生成对应的action和reducer，我们只管使用
export const { changeCount } = counterStore.actions;
export default counterStore.reducer;
```

### 初始化根store

`store.ts`

```typescript
import { configureStore, combineReducers } from "@reduxjs/toolkit";

// 引入刚才创建的计数器reducer
import counterReducer from "./counterStore";

// 将引入的各种reducer组合起来（虽然这里只有一个）
const reducer = combineReducer({
    counter: counterReducer,
    // ...其他的reducer
});

// 创建rootStore
const rootStore = configureStore({
    reducer: reducer,
});

export default rootStore;
// 至此仅在js方面已经实现了功能，但是我们使用的是ts，所以还有额外的操作
// 导出数据类型
export type RootStore = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;
```

### 类型推断（仅typescript）

`hooks.ts`：封装`react-redux`中的部分钩子，如果不使用ts则不需要进行下面的操作。

```typescript
import {
    useDispatch,
    useStore,
    useSelector,
    typedUseSelectorHook
} from "react-redux";
import { RootStore, AppDispatch } from "./store";

// 此后在项目中使用这些hook而不是直接使用react-redux中的hook
// 这些hook能自动推断相应的数据类型
export const useAppStore = () => useStore<RootStore>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: typedUseSelectorHook<RootStore> = useSelector;
```

## 使用

`main.tsx`：项目入口文件

```tsx
import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";

import store from "./store";
import App from "./app";

ReactDom.render(
	<Provider store={store}>
    	<App />
    </Provider>,
    document.getElementById("app")
);
```

`App.tsx`

```tsx
import React from "react";
import { useAppStore, useAppDispatch, useAppSelector } from "./hooks";

// 导入counter的actionCreator
import { changeCount } from "./counterStore";

const App = function() {
    const store = useAppStore();
    const countStore = useAppSelector(state => state.counterStore);
    const dispatch = useAppDispatch();
    return (
    	<div>
        	<p>count: {countStore.count}</p>
            <button onClick={() => dispatch(changeCount(1))}>increment by 1</button>
            <button onClick={() => dispatch(changeCount(-1))}>decrement by 1</button>
        </div>
    );
}
```

## 参考资料

+ [redux-toolkit usage with ts](https://redux-toolkit.js.org/tutorials/typescript)
+ [react-redux usage with ts](https://react-redux.js.org/using-react-redux/usage-with-typescript)

