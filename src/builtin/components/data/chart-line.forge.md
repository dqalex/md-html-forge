---
id: chart-line
category: data
tags: chart, line, bar, area, trend, visualization, graph
trust: builtin
defaultVariant: line
description: 轻量 SVG 折线/柱状/面积图，零外部依赖，支持双系列 + 数据标注，导出 HTML 无需任何图表库
whenToUse: 展示时间序列趋势（店铺增长/用户曲线）; 双线对比（before/after）; 简单柱状数据对比; 导出要求零依赖
whenNot: 超过 3 个系列的复杂图表（用 echarts/D3）; 需要交互缩放/钻取的看板; 实时数据流
keySlots: chartData; chartLabels
---

# 数据图表

## Variants

- `line` — 折线图，支持 1-2 条线 + 数据点标注
- `area` — 面积图，线下填充半透明色
- `bar` — 柱状图，每列一组竖柱

## Slots

```yaml
chartTitle:
  label: 图表标题（可选）
  type: text
  placeholder: 店铺增长趋势
  bind: h3
chartSubtitle:
  label: 副标题/时间范围（可选）
  type: text
  placeholder: 过去 6 个月
chartData:
  label: 数据（每行：x标签,y值1[,y值2]）
  type: data
  placeholder: |
    1月,120
    2月,185
    3月,240
    4月,320
    5月,410
    6月,520
  description: |
    每行格式：标签,数值1[,数值2]
    双系列：标签,值1,值2
    如：1月,120,90
chartSeries1Label:
  label: 系列1图例名（可选）
  type: text
  placeholder: 本店
chartSeries2Label:
  label: 系列2图例名（可选）
  type: text
  placeholder: 行业均值
chartHighlight:
  label: 高亮标注（格式：x标签|标注文字）
  type: text
  placeholder: 6月|爆发增长 +520
  description: 在该数据点旁显示气泡标注
chartUnit:
  label: Y 轴单位（可选）
  type: text
  placeholder: 万元
chartCaption:
  label: 图表说明（可选）
  type: text
  placeholder: 数据来源：平台后台
```

## HTML

```html
<div class="comp-chart-line" data-section="chart-line" data-variant="{{variant}}">
  <div class="cl-header">
    <h3 class="cl-title" data-slot="chartTitle"></h3>
    <span class="cl-subtitle" data-slot="chartSubtitle"></span>
  </div>
  <div class="cl-legend">
    <span class="cl-series1-label" data-slot="chartSeries1Label"></span>
    <span class="cl-series2-label" data-slot="chartSeries2Label"></span>
  </div>
  <!-- SVG 由 JS 动态渲染 -->
  <div class="cl-canvas"></div>
  <div class="cl-footer">
    <span class="cl-unit" data-slot="chartUnit"></span>
    <span class="cl-caption" data-slot="chartCaption"></span>
  </div>
  <!-- 原始数据（hidden，JS 读取后移除）-->
  <div class="cl-raw-data" data-slot="chartData" data-slot-type="data" style="display:none"></div>
  <div class="cl-raw-highlight" data-slot="chartHighlight" style="display:none"></div>
</div>
```

## CSS

```css
.comp-chart-line {
  font-family: var(--sans);
  background: var(--white);
  border-radius: var(--radius-panel);
  border: 1px solid var(--gray-100);
  padding: 20px 24px;
  margin: 12px 0;
}

.comp-chart-line .cl-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}
.comp-chart-line .cl-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--slate);
  margin: 0;
}
.comp-chart-line .cl-title:empty { display: none; }
.comp-chart-line .cl-subtitle {
  font-size: 12px;
  color: var(--gray-500);
}
.comp-chart-line .cl-subtitle:empty { display: none; }

.comp-chart-line .cl-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}
.comp-chart-line .cl-legend span {
  font-size: 12px;
  color: var(--gray-500);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.comp-chart-line .cl-legend span:empty { display: none; }
.comp-chart-line .cl-legend span::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 3px;
  border-radius: 2px;
}
.comp-chart-line .cl-series1-label::before { background: var(--clay, #D97757); }
.comp-chart-line .cl-series2-label::before { background: #4ECDC4; }

.comp-chart-line .cl-canvas {
  width: 100%;
  overflow: hidden;
}
.comp-chart-line .cl-canvas svg {
  width: 100%;
  height: auto;
  display: block;
}

.comp-chart-line .cl-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
.comp-chart-line .cl-unit,
.comp-chart-line .cl-caption {
  font-size: 11px;
  color: var(--gray-500);
}
.comp-chart-line .cl-unit:empty,
.comp-chart-line .cl-caption:empty { display: none; }

/* 气泡标注 */
.comp-chart-line .cl-tooltip {
  background: var(--slate);
  color: var(--ivory);
  border-radius: 6px;
  font-size: 11px;
  padding: 3px 8px;
  pointer-events: none;
}
```

## JS

