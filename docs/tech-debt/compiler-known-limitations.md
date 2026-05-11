# 编译器已知限制

> 本文档记录 forge 编译器当前实现中的已知行为限制。这些不是 bug，是现阶段权衡后的设计选择。

## 1. ~~`@item` 块内不支持自动 md-binding~~ 已修复

**已修复**（2026-05-11）：`@item` 块内的裸 Markdown 现在会按子组件的 slot bind 规则自动绑定。显式 `@slot:` 仍然优先级最高。

修复方式：在 `bindNativeMd` 阶段对 `GroupNode` 内的每个 `GroupItemNode` 执行 md-binding，计算 item 源码中未被显式 slot 占用的区间，扫描 MD 块并按 bind 规则分配。

---

## 2. ~~`findContentSlot` 一次只能绑一个 content slot~~ 已修复

**已修复**（2026-05-11）：`findContentSlot` 已改为 `findAllContentSlots`，支持多个 `bind: content` 的 slot。自动绑定按 block 位置顺序分配：第一个 content slot 拿第一个 unconsumed block，第二个拿第二个，以此类推。多余 slot 留空；block 多于 slot 时最后一个 slot 合并接收剩余所有 block。

---

## 3. `bind: list` 严格匹配 `kind: ul-list/ol-list`

**现象**：连续的列表项被识别为单个 `ul-list` block。如果模板写了：

```md
- item 1
- item 2

- item 3   ← 空行后另起的列表
- item 4
```

会被识别为 **2 个** ul-list block。`bind: list` 只能消费第一个，第二个进 unconsumed。

**规避**：列表项之间不要插入空行；或用显式 `@slot:` 包裹完整列表。

---

## 4. ~~跨段（segment）绑定不生效~~ 已修复

**已修复**（2026-05-11）：`@theme` / `@layout` 切段后，新段现在继承上一段的 `@use` 上下文和已绑定 slot 集合（explicit + auto），裸 MD 块可以跨段继续绑定到同个组件。

修复方式：`bindSegment` 接受上一段的 carry-over 状态（currentUseId、explicitSlots、autoSlots），在段间传递。

---

## 5. `bind: h1` / `h2` / `h3` 只匹配第一个

第一轮 `findBindSlot` 给每种 (kind, level) 只挑**第一个**未被占用的 slot，后续同类型 block 进 unconsumed。这是设计行为，避免重复绑定。

如果一个组件需要多个同级 heading，必须用显式 `<!-- @slot:name -->`。

---

## 6. 兜底渲染规则

| 类型 | 兜底容器 | 样式 |
|---|---|---|
| 没有 `@use` 上下文的裸 Markdown | `.forge-free-text` | editorial 风格，跟随品牌包 token |
| 已声明 slot 但找不到 owner | `.forge-orphan` | 左侧 clay 边框 + slot 名标签 |
| 引用了未实现的组件 | 前面两者结合 | slot 内容会进 orphan，组件位置无渲染 |

兜底渲染**永远不会丢内容**——即使写错也能看到原文，方便用户排错。
