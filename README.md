# JD Insight

JD Insight 是一个面向求职者的 AI 岗位分析工具：保存职位描述后，系统通过 FastAPI 调用 Dify Workflow，生成岗位解读、匹配诊断和行动建议。

## 文档职责

- 本文件：项目总览、整体架构、阶段进度和每日开发记录。
- [frontend/README.md](frontend/README.md)：前端启动方式、页面数据流、前端问题和开发顺序。
- [frontend/PROJECT_RESTART_GUIDE.md](frontend/PROJECT_RESTART_GUIDE.md)：较完整的架构规划、数据模型和后续扩展方案。

## 当前架构

```text
Chrome Extension / React
          -> FastAPI
          -> Dify Workflow
          -> MySQL（当前保存岗位记录）
```

当前已经具备：

- Chrome Extension 保存复制内容；
- FastAPI 岗位记录接口和 MySQL 存储；
- React JD 分析页面；
- 后端代理 Dify 调用，避免前端直接暴露 API Key；
- 历史岗位的单条分析入口。

当前尚未完成：

- Step2、Step3 的真实 Dify 输出；
- 完整的简历版本管理、文件上传和多用户隔离；
- 分析结果持久化；
- 正式的 `jobs`、`job_analyses`、`resume_versions` 数据模型；
- 投递看板和真正的 RAG 流程。

## 开发原则

1. 先统一 API、Dify 输出、mock 和组件字段。
2. AI 返回结果必须经过校验和标准化，不能直接信任模型输出。
3. 真实分析失败时显示明确错误，不用 mock 结果伪装成功。
4. 先打通 JD + 简历 -> 一次 Workflow -> 三步结果，再扩展 RAG、队列和统计。

## 学习路径与实践记录

### 我必须知道的东西

#### 1. 项目架构

Chrome Extension → FastAPI → MySQL

#### 2. API

POST /api/items
GET /api/items

#### 3. 数据库

items
id
content
created_at

#### 4. 为什么用 MySQL

#### 5. 为什么以后需要 Redis

#### 6. 为什么以后需要 MQ

#### 8. 我目前不会的

### V1

复制 → 保存 → 查看

真正理解：
Chrome Extension
JavaScript
HTTP
API
FastAPI
MySQL

### V2

搜索 + 分类

加入：
搜索
标签
时间
简单分类

你开始理解数据库查询、索引。

### V3

Redis

比如最近访问的数据缓存。

你亲眼看到：
第一次查询
→ MySQL
第二次查询
→ Redis

这时候你学 Redis 会非常快。

### V4

MQ + AI

保存之后：
用户复制
 ↓
API
 ↓
MySQL
 ↓
MQ
 ↓
AI Worker
 ↓
分类 / 摘要 / 提取信息

这时候你终于能理解：
为什么消息队列叫“解耦”。
因为保存和 AI 分析已经不需要绑死在一个请求里。

### 实践闭环

你提出需求
            ↓
        AI 帮你设计方案
            ↓
        你理解方案
            ↓
        AI 写一个小功能
            ↓
        你运行
            ↓
        你测试
            ↓
     出 bug → AI Debug
            ↓
        Git commit

### 遇到的困难并解决啦！

1、Dify返回的模型结果包含推理内容，导致直接进行JSON解析失败。我通过日志定位到实际响应格式，在服务层增加了输出清理，再进行JSON反序列化。

## 每日开发记录

### 2026-09-10

已完成：

- 统一 Step1 mock 字段，使其匹配 `Step1Result` 和目标 Dify 字段：`what`、`hardReq`、`bonus`、`subtext`、`verdict`；
- 移除真实分析失败时自动切换 mock 的逻辑，改为显示错误状态；
- 修复 Vite ESM 环境下 `__dirname` 未定义导致的 ESLint 错误；
- 明确两个 README 的职责，避免项目总览和前端说明重复维护。

遇到的困难与判断：

- 当前后端只向 Dify 发送 JD，还没有发送简历，因此 Step2 不能进行真实的个性化匹配；
- 知识库是否已上传简历、Workflow 是否真正使用了检索结果，需要在 Dify 控制台确认，代码仓库无法证明；
- 当前最合适的下一步是先实现简历保存/读取，再让一个 Dify Workflow 一次返回 Step1、Step2、Step3。

### 2026-09-10 简历保存/读取

已完成：

- 新增 `resume_versions` 数据表和保存、读取最近版本的后端接口；
- 前端输入页增加简历名称、简历内容和保存按钮；
- 页面加载时自动读取最近保存的简历版本。

当前边界：

- 目前保存的是文本简历，不包含文件上传和多用户鉴权；
- 已将简历版本 ID 接入分析请求，后端会读取简历内容并传给 Dify；
- 前端已移除尚未实现的 JD URL 输入入口，当前只支持粘贴 JD 文本；
- Dify 请求字段已统一为 `JD_content`、`URL`、`Resume_content`，其中 URL 暂时传空字符串；
- Dify Workflow 仍需配置并验证 `Resume_content` 输入，以及 Step2/Step3 的真实输出；
- 历史岗位自动分析改为依赖后端默认读取最近简历，避免简历异步加载造成重复调用。

验证结果：

- 简历保存和读取已通过浏览器验证；
- 后端 Python 编译检查通过；
- 前端 ESLint 检查通过；
- 当前尚未完成 Dify Workflow 中 Step2、Step3 的真实输出配置。

## 简历表述边界

当前阶段适合描述为：

> 基于 React、FastAPI、MySQL 和 Dify Workflow 构建 AI 求职岗位分析原型，实现 JD 保存、岗位解读和分析流程展示。

只有真正完成简历版本管理、分析结果持久化、知识库检索和评估后，才应描述为具备完整的 RAG 匹配或投递管理能力。
