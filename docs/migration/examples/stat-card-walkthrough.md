# 完整示例：迁移 stat-card

> 演示从 `11-status-report.html` 中提取一个数据卡片组件的完整过程。Agent 应当**完全遵循这个节奏**做新组件的迁移。

## 输入：源 HTML 片段

```html
<!-- 摘自 11-status-report.html -->
<style>
  /* ... 全局 reset + token 定义（要被删除）... */

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 32px;
  }

  .kpi-card {
    background: var(--white);
    border: 1.5px solid var(--gray-300);
    border-radius: 12px;
    padding: 18px 20px;
  }

  .kpi-card .value {
    font-family: var(--mono);
    font-weight: 500;
    font-size: 32px;
    color: var(--slate);
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 8px;
  }

  .kpi-card .label {
    font-family: var(--mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--gray-500);
    margin-bottom: 6px;
  }

  .kpi-card .delta {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--olive);
  }

  .kpi-card .delta.negative { color: var(--rust); }
</style>

<div class="kpi-grid">
  <div class="kpi-card">
    <div class="label">Active Users</div>
    <div class="value">12,430</div>
    <div class="delta">+8.2% vs last week</div>
  </div>
  <div class="kpi-card">
    <div class="label">Completion Rate</div>
    <div class="value">87.4%</div>
    <div class="delta negative">-2.1% vs last week</div>
  </div>
  <!-- ... 重复 2 次 ... -->
</div>
```

## 步骤 1：识别可复用单元

通览整段：
- `kpi-grid`：4 列网格 → 与现有 `grid-4` 等价，**复用**，不新增组件
- `kpi-card`：循环 4 次的核心单元 → **独立成组件 ✓**

候选 id：`stat-card`（"kpi" 太特化，"stat" 更通用）

## 步骤 2：设计 slot

观察 kpi-card 内可变的部分：
- "Active Users" → 标签
- "12,430" → 主数据值
- "+8.2% vs last week" → 增减说明
- 红色（negative）vs 绿色 → 需要表示"是否负向"

```ts
slots: {
  statLabel: { label: '指标名',     type: 'text',     placeholder: 'Active Users' },
  statValue: { label: '指标值',     type: 'text',     placeholder: '12,430' },
  statDelta: { label: '变化说明',   type: 'text',     placeholder: '+8.2% vs last week' },
  // 是否负向：用 statTrend 字符串约定
  statTrend: { label: '趋势 up/down', type: 'text', placeholder: 'up' },
},
```

`statTrend` 是简单约定：`'down'` / `'negative'` 时着红色，否则着绿色。

## 步骤 3：提取 CSS

### 3a. 删除全局 reset
源 HTML 头部的 `* { ... }` / `body { ... }` / 完整 `:root { --xxx: ... }` —— **全删**。

### 3b. 给所有选择器加命名空间
- `.kpi-card` → `.comp-stat-card`
- `.kpi-card .value` → `.comp-stat-card .value`
- `.kpi-card .delta.negative` → `.comp-stat-card .delta.negative`

### 3c. 检查颜色 token
源 CSS 已经用了 `var(--white)` / `var(--slate)` / `var(--gray-500)` / `var(--olive)` / `var(--rust)` —— **0 处需要替换**。

### 3d. 最终 CSS

```css
.comp-stat-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 18px 20px;
}
.comp-stat-card .label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  margin-bottom: 6px;
}
.comp-stat-card .value {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 32px;
  color: var(--slate);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;
}
.comp-stat-card .delta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--olive);
}
.comp-stat-card .delta.negative { color: var(--rust); }
```

注意：把 `1.5px solid var(--gray-300)` 替换成 `var(--border)`（它本身就是这个值）—— **进一步统一**。

## 步骤 4：写 html()

```ts
html: (s) => {
  if (!any(s.statValue, s.statLabel)) return '';

  // statTrend 约定：'down' / 'negative' / '-' 视为负向
  const isNegative = !isEmpty(s.statTrend) &&
    /^(down|negative|-|neg)$/i.test(s.statTrend.trim());

  return `
<div class="comp-stat-card" data-section="stat-card">
  ${!isEmpty(s.statLabel) ? `<div class="label" data-slot="statLabel">${s.statLabel}</div>` : ''}
  ${!isEmpty(s.statValue) ? `<div class="value" data-slot="statValue">${s.statValue}</div>` : ''}
  ${!isEmpty(s.statDelta)
    ? `<div class="delta${isNegative ? ' negative' : ''}" data-slot="statDelta">${s.statDelta}</div>`
    : ''}
</div>`.trim();
},
```

注意：
- 顶部 `if (!any(s.statValue, s.statLabel)) return '';` —— 至少有 value 或 label 才渲染
- 每个 slot 输出处都有 `data-slot="<name>"`
- 根元素有 `data-section="stat-card"`
- 没有 hardcode 内容

## 步骤 5：注册 + sample

