<!-- @page narrow -->
<!-- @compose: header, meta-pills, lead, metric, panel, callout, code-block, comparison, chip, table, timeline, collapse-section, checklist, faq-item, footer -->
<!-- @theme editorial -->


<!-- @use header -->

# forge 语法规范

## Markdown → 模板化 HTML 的契约

<!-- @slot:eyebrow -->docs · engine · syntax<!-- @/slot -->
<!-- @slot:date -->2026-05-11 · 与当前代码同步<!-- @/slot -->


<!-- @use meta-pills -->

<!-- @slot:pills -->
forge · directive
@compose · required
@use · segment
@slot · component
@theme · segment
@layout · segment
@compose-group / @item · loop
<!-- @/slot -->


<!-- @use lead variant=tldr -->

> forge 在原生 Markdown 上叠加 7 个指令（都写在 HTML 注释里）。文件在任何 Markdown 编辑器打开仍然是合法 Markdown；在 forge 引擎里会被编译成组件化的模板 HTML。这份文档自身就是用 forge 语法写的。


<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
18
4
3
11
<!-- @/slot -->

<!-- @slot:metricLabel -->
内置组件
主题 × 变体
渲染模式
指令
<!-- @/slot -->

<!-- @slot:metricDelta -->
.forge.md 原子组件
editorial / dark × slots
compose · template · editorial
page / compose / theme / layout / use / slot / item
<!-- @/slot -->


<!-- @use callout variant=note -->

<!-- @slot:calloutTitle -->设计原则<!-- @/slot -->

**所有 forge 扩展都写在 HTML 注释里**，裸文件在任何 Markdown 编辑器打开都是合法 MD。内容永远是原生 Markdown —— 指令只管"组件 / 变体 / 主题 / 段"怎么组织。


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->最小可运行文档<!-- @/slot -->

```markdown
<!-- @page narrow -->
<!-- @compose: header, body, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# 我的第一篇文档

## 副标题（可选，进 subtitle slot）

<!-- @use body -->

## 背景

这是一段正文，支持 **加粗**、`代码`、[链接](https://example.com)。

- 要点 1
- 要点 2

<!-- @use footer -->

<!-- @slot:footer -->forge · 2026<!-- @/slot -->
```


<!-- @use chip variant=legend -->

<!-- @slot:legendItems -->
step|@page / @compose · 文档级声明
ok|@use · 组件实例起点
ok|@slot · 显式填充 slot
gate|@theme / @layout · 段切割
bad|@compose-group / @item · 循环布局
<!-- @/slot -->


<!-- @use table variant=standard -->

<!-- @slot:tableHeading -->7 个指令速查<!-- @/slot -->

| 指令 | 作用 | 作用域 | 出现次数 |
|---|---|---|---|
| `@page` | 页宽 / band / 字号 | 文档级 | 至多 1 |
| `@compose` | 本文用到的组件清单（**必填**） | 文档级 | 至多 1 |
| `@theme` | 切换主题 | 段级（直到下次声明） | 任意 |
| `@layout` | 切换当前段布局容器 | 段级 | 任意 |
| `@use` | 开一个组件实例（可带 `variant=`） | 段级 | 任意 |
| `@slot:name` | 显式给 slot 填值 | 组件内 | 任意 |
| `@compose-group` / `@item` | 循环布局（N 个同结构子项） | 段级 | 任意 |


<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
**原生 Markdown 表格** — 优先。直接写 `| col | col |`，`table variant=standard` 会用 `tableContent` slot 吸收整张表。

```md
<!-- @use table variant=standard -->

| PR | Title | Author |
|---|---|---|
| #1234 | Fix login retries | Alice |
```
<!-- @/slot -->

<!-- @slot:baAfter -->
**结构化数据** — `risk` / `impact` / `flag` 变体。每行用 `|` 分隔字段，写进 `tableData` slot。mount JS 会渲染出自定义视觉。

```md
<!-- @use table variant=risk -->

<!-- @slot:tableData -->
Race condition on sync append|high|Dedupe on server id
Stale unread counts|med|Broadcast read-upserts
<!-- @/slot -->
```
<!-- @/slot -->


<!-- @use comparison variant=options -->

