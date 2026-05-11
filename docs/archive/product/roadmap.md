# 产品推进路线图

> 基于 [`positioning.md`](./positioning.md) 和 [`direction.md`](./direction.md) 的路线图。
>
> 初版日期：2026-05-10

## 总原则

- **今日冲刺**：一天内完成产品基座 + 核心能力骨架
- **本周迭代**：在可跑通的骨架上补齐用户面的功能
- **后续迭代**：按周推进，不按月；每周交付可验证的增量

## 今日冲刺（Day 0）

**目标**：端到端跑通新定位下的 MVP 骨架。

| 任务 | 交付物 |
|---|---|
| ✅ 产品文档落地 | `docs/product/` 三份文档（positioning/direction/roadmap） |
| 🎯 组件包格式规范 | `docs/product/component-package.md` 定义 `.forge.md` 格式 |
| 🎯 基座清理 | 统一 token / 删死代码 / SlotType 精简 / data DSL 统一 |
| 🎯 组件合并 | 77 → ~30 原子组件，按 card/list-item/callout/panel/table-like/timeline 归并 |
| 🎯 变体系统 | 每个原子组件支持 variant 切换，MD 侧通过 `@use xxx variant=compact` 声明 |
| 🎯 JS 交互 + 双向同步 | 组件可带 JS 片段，用户预览内交互自动回写 MD |
| 🎯 `forge.md` 规范 | 一份给 AI 的完整规范文档（组件清单、变体、DSL、主题） |
| 🎯 端到端 demo | 一份 MD 跑通：渲染 → 点组件切变体 → 改内容回写 MD |

**不在今日范围**：
- UI 编辑面板（右侧属性面板）
- 主题编辑器
- AI 组件生成流程
- 品牌包保存功能
- 多品牌切换 UI

## 本周迭代（Day 1-7）

- 预览侧右侧面板：点组件 → 变体/字体/配色切换
- 品牌包保存与加载（L2 层）
- 主题自定义基础能力
- CLI 工具（`forge render input.md --brand my-brand`）

## 下周起（开源准备 + API 服务准备）

- LICENSE 选择与声明
- `forge.md` 规范公开化（官网 / GitHub README）
- API 服务骨架（云端渲染接口）
- 引入 demo 站展示能力

## 当前冲刺仍需确认的决策

1. **LICENSE 选择**：MIT 还是 Apache 2.0？（都接受商用；Apache 2.0 包含专利授权，更保守）
2. **组件包后缀**：`.forge.md` 还是 `.component.md` 还是直接 `.md`？（建议 `.forge.md`，利于工具链识别）
3. **JS 沙箱策略**：组件的 JS 直接运行在主文档还是 iframe 隔离？（iframe 隔离安全但双向同步通信成本高；主文档简单但 CSS/JS 污染风险）

这些可以在今日冲刺过程中边做边定，不阻塞启动。

## 已明确放弃的方向

见 [`direction.md` 必须放弃的方向](./direction.md#必须放弃的方向)。
