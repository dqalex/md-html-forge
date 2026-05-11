# Post-Review Follow-ups

> 本次 review 中发现的"工作量大、不适合顺手修"的问题，已整理成可独立分发给 agent 的任务包。每个任务自带：背景、验收标准、可工作的提示词、参考文件。

---

## 任务清单概览

| ID | 优先级 | 工作量 | 主题 |
|---|---|---|---|
| **F1** | P1 | 中 | ~~`findContentSlot` 只能绑一个 content slot 的限制~~ ✅ 2026-05-11 |
| **F2** | P1 | 中 | ~~`@item` 块内不支持 md-binding 自动绑定~~ ✅ 2026-05-11 |
| **F3** | P2 | 大 | 实现技术债清单中的 18 个组件（按优先级分批） |
| **F4** | P2 | 中 | ~~`@item` 不支持 variant 透传~~ ✅ 2026-05-11 |
| **F5** | P2 | 小-中 | ~~多个组件的 starter 仍生成 `<!-- ─── 装饰 ─── -->` 注释~~ ✅ 2026-05-11 |
| **F6** | P3 | 中 | ~~跨段（segment）绑定不生效~~ ✅ 2026-05-11 |
| **F7** | P3 | 小 | ~~audit 脚本：补 `htmlValidator`（标签平衡 / a11y）~~ ✅ 2026-05-11 |
| **F8** | P1 | 中-大 | ~~**交互组件体系**：现状只有 checkbox 一种交互，体验薄弱~~ ✅ 2026-05-11 |

> 注：本文档持续更新；每完成一项请在表格中标 ✅ + 完成日期，并把对应章节的 prompt 标"已完成"。

---

## F1 · `findContentSlot` 多 content slot 支持

### 背景

当前 `src/builtin/compiler/md-binding.ts` 的 `findContentSlot` 函数只返回**第一个** `bind: 'content'` 的 slot，多余的永远收不到自动绑定。

例子：假设 panel 组件有 `panelBody` 和 `panelExtra` 都是 `bind: content`，那么裸 MD 段落只会进 `panelBody`，`panelExtra` 永远空。

当前规避：每个组件只声明 **一个** `bind: content` 的 slot。但这限制了组件设计。

### 验收标准

- 一个组件可以有多个 `bind: content` 的 slot
- 自动绑定按 block 在源文本中的**位置顺序**分配：第一个 content slot 拿第一个 unconsumed block，第二个 content slot 拿第二个，以此类推
- 如果 unconsumed blocks 数 < content slots 数，多余 slot 留空
- 如果 unconsumed blocks 数 > content slots 数，最后一个 content slot 把剩余所有 block 合并接收
- 不破坏现有 21 个模板的 audit（`npm run audit:templates` 仍 21/21 通过）

### Agent Prompt

```text
你需要修改 forge 编译器的 md-binding 阶段，让一个组件支持多个 bind: 'content' 的 slot。

工作目录：/data/workspace/md-html-forge

阅读这些文件理解上下文：
1. docs/engine/architecture.md（编译器四阶段）
2. docs/engine/component-api.md（slot 定义与 bind 字段）
3. src/builtin/compiler/md-binding.ts（待修改）
4. docs/tech-debt/compiler-known-limitations.md 第 2 条（这个限制的描述）

修改 src/builtin/compiler/md-binding.ts 的 findContentSlot 函数：
- 当前签名：findContentSlot(slots, explicit, auto): { name, def } | null
- 改为：返回所有 bind:'content' 且未被占用的 slot 列表，按声明顺序

修改 bindSegment 内"第二轮"逻辑：
- 收集所有 unconsumed blocks
- 按 contentSlots.length 拆分：
  * 如果 blocks.length <= contentSlots.length：每个 slot 拿一个 block，多余 slot 空
  * 如果 blocks.length > contentSlots.length：前 N-1 个 slot 拿一个，最后一个吃剩余所有
- push 出对应的 SlotNode（每个 slot 一个 SlotNode，raw 来自 source.slice）

测试：
1. npm run audit:templates 仍然 21/21 通过
2. 临时给 panel.forge.md 加一个 panelExtra: type:content, bind:content slot
3. 写个测试模板用两段 markdown 验证两个 slot 都被填充
4. 测完移除 panelExtra（不污染主分支）

注意事项：
- 不要改变 explicit slot 的处理逻辑（显式 @slot:xxx 优先级最高）
- 不要破坏 fork-instance 行为（同 segment 多次 @use 同 id 时每个实例独立）
- 提交前跑 npm run typecheck 必须 0 错误

完成后更新 docs/tech-debt/compiler-known-limitations.md，把第 2 条改为"已修复"或删除。
```