<!-- @slot:optionTitle -->应该用 `@slot:` 显式还是靠原生 MD 自动绑定？<!-- @/slot -->

<!-- @slot:optionContext -->
两种都支持，且可以在同一个 `@use` 里混用。建议：**内容能用原生 MD 写就别显式**（裸文件可读性更好），复杂场景才回到显式。
<!-- @/slot -->

<!-- @slot:optionItems -->
A · 原生 MD 自动绑定 — 列表/表格/代码块/标题自动按 bind 规则进 slot
B · `@slot:name` 显式 — 精确控制、支持复杂多块内容
C · 混用 — 显式 slot 优先，剩余块按 bind 自动落位
<!-- @/slot -->


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->支持的 bind 类型<!-- @/slot -->

```yaml
h1 / h2 / h3   : 标题
blockquote     : > 引用块
ul / ol / list : 无序 / 有序 / 任意列表
code           : ``` 代码块
table          : | ... | 表格
paragraph      : 普通段落
content        : 兜底，吃段内剩余所有块（支持多个 content slot
                 按声明顺序分配；最后一个 content slot 会吃掉剩余全部）
```


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->@item 块内现在支持自动绑定（2026-05-11 之后）<!-- @/slot -->

```md
<!-- @compose-group: layout-grid-2 -->

<!-- @item card variant=decision -->
## Title inside item             ← 自动进 cardTitle
Body paragraph here.              ← 自动进 cardBody（content 兜底）
<!-- @/item -->

<!-- @item card variant=decision -->
<!-- @slot:cardTitle -->显式 slot 仍然优先<!-- @/slot -->
混合写法也 OK。
<!-- @/item -->

<!-- @/compose-group -->
```

`@item` 同时支持三种赋值姿势，优先级从高到低：
1. 显式 `@slot:xxx` 块
2. `variant=xxx` 及其它 `key="value"` 属性直接赋给 slot
3. 裸 Markdown 块按子组件的 `bind` 自动绑定


<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ 2026-05-11 release notes @@
+ @item 块内的裸 MD 会按子组件 bind 自动绑定（F2）
+ @item 支持 variant=xxx 透传给子组件（F4）
+ 一个组件可以声明多个 bind:content slot，按顺序分配（F1）
+ @theme / @layout 切段后绑定不会断（F6）
+ .forge.md 新增 ## JS 块 + window.forge.runtime（F8）
- 旧文档里所有 "@item 块不支持 md-binding" 的说法作废
- 旧文档里 "item 的 variant 会被当 slot 值" 的说法作废
<!-- @/slot -->


<!-- @use timeline -->

<!-- @slot:timelineHeading -->编译流水线（4 阶段）<!-- @/slot -->

<!-- @slot:timelineEntry -->
## Parser · 词法 / 语法切分

把 markdown 按 `@compose` / `@use` / `@slot` / `@item` / `@compose-group` 切成 segment → component → slot 树。`@theme` / `@layout` 改变当前段的渲染上下文但不中断后续 `@use` 的 MD 块捕获（跨段绑定已修复）。
<!-- @/slot -->

<!-- @slot:timelineEntry -->
## MD-Binding · 原生 MD 绑定

每个 `@use` 后面的原生 MD 块按 slot 的 `bind` 类型分配：
- 第一轮：精确类型匹配（`h2` → `bind:h2` 的 slot）
- 第二轮：剩余块按声明顺序分配到 `bind:content` 的多个 slot
- 最后一个 `content` slot 吃掉所有剩余
- `@item` 块内走**同一套**绑定规则（2026-05-11 起）
<!-- @/slot -->

<!-- @slot:timelineEntry -->
## Resolver · Variant / 主题 / 布局解析

解析 `variant=`（含 `@item` 的 variant 透传）、`@theme`、`@layout`；把组件和当前段绑定的主题 / 布局容器关联上。
<!-- @/slot -->

<!-- @slot:timelineEntry -->
## Emitter · HTML + 交互注入

组装最终 HTML，同时注入 `window.forge.runtime` 运行时：事件总线、`shouldJumpToSource`、剪贴板工具、状态持久化（跨 srcdoc 重载）。`.forge.md` 的 `## JS` 块会被挂载到 `window.__forgeMounts[id]`，按 `[data-forge-id]` 元素 mount。
<!-- @/slot -->


