# 组件 API

> 所有组件用 `defineComponent()` 工厂声明，类型完整、行为统一。

## 最小示例

```ts
// src/builtin/components/card/feature-card.ts
import { defineComponent, isEmpty, any } from '../_base';

export default defineComponent({
  id: 'feature-card',
  name: '功能卡片',
  description: '图标 + 标题 + 描述的小卡片',
  source: '06,landing',
  category: 'card',
  tags: ['card', 'feature', 'icon'],

  slots: {
    cardIcon:  { label: '图标 (lucide 名称)', type: 'text', placeholder: 'zap' },
    cardTitle: { label: '标题', type: 'text', placeholder: '功能名称', bind: 'h3' },
    cardBody:  { label: '描述', type: 'content', placeholder: '一段介绍' },
  },

  sample: {
    cardIcon: 'zap',
    cardTitle: '极速渲染',
    cardBody: '从 MD 到 HTML，**纯前端零后端**。',
  },

  css: `
.comp-feature-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 22px 24px;
}
.comp-feature-card h3 {
  font-family: var(--serif);
  font-size: 18px;
  color: var(--slate);
}
  `.trim(),

  html: (s) => {
    if (!any(s.cardTitle, s.cardBody, s.cardIcon)) return '';
    return `
<div class="comp-feature-card" data-section="feature-card">
  ${!isEmpty(s.cardIcon) ? `<div class="fc-icon"><i data-lucide="${s.cardIcon.trim()}"></i></div>` : ''}
  ${!isEmpty(s.cardTitle) ? `<h3 data-slot="cardTitle">${s.cardTitle}</h3>` : ''}
  ${!isEmpty(s.cardBody) ? `<div class="fc-body" data-slot="cardBody" data-slot-type="content">${s.cardBody}</div>` : ''}
</div>`.trim();
  },
});
```

## ComponentDef 完整字段

```ts
interface ComponentDef {
  // === 标识 ===
  id: string;                    // kebab-case，全局唯一
  name: string;                  // 显示名（中文 OK）
  description?: string;          // 一句话用途（< 50 字）
  source: string;                // 来源 demo 编号，如 '06,landing'
  category: ComponentCategory;   // 见下表
  tags?: string[];               // 用于搜索

  // === Slots ===
  slots: Record<string, SlotDef>;
  sample?: Record<string, string>;   // 演示值（slot 名 → MD 文本）

  // === 渲染 ===
  css: string;                   // 该组件专属 CSS（避免污染其他组件）
  html: (slots) => string;       // 渲染函数，无内容应返回 ''

  // === 布局组件 ===
  isLayout?: boolean;
  sampleChildren?: string[];     // 布局组件的示例子项（组件 id）
}
```

### `category` 枚举

| 值 | 用于 | 示例 |
|---|---|---|
| `header` | 文档头部 | header / meta-pills / hero |
| `summary` | 摘要 | tldr / lead |
| `content` | 正文 | body / code / qa |
| `card` | 可循环卡片 | feature-card / stat-card / pricing-card |
| `list` | 列表 | actions / checklist / timeline / milestones / highlights |
| `visual` | 视觉 | progress / before-after / options / rollout |
| `data` | 数据 | metrics / table / summary-band |
| `layout` | 布局容器 | grid-2/3/4 / flex-row / stack |
| `footer` | 页脚 | footer / signature |
| `special` | 单页面专属 | slide-deck / kanban |

新建 category 时同步更新 `src/builtin/types.ts` 的 `ComponentCategory` 联合类型。

## SlotDef 字段

```ts
interface SlotDef {
  label: string;                       // UI 显示名
  type: 'text' | 'content' | 'data' | 'image';
  description?: string;
  placeholder?: string;
  bind?: SlotBindKind;                 // 原生 MD 自动绑定（见下）
}

type SlotBindKind =
  | 'h1' | 'h2' | 'h3'
  | 'blockquote'
  | 'ul' | 'ol' | 'list'
  | 'code' | 'table'
  | 'paragraph'
  | 'content';   // 兜底：吃段内剩余所有块
```

### slot type 说明

| type | 渲染前预处理 | 适用 |
|---|---|---|
| `text` | `inlineMdToHtml(raw)` + sanitize | 单行文本（标题、徽章、日期、图标名） |
| `content` | `simpleMdToHtml(raw)` + sanitize | 块级 markdown（段落、列表、引用） |
| `data` | 原值（组件自己解析） | JSON / 自定义结构 |
| `image` | 原值 | 图片 URL |

## `html(slots)` 渲染函数规范

