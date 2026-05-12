---
id: metric
category: data
tags: kpi, metric, stats, hero, slide
trust: builtin
defaultVariant: band
description: KPI / 指标卡：band 横排多列 · hero 大号对比 · slide 单项演讲式
whenToUse: 报告开头展示关键 KPI 汇总; 一排数据看板（4 列横排）; 两个大号数值对比（hero）; 演讲幻灯片的单项高亮（slide）
whenNot: 单个独立数值（用 callout）; 带图表的时序数据（暂不支持）; ≤3 条结构化数据（可考虑 table impact）
keySlots: metricValue; metricLabel; metricDelta
---

# 指标卡

## Variants

- `band` — 顶部状态条 / 多列指标横排，4 列等宽卡片，每列含大数字 + 标签 + 趋势
- `hero` — 大号 hero 指标 + 趋势，2 列大数字展示
- `slide` — 幻灯片用大数值 + 标签 + 趋势，单列无卡片边框

## Slots

```yaml
metricValue:
  label: 指标数值
  type: data
  placeholder: |
    14
    6
    1
    3
  description: band/hero 变体每行一列；slide 变体仅第一行有效
metricLabel:
  label: 指标说明
  type: data
  placeholder: |
    PRs merged
    Deploys
    Incidents
    Flaky tests
  description: band/hero 变体每行一列；slide 变体仅第一行有效
metricDelta:
  label: 变化趋势（可选）
  type: data
  placeholder: |
    +3 vs wk10
    ±0
    SEV-2 · 47m
    suite 99.1%
  description: band/hero 变体每行一列；slide 变体仅第一行有效
metricTrend:
  label: 趋势方向
  type: text
  placeholder: down
  description: slide 变体专用，up/positive/+ 开头时 delta 变红色，否则橄榄绿
```

## HTML

```html
<div class="comp-metric" data-section="metric" data-variant="{{variant}}">
  <!-- variant: band -->
  <div class="mc-band">
    <div class="mc-card" data-slot="metricValue" data-slot-type="data"></div>
    <div class="mc-card" data-slot="metricLabel" data-slot-type="data"></div>
    <div class="mc-card" data-slot="metricDelta" data-slot-type="data"></div>
  </div>

  <!-- variant: hero -->
  <div class="mc-hero">
    <div class="mc-hitem" data-slot="metricValue" data-slot-type="data"></div>
    <div class="mc-hitem" data-slot="metricLabel" data-slot-type="data"></div>
    <div class="mc-hitem" data-slot="metricDelta" data-slot-type="data"></div>
  </div>

  <!-- variant: slide -->
  <div class="mc-slide">
    <div class="mc-slabel" data-slot="metricLabel"></div>
    <div class="mc-svalue" data-slot="metricValue"></div>
    <div class="mc-sdelta" data-slot="metricDelta"></div>
  </div>
</div>
```

## CSS

```css
/* ===== 变体隔离：只显示当前 variant 对应的 pane ===== */
.comp-metric .mc-band,
.comp-metric .mc-hero,
.comp-metric .mc-slide {
  display: none;
}
.comp-metric[data-variant="band"] .mc-band { display: block; }
.comp-metric[data-variant="hero"] .mc-hero { display: block; }
.comp-metric[data-variant="slide"] .mc-slide { display: block; }

.comp-metric {
  background: transparent;
}

/* ===== variant: band ===== */
.comp-metric[data-variant="band"] .mc-band {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 32px;
}
.comp-metric[data-variant="band"] .mc-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 20px 22px 18px;
}
.comp-metric[data-variant="band"] .mc-card .mc-num {
  font-family: var(--serif);
  font-size: 44px;
  font-weight: 500;
  line-height: 1;
  color: var(--slate);
  margin-bottom: 8px;
}
.comp-metric[data-variant="band"] .mc-card .mc-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500);
}
.comp-metric[data-variant="band"] .mc-card .mc-delta {
  font-family: var(--mono);
  font-size: 11px;
  margin-top: 6px;
  color: var(--gray-500);
}

/* ===== variant: hero ===== */
.comp-metric[data-variant="hero"] .mc-hero {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 48px;
  margin-bottom: 40px;
}
.comp-metric[data-variant="hero"] .mc-hitem .mc-label {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 14px;
}
.comp-metric[data-variant="hero"] .mc-hitem .mc-num {
  font-family: var(--serif);
  font-size: 52px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--slate);
}
.comp-metric[data-variant="hero"] .mc-hitem .mc-delta {
  font-family: var(--mono);
  font-size: 13px;
  margin-top: 12px;
  color: var(--olive);
}

/* ===== variant: slide ===== */
.comp-metric[data-variant="slide"] .mc-slide {
  margin-bottom: 0;
}
.comp-metric[data-variant="slide"] .mc-slabel {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 14px;
}
.comp-metric[data-variant="slide"] .mc-svalue {
  font-family: var(--serif);
  font-size: 52px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--slate);
}
.comp-metric[data-variant="slide"] .mc-sdelta {
  font-family: var(--mono);
  font-size: 13px;
  margin-top: 12px;
  color: var(--olive);
}
.comp-metric[data-variant="slide"] .mc-sdelta.up {
  color: var(--clay);
}


```

