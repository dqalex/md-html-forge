# 主题 API

主题 = 一组 CSS 变量 + 段级背景样式。同一组件在不同主题下视觉完全不同，但 HTML 一字不变。

## ThemeDef 字段

```ts
interface ThemeDef {
  id: string;            // 'editorial' / 'dark' / 'sage' / ...
  name: string;          // 显示名

  // === 配色 ===
  background?: string;   // 段级背景色
  foreground?: string;   // 主文字色
  accent?: string;       // 强调色（替代 --clay）
  muted?: string;        // 次要文字
  surface?: string;      // 卡片/面板背景
  border?: string;       // 卡片边框
  radius?: string;       // 圆角

  // === 段样式 ===
  bandStyle?: 'contained' | 'full-bleed';
  // 'contained'（默认）：背景受 .page 宽度约束
  // 'full-bleed'        ：背景铺满视口，内容仍按 .page 宽度居中

  // === 高级 ===
  extraCss?: string;     // 主题专属 CSS（写在 .theme-<id> 选择器内）
}
```

## 内置主题（`src/builtin/themes/preset-themes.ts`）

| id | 气质 | accent | 用途 |
|---|---|---|---|
| `editorial` | 米底 + 深色文字 + 红橙 | `#D97757` | 默认，文档/文章 |
| `dark` | 深色 + 白色文字 + 蓝绿 | `#5EEAD4` | 数据 dashboard / code |
| `sage` | 橄榄 + 米色 + 深绿 | `#788C5D` | 自然 / 友好 |
| `cobalt` | 深蓝 + 白 + 金 | `#FFC857` | 商业 / 严肃 |
| `sunset` | 暖渐变 + 暗紫 | `#FF6B6B` | 创意 / 故事 |
| `mono` | 纯黑白灰 | `#000000` | 极简 / 出版物 |

## 主题如何作用于段

```md
<!-- @theme: dark -->

# 这一段的所有组件都被 .theme-dark 包裹
```

emitter 输出：

```html
<section class="theme-section theme-dark">
  <!-- 该段所有组件 HTML -->
</section>
```

CSS 由 `buildThemesCss(themes, bandStyle)` 生成：

```css
.theme-dark {
  background: #1a1a1a;
  color: #fafafa;
  --clay: #5EEAD4;     /* 覆盖共享 token */
  /* contained 模式：保持页宽 */
  margin: 0;
  /* full-bleed 模式：背景铺满 */
  /* margin-left: calc(50% - 50vw); ... */
}
.theme-dark .comp-feature-card {
  background: #2a2a2a;
  border-color: #3a3a3a;
}
```

## 注册自定义主题

```ts
import { forgeRegistry } from '@/builtin';

forgeRegistry.registerTheme({
  id: 'neon',
  name: 'Neon Cyber',
  background: '#0a0a0a',
  foreground: '#e0e0e0',
  accent: '#00ff88',
  surface: '#1a1a1a',
  border: '#2a2a2a',
  bandStyle: 'full-bleed',
  extraCss: `
    .comp-feature-card { box-shadow: 0 0 20px rgba(0, 255, 136, 0.2); }
  `,
});
```

注册后立即可用：`<!-- @theme: neon -->`。

## 设计规范

### 颜色对比

每个主题必须保证：
- foreground / background 对比度 ≥ 4.5（WCAG AA）
- accent / background 对比度 ≥ 3.0

### 不要破坏组件结构

主题 CSS 应当**只改变颜色 / 字体 / 阴影**，不应改变：
- 元素位置（避免 `position`、`transform`）
- 元素大小（避免 `width`、`height`、`padding`、`margin`）
- 显示模式（避免 `display: none`）

如果某个主题需要"在 dark 下隐藏装饰元素"，应该在组件 CSS 里用 `[data-section="xxx"] .decoration` 配合主题 var 控制 `opacity`。

### 段样式选择

- **contained**：默认，与其他段宽度一致，**视觉协调**
- **full-bleed**：banner 感，**只用于强反差段**（封面 / 品牌色 / hero）

### CSS 变量回退

主题 CSS 里覆盖 token 的写法：

```css
.theme-dark {
  --clay:  #5EEAD4;        /* 强调色变了 */
  --slate: #fafafa;        /* 主文字变了 */
  --white: #1a1a1a;        /* 卡片底变深了 */
  --ivory: #0a0a0a;        /* 段背景变深了 */
}
```

组件 CSS 永远引用 `var(--clay)`，不需要写 `.theme-dark .comp-xxx { color: ... }` 重复。
