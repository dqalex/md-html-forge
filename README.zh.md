<p align="center">
  <img src="./public/brand/logo-horizontal.svg" alt="md-html-forge · markdown → html" width="340" />
</p>

<p align="center">
  <b>把 Markdown 喂进精心设计的组件库，输出「像一本书而不是一个网页」的精美 HTML 文档。</b>
</p>

<p align="center">
  <a href="./README.md">🇬🇧 English</a> ·
  <a href="https://github.com/dqalex/md-html-forge">GitHub</a> ·
  <a href="./docs/">文档</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15" /></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript" /></a>
</p>

---

## 是什么

**md-html-forge** 是一个浏览器端的 **Markdown → Styled HTML** 编辑器。

左边写原生 Markdown，forge 把它喂进一套精心设计的组件库，右边实时输出视觉精美的 HTML
文档。编辑器和预览共享唯一真相源——那份 Markdown 文件——而所有 forge 指令都是普通的
HTML 注释，所以**即使没有 forge 工具链，这份文档在任何编辑器里打开依然是可读的 `.md`**。

### 特性

| | |
|---|---|
| 🎨 **组件化渲染** | 30+ 内置组件（`header` / `table` / `timeline` / `metric` / `callout`…），覆盖工程周报、PR 评审、事故复盘等高频场景 |
| ✍️ **原生 MD 可读** | 所有 forge 指令是 HTML 注释，内容永远是标准 Markdown |
| 🤖 **AI 友好** | 结构化组件比散文 HTML 节省 50-80% token；AI 输出直接粘贴，用户按需调整 |
| 🎯 **品牌一致性** | 品牌包（颜色 / 字体 / 间距 token）保存后，每次输出都维持统一风格 |
| 📦 **一键导出** | 导出精简独立 HTML（无运行时依赖）或 PNG 图片，可直接塞进邮件 / Notion / 飞书，或嵌入任意系统 |
| 🔄 **双向同步** | Checkbox 点击实时回写 MD；点击预览元素跳转到编辑器对应行 |
| 💾 **本地优先品牌包** | 所有设置都在 `localStorage`。不登录、不依赖服务器 |

---

## 做这个的心路历程

我一直有个判断：**面向人类的高密度信息，HTML 比 Markdown 更合适**。它信息密度更高、
结构更丰富、交互可能性更强，而那些真正"能让人读得舒服"的排版细节，根本塞不进
`# heading` 和 `- bullet` 的表达力里。

这个判断让我前后做了三件事：