---

## F2 · `@item` 块内支持 md-binding

### 背景

当前 `<!-- @compose-group -->` 内 `<!-- @item -->` 块里的裸 markdown **不会**被自动绑定到子组件 slot。所有内容必须用显式 `<!-- @slot:name -->`。

参考：`docs/tech-debt/compiler-known-limitations.md` 第 1 条。

举例：

```md
<!-- @item card -->
## My Title           ← 不会绑到 cardTitle
Body paragraph here.  ← 不会绑到 cardBody
<!-- @/item -->
```

必须写成：

```md
<!-- @item card -->
<!-- @slot:cardTitle -->My Title<!-- @/slot -->
<!-- @slot:cardBody -->
Body paragraph here.
<!-- @/slot -->
<!-- @/item -->
```

### 验收标准

- `@item` 块内的裸 markdown 会按子组件的 slot bind 规则自动绑定
- 显式 `@slot:` 仍然优先级最高
- 不破坏现有 21 个模板（很多模板的 `@item` 块内容是显式 slot，应继续工作）

### Agent Prompt

```text
你需要让 forge 编译器在 @item 块内也支持 md-binding 自动绑定。

工作目录：/data/workspace/md-html-forge

阅读这些文件：
1. src/builtin/compiler/parser.ts（parseItem 函数，line 252+）
2. src/builtin/compiler/resolver.ts（buildItemPlan 函数，handleGroup 函数）
3. src/builtin/compiler/md-binding.ts（bindSegment 函数，理解 bind 流程）
4. src/builtin/compiler/md-blocks.ts（scanMdBlocks）

关键改动点：

A. parser.ts 的 parseItem：
   - 当前只识别 slot-open / slot-close
   - 需要保留 item 内的 raw（已经有 raw 字段）
   - 把 raw 字段保留到 GroupItemNode（已经有了）

B. resolver.ts 的 buildItemPlan：
   - 当前只读取 item.slots（显式 slot）
   - 需要新增逻辑：拿 item.raw（item 块内除显式 slot 外的裸 MD），跑一次 md-binding
   - 用子组件（item.childId 对应的 ComponentDef）的 slots 定义跑 findBindSlot / findContentSlot
   - 把绑定结果合并到 slotValues

C. 注意 raw 已经包含了显式 slot 的注释（@slot:xxx ... @/slot），需要先把这些区域剥掉再 scanMdBlocks。
   建议：拿 item.slots[].loc 算出已被显式占用的 source 区间，对其余区间 scanMdBlocks。

测试：
1. npm run audit:templates 必须仍 21/21 通过
2. 写一个临时测试模板：
   ```md
   <!-- @use layout-grid-2 -->
   <!-- @compose-group: layout-grid-2 -->
   <!-- @item card -->
   ## My Card Title
   Some body paragraph that should auto-bind to cardBody.
   <!-- @/item -->
   <!-- @/compose-group -->
   ```
   编译后应该看到 cardTitle 和 cardBody 都被填充。

完成后更新 docs/tech-debt/compiler-known-limitations.md 第 1 条为"已修复"。
同时更新 docs/engine/syntax.md 的"@item" 章节和"AI 生成模板"反例 5（移除"@item 块内不支持自动 md-binding"的提醒）。

提交前跑 npm run typecheck 必须 0 错误。
```

---

## F3 · 实现 18 个未实现组件

### 背景

`docs/tech-debt/unimplemented-components.md` 列出了 18 个被模板引用但未实现的组件。当前用 MD 兜底+已有组件替代。

