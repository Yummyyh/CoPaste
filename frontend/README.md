# JD Insight

JD Insight 是一个面向求职者的 AI 岗位分析工具。用户粘贴职位描述后，系统调用 Dify Workflow，对岗位职责、硬性要求、加分项和投递建议进行结构化分析，并通过三步流程展示岗位解读、匹配诊断和行动建议。

当前仓库是前端原型，后续计划扩展为包含 FastAPI、MySQL 和浏览器插件的求职岗位管理系统。

## 项目状态

### 已实现

- React + Vite 单页应用
- JD 文本输入和提交流程
- Dify Workflow API 调用
- 岗位解读、匹配诊断和行动建议三步展示
- API 失败时的开发演示数据降级
- 简历建议、面试问题和话术复制
- Tailwind CSS 主题、响应式布局和基础动画

### 计划中

- FastAPI 后端和 MySQL 持久化
- 浏览器插件采集 JD
- 岗位、简历版本和投递记录管理
- Dify 多节点工作流和 RAG 知识库
- 看板、筛选和统计
- API 响应校验、异步分析、超时和任务状态管理

> 当前 Step 2 和 Step 3 使用 mock 数据；“输入 JD 链接”目前只是界面入口，尚未实现 URL 抓取。

## 产品流程

当前前端流程：

```text
输入 JD 文本
    -> 调用 Dify Workflow
    -> Step 1：岗位解读
    -> Step 2：匹配诊断（当前为 mock）
    -> Step 3：行动包（当前为 mock）
```

目标系统流程：

```text
浏览器插件采集 JD
    -> FastAPI 接收并去重
    -> MySQL 保存岗位
    -> Dify Workflow / RAG 分析
    -> 保存结构化结果
    -> React 看板管理岗位和投递状态
```

## 技术栈

- React 19
- Vite 8
- Tailwind CSS 4
- Dify Workflow API
- ESLint
- `clsx` 和 `tailwind-merge`
- `lucide-react`

规划中的后端技术栈：

- FastAPI
- SQLAlchemy
- MySQL
- Pydantic
- Dify Workflow / Knowledge Retrieval

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 配置环境变量

当前原型通过 `VITE_DIFY_API_KEY` 调用 Dify。可以在项目根目录创建 `.env.local`：

```env
VITE_DIFY_API_KEY=your_dify_api_key
```

安全注意事项：

- `VITE_` 变量会进入浏览器构建产物，不适合保存生产环境密钥。
- 真实部署时应将 Dify 调用迁移到 FastAPI 后端。
- 不要提交 `.env`、`.env.local` 或任何真实 API Key。
- 如果密钥已经暴露，应立即在 Dify 控制台轮换。

### 启动开发服务器

```bash
npm run dev
```

启动后访问终端输出的本地地址，通常为 `http://localhost:5173`。

### 生产构建

```bash
npm run build
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 目录结构

```text
.
├─ public/                    # 静态资源
├─ src/
│  ├─ App.jsx                 # 页面流程状态和组件编排
│  ├─ main.jsx                # React 应用入口
│  ├─ index.css               # Tailwind 主题、字体和动画
│  ├─ components/
│  │  ├─ InputCard.jsx        # JD 输入、Tab 和提交
│  │  ├─ LoadingOverlay.jsx   # 加载状态
│  │  ├─ NavBar.jsx           # 三步导航
│  │  ├─ Step1Result.jsx      # 岗位解读
│  │  ├─ Step2Result.jsx      # 匹配诊断
│  │  ├─ Step3Result.jsx      # 行动包
│  │  └─ TopCompanionBar.jsx  # 顶部陪伴文案
│  ├─ data/mockData.js        # 开发演示数据
│  ├─ services/difyApi.js     # Dify 请求和响应解析
│  └─ lib/utils.js            # cn 样式工具
├─ PROJECT_RESTART_GUIDE.md  # 项目重启和后续开发指南
├─ eslint.config.js           # ESLint 配置
├─ vite.config.js             # Vite 和 Tailwind 插件配置
└─ package.json               # 依赖和脚本
```

## 核心数据流

### 当前前端数据流

1. `InputCard` 通过受控组件保存 JD 文本。
2. `App.jsx` 的 `handleSubmit` 将页面切换到 loading 状态。
3. `analyzeJD` 请求 Dify Workflow API。
4. 服务层读取 `data.data.outputs.JD_Summarize` 并解析 JSON。
5. `App.jsx` 保存三个步骤的数据。
6. `Step1Result`、`Step2Result` 和 `Step3Result` 负责展示结果。

### 目标后端数据流

```text
React / 浏览器插件
    -> FastAPI
        -> 请求校验和岗位去重
        -> MySQL 持久化
        -> Dify 分析
        -> 保存原始响应和标准化结果
    -> 返回岗位和分析状态
