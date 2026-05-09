# 验收清单

每个新增组件必须通过以下 12 项才算完成。

## 必查项（must）

### 标识

- [ ] **id 全局唯一**（kebab-case）。在 `BUILTIN_COMPONENTS` 里 grep 确认无重复。
- [ ] **category 选择正确**（参考 [`component-api.md`](../engine/component-api.md#category-枚举)）。
- [ ] **source 字段**填了来源 HTML 编号（如 `'06'` 或 `'06,landing'`）。

### Slot

- [ ] 每个 slot 都有 **label**（中文 OK）和 **placeholder**（真实示例文本）。
- [ ] **type 选对**：单行用 `text`，富文本块用 `content`。
- [ ] 适合的 slot 加了 **bind**（让用户能用原生 MD 写）。
- [ ] **sample 字段**包含至少 70% 的 slot（非可选项必须有）。

### CSS

- [ ] 所有选择器都用 `.comp-<id>` 命名空间。**没有裸全局选择器**（`h1 / p / li` 等不带前缀）。
- [ ] 所有颜色都用 `var(--xxx)`，**0 处 hardcode**（包括 hex / rgb / 颜色名）。
- [ ] 字体引用 `var(--serif)` / `var(--sans)` / `var(--mono)`，不写 `font-family: Georgia`。
- [ ] CSS 字段 `< 150` 行（更长说明颗粒度太大，应继续拆）。

### HTML

- [ ] **空 slot 全空时**：函数返回 `''`（顶部 `if (!any(...)) return '';`）。
- [ ] **每个可选 slot** 用 `!isEmpty(s.x) ? ... : ''` 包条件。
- [ ] **每个 slot 输出处**带 `data-slot="<name>"`。
- [ ] **块级 content slot** 带 `data-slot-type="content"`。
- [ ] **组件根元素**带 `data-section="<id>"`。

### 注册

- [ ] 在对应 category 的 `index.ts` 里 import 并加入数组。
- [ ] 类别 index.ts 数组里**没有重复的组件名**。

### 验证

- [ ] **`npx tsc --noEmit`** 0 错误。
- [ ] **ESLint** 0 错误。
- [ ] **浏览器视觉对比**：与源 HTML 像素级一致（允许 ±2px）。
- [ ] **主题切换测试**：`@theme dark` / `@theme sage` 都能正常显示，没有 contrast 问题。
- [ ] **空 slot 测试**：不传任何 slot 时渲染为空（不是空 `<section>`）。
- [ ] **点击定位**：浏览器里点击该组件 → 编辑器光标跳到对应 slot 行。

## 应查项（should）

### 设计质量

- [ ] **不超出共享 token**：没有引入新颜色、新字体（除非确实需要主题之外的颜色）。
- [ ] **行业惯例**：常见交互（hover / focus / active）有对应 CSS。
- [ ] **不滥用动画**：避免 `transition: all`，明确 transition 属性。

### 可访问性

- [ ] **语义化标签**：标题用 `h2`/`h3`，列表用 `ul`/`ol`，链接用 `a` 而不是 `div onclick`。
- [ ] **alt / title**：图片有 alt，按钮有 title 或文字内容。
- [ ] **对比度**：在 light 和 dark 主题下 foreground / background 对比度 ≥ 4.5。

### 代码质量

- [ ] **html() 函数 < 50 行**（如果太长，可能某些 slot 该独立成子组件）。
- [ ] **没有内联 JavaScript**（`onclick="..."` / `<script>` 等）。
- [ ] **没有 inline `style="..."`**（除非是 slot 用户输入的动态值，如背景图 url）。

## 不应做（must not）

- [ ] **不要修改 `shared-tokens.ts`**（除非新增 token 经过讨论）。
- [ ] **不要修改 `compiler/` 下的任何文件**（迁移组件不需要改编译器）。
- [ ] **不要修改其他组件的文件**（保持隔离）。
- [ ] **不要在 css 里写 `@media` 移动端断点**（除非真的需要；优先让 layout 组件处理响应式）。
- [ ] **不要引入新的 npm 依赖**（lucide-react 已经在 deps，其他自带）。
- [ ] **不要在 html() 里 console.log**（提交前删除调试）。

## Reviewer 复核流程

1. 检查上面所有 must / should 项
2. 跑一次 `npm run build`（更严格的产物检查）
3. 在浏览器里：
   - 看默认主题渲染
   - 切换 dark 主题看不掉链
   - 切换 page 宽度（mobile / wide）看响应式
   - 点击 slot 看是否能跳转编辑器
4. 看 git diff：
   - 只动了对应 category 目录下的文件 + 该目录的 index.ts
   - 没有意外改动其他文件

## 通过后

- 在该 HTML 任务的清单上勾掉这个组件
- 当一个 HTML 的所有组件都迁移完，更新 `docs/migration/inventory.md`
