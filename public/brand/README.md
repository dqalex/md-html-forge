# md-html-forge · Brand assets

所有 logo 都是纯 SVG，可随意嵌入、着色、缩放。`viewBox` 是 64×64（mark）或 280×64（横版），内部已做像素对齐。

## 文件一览

| 文件 | 用途 | 场景 |
|---|---|---|
| `logo-mark.svg` | 主图标（浅色底，ivory #FAF9F5） | README / 默认 |
| `logo-mark-dark.svg` | 深色底反色版 | dark 主题页、分享卡 |
| `logo-mark-mono.svg` | 单色版（`currentColor` 驱动） | 打印 / 任意主题色一键适配 |
| `logo-horizontal.svg` | mark + 产品名 + 副标题 | 页面 header / README 顶部 |
| `favicon.svg` | 32×32 简化版（去边框、加粗笔触） | 浏览器 tab / PWA icon |

## 设计说明

- **概念**：`M` 的轮廓 + `H` 的轮廓共享一根中轴，中间由 clay `#D97757` 的"锻造痕"连接。暗示项目核心动作 `markdown → html`，同时呼应产品名 `forge`（锻造）。
- **主色**：
  - `#141413` slate（字母、边框）
  - `#FAF9F5` ivory（默认底）
  - `#D97757` clay（火花、强调色，不要替换）
- **字体**：横版 logo 用 JetBrains Mono / ui-monospace，和项目里的 `@use` / `@compose` 指令语言视觉同源。
- **不要**：不要给 logo 加渐变 / 阴影 / emoji；不要改火花的位置（它是 M 谷底 → H 横杠的那根线的起点）。

## 快速使用

### HTML

```html
<!-- 浅色底 -->
<img src="/brand/logo-mark.svg" alt="md-html-forge" width="40" height="40" />

<!-- 单色版，随父元素文字色 -->
<span style="color: var(--text-primary)">
  <img src="/brand/logo-mark-mono.svg" alt="md-html-forge" width="40" height="40" />
</span>

<!-- 带文字 -->
<img src="/brand/logo-horizontal.svg" alt="md-html-forge — markdown → html" height="48" />
```

### Markdown

```md
![md-html-forge](/brand/logo-horizontal.svg)
```

### Next.js `<head>` 里用 favicon

```tsx
// app/layout.tsx
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />
```
