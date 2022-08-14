---
title: GitHub Actions
date: 2022-08-14 23:22:43
tags:
  - Github
  - Github Actions
  - Deploy
categories:
  - Github
---

# GitHub Actions

> 在 GitHub Actions 的仓库中自动化、自定义和执行软件开发工作流程。 您可以发现、创建和共享操作以执行您喜欢的任何作业（包括 CI/CD），并将操作合并到完全自定义的工作流程中。

## 基本介绍

一个操作可以看作是一个文件夹，其中包含一个`action.yml`或`action.yaml`的**元数据文件**（只能是这两个名称中的一个）。
元数据文件都使用了yaml的语法格式。 如果您是 YAML 的新用户，请参阅[五分钟了解 YAML](https://www.codeproject.com/Articles/1214409/Learn-YAML-in-five-minutes)。

一个元数据文件需要包含以下内容：

### name

**必要**，操作的名称。 GitHub 在 Actions（操作）选项卡中显示 name，帮助从视觉上识别每项作业中的操作。

### author

可选，操作的作者姓名。

### description

可选，操作的简单介绍。

### inputs

可选，对于该操作的输入。例如：

```yml
inputs:
  # 输入的变量名为 numOctocats
  numOctocats:
    description: 'Number of Octocats'
    required: false # 该输入不是必须的
    default: '1' # 该输入的默认值
  octocatEyeColor:
    description: 'Eye color of the Octocats'
    required: true # 该输入是必须的
```

#### inputs.<input_id>
**必要**，必须以字母或 _ 开头，并且只能包含字母数字、- 或 _。例如上面示例的`numOctocats`和`octocatEyeColor`。

#### inputs.<input_id>.description

**必要**，输入参数的简单描述。

#### inputs.<input_id>.required

**可选**，标注该输入是否为必须输入，`true`表示必须。

#### inputs.<input_id>.default

可选，当工作流程文件中未提供输入时使用该默认值。

#### inputs.<input_id>.deprecationMessage

可选，如果使用输入参数，此 string 将记录为警告消息。 您可以使用此警告通知用户输入已被弃用，并提及任何其他替代方式。

## outputs

### 用于 Docker 容器和 JavaScript 操作的 outputs

可选，输出参数允许您声明操作所设置的数据。例如：

```yaml
outputs:
  sum: # id of the output
    description: 'The sum of the inputs' # 输出的简单描述
```

#### outputs.<output_id>

**必要**，要与输出关联的识别符。如上面示例中的`sum`。

#### outputs.<output_id>.description

**必要**，输出参数的简单描述。

### 用于复合操作的 outputs

可选，除了拥有与`用于 Docker 容器和 JavaScript 操作的 outputs`相同的参数之外还有一个`outputs.<output_id>.value`。例如：

```yaml
outputs:
  random-number:
    description: "Random number"
    # 将后续步骤中的某个输出定义为该操作的一个输出
    value: ${{ steps.random-number-generator.outputs.random-id }}
runs:
  using: "composite"
  steps:
    - id: random-number-generator # 在其他地方可以使用 steps.random-number-generator 引用该步骤
      run: echo "::set-output name=random-id::$(echo $RANDOM)" # @see https://docs.github.com/cn/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
      shell: bash
```

#### outputs.<output_id>.value

**必要**，输出参数将会映射到的值。您可以使用上下文将此设置为 string 或表达式。例如，您可以使用 steps 上下文将输出的 value 设置为步骤的输出值。

#### 一些tips

+ windows下无法更改文件的一些属性，这时可以使用git来修改。例如，更改文件的可执行属性：
  ```bash
  git update-index --chmod=+x path/to/file
  ```

## runs

### 用于 JavaScript 操作的 runs

**必要**，详见[用于 JavaScript 操作的 runs](https://docs.github.com/cn/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-javascript-actions)

### 用于复合操作的 runs

**必要**

#### runs.using

**必要**，必须将此值设置为`composite`。

### steps

**必要**，您计划在此操作中的步骤。 这些步骤可以是`run`步骤或`uses`步骤。

#### runs.steps[*].name

可选，步骤的名称

#### runs.steps[*].id

可选，步骤的唯一标识符。您可以使用`id`引用上下文中的步骤。

#### runs.steps[*].env

可选，设置环境变量的 map 仅用于该步骤。 如果要修改存储在工作流程中的环境变量，请在组合运行步骤中使用 echo "{name}={value}" >> $GITHUB_ENV。

#### runs.steps[*].working-directory

可选，指定命令在其中运行的工作目录。

#### runs.steps[*].uses

可选，选择作为作业步骤一部分运行的操作。操作是一种可重复使用的代码单位。您可以使用工作流程所在仓库中、公共仓库中或[发布 Docker 容器映像](https://hub.docker.com/)中定义的操作。
有些操作要求必须通过 with 关键词设置输入。

#### runs.steps[*].with

可选，输入参数的 map 由操作定义。 每个输入参数都是一个键/值对。 输入参数被设置为环境变量。 该变量的前缀为 INPUT_，并转换为大写。

#### runs.steps[*].run

可选，需要运行的命令。这可以是内联的，也可以是操作仓库中的脚本：

```yaml
runs:
  using: "composite" # 必须设置 using 为 composite
  steps:
    - run: ${{ github.action_path }}/test/script.sh # 运行一个脚本文件，关于 github.action_path @see https://docs.github.com/cn/actions/reference/context-and-expression-syntax-for-github-actions#github-context
      shell: bash # 指定终端
```

#### runs.steps[*].shell

可选，您想要在其中运行命令的`shell`。如果设置了`run`，则必填。
[可选的shell](https://docs.github.com/cn/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsshell)

#### runs.steps[*].if

可选，使步骤仅在满足条件时才运行。您可以使用任何支持上下文和表达式来创建条件。
在 if 条件下使用表达式时，可以省略表达式语法`${{ }}`，因为 GitHub 会自动将`if`条件作为表达式求值。 更多信息请参阅[表达式](https://docs.github.com/cn/actions/learn-github-actions/expressions)。

### 用于 Docker 容器操作的 runs

**必要**，配置用于 Docker 容器操作的图像。

详见[用于 Docker 容器操作的 runs](https://docs.github.com/cn/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-docker-container-actions)

## 参考资料

+ [GitHub Actions](https://docs.github.com/cn/actions)

+ [创建组合式操作](https://docs.github.com/cn/actions/creating-actions/creating-a-composite-action)

+ [工作流程上下文](https://docs.github.com/cn/actions/learn-github-actions/contexts)

+ [Github action的元数据语法](https://docs.github.com/cn/actions/creating-actions/metadata-syntax-for-github-actions)

+ [GitHub Actions 的工作流程命令](https://docs.github.com/cn/actions/using-workflows/workflow-commands-for-github-actions)

+ [Github action expressions](https://docs.github.com/cn/actions/learn-github-actions/expressions#status-check-functions)