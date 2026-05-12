---
id: category-panel
category: visual
tags: category, sidebar, nav, product, ecommerce, tabs-left
trust: builtin
defaultVariant: tabs-left
description: 分类面板：左侧垂直分类标签 + 右侧内容区（商品列表或任意内容），点击左侧标签切换右侧
whenToUse: 电商页左侧分类导航 + 右侧商品列表; 文档/知识库左导航 + 右侧内容; 设置页左侧菜单 + 右侧面板
whenNot: 横向分类用 product-grid; 纯商品宫格无分类用 product-card+layout-grid
keySlots: cpCategories; cpItems
---

# 分类面板

## Variants

- `tabs-left` — 左侧窄列（图标+文字）竖向分类，右侧商品列表
- `tabs-top` — 顶部横向标签（大屏），下方内容

## Slots

```yaml
cpSectionTitle:
  label: 区块标题（可选）
  type: text
  placeholder: 全品类精选
  bind: h2
cpCategories:
  label: 分类定义（每行：图标|分类名）
  type: data
  placeholder: |
    🏠|家用清洁
    💆|个人护理
    🍵|食品饮料
    💄|美妆护肤
    📱|数码配件
  description: 每行：emoji图标(可空)|分类名
cpItems:
  label: 商品列表（每行：分类|图片URL|名称|价格|原价|销量|按钮文字|按钮链接）
  type: data
  placeholder: |
    家用清洁|https://img.example.com/1.jpg|多效洗洁精 500ml|¥9.9|¥19.9|月售1.2万|去选品|#
    个人护理|https://img.example.com/2.jpg|氨基酸洗发水 400ml|¥39.9||月售8千|去选品|#
    食品饮料|https://img.example.com/3.jpg|有机燕麦片 1kg|¥29.9|¥49|月售2.1万|了解详情|#
  description: 与 cpCategories 中的分类名对应（第一列）
cpAccentColor:
  label: 激活色（可选，默认 clay 橙）
  type: text
  placeholder: '#FF5252'
```

## HTML

```html
<div class="comp-category-panel" data-section="category-panel" data-variant="{{variant}}">
  <h2 class="cp-title" data-slot="cpSectionTitle"></h2>
  <div class="cp-layout">
    <div class="cp-sidebar" role="tablist">
      <!-- tabs by JS -->
    </div>
    <div class="cp-content">
      <!-- panels by JS -->
    </div>
  </div>
  <!-- raw data -->
  <div class="cp-raw-cats"   data-slot="cpCategories"  data-slot-type="data" style="display:none"></div>
  <div class="cp-raw-items"  data-slot="cpItems"       data-slot-type="data" style="display:none"></div>
  <div class="cp-raw-accent" data-slot="cpAccentColor" style="display:none"></div>
</div>
```

## CSS

