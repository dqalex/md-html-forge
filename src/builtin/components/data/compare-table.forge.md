---
id: compare-table
category: data
tags: compare, table, platform, feature, versus, highlight
trust: builtin
defaultVariant: highlight-center
description: 多列对比表：2-4 列对比，支持高亮中列（推荐列）、✅/❌ 图标自动渲染、表头带徽标
whenToUse: 平台/方案对比（本平台 vs 竞品）; 套餐/价格对比; 特性矩阵; 方案选型
whenNot: 普通数据表格（用 table）; 两项 before/after 对比（用 comparison）
keySlots: ctColumns; ctRows
---

# 多列对比表

## Variants

- `highlight-center` — 高亮中间列（推荐列），带标注徽标
- `highlight-last` — 高亮最右列
- `standard` — 等宽无高亮

## Slots

```yaml
ctTitle:
  label: 表格标题（可选）
  type: text
  placeholder: 为什么选择我们平台
  bind: h2
ctColumns:
  label: 列定义（竖线 | 分隔：列名，第一列为属性名列）
  type: text
  placeholder: 功能|普通店铺|✦ 本平台|头部品牌
  description: |
    格式：属性列名|列1|列2|...
    在列名前加 ✦ 或 * 表示该列为推荐高亮列（highlight-center/last 变体用到）
ctRows:
  label: 对比行（每行：属性名|值1|值2|...）
  type: data
  placeholder: |
    入驻费用|¥999/年|免费|¥9999/年
    流量支持|无|✅ 平台推流|✅ 自建流量
    佣金比例|30%|✅ 8%|15%
    客服支持|❌ 无|✅ 7×24h|✅ 工作日
    数据分析|❌|✅ 实时看板|⚠️ 基础
    品牌背书|❌|✅ 平台认证|✅ 独立品牌
  description: |
    支持特殊值自动渲染：
    ✅ → 绿色对勾  ❌ → 红色叉  ⚠️ → 黄色警告
    数字/普通文字原样显示
ctHighlightLabel:
  label: 高亮列顶部徽标文字（可选）
  type: text
  placeholder: 推荐
ctHighlightColor:
  label: 高亮列主色（可选，默认 clay 橙）
  type: text
  placeholder: '#FF5252'
```

## HTML

```html
<div class="comp-compare-table" data-section="compare-table" data-variant="{{variant}}">
  <h2 class="ct-title" data-slot="ctTitle"></h2>
  <div class="ct-wrap">
    <table class="ct-table">
      <!-- injected by JS -->
    </table>
  </div>
  <!-- raw data -->
  <div class="ct-raw-cols"    data-slot="ctColumns"         style="display:none"></div>
  <div class="ct-raw-rows"    data-slot="ctRows" data-slot-type="data" style="display:none"></div>
  <div class="ct-raw-hlabel"  data-slot="ctHighlightLabel"  style="display:none"></div>
  <div class="ct-raw-hcolor"  data-slot="ctHighlightColor"  style="display:none"></div>
</div>
```

## CSS

```css
.comp-compare-table {
  font-family: var(--sans);
}

.comp-compare-table .ct-title {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--slate);
  text-align: center;
  margin: 0 0 16px;
}
.comp-compare-table .ct-title:empty { display: none; }

.comp-compare-table .ct-wrap {
  overflow-x: auto;
  border-radius: var(--radius-panel);
  border: 1px solid var(--gray-100);
}

.comp-compare-table .ct-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
}

/* ===== 表头 ===== */
.comp-compare-table .ct-table thead tr {
  background: var(--gray-100);
}
.comp-compare-table .ct-table th {
  padding: 12px 10px;
  font-weight: 600;
  color: var(--slate);
  text-align: center;
  border-bottom: 2px solid var(--gray-300);
  position: relative;
  vertical-align: bottom;
}
.comp-compare-table .ct-table th:first-child {
  text-align: left;
  width: 28%;
}

/* 高亮列 */
.comp-compare-table .ct-table th.ct-highlight {
  background: var(--ct-hcolor, var(--clay, #D97757));
  color: #fff;
}
.comp-compare-table .ct-table th.ct-highlight::before {
  content: attr(data-badge);
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.25);
  margin: 0 auto 4px;
  width: fit-content;
}
.comp-compare-table .ct-table th.ct-highlight[data-badge=""] { }
.comp-compare-table .ct-table th.ct-highlight[data-badge=""]:before { display: none; }

/* ===== 内容行 ===== */
.comp-compare-table .ct-table tbody tr:nth-child(even) {
  background: var(--gray-100);
}
.comp-compare-table .ct-table tbody tr:hover {
  background: color-mix(in srgb, var(--ct-hcolor, var(--clay, #D97757)) 5%, transparent);
}
.comp-compare-table .ct-table td {
  padding: 10px 10px;
  text-align: center;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
  line-height: 1.4;
}
.comp-compare-table .ct-table td:first-child {
  text-align: left;
  font-weight: 500;
  color: var(--slate);
}
.comp-compare-table .ct-table td.ct-highlight {
  background: color-mix(in srgb, var(--ct-hcolor, var(--clay, #D97757)) 8%, transparent);
  font-weight: 600;
}

/* 特殊值样式 */
.comp-compare-table .ct-ok    { color: #2e7d32; font-weight: 600; }
.comp-compare-table .ct-no    { color: #c62828; font-weight: 600; }
.comp-compare-table .ct-warn  { color: #f57c00; font-weight: 600; }
.comp-compare-table .ct-num   { color: var(--ct-hcolor, var(--clay, #D97757)); font-weight: 700; font-size: 14px; }

/* ===== 最后一行无底线 ===== */
.comp-compare-table .ct-table tbody tr:last-child td { border-bottom: none; }
```

