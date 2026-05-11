# 标准迁移流程

> 把一个 HTML 拆成 N 个 forge 组件的 7 步法。

## 0. 准备

1. 在编辑器里打开源 HTML（直接看渲染效果），同时打开源代码
2. 确认引擎文档已读：[`syntax.md`](../engine/syntax.md) / [`component-api.md`](../engine/component-api.md) / [`design-tokens.md`](../engine/design-tokens.md)

## 1. 识别可复用单元（10 分钟）

通览整个 HTML，按"视觉块"列出潜在组件。每个块写一个候选 id。

例（看 `06-component-variants.html`）：
```
- variant-grid       （是布局，可能复用 grid-3 组件）
- variant-card       （核心循环单元 ✓）
- variant-pill       （chip 类，看是否独立 or 内嵌）
- code-snippet-mini  （行内代码块带 lang 标签）
- before-after-pair  （已有 before-after 组件，复用）
```

**判断准则**（见 [`overview.md` 颗粒度判断](./overview.md#颗粒度判断关键)）。

## 2. 为每个单元设计 slot（关键步骤，30 分钟）

观察该单元里所有"会变化的内容"，定义 slot：

```
看到的元素                    → slot 设计
-------------------------------------------
"Variant 1 · Hover"            → slot variantLabel (text)
"Primary button on hover..."   → slot variantTitle (text, bind: 'h3')
长描述段落                      → slot variantBody (content, bind: 'paragraph')
紫色 hex 标签 #6366F1           → slot variantToken (text, mono 显示)
代码片段 button:hover {...}     → slot variantCode (content, bind: 'code')
"在以下场景使用..."             → slot variantUsage (content)
```

**slot 设计原则**：
- **越细越好**：每个独立可变项一个 slot（用户能精准控制）
- **能用 bind 就用 bind**：让用户写原生 MD 不用记 slot 名
- **type 选对**：text（行内）/ content（块级）/ data（结构化）/ image
- **placeholder 写有意义的真实示例**

## 3. 提取 CSS（30-60 分钟）

### 3a. 删除全局 reset

源 HTML 里的 `* { box-sizing: border-box; ... }` / `body { ... }` —— **全部删除**。这些已经在 `shared-tokens.ts` 里了。

### 3b. 删除重复 token

源 HTML 头部一般有：

```css
:root {
  --ivory: #FAF9F5;
  --slate: #141413;
  /* ... */
}
```

**全部删除**。共享 token 已经注入。

### 3c. 给所有选择器加 `.comp-<id>` 命名空间

源 HTML：
```css
.variant-card { background: var(--white); }
.variant-card .label { color: var(--gray-500); }
.variant-card h3 { font-family: var(--serif); }
```

迁移后（id = `variant-card`）：
```css
.comp-variant-card { background: var(--white); }
.comp-variant-card .label { color: var(--gray-500); }
.comp-variant-card h3 { font-family: var(--serif); }
```

注意：源里的 `.variant-card` → `.comp-variant-card`；其内部嵌套的 `.label` 也要改成 `.comp-variant-card .label` 防止泄漏。

### 3d. 替换 hardcode 颜色

```css
/* ❌ */
.comp-x { color: #141413; background: #FAF9F5; }

/* ✅ */
.comp-x { color: var(--slate); background: var(--ivory); }
```

详细映射见 [`design-tokens.md`](../engine/design-tokens.md)。

### 3e. CSS 体积控制

每个组件的 css 字段建议 < 100 行。如果超过：
- 看是否包含了应该独立的子组件
- 看是否有大量"装饰性 CSS"（特定动画、特定渐变）—— 这些可以保留，但确认在主题切换下仍合理

## 4. 写 `html(slots)` 函数（30 分钟）

参考源 HTML 的结构，但**做这些替换**：

| 源 HTML | 迁移后 |
|---|---|
| 硬编码内容 `Variant 1 · Hover` | `${s.variantLabel}` |
| 硬编码长文 | `${s.variantBody}` |
| 任何 slot 输出处 | 加 `data-slot="<name>"` |
| 块级内容 slot | 加 `data-slot-type="content"` |
| 组件根节点 | 加 `data-section="<id>"` |

每个可选 slot 用 `!isEmpty(s.xxx) ? `<...>` : ''` 包条件。

第一行总是：

```ts
if (!any(s.variantTitle, s.variantBody)) return '';
```

至少一个核心 slot 有内容才渲染，否则空字符串（emitter 会跳过）。

## 5. 注册 + 写 sample（10 分钟）

```ts
// src/builtin/components/card/variant-card.ts
import { defineComponent, isEmpty, any } from '../_base';

export default defineComponent({
  id: 'variant-card',
  name: '组件变体卡',
  description: '展示某组件在某状态下的视觉 + 描述 + 代码',
  source: '06',
  category: 'card',
  tags: ['card', 'variant', 'design-system'],
  slots: { ... },
  sample: {
    variantLabel: 'Variant 1 · Hover',
    variantTitle: 'Primary button on hover',
    variantBody: '提供 **subtle 提升** 信号，无大幅形变。',
    variantToken: '#6366F1',
  },
  css: `...`,
  html: (s) => { ... },
});
```

```ts
// src/builtin/components/card/index.ts
import featureCard from './feature-card';
import statCard from './stat-card';
import variantCard from './variant-card';   // ← 新增

export const CARD_COMPONENTS = [featureCard, statCard, variantCard];
```

## 6. 验证（20 分钟）

### 6a. 类型检查

```bash
cd /data/workspace/md-html-forge
npx tsc --noEmit
```

必须 0 错误。

### 6b. ESLint

通过 IDE 或 `npx eslint src/builtin/components/<category>/<id>.ts`。0 错误。

### 6c. 视觉对比

写一个最小 demo MD：

```md
<!-- @compose: variant-card -->
<!-- @theme: editorial -->

<!-- @item: variant-card -->
<!-- @slot:variantLabel -->Variant 1 · Hover<!-- @/slot -->
<!-- @slot:variantTitle -->Primary button on hover<!-- @/slot -->
<!-- @slot:variantBody -->提供 **subtle 提升** 信号。<!-- @/slot -->
<!-- @/item -->
```

或者直接在 demo 页里临时加一段，启动 `npm run dev`，浏览器对比源 HTML 和预览。

**像素级要求**：颜色、字号、间距、圆角、阴影应当**视觉相同**（允许 ±2px 差异，因为我们用了共享 token）。

### 6d. 主题切换

把 `<!-- @theme: editorial -->` 改成 `<!-- @theme: dark -->`。组件应当：
- 文字、背景反色（dark 主题应用）
- 不破坏布局（位置 / 大小不变）
- 不出现"白底 + 白字"等可读性问题

## 7. 提交

git commit 信息建议：

```
feat(components): migrate <id> from html-effectiveness/<filename>

- Extracted from <source-html>
- Slots: <slot1>, <slot2>, ...
- Category: <category>
- Tags: <tags>
```

## 时间估算

| 步骤 | 时间 |
|---|---|
| 0. 准备 | 5 min |
| 1. 识别单元 | 10 min |
| 2. 设计 slot | 30 min |
| 3. 提取 CSS | 30-60 min |
| 4. 写 html() | 30 min |
| 5. 注册 + sample | 10 min |
| 6. 验证 | 20 min |
| 7. 提交 | 5 min |
| **单组件总计** | **2-2.5 hour** |

一个 HTML 平均产出 6 个组件 → **每个 HTML 任务 12-15 hour**（建议拆给多个 agent 并行做，每人负责 1-2 个 HTML）。

## 常见错误

| 错误 | 后果 | 解决 |
|---|---|---|
| 忘记 `.comp-<id>` 前缀 | CSS 污染其他组件 | 全文搜源选择器，逐个加前缀 |
| 用了源 HTML 的 hardcode 颜色 | 主题切换不生效 | 替换为 `var(--xxx)` |
| 没加 `data-slot` | 点击预览不能跳转 | 在每个 slot 输出处加 |
| 空 slot 没 isEmpty 检查 | 渲染出空标签 | 用 `!isEmpty(s.x) ? ... : ''` 包条件 |
| 全空仍渲染 | 留下空 `<section>` | 顶部 `if (!any(...)) return '';` |
| id 不唯一 | 编译期 warning，覆盖前者 | 选更具体的 id |
| slot type 用错 | 内容里 markdown 不渲染 | 块级用 `content`，行内用 `text` |
