# md-html-forge

> Markdown → Styled HTML Playground
> 把 Markdown 喂进精心设计的 HTML 模板，输出"像一本书而不是一个网页"的单文件页面。

## 想法来源

- **内容组织**：Markdown 是信息的自然单元。
- **视觉呈现**：HTML 有空间感、可交互、能真正承担编辑级质感。
- **桥**：本项目的 `markdown-slots/` 管线让两者用一份 MD + 一份 HTML 就能组合出任意产出物，且 MD 可在不同模板间平滑切换。

设计语言的两个源头：

| 来源 | 贡献 |
| --- | --- |
| **teamclaw** | 应用壳的 surface / 阴影 / indigo 品牌色 / Plus Jakarta Sans |
| **html-effectiveness** ([repo](https://github.com/ThariqS/html-effectiveness)) | editorial 质感：ivory `#FAF9F5` 底 + serif 标题 + clay `#D97757` 强调 + 12/8/4 px 圆角与 1.5px 边框 |

## 快速开始

```bash
cd /data/workspace/md-html-forge
pnpm install       # 或 npm install / yarn
pnpm dev           # http://localhost:3000
```

首屏：默认打开 Playground，顶栏可点选 3 个预置模板。

## 📚 文档

完整的引擎参考、迁移规范、AI agent 提示词都在 [`docs/`](./docs) 下：

| 我想… | 看这里 |
|---|---|
| 学完整语法（指令 / slot / 原生 MD 绑定） | [`docs/engine/syntax.md`](./docs/engine/syntax.md) |
| 写新组件 | [`docs/engine/component-api.md`](./docs/engine/component-api.md) + [`docs/migration/workflow.md`](./docs/migration/workflow.md) |
| 理解编译器架构 | [`docs/engine/architecture.md`](./docs/engine/architecture.md) |
| 派发组件迁移任务给 AI agent | [`docs/prompts/_dispatch-examples.md`](./docs/prompts/_dispatch-examples.md) |
| 迁移进度 / 已完成清单 | [`docs/migration/inventory.md`](./docs/migration/inventory.md) |

**入口索引**：[`docs/README.md`](./docs/README.md)

## 核心结构

```
src/
├── app/
│   ├── layout.tsx          # 字体 + globals.css
│   ├── globals.css         # Tailwind v4 + 合并后的 design tokens
│   ├── page.tsx            # Playground 主页
│   └── docs/slots/page.tsx # Slot 语法说明页
│
├── components/markdown-editor/        # ← 移植自 TRFP/frontend（去掉后端依赖）
│   ├── MarkdownEditor.tsx             #   主组件：CodeMirror + Streamdown + iframe 预览
│   ├── Toolbar.tsx                    #   视图切换 / 模板切换 / 导出
│   ├── TemplatePicker.tsx             #   ⚠️ 从 registry 读本地 preset
│   ├── ViewModeToggle.tsx
│   ├── HtmlPreview.tsx
│   └── hooks/useAutoSave.ts
│
├── core/streamdown/                   # streamdown 插件（gfm + math + raw + katex）
│
├── lib/markdown-slots/                # ⭐️ 核心渲染管线（零外部依赖，可单独发布）
│   ├── slot-sync.ts                   #   MD ↔ HTML 双向同步（1500+ 行）
│   ├── types.ts                       #   SlotType / SlotDef / SlotValue / TemplateManifest
│   ├── universal-slots.ts             #   统一插槽规范 + 预设组合
│   └── icon-render.ts                 #   :lucide:icon-name: 短码自动渲染为 SVG
│
├── lib/utils.ts                       # cn() 辅助
│
└── templates/
    ├── html-effectiveness/            # ⚠️ 原作者 20 个 demo（原样，只读参考）
    │   └── 01-exploration-code-approaches.html …
    └── presets/                       # ⭐️ 本项目的 slot 化模板（要扩展就加这里）
        ├── _shared.ts                 #   EFFECTIVENESS_BASE_CSS：所有 preset 共享
        ├── explainer.ts               #   长文讲解（sticky TOC + TL;DR + body + FAQ）
        ├── incident-report.ts         #   事故复盘（timeline + action）
        ├── status-report.ts           #   状态周报（summary band）
        └── registry.ts                #   preset 注册表（加新模板就改这里）
```

## 加一个新模板

1. 新建 `src/templates/presets/<your-template>.ts`，导出 `{ manifest, starterMarkdown }`
   - `manifest.templateHtml`：含 `data-slot="xxx"` 的 HTML 模板
   - `manifest.slots`：`Record<string, SlotDef>`，声明 slot 类型
   - `starterMarkdown`：首次套用时填入的示例 MD
2. 在 `registry.ts` 的 `PRESETS` 数组里登记
3. 刷新页面即可在顶栏看到新模板

规范请看 `/docs/slots`（应用内页面）或直接读 `src/lib/markdown-slots/slot-sync.ts`。

## 与 TRFP 的关系

本项目是从 TRFP（Three Rings & Four Powers）主工程里**剥出来的独立 playground**，目的是：

- 脱离后端、脱离 LangGraph、脱离资产库，纯前端验证"markdown → 模板 HTML"这套管线本身
- 作为**模板样式孵化器**：新模板先在这里跑顺，再按 TRFP 的资产 manifest 格式上传到 TRFP 资产库

两个关键文件夹完全复用自 TRFP（可以直接反向同步）：

- `src/lib/markdown-slots/`（原样）
- `src/components/markdown-editor/`（改了 `TemplatePicker`，其余一致）

## 许可

参考代码来源：

- [teamclaw](https://github.com/…)
- [html-effectiveness](https://github.com/ThariqS/html-effectiveness) — MIT

项目本身：MIT。
