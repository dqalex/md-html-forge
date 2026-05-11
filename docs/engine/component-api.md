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

| 值 | 用于 | 示例（forge.md 原子组件） |
|---|---|---|
| `header` | 文档头部 | header / meta-pills |
| `summary` | 摘要 | lead |
| `content` | 正文 | body / code / qa |
| `card` | 可循环卡片 | card / info-panel |
| `list` | 列表 | list-item / list-row / timeline |
| `visual` | 视觉 | callout / panel / progress / chip / code-block / comparison / design-spec / illustration |
| `data` | 数据 | metric / pr-summary / table |
| `layout` | 布局容器 | grid-2/3/4 / flex-row / stack |
| `footer` | 页脚 | footer |
| `special` | 单页面专属 | slide-cover |

新建 category 时同步更新 `src/builtin/types.ts` 的 `ComponentCategory` 联合类型。

## SlotDef 字段

```ts
interface SlotDef {
  label: string;                       // UI 显示名
  // 对外（.forge.md 推荐）只用 3 种：text / content / data
  // image 仍由 universal-slots / slide-cover 等遗留路径使用，但新组件不要再用
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

## 组件交互（`## JS` 块 + forge.runtime）

### 何时需要交互

纯展示组件不需要 JS 块。需要"用户点击/输入产生反馈"时（折叠、复制、Tab、排序、筛选），在 `.forge.md` 里追加 `## JS` 块：

````markdown
## JS

```js
export function mount(el, api) {
  // el  → 组件根 DOM 元素（带 data-forge-id）
  // api → 该组件的运行时句柄
}
```
````

每个组件实例 mount 一次；`el` 是该实例的根。`api` 字段如下：

| 字段 | 用途 |
|---|---|
| `api.el` | 组件根（同 `el`，方便闭包） |
| `api.runtime` | 即 `window.forge.runtime`，全局工具集 |
| `api.emit(event, payload)` | 向宿主发组件事件（`forge:component-event`），可被外部 React 监听 |
| `api.on(event, handler)` | 监听宿主回发事件（`forge:host-event`） |
| `api.state.get(key, fallback)` | 读组件级持久状态（自动加 `c:<id>:<variant>:` 前缀） |
| `api.state.set(key, value)` | 写组件级持久状态，跨 srcdoc 重载保留 |

### `window.forge.runtime` 全局工具

| 方法 | 说明 |
|---|---|
| `runtime.shouldJumpToSource(target)` | 一致的"是否触发定位跳转"判定。组件内部 click handler 一般无需调用，已被顶层 click 监听器使用 |
| `runtime.copy(text)` | 跨浏览器剪贴板复制，返回 Promise<boolean> |
| `runtime.postToParent(type, data)` | 向宿主 React 发 postMessage |
| `runtime.on/off/emit(type, payload)` | 组件之间的事件总线（同一 iframe 内） |
| `runtime.state.get/set` | 全局命名空间的状态（自己拼 key） |

### 关键约束

1. **交互元素必须 `e.stopPropagation()`**
   - 否则会冒泡到顶层 click，触发"定位到源码"，把外层编辑器视图滚走 → 用户感知"点完跳到顶部"
2. **DOM 不参与跳转的子树加 `data-no-jump`**
   - 顶层 click handler 看到 `closest('[data-no-jump]')` 就退出
3. **状态持久化用 `api.state`，不要用 sessionStorage**
   - srcdoc iframe 每次 markdown 变都重新 navigate，sessionStorage 不可靠；`api.state` 走 parent 内存桥，自动跨 reload
4. **不要修改 `data-slot` 元素的标签结构**
   - slot 内容会在每次 mount 时被填充覆盖。要附加交互装饰，包一层外壳 div
5. **原生 `<details>` 自动持久化**
   - 任意 details 的 `open` 状态会被全局 toggle 监听器写入 `details:<index>`，无需组件作者关心

### 完整示例：复制按钮

```js
export function mount(el, api) {
  const btn = el.querySelector('.cp-copy');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();           // 防止触发跳转
    const text = el.querySelector('[data-slot="diffContent"]').textContent;
    Promise.resolve(api.runtime.copy(text)).then(() => {
      btn.classList.add('copied');
      btn.textContent = '已复制';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = '复制';
      }, 1200);
    });
  });
}
```

### 完整示例：Tab 切换 + 状态保留

```js
export function mount(el, api) {
  const tabs = el.querySelectorAll('.cp-ba-tab');
  const wrap = el.querySelector('.cp-ba');
  const setView = (view) => {
    wrap.setAttribute('data-ba-view', view);
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.baTarget === view));
    api.state.set('view', view);
  };
  setView(api.state.get('view', 'both'));   // 启动时恢复
  tabs.forEach((t) => t.addEventListener('click', (e) => {
    e.stopPropagation();
    setView(t.dataset.baTarget);
  }));
}
```
