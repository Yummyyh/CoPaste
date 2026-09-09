# JD Insight 项目重启指南

> 用途：恢复项目上下文、明确下一阶段目标，并按可验证的小步骤完成“岗位采集 -> AI 分析 -> 投递管理 -> 看板展示”的完整闭环。
>
> 最后整理时间：2026-09-07

## 1. 项目定位

JD Insight 是一个面向求职者的 AI 岗位分析与投递管理系统。

目标用户在招聘网站看到岗位后，可以快速保存 JD，由系统完成：

```text
采集岗位
  -> 保存岗位
  -> 结构化解析 JD
  -> 检索岗位知识
  -> 分析候选人匹配度
  -> 生成简历和面试建议
  -> 记录投递状态
  -> 通过看板跟踪进度
```

当前项目是一个 React/Vite 单页原型；后续应逐步增加 FastAPI、MySQL 和浏览器插件。

## 2. 当前代码状态

### 2.1 技术栈

- 前端：React 19、Vite、Tailwind CSS v4
- 样式：Tailwind 主题变量、自定义字体和动画
- AI：Dify Workflow API
- 工具：ESLint、`clsx`、`tailwind-merge`、`lucide-react`
- 当前未使用：`react-router-dom`
- 当前没有：FastAPI、MySQL、浏览器插件、测试、真正的 RAG

### 2.2 当前目录职责

```text
src/
├─ App.jsx                       # 页面流程状态和组件编排
├─ main.jsx                      # React 入口
├─ index.css                    # Tailwind、主题、字体、动画
├─ components/
│  ├─ InputCard.jsx              # JD 输入、Tab、提交
│  ├─ LoadingOverlay.jsx         # 加载遮罩
│  ├─ NavBar.jsx                 # 三步导航
│  ├─ Step1Result.jsx            # 岗位解读
│  ├─ Step2Result.jsx            # 匹配诊断
│  ├─ Step3Result.jsx            # 行动包
│  ├─ TopCompanionBar.jsx        # 顶部陪伴文案
│  └─ DecorativePath.jsx         # 当前未使用的装饰组件
├─ data/mockData.js              # mock 数据
├─ services/difyApi.js           # Dify 调用和 JSON 解析
└─ lib/utils.js                  # cn 工具
```

### 2.3 当前主流程

`App.jsx` 使用 `step` 表示页面状态：

```text
-1 = 输入
 0 = 加载
 1 = 岗位解读
 2 = 匹配诊断
 3 = 行动包
```

当前提交逻辑：

1. 用户输入 JD。
2. 调用 `analyzeJD`。
3. API 成功时只使用真实的 Step 1 数据。
4. Step 2、Step 3 仍然使用 mock 数据。
5. API 失败时，三个步骤都切换到 mock 数据。

## 3. 已确认的问题

### 3.1 数据字段不一致

`mockData.js` 的 Step 1 字段和 `Step1Result.jsx` 的字段不一致：

```text
mockData：actualWork、hardRequirements、bonusItems、advice
组件读取：what、hardReq、bonus、verdict
```

结果是 API 失败后页面可能能打开，但内容为空。第一步重构必须先统一数据模型。

建议统一为：

```js
{
  jobTitle: string,
  company: string,
  what: string,
  hardReq: string[],
  bonus: string[],
  subtext: Array<{ keyword: string, meaning: string }>,
  verdict: string
}
```

### 3.2 Dify Key 不能放在前端

当前 `src/services/difyApi.js` 使用 `VITE_DIFY_API_KEY`，这会让 Key 进入浏览器构建产物。

必须执行：

1. 立即作废并轮换已经暴露的 Key。
2. 将 Dify 调用迁移到 FastAPI。
3. React 和插件只调用 FastAPI。
4. `.gitignore` 增加 `.env` 和 `.env.*`。
5. 提供 `.env.example`，只写变量名，不写真实凭据。

推荐数据流：

```text
React / 插件 -> FastAPI -> Dify -> FastAPI -> MySQL
```

### 3.3 JD 链接入口还没有实现

当前“输入 JD 链接”只是界面 Tab，实际上 URL 会被当成普通文本发送给 Dify。

在真正实现 URL 抓取之前，应选择以下一种处理：

- 暂时移除链接 Tab；或
- 禁用并明确提示“暂未支持”；或
- 后端实现抓取、HTML 清洗和安全校验。

URL 抓取必须考虑 SSRF、协议限制、重定向限制、响应大小和超时。

### 3.4 API 响应缺少校验