### 必须遵守

1. **空值返回空字符串**
   ```ts
   if (!any(s.title, s.body)) return '';
   ```
   否则空组件会留下空 `<section>` 框。

2. **每个 slot 输出处必须带 `data-slot="<name>"`**
   ```ts
   `<h1 data-slot="title">${s.title}</h1>`
   ```
   这是**点击定位**（预览 → 编辑器跳转）的基础。

3. **块级内容 slot 加 `data-slot-type="content"`**
   ```ts
   `<div data-slot="body" data-slot-type="content">${s.body}</div>`
   ```

4. **组件根元素加 `data-section="<id>"`**
   ```ts
   `<section class="comp-feature-card" data-section="feature-card">...`
   ```

5. **isEmpty 判断隐藏**：每个可选 slot 都要 `!isEmpty(s.xxx)` 包一层条件。

### 不应做

- ❌ 不要在 `html()` 里直接输出 `<style>` 标签 → 用 `css` 字段
- ❌ 不要 inline `style="..."` → 一律走 `css` 字段
- ❌ 不要假设 slot 一定有值（除非该 slot 是 required，目前没有 required 标记）
- ❌ 不要在 css 里写裸选择器（`.comp-xxx` 命名空间是必须的）

## CSS 规范

### 命名

每个 CSS 选择器都要用 `.comp-<id>` 前缀做命名空间：

```css
/* ✅ 正确 */
.comp-feature-card { ... }
.comp-feature-card .fc-title { ... }
.comp-feature-card:hover { ... }

/* ❌ 错误 - 会污染其他组件 */
.feature-card { ... }
h3 { font-size: 18px; }     /* 全局选择器！ */
```

### 使用共享 token

来自 `src/builtin/components/shared-tokens.ts`：

```css
:root {
  --ivory: #FAF9F5;       /* 米色底 */
  --slate: #141413;       /* 深色文字 */
  --clay:  #D97757;       /* 强调红橙 */
  --oat:   #E3DACC;
  --olive: #788C5D;
  --rust:  #B04A3F;
  --gray-100: #F0EEE6;
  --gray-300: #D1CFC5;
  --gray-500: #87867F;
  --gray-700: #3D3D3A;
  --white: #FFFFFF;

  --serif: ui-serif, Georgia, serif;
  --sans:  system-ui, -apple-system, sans-serif;
  --mono:  ui-monospace, 'SF Mono', Menlo, monospace;

  --radius-panel: 12px;
  --border: 1.5px solid var(--gray-300);
}
```

**永远引用变量，不要 hardcode 颜色**。这是主题切换正常工作的前提。

## 布局组件（`isLayout: true`）

布局组件的 `html(slots)` 接收一个特殊 slot：`slots.__children__`，里面是已渲染好的子组件 HTML 拼接串。

```ts
export default defineComponent({
  id: 'grid-3',
  name: '3 列网格',
  category: 'layout',
  isLayout: true,
  sampleChildren: ['feature-card', 'feature-card', 'feature-card'],
  slots: {},
  css: `
.comp-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}
  `.trim(),
  html: (s) => `<div class="comp-grid-3">${s.__children__ || ''}</div>`,
});
```

参考 `src/builtin/components/layout/_layout-factory.ts` 看现有 grid-2/3/4 的简洁实现。

## 注册流程

```
1. 在对应 category 目录下新建 xxx.ts
   └── export default defineComponent({...})

2. 在该 category 的 index.ts 里
   └── import xxx from './xxx';
   └── export const XXX_COMPONENTS = [...existing, xxx];

3. 自动出现在：
   ├── 组件库浏览器（按 category 分组）
   ├── @compose 可引用
   └── 模板可包含
```

零侵入：不需要改主框架，不需要改 registry，不需要改 emitter。

## 工具函数

```ts
import { isEmpty, any } from '../_base';

isEmpty(s);              // s 是空 / 空格 / 占位符 [xxx] / 注释
any(s.a, s.b, s.c);      // 任一非空
```

## 调试技巧

- **看不到组件渲染**：检查 `html()` 是否在所有 slot 空时 return `''`
- **样式跑到别的组件去了**：检查 CSS 是否都在 `.comp-<id>` 命名空间下
- **slot 拿不到值**：在 MD 里临时改用显式 `<!-- @slot:name -->` 而不是依赖 `bind`
- **主题切换没效果**：CSS 里 hardcode 了颜色而不是用 `var(--xxx)`
- **点击预览没跳转到编辑器对应行**：忘记加 `data-slot="<name>"`