按优先级分三批实现：
- **P0**（阻塞模板美观）：`flow-diagram` / `flowchart-canvas` / `chart-bar` / `sparkline-chart` / `toc-sidebar`
- **P1**（提升表达力）：`slide-deck` / `interactive-toolbar` / `tabbed-code-block` / `theme-toggle`
- **P3**（业务驱动）：其他 9 个

每个组件 1-3 小时工作量。

### Agent Prompt（按优先级分批，本 prompt 实现 P0 第一个：`flow-diagram`）

```text
你需要在 forge 中实现 flow-diagram 组件（流程图容器）。

工作目录：/data/workspace/md-html-forge

阅读这些文件：
1. docs/engine/component-api.md（组件 API 完整规范）
2. docs/engine/design-tokens.md（颜色/字体/间距 token）
3. src/builtin/components/visual/illustration.forge.md（参考：相似的视觉组件）
4. src/builtin/components/data/metric.forge.md（参考：variant 切换 + JS 数据驱动）
5. docs/tech-debt/unimplemented-components.md（看 flow-diagram 条目和"建议替代方案"）

关键设计决策：
- flow-diagram 是 visual 类组件，单容器渲染流程图
- 内部已有 ` ```flow ` 语义图表（src/lib/markdown-slots/slot-sync.ts 的 parseFlowDiagram），可以复用
- 不需要 SVG 编辑能力，直接接受用户写的 ```flow 代码块作为内容

实现步骤：
1. 创建 src/builtin/components/visual/flow-diagram.forge.md
   - frontmatter: id=flow-diagram, category=visual, defaultVariant=standard, trust=builtin
   - Slots:
     * flowHeading: type=text, bind=h2
     * flowContent: type=content, bind=content（接收完整 markdown，会被 simpleMdToHtml 处理）
     * flowCaption: type=text（可选说明文字）
   - HTML: 卡片样式 + heading + content 区 + caption
   - CSS: 跟 illustration 风格一致，跟随 token；流程图节点样式参考 src/lib/markdown-slots/slot-sync.ts 中 .sd-flow-* 的样式

2. 在 src/builtin/components/visual/index.ts（或同目录注册入口）注册

3. 验证：
   - npm run typecheck 0 错误
   - npm run audit:templates 仍 21/21 通过
   - 写一个测试模板用 flow-diagram + ```flow 代码块，确认渲染

4. 找到 docs/tech-debt/unimplemented-components.md 把 flow-diagram 条目移除
5. 更新 docs/engine/syntax.md 的"组件目录"章节加入 flow-diagram

不要做的：
- 不要尝试一次实现多个组件，专注 flow-diagram 一个
- 不要改 simpleMdToHtml 的 ```flow 解析逻辑（已经够用）

提交前 typecheck + audit 都必须通过。
```

---

## F4 · `@item` 支持 variant 透传

### 背景

当前 `<!-- @item card variant=decision -->` 中的 `variant` 不会传给 child 组件，会被 `expandAttrsToSlots` 当成 slot 值（slot 名 = "variant"，值 = "decision"）。

参考 he-06 模板原始版本的写法（已被改为统一 default variant 规避）。

### Agent Prompt

```text
你需要让 @item 指令支持 variant 属性透传到子组件。

工作目录：/data/workspace/md-html-forge

阅读：
1. src/builtin/compiler/parser.ts 第 252+ 行的 parseItem
2. src/builtin/compiler/resolver.ts 的 GroupPlan 类型 / buildItemPlan
3. src/builtin/compiler/emitter.ts line 175 附近的 group.items 渲染逻辑
4. src/builtin/compiler/attr-parser.ts（理解 attrs 怎么被解析）

实现：
1. 在 GroupItem AST 节点上加 `variant?: string` 字段
2. parseItem 里：从 openTok.attrs.attrs.variant 读出 variant 值，赋给 GroupItem 节点；同时从 attrs 删除 variant 字段，避免被 expandAttrsToSlots 当成 slot
3. 在 GroupPlan.items 里也带上 variant
4. resolver.buildItemPlan：把 item.variant 也传到 plan
5. emitter 的 group 渲染（line 175 附近）：把 variant 传给 processComponentSlots（通过给 ComponentPlan 增加 variant 字段，这个字段已经存在）

测试：
1. 先 audit 确认 21/21 通过
2. 把 he-06-component-variants 的 starterMarkdown 改回原始的 6 种 variant 写法（参考 git log 找历史）
   写：<!-- @item card variant=standard --> / <!-- @item card variant=decision --> / <!-- @item card variant=ticket -->
3. 重新 audit 确认 he-06 仍通过，且 HTML 里能看到 6 种不同 variant 的 card

提交前：
- npm run typecheck 0 错误
- npm run audit:templates 21/21 通过
- 视觉验证 he-06 在浏览器里展示了不同 variant
```

