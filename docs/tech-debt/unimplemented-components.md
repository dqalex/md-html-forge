# 未实现组件清单

> 模板中引用但尚未实现的组件。这些组件被刻意预留为"未来可扩展"的接口，**不阻塞**当前模板的渲染——内容会以 Markdown 兜底样式输出，跟随品牌包的全局排版 token。

## 处理策略

- **模板层**：这些组件应该用**已有组件 + MD 兜底**写法替代，确保用户立即能看到完整内容
- **兜底渲染**：`renderFreeText` + `renderOrphans` 会用 editorial 样式渲染未识别的内容（见 `src/builtin/compiler/emitter.ts`）
- **未来实现**：当业务确实有大量需求时，按 `docs/engine/component-api.md` 添加 `.forge.md` / `.ts` 实现即可

---

## 清单

### 1. 视觉/交互特化组件

| 组件 ID | 出现在模板 | 预期能力 | 建议替代方案 |
|---|---|---|---|
| `chart-bar` | he-12 事故复盘 | 横向柱状图（影响指标） | 用 `progress variant=bars` + MD 表格兜底 |
| `slide-deck` | he-09 幻灯片演示 | 幻灯片导航容器 | 用 `slide-cover` + `card` 多次堆叠 |
| `sparkline-chart` | he-09 | 内联趋势线 | 用 `metric variant=band` + delta 文字 |
| `flowchart-canvas` | he-08 部署流水线 | 自由布局流程图 | 用 ` ```flow ` 语义图表（已支持） |
| `data-flow-diagram` | he-13 实施计划 | 数据流图 | 同上，` ```flow ` |
| `flow-diagram` | he-04 架构设计 | 架构图 | 同上，或上传 SVG 用 freeText 兜底 |
| `interactive-ring-demo` | he-15 概念解释 | 可交互环形图 | 用静态 SVG via `slide-cover` |
| `animation-stage` | he-07 视觉方案 / he-03 微动效 | 动效演示舞台 | 用 ` ```compare ` 或 ` ```steps ` 语义图表 |
| `flag-group` | he-19 功能开关 | 开关组合卡 | 用 `card variant=stat` 多次堆叠 |
| `toggle-switch` | he-19 | 单个开关组件 | 用 `chip variant=risk` 当 on/off 视觉 |

### 2. 导航/工具栏组件

| 组件 ID | 出现在模板 | 预期能力 | 建议替代方案 |
|---|---|---|---|
| `toc-nav` | he-19 | 顶部目录导航 | 用 MD `[link](#anchor)` 列表兜底 |
| `toc-sidebar` | he-17 长文文档 | 侧边目录 | 用 `layout-grid-2` + 左列 MD 列表 |
| `interactive-toolbar` | he-05 设计系统 | 可交互工具栏 | 用 `chip` 组件横向排列 |
| `tag-filter` | he-18 编辑器分屏 | 标签筛选器 | 用 `chip variant=risk` 多个 |
| `theme-toggle` | he-02 视觉探索 | 主题切换按钮 | 用 `chip` 当装饰，实际切换由 app header 完成 |

### 3. 复杂数据展示组件

| 组件 ID | 出现在模板 | 预期能力 | 建议替代方案 |
|---|---|---|---|
| `drag-drop-kanban` | he-18 编辑器分屏 | 看板拖拽 | 用 `layout-grid-3` + `card variant=ticket` |
| `tabbed-code-block` | he-14 研究学习 | 多语言 tab 代码块 | 用 `code-block variant=walkthrough` 多步 |
| `approach-card` | he-01 方案探索 | 方案对比卡片 | 用 `card variant=concept` |
| `file-card` | he-03 PR 评审 | 文件变更卡 | 用 `card variant=stat` + diff |
| `live-template-editor` | he-20 模板编辑器 | 模板编辑预览 | 用 `code-block variant=walkthrough` |
| `slot-highlighter` | he-20 | slot 高亮提示 | 用 `chip` 标注未填字段 |
| `svg-download-button` | he-16 | SVG 下载按钮 | 用 `chip` 装饰 + 文字提示 |

---

## 修复优先级建议

| 优先级 | 组件 | 理由 |
|---|---|---|
| **P0** | `flow-diagram` / `flowchart-canvas` | 多个模板需要，` ```flow ` 已经能覆盖 80% 场景，只差固定容器组件 |
| P1 | `chart-bar` / `sparkline-chart` | 数据可视化高频需求 |
| P1 | `toc-sidebar` | 长文模板必备 |
| P2 | `slide-deck` | 幻灯片是单独使用场景 |
| P3 | 其他 | 业务需求驱动 |

---

## 添加新组件的标准流程

1. 在 `src/builtin/components/<category>/` 创建 `.forge.md`（参考 `metric.forge.md`）
2. 在 `src/builtin/components/index.ts` 注册
3. 在 `docs/engine/syntax.md` 添加用法
4. 找到使用该组件的模板，把"MD 兜底"写法改为正式的 `@use` 写法
5. 从本清单移除该条目
