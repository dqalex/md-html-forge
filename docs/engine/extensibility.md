# 扩展点

> "扩展" = 一次 `forgeRegistry.registerXxx(def)` 调用，**不改主框架**。

## 四类扩展

```ts
import { forgeRegistry } from '@/builtin/compiler/registry';

forgeRegistry.registerComponent(def);   // 组件
forgeRegistry.registerTheme(def);        // 主题
forgeRegistry.registerInlineRule(rule);  // 行内替换规则
forgeRegistry.registerDirective(meta);   // 指令元数据（用于文档/help）
```

## 1. 组件

详见 [`component-api.md`](./component-api.md)。

最常用，本仓库 80% 的扩展走这条。

## 2. 主题

详见 [`theme-api.md`](./theme-api.md)。

## 3. 行内替换规则（InlineRule）

```ts
interface InlineRule {
  id: string;
  pattern: RegExp;          // 必须带 g flag
  render: (match: RegExpMatchArray) => string;  // 返回替换后的 HTML
}
```

例：自定义 emoji

```ts
forgeRegistry.registerInlineRule({
  id: 'shrug',
  pattern: /:shrug:/g,
  render: () => '¯\\_(ツ)_/¯',
});
```

例：自定义 `:flag:CN:` 渲染国旗

```ts
forgeRegistry.registerInlineRule({
  id: 'flag',
  pattern: /:flag:([A-Z]{2}):/g,
  render: (m) => `<img src="https://flagcdn.com/${m[1]!.toLowerCase()}.svg" class="inline-flag" alt="${m[1]}">`,
});
```

**执行时机**：emitter 完成 HTML 拼装后线性应用所有规则。

**约束**：
- pattern 必须有 `g` flag
- render 输出**必须是合法 HTML 子串**（会原样插入）
- pattern 顺序按注册顺序，先注册的先匹配

## 4. 指令元数据

不会改变编译行为，只用于：
- 组件库 / help 面板里展示"该指令是干嘛的"
- 未来的语法高亮

```ts
forgeRegistry.registerDirective({
  name: 'page',
  description: '文档级页面配置：宽度 + band 样式',
});
```

加新指令的真正实现还需要：
1. lexer 加 case
2. parser 加 handler
3. resolver / emitter 消化

但元数据登记是**必须**的，因为这是文档系统的真值来源。

## Bootstrap 流程

`src/builtin/bootstrap.ts` 在应用启动时一次性把所有内置项注册到 registry：

```ts
import { forgeRegistry } from './compiler/registry';
import { BUILTIN_COMPONENTS } from './components';
import { BUILTIN_THEMES } from './themes';
import { LUCIDE_INLINE_RULES } from './inline-rules/lucide';

let initialized = false;
export function bootstrap(): void {
  if (initialized) return;
  initialized = true;

  for (const c of BUILTIN_COMPONENTS) forgeRegistry.registerComponent(c);
  for (const t of BUILTIN_THEMES)     forgeRegistry.registerTheme(t);
  for (const r of LUCIDE_INLINE_RULES) forgeRegistry.registerInlineRule(r);

  forgeRegistry.registerDirective({ name: 'page',          description: '文档级页面配置' });
  forgeRegistry.registerDirective({ name: 'compose',       description: '声明文档使用的组件' });
  // ...
}
```

`src/lib/markdown-slots/fallback-renderer.ts` 在文件顶部 `import '@/builtin/bootstrap'`，确保任何渲染入口都会先初始化。

## 用户态扩展（运行时注册）

模板可以通过 `customComponents` 注册"模板私有组件"：

```ts
const myTemplate: TemplateDef = {
  id: 'my-template',
  // ...
  customComponents: [
    defineComponent({
      id: 'my-special-card',
      // ...
    }),
  ],
};
```

模板私有组件**只在该模板激活时可用**，不污染全局 registry。

如果想真正全局注册（持久化），目前没有 UI 入口；走代码：在 `bootstrap.ts` 里加。

## 命名规范

| 类型 | 命名 | 示例 |
|---|---|---|
| 组件 id | kebab-case | `feature-card` / `pricing-table` / `code-review-diff` |
| 主题 id | kebab-case | `editorial` / `dark` / `neon-cyber` |
| inline rule id | kebab-case | `lucide-icon` / `flag` / `mention` |
| 指令名 | 单词 | `compose` / `theme` / `layout` |
| slot 名 | camelCase | `cardTitle` / `statValue` / `actionLabel` |
| CSS class | `.comp-<id>` | `.comp-feature-card` |

**id 一旦发布不可改**（用户的 `@compose: <id>` 会断），所以提交前确认。

## 依赖图

```
你写的扩展（registerXxx）
   ↓
forgeRegistry
   ↓
compile() 在每次编译时读取
   ↓
HTML 输出
```

注册是**一次性**的（应用启动时），编译是**每次**的。所以注册逻辑要快，编译逻辑可以慢一点（有缓存）。