不能直接假设以下路径一定存在：

```js
data.data.outputs.JD_Summarize
```

应按以下顺序处理：

```text
原始响应
  -> 响应结构校验
  -> JSON/Markdown 清洗
  -> Schema 校验
  -> 数据标准化
  -> 展示组件
```

AI 输出必须当作不可信外部输入处理。数组、字符串、分数和必填字段都需要校验。

### 3.5 错误处理不足

当前所有失败都可能静默降级到 mock，用户不知道结果是否真实。

应至少区分：

```text
input / loading / success / error / demo-fallback
```

mock 只能用于开发演示，不能无提示地伪装成真实分析。

### 3.6 工程检查

- `npm run build` 已通过。
- `npm run lint` 当前失败，原因是 `vite.config.js` 在 ESM 中直接使用 `__dirname`。
- 当前没有测试文件。
- `README.md` 仍是 Vite 默认模板，需要改成项目文档。

## 4. 目标架构

```text
浏览器插件
  -> FastAPI API
      -> MySQL
      -> Dify Workflow / RAG
  -> React 管理看板
```

职责划分：

| 模块 | 职责 |
|---|---|
| 浏览器插件 | 选中或复制 JD，读取页面标题和 URL，提交保存 |
| FastAPI | 鉴权、参数校验、去重、业务流程、Dify 调用 |
| MySQL | 岗位、分析结果、简历版本、投递记录持久化 |
| Dify | JD 解析、技能提取、匹配分析、建议生成 |
| React | 岗位列表、详情、分析结果、筛选和看板 |

插件和 React 都不能直接访问 MySQL；Dify Key 只能存后端。

## 5. 建议目录结构

```text
jd-insight/
├─ frontend/                  # 当前 React 项目，后续可迁移到这里
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ core/
│  │  │  ├─ config.py
│  │  │  └─ database.py
│  │  ├─ models/
│  │  │  ├─ job.py
│  │  │  ├─ analysis.py
│  │  │  ├─ resume.py
│  │  │  └─ application.py
│  │  ├─ schemas/
│  │  │  ├─ job.py
│  │  │  └─ analysis.py
│  │  ├─ api/
│  │  │  ├─ jobs.py
│  │  │  ├─ analyses.py
│  │  │  └─ dashboard.py
│  │  └─ services/
│  │     ├─ dify_service.py
│  │     ├─ job_service.py
│  │     └─ hash_service.py
│  ├─ tests/
│  ├─ requirements.txt
│  └─ .env.example
├─ extension/
│  ├─ manifest.json
│  ├─ content.js
│  ├─ popup.html
│  └─ popup.js
└─ README.md
```

不必一次完成全部目录。先打通主链路，再扩展模块。

## 6. 第一版数据模型

### 6.1 jobs

```text
id
 title
company
content
source_url
source
salary
location
status
content_hash
created_at
updated_at
```

`content_hash` 用于判断重复 JD。

### 6.2 job_analyses

```text
id
job_id
raw_response
structured_result
match_score
status
error_message
created_at
updated_at
```

原始响应和标准化结果分开保存，便于排错和重新处理。

### 6.3 resume_versions

```text
id
name
target_position
content
created_at
updated_at
```

例如：前端版、组件库版、B 端版。

### 6.4 applications

```text
id
job_id
resume_version_id
status
notes
applied_at
interview_at
created_at
updated_at
```

推荐状态：

```text
saved -> analyzing -> analyzed -> applied -> interview -> offer
                                      \-> rejected
                                      \-> archived
```

## 7. 第一版 API

```text
GET    /health
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/{job_id}
POST   /api/jobs/{job_id}/analyze
GET    /api/jobs/{job_id}/analysis
PATCH  /api/jobs/{job_id}/status
GET    /api/dashboard/summary
```

创建岗位请求示例：

```json
{
  "title": "前端开发工程师",
  "company": "某科技公司",
  "content": "岗位描述全文",
  "source_url": "https://example.com/job/123",
  "source": "boss",
  "salary": "15-25K",
  "location": "上海"
}
```

推荐分析接口使用异步化设计：

```text
POST /api/jobs/{job_id}/analyze
  -> 立即返回 job_id、analysis_status

GET /api/jobs/{job_id}/analysis
  -> 查询 pending / running / success / failed
```

第一版可以先同步实现，但必须有超时、异常和状态字段；后续再接 Celery、RQ 或其他任务队列。

## 8. 插件融合方案

最小可用流程：