---

## F5 · 移除 starter generator 生成的装饰注释

### 背景

`src/builtin/templates/starter.ts` 在生成 starterMarkdown 时仍会输出 `<!-- ─── ${comp.name} (${id}) ─── -->` 这种装饰注释。

虽然 lexer 已经会丢弃，但这些注释让模板源码看起来啰嗦，也容易让 AI agent 误以为这是合法 forge 语法。

### Agent Prompt（小任务，可与其他任务捆绑）

```text
你需要清理 forge starter generator 生成的装饰注释。

工作目录：/data/workspace/md-html-forge

修改 src/builtin/templates/starter.ts：
- 移除所有 `<!-- ─── ... ─── -->` 装饰行（generateStarterMarkdown 与 renderLayoutBlock 内）
- 改用空行 + （可选）单行说明注释作为段间分隔，例如：
  `\n<!-- ${comp.name} -->\n` （不带 ─── 装饰）
- 或干脆完全去掉分隔注释，组件之间用空行分开

测试：
1. npm run audit:templates 仍 21/21 通过
2. 选 blank 模板编辑器里看一眼生成的内容应该比之前更整洁
3. 选其他模板（如 he-09）确认生成的 starterMarkdown 没装饰污染

不要做：
- 不要修改 batches/he-batch-*.ts 里的装饰注释（这些是手写的，不是 generator 生成的；用户偏好保留）

提交前：
- npm run typecheck 0 错误
- npm run audit:templates 21/21 通过
```

---

## F6 · 跨段（segment）绑定

### 背景

`@theme` / `@layout` 指令会切分 segment，导致跨段的 `@use` 上下文丢失：

```md
<!-- @use highlights -->
## My Highlights
<!-- @theme dark -->     ← 切段了！
- item 1                  ← 这些不会绑到上面的 highlights
- item 2
```

参考：`docs/tech-debt/compiler-known-limitations.md` 第 4 条。

### Agent Prompt

```text
你需要让 forge 编译器在 @theme / @layout 切段后保留当前 @use 上下文。

工作目录：/data/workspace/md-html-forge

阅读：
1. src/builtin/compiler/md-binding.ts 的 splitIntoSegments 函数和 bindSegment 函数
2. docs/tech-debt/compiler-known-limitations.md 第 4 条
3. src/builtin/compiler/resolver.ts 的 breakSection 逻辑

设计选择（请权衡）：
- 选项 A：把 @theme/@layout 不切段，把"主题信息"作为节点元数据传给 emitter
  → 改动小但破坏现有 segment 抽象
- 选项 B：在切段时记录"未关闭的 @use"，新段头部继承上一段的 currentUseId
  → 改动 splitIntoSegments / bindSegment，需小心 explicit/auto 集合的延续
- 选项 C：用户必须显式重写 @use（保持当前行为）+ 加诊断警告

推荐选项 B。

测试：
1. npm run audit:templates 仍 21/21 通过
2. 写测试模板验证跨 @theme 的 @use 上下文延续
3. 视觉确认（用 playwright 或浏览器手动验证）

完成后更新 docs/tech-debt/compiler-known-limitations.md 第 4 条。
```

---

## F7 · audit 脚本增强

### 背景

当前 `scripts/compile-templates/run.ts` 检查的维度：
- 注释残留 / forge-free-text / forge-orphan / 空组件 / 未解析组件 / unused-declaration / 编译错误