```ts
// src/builtin/components/card/stat-card.ts
import { defineComponent, isEmpty, any } from '../_base';

export default defineComponent({
  id: 'stat-card',
  name: '指标卡',
  description: '数字 + 标签 + 增减说明的紧凑数据卡片',
  source: '11,landing',
  category: 'card',
  tags: ['card', 'stat', 'metric', 'kpi'],

  slots: {
    statLabel: { label: '指标名',       type: 'text', placeholder: 'Active Users' },
    statValue: { label: '指标值',       type: 'text', placeholder: '12,430' },
    statDelta: { label: '变化说明',     type: 'text', placeholder: '+8.2% vs last week' },
    statTrend: { label: '趋势 up/down', type: 'text', placeholder: 'up' },
  },

  sample: {
    statLabel: 'Active Users',
    statValue: '12,430',
    statDelta: '+8.2% vs last week',
    statTrend: 'up',
  },

  css: `
.comp-stat-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 18px 20px;
}
.comp-stat-card .label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  margin-bottom: 6px;
}
.comp-stat-card .value {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 32px;
  color: var(--slate);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;
}
.comp-stat-card .delta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--olive);
}
.comp-stat-card .delta.negative { color: var(--rust); }
  `.trim(),

  html: (s) => {
    if (!any(s.statValue, s.statLabel)) return '';
    const isNegative = !isEmpty(s.statTrend) &&
      /^(down|negative|-|neg)$/i.test(s.statTrend.trim());
    return `
<div class="comp-stat-card" data-section="stat-card">
  ${!isEmpty(s.statLabel) ? `<div class="label" data-slot="statLabel">${s.statLabel}</div>` : ''}
  ${!isEmpty(s.statValue) ? `<div class="value" data-slot="statValue">${s.statValue}</div>` : ''}
  ${!isEmpty(s.statDelta) ? `<div class="delta${isNegative ? ' negative' : ''}" data-slot="statDelta">${s.statDelta}</div>` : ''}
</div>`.trim();
  },
});
```

注册到 `card/index.ts`：

```ts
import featureCard from './feature-card';
import statCard from './stat-card';

export const CARD_COMPONENTS = [featureCard, statCard];
```

## 步骤 6：验证

### 6a. tsc + eslint

```bash
cd /data/workspace/md-html-forge
npx tsc --noEmit          # 0 错误
```

### 6b. 视觉对比

写一个快速 demo：

```md
<!-- @page width=wide -->
<!-- @compose: layout-grid-4 -->
<!-- @theme: editorial -->

<!-- @compose-group layout-grid-4 -->
<!-- @item stat-card statLabel="Active Users" statValue="12,430" statDelta="+8.2% vs last week" statTrend=up --><!-- @/item -->
<!-- @item stat-card statLabel="Completion Rate" statValue="87.4%" statDelta="-2.1% vs last week" statTrend=down --><!-- @/item -->
<!-- @item stat-card statLabel="Avg Session" statValue="4m 12s" statDelta="+0:18 vs last week" statTrend=up --><!-- @/item -->
<!-- @item stat-card statLabel="Errors" statValue="231" statDelta="-12 vs last week" statTrend=up --><!-- @/item -->
<!-- @/compose-group -->
```

打开浏览器，对比源 HTML 的 `kpi-grid` 段：
- 4 列 ✓
- 卡片背景白、边框灰 ✓
- value 用 mono 字体大号 ✓
- delta 上涨绿色、下降红色 ✓
- 间距、padding、圆角一致 ✓

### 6c. 主题切换

在 demo MD 顶部加 `<!-- @theme: dark -->`，看：
- 卡片底变深 ✓（`var(--white)` 在 dark 主题被覆盖）
- 文字反白 ✓
- 红/绿 trend 仍可读 ✓

### 6d. 空 slot 测试

```md
<!-- @item stat-card --><!-- @/item -->
```

→ 渲染为空字符串 ✓（`if (!any(s.statValue, s.statLabel)) return '';`）

## 步骤 7：提交

```
feat(components): migrate stat-card from 11-status-report.html

- Extracted KPI card pattern (kpi-card class)
- Slots: statLabel, statValue, statDelta, statTrend
- statTrend='down|negative|-' applies red color
- Category: card
- Source: 11 (status-report)
```

## 复盘

| 步骤 | 时间 |
|---|---|
| 识别 + slot 设计 | 10 min |
| 提取 CSS | 15 min |
| 写 html() | 15 min |
| 注册 + sample | 5 min |
| 验证 | 15 min |
| **总计** | **60 min** |

stat-card 是**简单组件**的代表（slot 都是 text 类型，无 list / code）。复杂组件如 `pr-summary`（含 diff stats + 状态条 + 多 metadata）一般 2x 时间。

## 自检：12 项验收

- [x] id 唯一（kebab）
- [x] category = 'card'
- [x] source = '11,landing'
- [x] 每 slot 有 label + placeholder
- [x] type 用 text（都是行内单行）
- [x] sample 全 4 项
- [x] CSS 全 `.comp-stat-card` 命名空间
- [x] 0 hardcode 颜色
- [x] 字体引用 var(--mono)
- [x] CSS < 30 行
- [x] 顶部 `if (!any(...)) return '';`
- [x] data-slot / data-section 齐全
- [x] tsc + eslint 0 错
- [x] 视觉对比一致
- [x] 主题切换正常

✅ 通过。