```css
.comp-category-panel {
  font-family: var(--sans);
}

.comp-category-panel .cp-title {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--slate);
  text-align: center;
  margin: 0 0 14px;
}
.comp-category-panel .cp-title:empty { display: none; }

/* ===== tabs-left 布局 ===== */
.comp-category-panel[data-variant="tabs-left"] .cp-layout {
  display: flex;
  gap: 0;
  min-height: 300px;
  border-radius: var(--radius-panel);
  overflow: hidden;
  border: 1px solid var(--gray-100);
}

.comp-category-panel[data-variant="tabs-left"] .cp-sidebar {
  width: 76px;
  flex-shrink: 0;
  background: var(--gray-100);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.comp-category-panel[data-variant="tabs-left"] .cp-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  max-height: 500px;
  background: var(--white);
  padding: 8px;
}

/* ===== tabs-top 布局 ===== */
.comp-category-panel[data-variant="tabs-top"] .cp-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comp-category-panel[data-variant="tabs-top"] .cp-sidebar {
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.comp-category-panel[data-variant="tabs-top"] .cp-sidebar::-webkit-scrollbar { display: none; }

/* ===== 分类标签 ===== */
.comp-category-panel .cp-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  user-select: none;
}

.comp-category-panel[data-variant="tabs-left"] .cp-tab {
  padding: 12px 6px;
  border-left: 3px solid transparent;
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
}
.comp-category-panel[data-variant="tabs-left"] .cp-tab.active {
  background: var(--white);
  border-left: 3px solid var(--cp-accent, var(--clay, #D97757));
}

.comp-category-panel[data-variant="tabs-top"] .cp-tab {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--gray-300);
  background: var(--white);
  white-space: nowrap;
  flex-direction: row;
  gap: 5px;
}
.comp-category-panel[data-variant="tabs-top"] .cp-tab.active {
  background: var(--cp-accent, var(--clay, #D97757));
  border-color: var(--cp-accent, var(--clay, #D97757));
  color: #fff;
}

.comp-category-panel .cp-tab-icon {
  font-size: 20px;
  line-height: 1;
}
.comp-category-panel[data-variant="tabs-top"] .cp-tab-icon { font-size: 14px; }

.comp-category-panel .cp-tab-label {
  font-size: 11px;
  color: var(--gray-700);
  text-align: center;
  word-break: break-all;
}
.comp-category-panel[data-variant="tabs-left"] .cp-tab.active .cp-tab-label {
  color: var(--cp-accent, var(--clay, #D97757));
  font-weight: 600;
}
.comp-category-panel[data-variant="tabs-top"] .cp-tab.active .cp-tab-label { color: #fff; }

/* ===== 内容面板 ===== */
.comp-category-panel .cp-panel { display: none; }
.comp-category-panel .cp-panel.active { display: flex; flex-direction: column; gap: 8px; }

/* ===== 内联商品行 ===== */
.comp-category-panel .cp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--white);
  border-radius: 8px;
  border: 1px solid var(--gray-100);
}
.comp-category-panel .cp-item-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--gray-100);
  flex-shrink: 0;
}
.comp-category-panel .cp-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.comp-category-panel .cp-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.comp-category-panel .cp-item-meta {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.comp-category-panel .cp-item-price {
  font-size: 14px;
  font-weight: 700;
  color: #E53935;
}
.comp-category-panel .cp-item-original {
  font-size: 11px;
  color: var(--gray-500);
  text-decoration: line-through;
}
.comp-category-panel .cp-item-sales {
  font-size: 11px;
  color: var(--gray-500);
}
.comp-category-panel .cp-item-action {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--cp-accent, var(--clay, #D97757));
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s;
}
.comp-category-panel .cp-item-action:empty { display: none; }
.comp-category-panel .cp-item-action:hover { opacity: 0.85; }
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-category-panel').forEach(function(el) {
    var sidebarEl  = el.querySelector('.cp-sidebar');
    var contentEl  = el.querySelector('.cp-content');
    var rawCats    = el.querySelector('.cp-raw-cats');
    var rawItems   = el.querySelector('.cp-raw-items');
    var rawAccent  = el.querySelector('.cp-raw-accent');
    if (!sidebarEl || !contentEl) return;

    var accent = rawAccent ? rawAccent.textContent.trim() : '';
    if (accent) el.style.setProperty('--cp-accent', accent);

    function lines(node) {
      if (!node) return [];
      return node.textContent.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    }

    // 解析分类
    var catLines = lines(rawCats);
    var cats = catLines.map(function(l) {
      var parts = l.split('|');
      return { icon: (parts[0] || '').trim(), name: (parts[1] || parts[0] || '').trim() };
    });
    if (cats.length === 0) return;

    // 解析商品
    var products = [];
    lines(rawItems).forEach(function(line) {
      var p = line.split('|');
      products.push({
        cat:      (p[0] || '').trim(),
        img:      (p[1] || '').trim(),
        name:     (p[2] || '').trim(),
        price:    (p[3] || '').trim(),
        original: (p[4] || '').trim(),
        sales:    (p[5] || '').trim(),
        action:   (p[6] || '').trim(),
        href:     (p[7] || '#').trim()
      });
    });

    [rawCats, rawItems, rawAccent].forEach(function(n){ if (n) n.remove(); });

    var panelMap = {};

    cats.forEach(function(cat, idx) {
      // sidebar tab
      var tab = document.createElement('button');
      tab.className = 'cp-tab' + (idx === 0 ? ' active' : '');
      tab.setAttribute('data-cat', cat.name);

      var iconEl = document.createElement('span');
      iconEl.className = 'cp-tab-icon';
      iconEl.textContent = cat.icon;
      tab.appendChild(iconEl);

      var lblEl = document.createElement('span');
      lblEl.className = 'cp-tab-label';
      lblEl.textContent = cat.name;
      tab.appendChild(lblEl);
      sidebarEl.appendChild(tab);

      // panel
      var panel = document.createElement('div');
      panel.className = 'cp-panel' + (idx === 0 ? ' active' : '');
      panel.setAttribute('data-cat', cat.name);

      var filtered = products.filter(function(p){ return p.cat === cat.name; });
      filtered.forEach(function(item) {
        var row = document.createElement('div');
        row.className = 'cp-item';

        var img = document.createElement('img');
        img.className = 'cp-item-img';
        img.src = item.img;
        img.alt = item.name;
        row.appendChild(img);

        var body = document.createElement('div');
        body.className = 'cp-item-body';

        var nameEl = document.createElement('div');
        nameEl.className = 'cp-item-name';
        nameEl.textContent = item.name;
        body.appendChild(nameEl);

        var meta = document.createElement('div');
        meta.className = 'cp-item-meta';
        var priceEl = document.createElement('span');
        priceEl.className = 'cp-item-price';
        priceEl.textContent = item.price;
        meta.appendChild(priceEl);
        if (item.original) {
          var origEl = document.createElement('span');
          origEl.className = 'cp-item-original';
          origEl.textContent = item.original;
          meta.appendChild(origEl);
        }
        body.appendChild(meta);

        if (item.sales) {
          var salesEl = document.createElement('span');
          salesEl.className = 'cp-item-sales';
          salesEl.textContent = item.sales;
          body.appendChild(salesEl);
        }
        row.appendChild(body);

        if (item.action) {
          var actEl = document.createElement('a');
          actEl.className = 'cp-item-action';
          actEl.textContent = item.action;
          actEl.href = item.href || '#';
          row.appendChild(actEl);
        }

        panel.appendChild(row);
      });

      contentEl.appendChild(panel);
      panelMap[cat.name] = panel;
    });

    // 切换
    sidebarEl.addEventListener('click', function(e) {
      var btn = e.target.closest('.cp-tab');
      if (!btn) return;
      var cat = btn.getAttribute('data-cat');
      sidebarEl.querySelectorAll('.cp-tab').forEach(function(t){ t.classList.remove('active'); });
      btn.classList.add('active');
      Object.keys(panelMap).forEach(function(k){
        panelMap[k].classList.toggle('active', k === cat);
      });
    });
  });
})();
```
