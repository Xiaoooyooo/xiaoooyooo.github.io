---
title: Grid 布局
date: 2021-05-30 21:23:43
tags:
  - 网页布局
categories:
  - HTML
---

# Grid 布局

即网格布局，它将元素按行列分为多个不同的“块”，使子项目位于这些块中，从而能实现更为复杂的布局。它类似于flex布局，但是比flex布局更为强大。

使用grid布局的元素称为容器，其内部的直接子元素则为项目。

## 容器属性

### grid-template-columns, grid-template-rows

前者用于定义容器的列，后者定义容器的行：

```css
.el {
    display: grid;
    grid-template-columns: 100px 100px 100px; /* 定义3列，每列宽100px */
    grid-template-rows: 100px 100px 100px; /* 定义3行，每行高100px */
}
```

如果定义的每行每列宽高都一致的话，则可以使用`repeat`函数简写：

```css
.el {
    display: grid;
    grid-template-columns: repeat(3, 100px); /* 定义3列，每列宽100px */
    grid-template-rows: repeat(3, 100px); /* 定义3行，每行高100px */
}
```

要使列数尽可能的适应容器宽度，则可以使用`auto-fill`关键字使列数在不超过容器宽度的情况下尽可能的多：

```css
.el {
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px); /* 列数尽可能多，每列宽100px */
    grid-template-rows: repeat(3, 100px); /* 定义3行，每行高100px */
}
```

### fr 关键字

仅在grid布局中生效的关键字，用于表示相对宽度。（类似于flex布局中`flex-grow`与`flex-shrink`）

### minmax() 函数

该函数产生一个长度范围，接受最小和最大两个参数。

如果最大值大于最小值，则`minmax(最大值, 最小值)`被看作是`最小值`；反之取最大值。

```css
.el {
    grid-template-columns: 1fr 1fr minmax(100px, 1fr);
}
```

### auto 关键字

auto关键字表示该行/列所占的宽/高度由该行/列中最大的项目决定，确保该行/列能完整容下所有项目。

```css
.el {
    grid-template-columns: 100px auto 100px;
}
```

上述css代码表示第二列宽度自适应，一般为容器最大剩余空间，除非使用`max-width`做了限制

### 网格线的名称

网格线可用于子项目的定位。

在定义网格的同时，可以使用`[]`在每行、列网格之间定义网格线的名称，方便之后的引用：

```css
.el {
    grid-template-columns: [c1] 100px [c2] 100px [c3];
    grid-template-rows: [r1] 100px [r2] 100px [r3];
}
```

一根网格线允许拥有多个名称，只需在`[]`中使用空格隔开。

### 网格间距

可以使用`grid-column-gap`和`grid-row-gap`定义网格之间的最小间距：

```css
.el {
    grid-row-gap: 10px;
    grid-column-gap: 20px;

    /* 简写 */
    grid-gap: 10px 20px;
    /* 或 */
    gap: 10px 20px;
}
```

### 网格区域

使用`grid-template-areas`定义网格区域：

```css
.el {
    grid-template-areas: "a b c" "d e f" "g h i";
}
```

上述代码定义了一个3*3的网格，共九个区域。还可以使某些区域的名称相同，从而合并这些区域：

```css
.el {
    grid-template-areas: "header header header" "main main sider" "footer footer footer";
}
```

注：如有不需要使用的区域，则可以用`.`填充相应的区域。区域的命名会影响到网格线，每个区域的起始网格线和结束网格线分别为：`<区域名>-start`和`<区域名>-end`

### 网格排列顺序

使用`grid-auto-flow`定义网格排列顺序：

```css
.el {
    grid-auto-flow: [row | column] || dense;
}
```

`dense`为可选值，作用为某些元素指定了排布位置或大小而其附近留下了较大的空白，则后续出现的较小的元素将会尝试填充这些空白。

### 自定义超出网格项目的大小

容器的大小计算方法为：`列数 * 行数`，如果子项目的数量超出了这个数，那么一部分子项目将会超出容器。

如果子项目超出了容器内部，则浏览器会自动生成合适数量的行或列来适应该项目的位置，默认情况下生成的行列宽高为其内容的大小。

可以使用`grid-auto-columns`和`grid-auto-rows`指定生成的单元格的大小：

```css
.el {
    grid-auto-rows: 100px;
    grid-auto-columns: 100px;
}
```

## 项目属性

### 根据网格线定位

+ `grid-column-start`：设置当前项目的起始列网格线编号；
+ `grid-column-end`：设置当前项目的结束列网格线编号，不设置默认为起始列网格线加1。
  + 上面两个可缩写为：`grid-column: start / end`，当只跨过一列时，`end`可不写。
+ `grid-row-start`：设置当前项目的结束行网格线编号；
+ `grid-row-end`：设置当前项目的结束行网格线编号，不设置默认为起始行网格线加1。
  + 上面两个可以缩写为：`grid-row: start / end`，当只跨过一行时，`end`可不写。

上面四个属性可简写为：`grid-area: row-start / column-start/ row-end / column-end`。

其余未设置定位的项目按剩余空间按顺序分配位置。

#### span关键字

用于定义当前项目跨越的行/列数，例如：

```css
.el {
    grid-column: 1 / span 2; /* 以第一条列网格线为起点，跨过2列 */
}
```

## 网格布局与flex布局的区别

网格布局：二维布局，能控制项目在行和列上的行为；

flex布局：一维布局，仅能控制项目在行或列单一方向上的布局。

## 参考资料

+ [网格布局的基本概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout)
+ [grid layout 和其它布局方法的联系](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout/Relationship_of_Grid_Layout)