## JS

```js
(function() {
  document.querySelectorAll('.comp-metric').forEach(function(el) {
  var variant = el.getAttribute('data-variant');

  if (variant === 'band' || variant === 'hero') {
    var valueSlot = el.querySelector('[data-slot="metricValue"]');
    var labelSlot = el.querySelector('[data-slot="metricLabel"]');
    var deltaSlot = el.querySelector('[data-slot="metricDelta"]');

    var values = ((valueSlot && valueSlot.textContent) || '').split('\n').map(v => v.trim()).filter(Boolean);
    var labels = ((labelSlot && labelSlot.textContent) || '').split('\n').map(v => v.trim()).filter(Boolean);
    var deltas = ((deltaSlot && deltaSlot.textContent) || '').split('\n').map(v => v.trim()).filter(Boolean);
    var count = Math.max(values.length, labels.length, deltas.length);

    if (count === 0) return;

    var container = variant === 'band'
      ? el.querySelector('.mc-band')
      : el.querySelector('.mc-hero');
    if (!container) return;

    container.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var cardClass = variant === 'band' ? 'mc-card' : 'mc-hitem';
      var card = document.createElement('div');
      card.className = cardClass;
      if (values[i]) {
        var num = document.createElement('div');
        num.className = 'mc-num';
        num.textContent = values[i];
        card.appendChild(num);
      }
      if (labels[i]) {
        var lbl = document.createElement('div');
        lbl.className = 'mc-label';
        lbl.textContent = labels[i];
        card.appendChild(lbl);
      }
      if (deltas[i]) {
        var dlt = document.createElement('div');
        dlt.className = 'mc-delta';
        dlt.textContent = deltas[i];
        card.appendChild(dlt);
      }
      container.appendChild(card);
    }
  }

  if (variant === 'slide') {
    var deltaEl = el.querySelector('.mc-sdelta');
    var trendEl = el.querySelector('[data-slot="metricTrend"]');
    var trend = trendEl ? (trendEl.textContent || '').trim().toLowerCase() : '';
    if (trend && deltaEl) {
      var isUp = /^(up|positive|\+)/i.test(trend);
      if (isUp) {
        deltaEl.classList.add('up');
      }
    }
  }
  });
})();
```

## Sample

```markdown
<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
14
6
1
99.1%
<!-- @/slot -->

<!-- @slot:metricLabel -->
PRs merged
Deploys
Incidents
Suite green
<!-- @/slot -->

<!-- @slot:metricDelta -->
+3 vs wk10
±0
SEV-2 · 47m
+0.3pp
<!-- @/slot -->

---

<!-- @use metric variant=hero -->

<!-- @slot:metricValue -->
184ms
0.21%
<!-- @/slot -->

<!-- @slot:metricLabel -->
API p95 延迟
后台任务错误率
<!-- @/slot -->

<!-- @slot:metricDelta -->
↓ 12% wk/wk
↓ 0.08pp
<!-- @/slot -->

---

<!-- @use metric variant=slide -->

<!-- @slot:metricLabel -->API p95 latency<!-- @/slot -->
<!-- @slot:metricValue -->184ms<!-- @/slot -->
<!-- @slot:metricDelta -->↓ 12% wk/wk<!-- @/slot -->
<!-- @slot:metricTrend -->down<!-- @/slot -->
```