## JS

```js
(function() {
  // 特殊值 → HTML 转换
  function renderCell(text) {
    var t = text.trim();
    if (t === '✅' || t.startsWith('✅'))
      return '<span class="ct-ok">' + t + '</span>';
    if (t === '❌' || t.startsWith('❌'))
      return '<span class="ct-no">' + t + '</span>';
    if (t === '⚠️' || t.startsWith('⚠️'))
      return '<span class="ct-warn">' + t + '</span>';
    // 纯数字加颜色
    if (/^\d+(\.\d+)?[%x倍]?$/.test(t))
      return '<span class="ct-num">' + t + '</span>';
    return t;
  }

  document.querySelectorAll('.comp-compare-table').forEach(function(el) {
    var variant   = el.getAttribute('data-variant') || 'highlight-center';
    var tableEl   = el.querySelector('.ct-table');
    var rawCols   = el.querySelector('.ct-raw-cols');
    var rawRows   = el.querySelector('.ct-raw-rows');
    var rawHLabel = el.querySelector('.ct-raw-hlabel');
    var rawHColor = el.querySelector('.ct-raw-hcolor');
    if (!tableEl) return;

    var hlColor = rawHColor ? rawHColor.textContent.trim() : '';
    var hlLabel = rawHLabel ? rawHLabel.textContent.trim() : '推荐';
    if (hlColor) el.style.setProperty('--ct-hcolor', hlColor);

    // 列定义
    var colStr = rawCols ? rawCols.textContent.trim() : '';
    var cols = colStr ? colStr.split('|').map(function(c){ return c.trim(); }) : [];
    if (cols.length < 2) return;

    // 确定高亮列索引（跳过第0列属性名列，从第1列起计）
    var hlIdx = -1;
    var cleanCols = cols.map(function(c, i) {
      if (i > 0 && (c.startsWith('✦') || c.startsWith('*') || c.startsWith('★'))) {
        hlIdx = i;
        return c.replace(/^[✦*★]\s*/, '');
      }
      return c;
    });

    // 若变体是 highlight-center 且没有明确标记，默认中间列
    if (hlIdx < 0 && variant !== 'standard') {
      if (variant === 'highlight-center') hlIdx = Math.floor(cols.length / 2);
      else if (variant === 'highlight-last') hlIdx = cols.length - 1;
    }

    // 表头
    var thead = document.createElement('thead');
    var headTr = document.createElement('tr');
    cleanCols.forEach(function(col, i) {
      var th = document.createElement('th');
      th.textContent = col;
      if (i === hlIdx) {
        th.className = 'ct-highlight';
        th.setAttribute('data-badge', hlLabel);
      }
      headTr.appendChild(th);
    });
    thead.appendChild(headTr);
    tableEl.appendChild(thead);

    // 内容行
    var tbody = document.createElement('tbody');
    var rowLines = rawRows ? rawRows.textContent.trim().split('\n').map(function(l){ return l.trim(); }).filter(Boolean) : [];
    rowLines.forEach(function(line) {
      var cells = line.split('|');
      var tr = document.createElement('tr');
      cells.forEach(function(cell, i) {
        var td = document.createElement('td');
        td.innerHTML = renderCell(cell);
        if (i === hlIdx) td.className = 'ct-highlight';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);

    [rawCols, rawRows, rawHLabel, rawHColor].forEach(function(n){ if (n) n.remove(); });
  });
})();
```
