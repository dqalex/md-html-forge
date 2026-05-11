# 产品文档

本目录定义 md-html-forge 的产品方向。**所有技术决策、组件设计、文档规范都必须服从这里**。

## 四份核心文档

| 文档 | 作用 | 何时读 |
|---|---|---|
| [`positioning.md`](./positioning.md) | 产品是什么、为谁做、核心价值 | 新加入项目时，第一份必读 |
| [`direction.md`](./direction.md) | 产品的七大方向决策 | 做组件/模板/主题设计前 |
| [`roadmap.md`](./roadmap.md) | 冲刺节奏与路线图 | 规划工作优先级时 |
| `component-package.md` *(待建)* | `.forge.md` 组件包格式规范 | 写自定义组件 / AI 生成组件前 |
| `forge.md` *(待建)* | 给 AI 的对外规范 | 对接 Claude / 用户 prompt 时 |

## 一句话梗概

**md-html-forge = Claude 输出的最佳渲染器**

AI 按规范产出 Markdown → 本产品自动渲染（含交互）→ 用户双向微调（内容 + 审美）→ 保存为品牌包 → 对外发布保证一致性。

完整开源，API 服务变现。

## 与其他文档的关系

```
docs/
├── product/       ← 你在这里。产品真相源。一切的上游。
│
├── engine/        ← 引擎技术参考。产品决策的技术实现依据。
├── migration/     ← 组件迁移规范。执行层面的工艺手册。
└── prompts/       ← 给开发期 agent 的任务提示词（组件迁移工作流用）。
```

**优先级**：`product/` > `engine/` > `migration/` > `prompts/`

当 `engine/` 或 `migration/` 与 `product/` 冲突时，以 `product/` 为准；同时需要把 `engine/` 和 `migration/` 的对应内容更新为与产品方向一致。

## 修改这些文档的流程

1. 产品定位、价值主张变化 → 改 `positioning.md`（需重大讨论，记录日期）
2. 七大决策有新结论 → 改 `direction.md`（需产品负责人确认）
3. 路线图调整 → 改 `roadmap.md`（按冲刺节奏更新）
4. 组件包格式/AI 规范变化 → 改 `component-package.md` / `forge.md`（需同步代码实现）

每次修改在文档顶部标注日期，保留历史可追溯。