```js
(function() {
  var COLOR1 = 'var(--clay, #D97757)';
  var COLOR2 = '#4ECDC4';
  var AXIS_COLOR = 'var(--gray-300, #D1CFC5)';
  var LABEL_COLOR = 'var(--gray-500, #87867F)';

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function(k){ el.setAttribute(k, attrs[k]); });
    return el;
  }

  document.querySelectorAll('.comp-chart-line').forEach(function(el) {
    var variant = el.getAttribute('data-variant') || 'line';
    var rawEl = el.querySelector('.cl-raw-data');
    var hlEl  = el.querySelector('.cl-raw-highlight');
    var canvas = el.querySelector('.cl-canvas');
    if (!rawEl || !canvas) return;

    var raw = rawEl.textContent.trim();
    rawEl.style.display = 'none';

    var rows = raw.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    if (rows.length === 0) return;

    var labels = [], s1 = [], s2 = [], hasS2 = false;
    rows.forEach(function(r) {
      var parts = r.split(',');
      labels.push(parts[0] ? parts[0].trim() : '');
      s1.push(parseFloat(parts[1]) || 0);
      if (parts[2] !== undefined) { s2.push(parseFloat(parts[2]) || 0); hasS2 = true; }
    });

    // 高亮
    var hlText = '', hlLabel = '';
    if (hlEl) {
      var hlRaw = hlEl.textContent.trim();
      if (hlRaw) {
        var hlParts = hlRaw.split('|');
        hlLabel = hlParts[0] ? hlParts[0].trim() : '';
        hlText  = hlParts[1] ? hlParts[1].trim() : '';
      }
    }

    var W = 520, H = 200, PAD = { top: 24, right: 24, bottom: 36, left: 44 };
    var chartW = W - PAD.left - PAD.right;
    var chartH = H - PAD.top - PAD.bottom;

    var allVals = s1.concat(hasS2 ? s2 : []);
    var minV = Math.min.apply(null, allVals);
    var maxV = Math.max.apply(null, allVals);
    var range = maxV - minV || 1;
    // 留 10% padding
    var vMin = minV - range * 0.1;
    var vMax = maxV + range * 0.15;
    var vRange = vMax - vMin;

    function cx(i) { return PAD.left + (i / (labels.length - 1 || 1)) * chartW; }
    function cy(v) { return PAD.top + (1 - (v - vMin) / vRange) * chartH; }

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, xmlns: 'http://www.w3.org/2000/svg' });

    // 横向辅助线（3 条）
    for (var gi = 0; gi <= 3; gi++) {
      var gv = vMin + (vRange / 3) * gi;
      var gy = cy(gv);
      var gridLine = svgEl('line', { x1: PAD.left, y1: gy, x2: W - PAD.right, y2: gy,
        stroke: AXIS_COLOR, 'stroke-width': '1', 'stroke-dasharray': '3 4' });
      svg.appendChild(gridLine);
      // Y 轴标签
      var yLabel = svgEl('text', { x: PAD.left - 6, y: gy + 4, 'text-anchor': 'end',
        fill: LABEL_COLOR, 'font-size': '10' });
      yLabel.textContent = Math.round(gv);
      svg.appendChild(yLabel);
    }

    function drawSeries(vals, color, filled) {
      if (vals.length < 2) return;
      var pts = vals.map(function(v, i){ return cx(i) + ',' + cy(v); });

      if (filled) {
        // area
        var areaD = 'M' + cx(0) + ',' + (PAD.top + chartH) +
                    ' L' + pts.join(' L') +
                    ' L' + cx(vals.length-1) + ',' + (PAD.top + chartH) + ' Z';
        var area = svgEl('path', { d: areaD, fill: color, opacity: '0.15', stroke: 'none' });
        svg.appendChild(area);
      }

      if (variant !== 'bar') {
        // line
        var lineEl = svgEl('polyline', { points: pts.join(' '), fill: 'none',
          stroke: color, 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        svg.appendChild(lineEl);
        // dots
        vals.forEach(function(v, i) {
          var dot = svgEl('circle', { cx: cx(i), cy: cy(v), r: '4',
            fill: '#fff', stroke: color, 'stroke-width': '2' });
          svg.appendChild(dot);
        });
      } else {
        // bar
        var barW = (chartW / (vals.length * (hasS2 ? 2.5 : 1.8)));
        var offset = color === COLOR1 ? -(hasS2 ? barW * 0.6 : 0) : barW * 0.6;
        vals.forEach(function(v, i) {
          var bx = cx(i) + offset - barW / 2;
          var bh = Math.max(2, (PAD.top + chartH) - cy(v));
          var rect = svgEl('rect', { x: bx, y: cy(v), width: barW, height: bh,
            fill: color, opacity: '0.85', rx: '3' });
          svg.appendChild(rect);
        });
      }
    }

    // 柱状图或折线/面积
    drawSeries(s1, COLOR1, variant === 'area');
    if (hasS2) drawSeries(s2, COLOR2, variant === 'area');

    // X 轴标签
    labels.forEach(function(lbl, i) {
      var tx = svgEl('text', { x: cx(i), y: H - PAD.bottom + 16, 'text-anchor': 'middle',
        fill: LABEL_COLOR, 'font-size': '10' });
      tx.textContent = lbl;
      svg.appendChild(tx);
    });

    // 高亮标注气泡
    if (hlLabel) {
      var hlIdx = labels.indexOf(hlLabel);
      if (hlIdx >= 0) {
        var hx = cx(hlIdx), hy = cy(s1[hlIdx]);
        // 连线
        var hlLine = svgEl('line', { x1: hx, y1: hy - 6, x2: hx, y2: hy - 28,
          stroke: COLOR1, 'stroke-width': '1.5', 'stroke-dasharray': '3 2' });
        svg.appendChild(hlLine);
        // 气泡背景（rect + text）
        var hlGrp = svgEl('g', {});
        var hlRect = svgEl('rect', { x: hx - 46, y: hy - 48, width: 92, height: 20,
          rx: '6', fill: 'var(--slate, #141413)', opacity: '0.88' });
        hlGrp.appendChild(hlRect);
        var hlTxt = svgEl('text', { x: hx, y: hy - 34, 'text-anchor': 'middle',
          fill: '#FAF9F5', 'font-size': '10', 'font-weight': '500' });
        hlTxt.textContent = hlText || hlLabel;
        hlGrp.appendChild(hlTxt);
        svg.appendChild(hlGrp);
      }
    }

    canvas.appendChild(svg);
  });
})();
```