可补充：
- HTML 标签平衡（`<div>` 开闭对应）
- a11y：每个 `<img>` 是否有 alt、heading 层级是否合理
- CSS 变量是否都来自 token 表（防 hardcode）
- 总字节数趋势：每个模板 HTML 大小变化（回归用）

### Agent Prompt

```text
你需要增强 forge 模板审计脚本的检查维度。

工作目录：/data/workspace/md-html-forge

修改：scripts/compile-templates/run.ts

新增检查：
1. HTML 标签平衡：用简单 stack 解析所有非自闭合标签的开闭
   - 不平衡的标签作为 'high' severity 报出
   - 注意忽略 script/style 内的内容

2. CSS hardcode 检查：扫描 <style> 块里的 #xxx hex 颜色 / rgb(...) / rgba(...)
   - 排除已知例外（注释里的颜色值、SVG 内的 fill）
   - 报为 'low' severity
   - 跳过来自组件 CSS 的固定颜色（这些是组件本身的，不在 audit 范围）

3. 字节数 baseline：
   - 在 /tmp/forge-audit/_baseline.json 存一份历史 byteCount
   - 当前编译结果与 baseline 比对，差异 > 20% 报 'medium'（疑似回归）
   - 如果 baseline 不存在，自动创建

4. heading 层级：
   - 每个模板里 h1 必须 = 1 个；h2/h3 必须递进（不能跳级）
   - 报为 'medium'

测试：
- 改完 npm run audit:templates 必须仍 21/21 通过（如果不通过，那是被新检查抓出来的真实问题，先评估是否是 false positive 再决定修脚本还是修模板）

提交前：
- npm run typecheck 0 错误（注意 scripts/ 在 tsconfig 里被 exclude，但脚本内部用的库类型要对）
```

---

## 使用建议

- **任何 agent 拿到这份文档，应只挑一个任务做**（不要同时做多个）
- 任务完成后**更新本文档**：把对应章节标"已完成 by <agent name>, <date>"
- 完成后**必须**跑：
  ```bash
  npm run typecheck
  npm run audit:templates
  ```
  两者都必须无问题才能视为完成。
- 大幅改动建议先开 PR / 长函数前先在 chat 里贴出实现思路。


---

## F8 · 交互组件体系建设

> **已完成 2026-05-11**：阶段 1 + 阶段 2 一次落地。详见末尾"完成记要"。
>
> - `window.forge.runtime` 统一交互运行时（事件总线 / `shouldJumpToSource` / 状态持久化 / 复制工具）
> - split iframe 跳顶修复（与 preview 同样的 scrollY 保留 + 全局 details toggle 状态保留）
> - 5 类常见交互全部实装：code-block 复制按钮 / collapse-section 自动持久折叠 / comparison ba Tab + options chip 单选 / table standard+risk 排序 + flag toggle / chip risk active + legend 多选筛选
> - 文档：`docs/engine/component-api.md` 末尾"组件交互"章节

### 背景

当前可交互组件只有一种：**checklist 的 checkbox**（点击切换，回写 MD）。其他 30+ 组件全是纯展示。

这次 review 中遇到的具体问题：

1. **checkbox 跳到顶部**（已修复，但暴露了根本架构问题）
   - 根因 A：iframe srcDoc 变化触发整页重载 → scrollY 归 0
   - 根因 B：postMessage 'forge:jump-to-line' → 编辑器 view.focus() → 浏览器把 editor 滚入视野，外层页面看起来在跳
   - 根因 C：iframe click handler 无差别给所有 click 事件做"定位跳转"，跟交互意图冲突
   - 当前修复：① iframe ref + scrollY 保留 ② focus 仅在 editor 可见时触发 ③ click handler 跳过 input/button/checkbox 等交互元素

2. **缺乏交互能力的组件示例**
   - 折叠/展开（`collapse-section` 已有 slot 但点击不展开）
   - 标签筛选（`chip` 没有 active state、点击无反馈）
   - 切换器（`comparison` 是静态展示，没有 toggle）
   - 排序/过滤（`table` 不能交互）
   - 步骤导航（`code-block walkthrough` 步骤之间没有切换）
   - 复制按钮（代码块没复制按钮）

