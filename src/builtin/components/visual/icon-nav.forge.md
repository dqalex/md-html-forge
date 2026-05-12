---
id: icon-nav
category: visual
tags: nav, icon, entry, grid, marketing, portal, button
trust: builtin
defaultVariant: grid
description: 图标导航入口：彩色宫格按钮（grid）或横排列表（row），每项含图标/图片 + 主标签 + 副标签
whenToUse: 营销页活动入口（节日专区/品类入口）; 小程序首页导航宫格; 功能门户页入口卡片
whenNot: 普通文字导航（用 header 的 nav）; 步骤流程（用 steps-horizontal）
keySlots: navLabel; navIcon
---

# 图标导航入口

## Variants

- `grid` — 宫格，2~4 列均匀排列，每项色块背景 + 大图标 + 文字
- `row` — 横排，单行滚动，图标较小 + 紧凑文字

## Slots

```yaml
navIcon:
  label: 图标（每行：emoji 或图片 URL）
  type: data
  placeholder: |
    🎁
    📦
    🏷️
    💎
  description: 每行一个图标；支持 emoji 或以 http 开头的图片 URL
navLabel:
  label: 主标签（每行一个）
  type: data
  placeholder: |
    节日优惠
    新品专区
    限时折扣
    会员专享
  description: 与 navIcon 行数对应
navSubLabel:
  label: 副标签（每行，可选）
  type: data
  placeholder: |
    好礼送不停
    上新速递
    仅剩24小时
    专属福利
navColor:
  label: 背景色（每行，可选，十六进制或 CSS 颜色）
  type: data
  placeholder: |
    #FF5252
    #FF9800
    #4CAF50
    #2196F3
  description: 不填时走主题 accent 色；行数可少于 navIcon（剩余项用默认色循环）
navHref:
  label: 跳转链接（每行，可选）
  type: data
  placeholder: |
    #promo
    #new
    #sale
    #member
```

## HTML

```html
<div class="comp-icon-nav" data-section="icon-nav" data-variant="{{variant}}">
  <div class="in-grid">
    <!-- items injected by JS -->
  </div>
  <!-- 原始数据 hidden -->
  <div class="in-raw-icon"     data-slot="navIcon"     data-slot-type="data" style="display:none"></div>
  <div class="in-raw-label"    data-slot="navLabel"    data-slot-type="data" style="display:none"></div>
  <div class="in-raw-sublabel" data-slot="navSubLabel" data-slot-type="data" style="display:none"></div>
  <div class="in-raw-color"    data-slot="navColor"    data-slot-type="data" style="display:none"></div>
  <div class="in-raw-href"     data-slot="navHref"     data-slot-type="data" style="display:none"></div>
</div>
```

## CSS

```css
.comp-icon-nav {
  font-family: var(--sans);
  padding: 8px 0;
}

/* ===== grid ===== */
.comp-icon-nav[data-variant="grid"] .in-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

/* ===== row ===== */
.comp-icon-nav[data-variant="row"] .in-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.comp-icon-nav[data-variant="row"] .in-grid::-webkit-scrollbar { display: none; }

/* ===== item ===== */
.comp-icon-nav .in-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  padding: 16px 8px 14px;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.12s, opacity 0.15s;
  color: #fff;
  min-width: 80px;
}
.comp-icon-nav .in-item:hover { opacity: 0.92; transform: translateY(-1px); }

.comp-icon-nav[data-variant="row"] .in-item {
  padding: 12px 14px;
  min-width: 70px;
  flex-shrink: 0;
}

.comp-icon-nav .in-icon {
  font-size: 30px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}
.comp-icon-nav .in-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}
.comp-icon-nav[data-variant="row"] .in-icon {
  width: 36px;
  height: 36px;
  font-size: 22px;
}

.comp-icon-nav .in-label {
  font-size: 13px;
  font-weight: 600;
  color: inherit;
  white-space: nowrap;
}
.comp-icon-nav .in-sublabel {
  font-size: 10px;
  color: rgba(255,255,255,0.75);
  white-space: nowrap;
}
.comp-icon-nav .in-sublabel:empty { display: none; }
```

## JS

```js
(function() {
  var DEFAULT_COLORS = ['#FF5252','#FF9800','#4CAF50','#2196F3','#9C27B0','#FF7043','#26C6DA','#EC407A'];

  function lines(el) {
    if (!el) return [];
    return el.textContent.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
  }

  document.querySelectorAll('.comp-icon-nav').forEach(function(el) {
    var grid = el.querySelector('.in-grid');
    if (!grid) return;

    var icons     = lines(el.querySelector('.in-raw-icon'));
    var labels    = lines(el.querySelector('.in-raw-label'));
    var sublabels = lines(el.querySelector('.in-raw-sublabel'));
    var colors    = lines(el.querySelector('.in-raw-color'));
    var hrefs     = lines(el.querySelector('.in-raw-href'));

    ['.in-raw-icon','.in-raw-label','.in-raw-sublabel','.in-raw-color','.in-raw-href'].forEach(function(sel) {
      var n = el.querySelector(sel);
      if (n) n.remove();
    });

    var count = Math.max(icons.length, labels.length);
    for (var i = 0; i < count; i++) {
      var href = hrefs[i] || '#';
      var item = document.createElement('a');
      item.className = 'in-item';
      item.href = href;
      if (href === '#') item.onclick = function(e){ e.preventDefault(); };
      var bg = colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      item.style.background = bg;

      // icon
      var iconWrap = document.createElement('div');
      iconWrap.className = 'in-icon';
      var ic = icons[i] || '';
      if (ic.startsWith('http')) {
        var img = document.createElement('img');
        img.src = ic;
        img.alt = labels[i] || '';
        iconWrap.appendChild(img);
      } else {
        iconWrap.textContent = ic;
      }
      item.appendChild(iconWrap);

      if (labels[i]) {
        var lbl = document.createElement('div');
        lbl.className = 'in-label';
        lbl.textContent = labels[i];
        item.appendChild(lbl);
      }
      if (sublabels[i]) {
        var sub = document.createElement('div');
        sub.className = 'in-sublabel';
        sub.textContent = sublabels[i];
        item.appendChild(sub);
      }
      grid.appendChild(item);
    }
  });
})();
```