```

前端和插件不应直接访问 MySQL，Dify API Key 也不应暴露给浏览器。

## 数据模型规划

第一版后端建议包含以下实体：

### `jobs`

保存岗位标题、公司、JD 正文、来源 URL、薪资、地点、岗位状态和内容哈希。

### `job_analyses`

保存岗位分析状态、Dify 原始响应、标准化 JSON、匹配分数和错误信息。

### `resume_versions`

保存不同目标岗位对应的简历版本，例如“前端版”和“组件库版”。

### `applications`

关联岗位和简历版本，记录保存、已投递、面试、Offer、拒绝等状态。

## 开发约定

- 先统一 API、mock 和组件之间的数据结构，再扩展页面。
- 所有外部响应都要做结构和类型校验，不能直接假设 AI 输出合法。
- 网络请求必须处理 loading、error、empty 和成功状态。
- mock 数据只能用于开发演示，界面应明确标识演示数据。
- 不要把 API Key、数据库密码或其他凭据提交到仓库。
- 新功能优先通过小模块实现，并在每次修改后运行 lint 或 build。
- 组件负责展示，API 解析、数据标准化和业务规则应放在服务层。

## 已知限制

- 当前没有后端和数据库，刷新页面后数据不会持久化。
- 当前只有 Step 1 使用 Dify，Step 2 和 Step 3 使用 mock 数据。
- 当前没有真正的 RAG 知识库和语义检索流程。
- 当前没有浏览器插件和岗位自动采集能力。
- 当前 API 响应校验、请求超时和错误提示仍需完善。
- 当前没有自动化测试。

## 后续开发顺序

建议按以下顺序推进：

1. 轮换已经暴露的 Dify Key。
2. 修复 `vite.config.js` 的 ESLint 问题。
3. 统一 Step 1 的 mock、API 和组件字段。
4. 创建 FastAPI 项目并完成 `/health`。
5. 创建 `jobs` 表和岗位创建、列表接口。
6. 让 React 从后端读取岗位数据。
7. 将 Dify 调用迁移到后端，并保存分析结果。
8. 增加投递状态和基础看板。
9. 接入浏览器插件。
10. 在主链路稳定后加入 RAG 和统计增强。

9.9更新
确认 Dify Key 已轮换，并只保存在后端 .env。
完成历史记录中的单条 AI 分析按钮。
完善分析接口的 loading、错误和响应校验。
统一 Dify 返回结构与 Step 1、Step 2、Step 3 的字段。
将分析结果保存到数据库。
把岗位记录从 items 演进为正式的 jobs 模型。
React 页面读取后端岗位和分析结果。
增加投递状态和基础看板。
最后再考虑 Redis、MQ、RAG。

产品定位

详细的重启步骤、数据库设计、API 规划和 Vibe Coding 提示词见 [PROJECT_RESTART_GUIDE.md](PROJECT_RESTART_GUIDE.md)。

## 简历表述边界

当前阶段适合描述为：

> 基于 React、Vite 和 Dify Workflow 构建 AI 求职岗位分析原型，实现 JD 文本输入、岗位信息结构化解析、匹配诊断展示、简历建议和面试话术生成。

完成后端闭环后可以补充：

> 基于 FastAPI 和 MySQL 实现岗位持久化、分析结果保存、简历版本管理和投递状态跟踪，并通过看板支持岗位筛选与进度查看。

只有真正完成知识库、评估样本或压测后，才应使用“RAG 精准匹配”“显著提升准确率”或“高并发稳定性”等表述。

## License

本项目目前未声明开源许可证，仅用于学习和项目演示。