<!-- @use callout variant=warning -->

<!-- @slot:calloutTitle -->AI 生成模板的铁律<!-- @/slot -->

- `@compose` 列表 **= 实际用到的组件集合**（不多不少）
- 所有 `@use <id>` 的 `<id>` 必须在内置组件清单中
- 所有 `@slot:<name>` 的 `<name>` 必须是该组件的真实 slot 名
- 同一组件多实例（FAQ / timeline 条目）用**多次 `@use`**，不要写 `q1 / a1 / q2 / a2` 虚构 slot
- `lead variant=lead` 内容用 `>` blockquote 或显式 `<!-- @slot:lead -->`
- `table variant=standard` 用 `tableContent`；`risk` / `impact` / `flag` 用 `tableData` + `|` 分隔
- 每个组件的 slot 命名遵循 `<id><SlotName>` 规则（`card` → `cardTitle / cardBody`）


<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->常见错误 · 虚构 slot 名<!-- @/slot -->
<!-- @slot:sectionWhere -->见 compiler-known-limitations.md<!-- @/slot -->

<!-- @slot:sectionBody -->
**❌ 错**：

```md
<!-- @use faq-item -->
<!-- @slot:q1 -->问题 1<!-- @/slot -->
<!-- @slot:a1 -->回答 1<!-- @/slot -->
<!-- @slot:q2 -->问题 2<!-- @/slot -->
```

`faq-item` 只有 `faqQ / faqA` 两个 slot，`q1/a1/q2` 都是虚构的。

**✅ 对**（多实例 = 多次 `@use`）：

```md
<!-- @use faq-item -->
<!-- @slot:faqQ -->问题 1<!-- @/slot -->
<!-- @slot:faqA -->回答 1<!-- @/slot -->

<!-- @use faq-item -->
<!-- @slot:faqQ -->问题 2<!-- @/slot -->
<!-- @slot:faqA -->回答 2<!-- @/slot -->
```
<!-- @/slot -->


<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->常见错误 · `bind` 不匹配导致内容丢失<!-- @/slot -->
<!-- @slot:sectionWhere -->md-binding 规则<!-- @/slot -->

<!-- @slot:sectionBody -->
如果某个 slot 声明了 `bind: h2`，你又在 `@use` 后只写了 `# 一级标题`（h1），这条 MD 块**不会**进 slot（bind 不匹配 → 被视为 free-text → 走兜底渲染）。

解决：
1. 改成显式 `@slot:name` 块（推荐，最稳）
2. 或者把 MD 级别改成 bind 声明的类型
3. 或者让该组件有一个 `bind: content` 的 slot 作为兜底

想看具体组件的 slot / bind 声明，读源码：`src/builtin/components/<category>/<id>.forge.md` 的 `## Slots` 段。
<!-- @/slot -->


<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->常见错误 · `@compose` 多声明了没用的组件<!-- @/slot -->
<!-- @slot:sectionWhere -->编译诊断会标红<!-- @/slot -->

<!-- @slot:sectionBody -->
```md
<!-- @compose: header, lead, panel, code-block, footer -->
```

如果实际只用到 `header / lead / panel / footer`，多余的 `code-block` 会被兜底实例化成一个空组件挂页面底部。`npm run audit:templates` 会把这种问题作为 `unused-declaration` 报出来。

**规则**：`@compose` 列表必须和实际 `@use` 的组件**精确一致**（不多不少）。
<!-- @/slot -->


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->组件交互（`.forge.md` 的 ## JS 块）<!-- @/slot -->

```js
// 在 .forge.md 里加一段 ## JS
export function mount(el, api) {
  // el  → 组件根 DOM（带 data-forge-id）
  // api → { el, runtime, emit, on, state }
  const btn = el.querySelector('.my-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();                        // 别忘这行，否则会触发跳转
    api.runtime.copy(btn.dataset.text);          // 用运行时工具
    api.state.set('clicked', true);              // 跨 srcdoc 重载保留状态
    api.emit('my-event', { foo: 1 });            // 向宿主发事件
  });
}
```