```text
招聘网站看到岗位
  -> 选中文字或点击插件按钮
  -> 用户确认“保存为 JD”
  -> 插件读取页面标题和 URL
  -> POST /api/jobs
  -> React 看板显示岗位
```

不要默认监听并保存用户所有复制内容。推荐：

- 选中文字后右键“保存为岗位”；或
- 复制后弹出确认提示。

插件应保存：

- JD 文本
- 页面标题
- 页面 URL
- 来源网站
- 采集时间
- 用户确认状态

同时增加：

- 文本长度限制
- 去重
- 站点白名单或明确来源
- HTTPS
- CORS 限制
- 接口错误提示

## 9. Dify 与 RAG 的最小实现

基础 Dify 节点链路可以是：

```text
输入 JD
  -> JD 清洗
  -> 职位信息提取
  -> 硬性要求与加分项提取
  -> RAG 检索岗位知识
  -> 候选人匹配分析
  -> 生成简历和面试建议
  -> JSON 输出
```

知识库可以先准备：

- 技能定义
- 前端岗位能力要求
- 常见岗位职责
- 技术栈与经验等级说明
- 面试知识点

必须能解释：

1. 知识库文档从哪里来。
2. 文档如何切分。
3. 使用什么 embedding 或 Dify 内置检索能力。
4. 召回结果如何进入 Prompt。
5. RAG 是否改变了最终输出。
6. 如何用测试样本评估提取准确率。

不要只因为使用了知识库，就声称系统实现了精准匹配。需要有样本、指标和对比。

## 10. 8 天实施计划

### 第 1 天：后端骨架

- 建立 `backend`。
- FastAPI 启动。
- 配置 MySQL 连接。
- 完成 `GET /health`。
- 增加 `.env.example`。

### 第 2 天：岗位模块

- 创建 `jobs` 表。
- 完成岗位创建和列表接口。
- 增加内容哈希去重。
- 增加 Pydantic 校验。

### 第 3 天：前端岗位列表

- 新增 API service。
- React 获取真实岗位列表。
- 增加 loading、error、empty 状态。
- 保留 mock 时，必须显示“演示数据”。

### 第 4 天：Dify 后端接入

- 将 Dify Key 移到 FastAPI。
- 实现超时和 HTTP 错误处理。
- 保存原始响应和标准化结果。
- 实现岗位分析接口。

### 第 5 天：分析详情

- React 展示真实 Step 1、Step 2、Step 3 数据。
- 统一 API、mock 和组件字段。
- 增加 JSON Schema 或等价的运行时校验。

### 第 6 天：投递管理和看板

- 增加投递记录。
- 支持状态修改。
- 实现岗位搜索、状态筛选和匹配度筛选。
- 展示总岗位数、已投递数、面试数和平均匹配度。

### 第 7 天：浏览器插件

- Manifest V3。
- 选中文字保存。
- 页面标题和 URL 自动填充。
- 调用 FastAPI。
- 处理重复、成功和失败提示。

### 第 8 天：稳定性与表达

- 测试接口异常、空字段、重复提交和超时。
- 修复 ESLint。
- 运行构建。
- 补 README、架构图和演示数据。
- 记录响应时间和测试样本结果。

如果时间不足，优先保证：

```text
插件采集 -> FastAPI -> MySQL -> Dify -> React 看板
```

RAG 和复杂图表都应排在这个主链路之后。

## 11. Vibe Coding 工作方式

不要一次让 AI 生成完整系统。每次只处理一个小模块：

```text
明确目标
  -> 让 AI 阅读相关代码
  -> 生成一个模块
  -> 运行测试或接口检查
  -> 修复问题
  -> 再继续下一个模块
```

每次提示词都应包含：

- 修改范围
- 不允许修改的文件
- 输入输出契约
- 错误处理要求
- 验证命令
- 完成标准

### 后端初始化提示词

```text
请基于当前 React 项目新增 backend 目录，使用 FastAPI、SQLAlchemy 2.x、Pydantic v2 和 MySQL。

要求：
1. 不修改现有 frontend 代码。
2. 先创建项目结构和配置文件。
3. 使用环境变量读取数据库连接。
4. 创建 GET /health。
5. 添加 requirements.txt 和 .env.example。
6. 完成后说明启动命令和目录职责。
7. 不要一次实现所有业务功能。
```

### 岗位接口提示词