### 验收标准

#### 阶段 1（必须）：交互基础设施

1. **iframe 重渲染时保留交互状态**
   - scrollY ✅ 已实现
   - 当前选中的 component（PropertyPanel）✅ 已部分实现
   - 用户展开/折叠的 details/section 状态 — **待实现**
   - hover/active state — 不需要保留（每次 hover 重新触发即可）

2. **统一组件交互运行时**
   - 在 emitter 注入的 runtime 里提供 `forge.runtime` 全局对象
   - 暴露 `subscribe(eventType, handler)` / `emit(eventType, payload)` API
   - 各组件的 mount JS 可以注册自己的事件处理器
   - postMessage 给 parent 时统一走 `forge.runtime.postToParent(type, data)`
   - 关键：所有 click/change handler **必须 stopPropagation**，避免触发顶层 click handler 的"定位跳转"

3. **定位跳转规则细化**
   - 用户点击展示元素（h1/h2/p/li 等）→ 定位
   - 用户点击交互元素（input/button/a/select/details summary 等）→ **不定位**，触发交互
   - 用户在交互元素内的展示部分点击 → 定位（可选）
   - 把这些规则集中在一个 `shouldJumpToSource(target)` 函数里

#### 阶段 2（推荐）：常见交互组件

至少实现 4 个：

1. **代码块复制按钮**：`code-block` 右上角复制按钮，点击复制代码 → toast 提示
2. **collapse-section 折叠/展开**：点击 sectionTitle 切换 sectionBody 显示
3. **chip 筛选**：多个 chip 可作为 toggle，点击切 active；可发 'forge:filter-change' 事件
4. **table 排序**：表头点击切换升序/降序

#### 阶段 3（加分）：双向同步增强

- 折叠状态写回 MD（`@slot:collapsed` 标记？或单独的 `@state:`）
- chip active state 写回（如 `<!-- @slot:activeFilter -->bug<!-- @/slot -->`）

### 关键文件

- `src/builtin/compiler/emitter.ts` — 顶层 click/change handler（line 790+ 是 checkbox，line 808+ 是 click 跳转）
- `src/components/markdown-editor/MarkdownEditor.tsx` — preview iframe + postMessage handler
- 各组件的 `## JS` 块（如 `metric.forge.md`、`code-block.forge.md`）— 当前只做"数据 slot 解析"，可扩展为交互

### Agent Prompt（先做阶段 1，确认通过再启动阶段 2）

```text
你需要重构 forge 编译器注入的 iframe 运行时，建立统一的交互基础设施。

工作目录：/data/workspace/md-html-forge

阅读：
1. src/builtin/compiler/emitter.ts 第 700-870 行的 buildInteractionScript
2. src/components/markdown-editor/MarkdownEditor.tsx 中 previewIframeRef 相关 effect
3. src/components/markdown-editor/MarkdownEditor.tsx 中 jumpToLine + checkbox-toggle handler
4. docs/tech-debt/compiler-known-limitations.md
5. docs/prompts/post-review-followups.md F8 章节（本文）

实现：

1. 在 emitter 注入的脚本里创建 window.forge 命名空间：

   window.forge = {
     runtime: {
       // 集中的事件分发
       _listeners: new Map(),
       on(type, handler) { ... },
       off(type, handler) { ... },
       emit(type, payload) { ... },
       postToParent(type, data) { window.parent.postMessage({ type, ...data }, '*'); },
     },
     // 跳转规则集中点
     shouldJumpToSource(target) {
       // 真正的判定逻辑：交互元素返回 false
     },
   };

2. 现有的 click handler / change handler 改为调用 window.forge.runtime / shouldJumpToSource。

3. 组件的 mount JS 可以这样注册交互：

   forge.runtime.on('forge:component-init', function (data) {
     if (data.componentId !== 'my-component') return;
     // 注册 click handler，记得 e.stopPropagation()
   });

4. iframe 内增加"交互状态"持久化：
   - sessionStorage 里存当前展开的 details、active chip 等
   - iframe 重载时（detected by document.readyState 或 init 标记），恢复这些状态

测试：
1. npm run audit:templates 仍 21/21 通过
2. 首页 demo 的 6 个 checkbox：勾选任一不会跳顶（已通过）
3. 写一个测试组件 test-interactive：
   - 一个 button data-testid="t-btn"，点击发 'test:clicked' 事件
   - 一个 details，记录展开状态到 sessionStorage
4. iframe 重载（修改 markdown）后：
   - scrollY 保留
   - details 展开状态保留
5. 在 collapse-section 加一个简单的展开/折叠交互作为示范

完成后：
- 更新 docs/engine/syntax.md 加"组件交互"章节
- 更新 docs/engine/component-api.md 描述 `forge.runtime` API
- 更新 docs/tech-debt/compiler-known-limitations.md 标注交互体系状态

提交前：
- npm run typecheck 0 错误
- npm run audit:templates 21/21 通过
- 视觉验证（playwright 或浏览器手动）：
  * 编辑模式下输入文字预览不跳
  * 预览模式下点 checkbox 不跳
  * 切换模板后选中状态被合理重置
```