已内置能力：
- `api.runtime.copy(text)` · 剪贴板复制
- `api.runtime.shouldJumpToSource(target)` · 跳转决策
- `api.runtime.on/off/emit(type, payload)` · 同 iframe 内事件总线
- `api.state.get/set(key, value)` · 组件级状态（自动加 `c:<id>:<variant>:` 前缀），跨 markdown 编辑重渲不丢
- 原生 `<details>` 的 `open` 状态自动持久化，组件作者无需额外代码

已实装交互的组件：`checklist`（勾选回写 MD）/ `code-block`（复制、walkthrough 折叠）/ `comparison`（ba Tab、options 单选）/ `table`（standard/risk 表头排序、flag toggle）/ `chip`（risk active、legend 多选筛选）/ `collapse-section` + 任意 `<details>`（展开状态保留）。


<!-- @use checklist -->

<!-- @slot:checklistHeading -->写一个新模板前的检查表<!-- @/slot -->

- [ ] `@compose` 列表 = 实际 `@use` 的组件集合（不多不少）
- [ ] 每个 `@use <id>` 的 `<id>` 在内置组件里存在
- [ ] 每个 `@slot:<name>` 的 `<name>` 是组件的真实 slot 名
- [ ] 同类多条记录用多次 `@use`，不写虚构的编号 slot
- [ ] `table standard` 用 `tableContent` + Markdown 表格；`risk/impact/flag` 用 `tableData` + `|` 分隔
- [ ] `metric band` 的三个 slot（`metricValue / metricLabel / metricDelta`）等长
- [ ] 运行 `npm run audit:templates` → 21/21 全绿


<!-- @use faq-item -->

<!-- @slot:faqQ -->`@use` 了但没渲染出来<!-- @/slot -->

<!-- @slot:faqA -->
检查 `@compose` 里是否声明了该组件 id。**未声明的组件无法被 `@use` 激活**，这是刻意的设计（强制显式依赖）。编译器会在诊断栏报 `unregistered-use`。
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->内容写了但页面空白<!-- @/slot -->

<!-- @slot:faqA -->
多半是 slot 名写错或 `bind` 不匹配。临时改用显式 `@slot:name` 块看是否显示 — 能显示就说明是自动绑定匹配失败，回去调 bind 类型即可。
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->同一组件用了两次，内容会合并吗<!-- @/slot -->

<!-- @slot:faqA -->
不会。每次 `@use` 都创建独立组件实例。timeline / faq-item / callout 等都依赖这个机制实现"多条记录"。
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->怎么看某个组件有哪些 slot / 变体<!-- @/slot -->

<!-- @slot:faqA -->
直接读源码：`src/builtin/components/<category>/<id>.forge.md`，`## Slots` 段列出所有 slot，`## Variants` 段列出所有变体。Playground 右侧的属性面板也会显示 slot 列表 + 一键切换变体。
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->点预览元素跳回编辑器对应行不工作<!-- @/slot -->

<!-- @slot:faqA -->
两种情况：
1. 组件模板里忘了加 `data-slot="<name>"` — emitter 沿着 DOM 向上找 `data-src-line`，没有就不会跳
2. 点到了交互元素（button / input / `<summary>` / `[data-no-jump]`）— 这是有意的：交互优先于定位，否则"点复制按钮也跳转"会很烦人（见 `shouldJumpToSource` 决策规则）
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->导出 HTML 里会不会带编辑器属性 / 交互脚本<!-- @/slot -->

<!-- @slot:faqA -->
不会。工具栏"导出"用 `outputMode: 'standalone'` 编译，会剥掉 `data-src-line` / `data-forge-id` / `data-md-checkbox` 等编辑器属性和所有 runtime 脚本，输出可以在任意浏览器单独打开的干净文件。
<!-- @/slot -->


<!-- @use footer -->

<!-- @slot:footer -->
forge · docs/engine/syntax · 用 forge 自己渲染。AI 用 → `/llms.txt` · `/api/catalog.json` · `/docs/agent`。源码：`src/app/docs/syntax/` · 深度契约：`docs/engine/syntax.md`（给 AI 细节查阅）· 组件源码：`src/builtin/components/*.forge.md`
<!-- @/slot -->