1. **[teamclaw](https://github.com/dqalex/teamclaw)**：做这个项目时我意识到，报告类
   场景需要一条真正的"渲染管线"，而不是 Markdown 预览插件那种浅表方案。所以在项目
   内部我就搭了一套。
2. **另一个内部项目**：同样的问题再次出现。我正在迭代这条渲染管线的时候……
3. 刷到 Thariq Shihipar 那篇
   [《Using Claude Code: The Unreasonable Effectiveness of HTML》](https://x.com/trq212/status/2052809885763747935)，
   以及他的 [html-effectiveness](https://github.com/ThariqS/html-effectiveness)
   仓库。角度不同（他谈的是 agent 输出格式），但核心论点一样：**HTML 才是更合适的
   输出目标**。

这篇文章让我确认了方向，也让我看清了我真正关心的差距：

> 对 **agent** 而言，让它自由生成 HTML 是 OK 的——它产出的都是一次性的工件。但对
> **最终用户**来说，他想要的是**每次**都能稳定出来一份精美的、符合品牌风格的 HTML
> 文档。做不到这一点的方案，不能是"每次让 LLM 现场幻觉一套新的 CSS"。它需要一条
> **标准的渲染管线**——一个带强默认美学的组件库，接受 Markdown（或 AI 生成的
> Markdown），稳定产出一份精致的 HTML。

所以 `md-html-forge` 就是这条管线。人写简单的格式（Markdown），引擎负责最终的视觉。
它和 AI 很合，但**首先是为人做的**。

---

## 给 AI / agent 用

要让 AI（Claude / ChatGPT / Cursor / Copilot）帮你写 forge 文档？直接把下面任一端点
的 URL 或内容贴进上下文即可。**这些端点由代码动态生成，始终反映当前组件的真实能力。**

| 端点 | 格式 | 适合 |
|---|---|---|
| `/llms.txt` | 纯文本（llmstxt.org 约定） | 贴进聊天窗口 · 通用 LLM 爬虫 |
| `/api/catalog.json` | 结构化 JSON | MCP / embedding / 程序化 retrieval |
| `/docs/agent` | 浏览器版（带复制 / 下载按钮） | 本地浏览 + 一键复制整份给 AI |
| `/docs/syntax` | forge 自渲染，人类友好 | 带真实组件预览的完整语法文档 |
| `/docs/slots` | 速查 + 选型卡 | 按场景挑组件（含 `whenToUse` / `whenNot`） |

一句话 prompt 模板：

```
请把这个 forge 语法契约读进上下文：https://<your-domain>/llms.txt
然后帮我写一份"工程周报"类型的 forge markdown，包含 header / metric band /
highlights / table（standard）/ checklist / footer。
```

---

## 快速开始

```bash
git clone https://github.com/dqalex/md-html-forge.git
cd md-html-forge
npm install
npm run dev          # http://localhost:3000
```

打开 [http://localhost:3000](http://localhost:3000)，左侧编辑 Markdown，右侧实时预览。

### 开发常用命令

```bash
npm run dev               # 本地开发服务（带 Turbopack 热更新）
npm run build             # 生产构建
npm run typecheck         # TypeScript 类型检查
npm run lint              # ESLint
npm run audit:templates   # 编译所有 21 个内置模板，扫描渲染问题
```

`audit:templates` 不依赖浏览器，直接在 Node 里调用 forge 编译器把模板编译成 HTML
并扫描问题——非常适合在 CI 里跑，或修改编译器后做回归验证。输出位置：`/tmp/forge-audit/`。

---

## 一分钟上手

```md
<!-- @page narrow -->
<!-- @compose: header, highlights, table, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# Engineering Status — Week 11

## birchline/app @ main

<!-- @slot:eyebrow -->auto-generated<!-- @/slot -->
<!-- @slot:date -->Mar 10 – Mar 16, 2025<!-- @/slot -->

<!-- @use highlights -->

## Highlights

- **Bulk task editing shipped to 100%.** Ramped to all workspaces by Thursday.
- **Sync API p95 down 38%.** Batch auth lookup cut hot path from 410ms to 255ms.

<!-- @use table variant=standard -->

<!-- @slot:heading -->Shipped<!-- @/slot -->

| PR | Title | Author | Risk |
|---|---|---|---|
| #4871 | Bulk edit toolbar | Mira Okafor | Med |
| #4874 | Batch auth lookup | Devon Park | Med |

<!-- @use footer -->

<!-- @slot:footer -->generated Mar 16 2025 18:02<!-- @/slot -->
```

完整指令规范见 [`docs/engine/syntax.md`](./docs/engine/syntax.md)。

---

## 项目结构

```
md-html-forge/
├── src/
│   ├── app/                          Next.js App Router
│   │   ├── page.tsx                  Playground 主页
│   │   ├── layout.tsx                字体 + 全局样式
│   │   └── docs/                     自渲染文档（syntax / slots / agent）
│   │
│   ├── builtin/                      ⭐ forge 引擎
│   │   ├── compiler/                 编译器（lexer/parser/resolver/emitter）
│   │   ├── components/               内置组件（.ts + .forge.md）
│   │   ├── templates/                内置模板（21 个场景）
│   │   └── themes/                   主题定义
│   │
│   ├── components/                   React UI 外壳
│   │   ├── app/AppHeader.tsx         顶部导航（模板选择 / 语言切换）
│   │   ├── markdown-editor/          CodeMirror 编辑器 + iframe 预览 + 全局主题选择器
│   │   ├── component-library/        组件库浏览器
│   │   ├── html-preview/             品牌包 / 主题编辑 / AI 造组件 弹窗
│   │   └── ui/                       基础 UI（Button / Dialog / Popover）
│   │
│   └── lib/markdown-slots/           MD ↔ HTML 同步工具
│
├── public/brand/                     品牌 Logo 资源（SVG）
├── docs/
│   ├── engine/                       API 参考（长青）
│   ├── tech-debt/                    已知限制追踪
│   └── archive/                      历史设计 & 迁移文档
└── scripts/compile-templates/        模板审计脚本
```

---

## 内置组件一览

### 文档结构

| 组件 | 用途 |
|---|---|
| `header` | 文档标题区（标题 / 副标题 / 作者 / 日期 / badge） |
| `meta-pills` | 快速状态 pill 标签栏（事故复盘必用） |
| `lead` | 摘要 / TL;DR / 阶段说明（`lead` / `tldr` / `phase`） |
| `body` | 通用正文容器，支持任意 MD 内容 |
| `footer` | 页脚元信息 |

### 数据展示

| 组件 | 用途 |
|---|---|
| `metric` | 数据指标卡（`band` / `hero` / `slide`） |
| `table` | 数据表格（`standard` / `risk` / `impact` / `flag`） |
| `progress` | 进度条 / rollout 阶段 |
| `timeline` | 时间线（`standard` / `milestones` / `incident`） |
| `pr-summary` | PR 摘要头（作者 / 分支 / 改动行数） |

### 内容块

| 组件 | 用途 |
|---|---|
| `highlights` | 亮点列表（带分隔线标题） |
| `actions` | 行动清单（Carryover / 待办） |
| `checklist` | 可勾选清单（双向同步） |
| `callout` | 提示块（`concept` / `note` / `questions` / `recommendation`） |
| `panel` | 信息面板（`snippet` / `glossary` / `prompt`） |
| `code-block` | 代码展示（`diff` / `walkthrough`） |
| `collapse-section` | 折叠区块 |
| `comparison` | 对比视图（`ba` / `options` / `mockup`） |
| `faq-item` / `qa` | FAQ / 问答 |
| `review-comment` | PR 评审评论（`blocking` / `nit` / `suggestion`） |

### 视觉 / 布局

| 组件 | 用途 |
|---|---|
| `chip` | 标签 / 徽章（`risk` / `flag` / `option` / `legend`） |
| `illustration` | 插图 / SVG 框架 |
| `design-spec` | 设计系统展示（`keyframe` / `swatch` 等） |
| `list-item`, `list-row` | 富列表行 |
| `grid-2/3/4`, `layout-flex-row`, `scroll-row` | 布局原语 |

---

## 内置模板

模板下拉包含 21 个场景模板，分 5 类：

| 类别 | 模板 |
|---|---|
| **报告** | 工程周报、事故复盘、功能开关清单 |
| **规划** | 动画规范、交互原型、流程图带注解、实施计划 |
| **研究 / 讲解** | 代码流程讲解、设计系统参考、组件变体矩阵、特性讲解、概念讲解 |
| **代码评审** | 代码方案探索、PR 评审摘要、PR 说明 |
| **Playground** | 视觉方案探索、幻灯片演示、SVG 插图集、编辑器看板、提示词调优器 |

---

## 文档

| 我想… | 看这里 |
|---|---|
| 学完整语法 | [`docs/engine/syntax.md`](./docs/engine/syntax.md) |
| 了解编译器架构 | [`docs/engine/architecture.md`](./docs/engine/architecture.md) |
| 写自定义组件 | [`docs/engine/component-api.md`](./docs/engine/component-api.md) |
| 写自定义主题 | [`docs/engine/theme-api.md`](./docs/engine/theme-api.md) |
| 了解设计 token | [`docs/engine/design-tokens.md`](./docs/engine/design-tokens.md) |
| 了解扩展点 | [`docs/engine/extensibility.md`](./docs/engine/extensibility.md) |

历史文档（迁移 / 提示词 / 早期产品规划）在 [`docs/archive/`](./docs/archive/)。

---

## 技术栈

- **Next.js 15**（App Router）
- **TypeScript 5**
- **Tailwind CSS v4**
- **CodeMirror 6**（编辑器）
- **Lucide React**（图标）
- 导出的 HTML 零运行时依赖

---

## 贡献

1. Fork 并创建 feature 分支
2. 在 `src/builtin/components/` 下新建组件
3. 可选：在 `src/builtin/templates/batches/` 添加模板
4. `npm run typecheck && npm run audit:templates`
5. 提 PR，描述组件用途和 variant

---

## 致谢 & 灵感

- **[html-effectiveness](https://github.com/ThariqS/html-effectiveness)** by
  Thariq Shihipar —— 让"HTML 作为一等输出格式"这个观点更清晰的那个火花。editorial
  视觉语言参考自这里。
- **[《The Unreasonable Effectiveness of HTML》](https://simonwillison.net/2026/May/9/thariq/)** ——
  从 agent 角度印证了同一个结论。
- **[teamclaw](https://github.com/dqalex/teamclaw)** —— 这条渲染管线最早的试验田，
  后来独立成这个项目。

---

## 许可

MIT © 2026 · [dqalex](https://github.com/dqalex)
