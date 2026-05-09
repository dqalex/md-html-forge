# 引擎架构

> md-html-forge 不是模板引擎。它是 **Markdown 的扩展编译器**：lexer → parser → resolver → emitter，每一阶段独立、可测试、可缓存。

## 一图概览

```
                ┌─────────┐    ┌─────────┐    ┌──────┐    ┌──────────────┐    ┌─────────┐    ┌─────────┐
   MD source ─→ │  Lexer  │ ─→ │ Parser  │ ─→ │ AST  │ ─→ │ bindNativeMd │ ─→ │ Resolve │ ─→ │ Emitter │ ─→ HTML
                └─────────┘    └─────────┘    └──────┘    └──────────────┘    └─────────┘    └─────────┘
                Token[]        Document       原生 MD                          SectionPlan[]   组件 CSS
                + 位置          + 诊断          → SlotNode                      + 组件归属      + 主题
                                                                                                + InlineRule
```

每一步都在 `src/builtin/compiler/` 下：

| 文件 | 职责 |
|---|---|
| `lexer.ts` | 单遍扫描 → `Token[]`（指令 / 文本，每个 token 带 `SourceLoc`） |
| `parser.ts` | Token → `Document` AST，panic-mode 错误恢复 |
| `md-blocks.ts` | 轻量级 MD 块识别（heading / list / blockquote / code / table / paragraph） |
| `md-binding.ts` | 段内原生 MD 块按组件 `slot.bind` 自动归入 SlotNode |
| `resolver.ts` | AST + Env → `SectionPlan[]`（段切割 + 组件归属 + 诊断） |
| `emitter.ts` | SectionPlan → HTML（按需 CSS、inline rules、sourcemap、模式开关） |
| `registry.ts` | 全局注册表：Component / Theme / InlineRule / Directive |
| `diagnostics.ts` | 诊断包（错误码 + 行号 + 修复建议） |
| `cache.ts` | LRU + FNV-1a 指纹（顶层 + slot 级双层缓存） |
| `page-config.ts` | `@page` 指令解析（宽度 / band 样式） |
| `attr-parser.ts` | 紧凑属性解析（`key="v"` / 裸值 / flag） |
| `index.ts` | `compile(source, opts)` 高层入口 |

## 核心原则（设计宪法）

### 1. **MD 兼容**

> 源文件在没有 forge 引擎的前提下，用任何 MD 编辑器打开都应当是合理的、语义基本保留的 Markdown 文档。

- 所有 forge 指令必须是 HTML 注释 `<!-- @xxx -->`
- 内容（标题、列表、引用、代码块、表格）永远是原生 Markdown
- 禁止把"内容"塞到属性里（`@slot title="..."` 这种已废弃）

### 2. **强扩展性**

新增一个能力 = 一次 `forgeRegistry.registerXxx(def)` 调用，不改主框架文件。

四类扩展点：
- `registerComponent(def)` — 内容/卡片/布局组件
- `registerTheme(def)` — 主题（配色 + 字体 + 段样式）
- `registerInlineRule({pattern, render})` — 行内替换规则（图标、emoji、自定义 token）
- `registerDirective({name, description})` — 指令元数据（用于文档/help）

### 3. **编译器心智**

- **单遍扫描**：lexer 一次产 token，不重复读源码
- **AST 真值**：所有后续操作基于 AST，不再 string.replace
- **可诊断**：每个错误必须有 `code` + `line` + `hint`
- **可缓存**：相同输入 + 相同 env 一定命中缓存

### 4. **零运行时（可选）**

`compile(source, { env, mode: 'standalone' })` 产出的 HTML：
- 不含 `<script>` 交互脚本
- 不含 `data-src-line`、`data-md-checkbox` 等编辑器属性
- 只含实际用到的组件 CSS / 主题 / 图表 CSS
- 可在任何浏览器单独打开

## 数据流细节

### Lexer 产出

```ts
interface Token {
  kind: 'compose' | 'layout' | 'theme' | 'use' | 'page'
      | 'slot-open' | 'slot-close'
      | 'group-open' | 'group-close' | 'item-open' | 'item-close'
      | 'text';
  value: string;          // 冒号式的值，或属性式的 positional
  attrs?: ParsedAttrs;    // 属性式指令（仅 group/item 用）
  loc: SourceLoc;         // { start, end, line, col }
}
```

### Parser 产出

```ts
DocumentNode {
  children: TopNode[]
  // TopNode = ComposeNode | UseNode | LayoutNode | ThemeNode | SlotNode
  //        | GroupNode { items: GroupItemNode[] } | TextNode
}
```

### Resolver 产出

```ts
SectionPlan {
  themeId: string;
  layoutId: string;
  components: ComponentPlan[];   // 该段顺序渲染的组件
  groups: GroupPlan[];           // 显式 @compose-group 块
}
```

### Emitter 输出

完整 HTML 文档（包含 `<style>` 和可选 `<script>`），CSS 是**按需拼装**：
- 用到的组件 → 收 `comp.css`
- 用到的主题 → `buildThemesCss(themes, bandStyle)`
- 出现 `data-diagram="flow"` → 注入对应 diagram CSS
- 否则**不注入**

## 缓存策略

```
┌─────────────────────────────────┐
│ 顶层 LRU                         │
│ key = source-hash + env-hash    │
│ value = CompileResult           │
│ 命中 = 跳过整个 pipeline         │
└─────────────────────────────────┘
              ↓ 未命中
┌─────────────────────────────────┐
│ Slot 级 LRU                      │
│ key = raw-md-hash + slot-type   │
│ value = sanitized HTML          │
│ 命中 = 跳过 simpleMdToHtml + sanitize │
└─────────────────────────────────┘
              ↓ 未命中
        Lucide 图标缓存（renderToStaticMarkup）
```

## 测试边界

- **Lexer**：给定字符串 → 期望 token 序列（含 loc）
- **Parser**：给定 token → 期望 AST + 诊断
- **Resolver**：给定 AST + env → 期望 SectionPlan
- **Emitter**：给定 SectionPlan → 期望 HTML 子串
- **整体**：`compile(md, env)` 给定 → 期望 HTML 包含某些选择器、不包含某些选择器（按需 CSS 验证）

## 关键设计权衡

| 决策 | 选择 | 理由 |
|---|---|---|
| AST 是否可变？ | 不可变 | resolver 输出的 plan 是新对象；缓存安全 |
| 错误恢复？ | panic-mode（吞到下个明显边界） | 简单，对 IDE 用户友好 |
| 诊断是否中断编译？ | error 也不中断 | 显示尽可能多的问题 |
| 主题 CSS 是否预生成？ | 运行时 `buildThemesCss` | 主题数 < 20，CSS 字符串很短，不必预生成 |
| 是否引入 remark/markdown-it？ | 不引入 | 我们的 MD 子集已经够用，自己控制更可靠 |