```text
请在 backend 中实现 jobs 模块。

要求：
1. 创建 Job SQLAlchemy 模型。
2. 创建 JobCreate、JobResponse、JobListResponse Schema。
3. 实现 POST /api/jobs 和 GET /api/jobs。
4. 对 title、content 做非空校验。
5. 使用 content_hash 防止重复 JD。
6. 添加接口测试。
7. 保持现有 frontend 不变。
```

### Dify 接入提示词

```text
请在 FastAPI 后端新增 dify_service.py。

要求：
1. Dify API Key 只能从后端环境变量读取。
2. 实现超时和 HTTP 错误处理。
3. 校验 Dify 返回结构。
4. 将原始响应和标准化 JSON 分开保存。
5. 失败时不能伪造成功结果。
6. 增加 POST /api/jobs/{job_id}/analyze。
7. 编写成功、超时和错误响应测试。
```

### React 改造提示词

```text
请将现有 React 应用从本地 mock 数据逐步改为调用 FastAPI。

要求：
1. 新增 frontend/src/services/api.js。
2. 保留现有视觉结构。
3. 增加岗位列表和岗位详情请求。
4. 增加 loading、error、empty 三种状态。
5. 开发环境可保留 mock，但界面必须显示“演示数据”。
6. 不要修改无关组件。
```

### 插件提示词

```text
请创建 extension 目录，实现 Chrome Manifest V3 插件。

要求：
1. 用户选中文字后可以点击“保存为 JD”。
2. 自动读取当前页面标题和 URL。
3. 弹窗允许用户确认后提交。
4. 调用 FastAPI POST /api/jobs。
5. 不要监听并保存所有复制内容。
6. 增加保存成功、重复岗位和接口失败提示。
```

每个模块完成后执行对应验证，不要只根据 AI 的文字说明判断完成。

## 12. 验证清单

### 前端

```text
npm run lint
npm run build
```

### 后端

```text
pytest
```

### 手工接口验证

- `/health` 返回成功。
- 创建岗位成功。
- 空标题和空内容被拒绝。
- 重复 JD 不会重复创建。
- 分析中可以查询状态。
- Dify 超时会进入失败状态。
- API Key 不出现在前端构建产物。

### 页面验证

- 空状态可用。
- 加载状态可见。
- 错误状态可恢复。
- 演示数据有明确标识。
- 刷新页面后数据仍存在。
- 移动端布局不溢出。

## 13. 简历表述边界

完成基础闭环后，可以写：

> 基于 React、FastAPI、MySQL 和 Dify 构建求职岗位管理系统，开发浏览器插件实现 JD 采集与快速入库，完成岗位信息结构化保存、AI 分析结果持久化、简历建议生成和投递状态管理，并通过看板支持岗位筛选、匹配度查看和投递进度跟踪。

只有真正完成知识库和语义检索后，才补充：

> 基于岗位知识库和语义检索增强 JD 分析结果，提升岗位技能提取和候选人匹配解释能力。

只有有实验数据时，才使用“提升准确率”；只有做过压测时，才使用“高并发稳定性”。

不建议直接写：

- 显著提升准确率
- 高并发场景稳定运行
- 完整生命周期管理
- 多版本自动映射
- 精准匹配

除非有对应的实现、测试数据和可复现的讲解。

## 14. 面试必须理解的问题

1. 为什么需要 RAG，而不是直接把 JD 发给大模型？
2. 知识库中保存什么，如何切分和检索？
3. Dify 每个节点的输入和输出是什么？
4. AI 输出 JSON 不合法时怎么处理？
5. JSON Schema 和 `JSON.parse` 有什么区别？
6. 简历版本如何建模？
7. 投递状态如何设计和流转？
8. 看板统计数据从哪里来？
9. 如何测量准确率和响应延迟？
10. 高并发时如何保护 Dify API？
11. 为什么浏览器插件不能直接访问 MySQL？
12. 如何避免重复 JD 和重复分析？

## 15. 重启后的第一步

按以下顺序开始，不要先做视觉重构：

1. 轮换已经暴露的 Dify Key。
2. 修复 `vite.config.js` 的 ESLint 问题。
3. 统一 Step 1 的 API、mock 和组件数据结构。
4. 创建 FastAPI `backend`，先完成 `/health`。
5. 创建 `jobs` 表和岗位 CRUD。
6. 让 React 从后端读取岗位。
7. 再接入 Dify 和分析结果持久化。
8. 最后接入插件、RAG 和看板增强。

项目的核心判断标准不是功能数量，而是每个环节都能说明：输入是什么、数据如何流转、失败如何处理、结果如何验证。