### 完成记要（2026-05-11）

#### 改动总览

- `src/builtin/compiler/emitter.ts`
  * 重写 `buildInteractionScript()`：新增 `window.forge.runtime`（`on/off/emit/postToParent/copy/state` + `shouldJumpToSource`）
  * 顶层 click 改为统一调用 `shouldJumpToSource`，集中处理"交互优先 / 定位次之"
  * 启动流程：`stateRequestSnapshot → mountAll → restoreDetailsState → bindDetailsTracking`
  * 全局 `<details>` toggle 状态自动持久化，无需组件作者关心
- `src/components/markdown-editor/MarkdownEditor.tsx`
  * split 模式 iframe 也保留 scrollY（修跳顶）
  * 新增 `iframeStateRef` + `forge:state-pull/push/snapshot` 桥，承载组件交互状态跨 srcdoc 重载
- `src/builtin/components/visual/code-block.forge.md`
  * diff / walkthrough 加 hover 出现的复制按钮，walkthrough badge 点击折叠代码
- `src/builtin/components/visual/comparison.forge.md`
  * ba 加 Before / After / 并排 三态 Tab，options chip 改为可点 toggle 单选 + emit `option-select`
- `src/builtin/components/data/table.forge.md`
  * standard / risk 表头点击三态排序（asc / desc / none），flag toggle 可点切并 emit `flag-toggle`
- `src/builtin/components/visual/chip.forge.md`
  * risk 单 chip 可点 active toggle，legend 多项可点筛选并 emit `filter-change`
- `docs/engine/component-api.md`：新增"组件交互"章节，含 API 表 + 关键约束 + 完整示例

#### 验证

- `npm run typecheck` 0 错误
- `npm run audit:templates` 21 / 21 通过（0 严重 / 0 中等 / 0 轻微）
- `collapse-section` 等使用 `<details>` 的组件无需任何修改即享有"跨 reload 保留展开状态"

#### 已知边界 / 后续可继续做

1. 组件交互状态 key 用 DOM 索引（`details:<idx>`、`c:<id>:<variant>:<key>`）。同模板内多个同 id 同 variant 实例共享 state —— 如果未来需要"独立实例状态"，需要为每个 `@use` 实例分配稳定的 instance-id。
2. comparison ba 的 Tab 状态、code-block walkthrough 的 collapsed 状态目前只在 iframe 内存活；如需写回 MD（让 export 出去的 standalone HTML 也带上），需要在 emitter 加新的"状态 → 注释"序列化通道。
3. table standard 的排序基于 `markdown` 直接生成的 `<table>`；如果用户在 markdown 里写了 colspan / rowspan，排序结果未定义。
4. chip legend 的 `filter-change` 事件目前只是 `api.emit`；和宿主侧（React）联动需要在 `MarkdownEditor.tsx` 增加对 `forge:component-event` 的具体处理（按业务需要再做）。
