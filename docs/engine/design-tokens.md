# 设计 Tokens

整个产品共享一套设计语言：**editorial**（米底 + 深色文字 + 红橙强调）。

## 共享 token（组件层）

来自 `src/builtin/components/shared-tokens.ts`，注入到所有渲染输出的 HTML：

```css
:root {
  /* === 颜色 === */
  --ivory:   #FAF9F5;     /* 米色底 */
  --slate:   #141413;     /* 深色主文字 */
  --clay:    #D97757;     /* 红橙强调 */
  --oat:     #E3DACC;     /* 米色装饰 */
  --olive:   #788C5D;     /* 橄榄绿 */
  --rust:    #B04A3F;     /* 深红 */
  --gray-100: #F0EEE6;
  --gray-300: #D1CFC5;
  --gray-500: #87867F;
  --gray-700: #3D3D3A;
  --white:   #FFFFFF;

  /* === 字体 === */
  --serif: ui-serif, Georgia, 'Times New Roman', serif;     /* 标题 */
  --sans:  system-ui, -apple-system, sans-serif;            /* 正文 */
  --mono:  ui-monospace, 'SF Mono', Menlo, monospace;       /* 代码 / 数据 */

  /* === 形状 === */
  --radius-panel: 12px;
  --border: 1.5px solid var(--gray-300);
}
```

## 应用层 token（编辑器 UI）

来自 `src/app/globals.css`，**只用于编辑器外壳 UI**（toolbar / 面板 / 对话框等），不进入预览 iframe：

```css
:root {
  /* === 表面层（语义） === */
  --background:        var(--ivory);
  --surface:           var(--white);
  --surface-sunken:    #F5F3EC;        /* toolbar / 输入框底 */
  --surface-hover:     #EDEAE0;
  --surface-active:    #E3DECF;

  /* === 文字（语义） === */
  --text-primary:      var(--slate);
  --text-secondary:    var(--gray-700);
  --text-tertiary:     var(--gray-500);

  /* === 边框 === */
  --border-strong:     var(--gray-300);
  --border-subtle:     var(--gray-100);
  --ring:              rgba(217, 119, 87, 0.35);   /* 聚焦光晕 */

  /* === 强调 === */
  --accent:            var(--clay);
  --accent-soft:       rgba(217, 119, 87, 0.10);

  /* === 阴影（暖色） === */
  --shadow-xs: 0 1px 2px rgba(75, 60, 45, 0.04);
  --shadow-sm: 0 2px 4px rgba(75, 60, 45, 0.06);
  --shadow-md: 0 4px 12px rgba(75, 60, 45, 0.08);
  --shadow-lg: 0 8px 24px rgba(75, 60, 45, 0.12);
  --shadow-xl: 0 16px 48px rgba(75, 60, 45, 0.16);

  /* === 动效 === */
  --duration-fast:  120ms;
  --duration-base:  200ms;
  --duration-slow:  320ms;
  --ease-out:       cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## 设计语义

### 颜色用法

| Token | 何时用 |
|---|---|
| `--clay` | 强调元素：链接、按钮、主标题装饰、关键数据 |
| `--olive` | 次强调：成功状态、绿色徽章 |
| `--rust` | 警示：错误状态、警告 chip |
| `--slate` | 主文字、卡片标题、强调段落 |
| `--gray-700` | 正文 |
| `--gray-500` | 元数据 / hint / 次要 |
| `--gray-300` | 分割线 / 边框 |
| `--gray-100` | 背景轻强调（code 行内底） |
| `--oat` | 装饰底色 / chip |

### 字体配比

| 用途 | 字体 | 字重 | 字号 |
|---|---|---|---|
| 大标题 (h1) | serif | 500 | 32–44px |
| 副标题 (h2) | serif | 500 | 22–28px |
| 卡片标题 (h3) | serif | 500 | 18–20px |
| 正文 | sans | 400 | 14–15px |
| 元数据 | sans / mono | 500 | 11–13px |
| 代码 | mono | 400 | 13px |
| 数据数字 | mono | 500 | 24–48px |

### 间距

不存在专门的间距 token（所有 padding / gap 直接写数字），但**遵守 4 的倍数**：4 / 8 / 12 / 16 / 20 / 24 / 32 / 44 / 56。

### 圆角

- 卡片 / 面板：`var(--radius-panel)` = 12px
- 按钮：6–8px
- chip / pill：999px（全圆）

### 阴影

- 卡片悬停：`--shadow-sm`
- 弹层：`--shadow-md`
- 模态：`--shadow-xl`
- 编辑器外壳避免阴影；预览里也避免（保持 editorial 平面感）

## 主题如何与 token 协作

主题在段级覆盖一部分 token：

```css
.theme-dark {
  --slate: #fafafa;     /* 主文字反色 */
  --ivory: #1a1a1a;     /* 段底反色 */
  --white: #2a2a2a;     /* 卡片底反色 */
  --clay:  #5EEAD4;     /* 强调改为蓝绿 */
}
```

组件 CSS 永远引用 `var(--clay)`、`var(--slate)`、`var(--white)`，**不要写死颜色**。

## 反例（不要做）

```css
/* ❌ hardcode 颜色 */
.comp-feature-card { background: #FFFFFF; color: #141413; }

/* ❌ hardcode 字体 */
.comp-feature-card h3 { font-family: Georgia, serif; }

/* ❌ 自定义 shadow */
.comp-feature-card { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

/* ❌ 重复定义 token */
.comp-feature-card { --my-color: #D97757; color: var(--my-color); }
```

```css
/* ✅ 用 token */
.comp-feature-card {
  background: var(--white);
  color: var(--slate);
  border: var(--border);
  border-radius: var(--radius-panel);
  font-family: var(--sans);
}
.comp-feature-card h3 { font-family: var(--serif); }
.comp-feature-card:hover { box-shadow: var(--shadow-sm); }
```
