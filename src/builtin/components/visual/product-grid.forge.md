---
id: product-grid
category: visual
tags: product, grid, category, tab, ecommerce, filter, shelf
trust: builtin
defaultVariant: grid
description: 商品宫格容器：顶部分类标签横滑切换 + 下方商品宫格/列表，点击标签过滤对应分类商品
whenToUse: 电商/营销页商品展示区（带分类过滤）; 活动页货架（2列宫格）; 商品列表（列表视图）
whenNot: 单个商品详情（用 product-card）; 纯排行榜无分类（用 product-card variant=list）
keySlots: pgCategories; pgItems
---

# 商品宫格

## Variants

- `grid` — 2 列宫格，每格：图片 + 标题 + 价格 + 操作按钮
- `list` — 竖向列表，每行：图片 + 标题 + 价格 + 销量 + 按钮

## Slots

```yaml
pgSectionTitle:
  label: 区块标题（可选）
  type: text
  placeholder: 精选好物 · 品质保障
  bind: h2
pgCategories:
  label: 分类标签（竖线 | 分隔，第一个为"全部"）
  type: text
  placeholder: 全部|家用清洁|个人护理|食品饮料|美妆护肤
  description: 用 | 分隔，点击标签过滤对应分类商品；商品 pgCategory 字段与此对应
pgItems:
  label: 商品数据（每行：分类|图片URL|标题|价格|原价|销量|按钮文字|按钮链接）
  type: data
  placeholder: |
    家用清洁|https://img.example.com/1.jpg|多效洗洁精 500ml|¥9.9|¥19.9|月售1.2万|去选品|#
    个人护理|https://img.example.com/2.jpg|氨基酸洗发水 400ml|¥39.9||月售8千|去选品|#
    食品饮料|https://img.example.com/3.jpg|有机燕麦片 1kg|¥29.9|¥49|月售2.1万|去选品|#
    美妆护肤|https://img.example.com/4.jpg|保湿面霜 50g|¥49.9||月售5千|去选品|#
  description: |
    每行格式：分类|图片URL|标题|价格|原价(可空)|销量(可空)|按钮文字(可空)|按钮链接(可空)
    分类须与 pgCategories 中的某项完全匹配（"全部"分类不用指定，默认显示所有）
pgActionColor:
  label: 操作按钮颜色（可选，默认 clay 橙）
  type: text
  placeholder: '#FF5252'
```

## HTML

```html
<div class="comp-product-grid" data-section="product-grid" data-variant="{{variant}}">
  <h2 class="pg-title" data-slot="pgSectionTitle"></h2>
  <div class="pg-tabs-wrap">
    <div class="pg-tabs" role="tablist">
      <!-- tabs injected by JS -->
    </div>
  </div>
  <div class="pg-body">
    <!-- grid/list panels injected by JS -->
  </div>
  <!-- raw data (hidden) -->
  <div class="pg-raw-cats"    data-slot="pgCategories"  style="display:none"></div>
  <div class="pg-raw-items"   data-slot="pgItems"  data-slot-type="data" style="display:none"></div>
  <div class="pg-raw-actcol"  data-slot="pgActionColor" style="display:none"></div>
</div>
```

## CSS

```css
.comp-product-grid {
  font-family: var(--sans);
  overflow: hidden;
}

.comp-product-grid .pg-title {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--slate);
  text-align: center;
  margin: 0 0 14px;
  padding: 0 16px;
}
.comp-product-grid .pg-title:empty { display: none; }

/* ===== 分类标签栏 ===== */
.comp-product-grid .pg-tabs-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 12px 12px;
}
.comp-product-grid .pg-tabs-wrap::-webkit-scrollbar { display: none; }

.comp-product-grid .pg-tabs {
  display: flex;
  gap: 8px;
  white-space: nowrap;
  min-width: max-content;
}

.comp-product-grid .pg-tab {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-700);
  transition: all 0.15s;
  user-select: none;
}
.comp-product-grid .pg-tab:hover {
  border-color: var(--clay);
  color: var(--clay);
}
.comp-product-grid .pg-tab.active {
  background: var(--clay);
  border-color: var(--clay);
  color: #fff;
}

/* ===== 商品内容区 ===== */
.comp-product-grid .pg-panel { display: none; }
.comp-product-grid .pg-panel.active { display: block; }

/* grid 变体 */
.comp-product-grid[data-variant="grid"] .pg-panel.active {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
}

/* list 变体 */
.comp-product-grid[data-variant="list"] .pg-panel.active {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px;
}

/* ===== 商品卡（grid 内联版） ===== */
.comp-product-grid .pg-item {
  background: var(--white);
  border-radius: var(--radius-panel);
  border: 1px solid var(--gray-100);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.comp-product-grid[data-variant="list"] .pg-item {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
}

.comp-product-grid .pg-item-img-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.comp-product-grid[data-variant="grid"] .pg-item-img-wrap {
  width: 100%;
  height: 140px;
}
.comp-product-grid[data-variant="list"] .pg-item-img-wrap {
  width: 70px;
  height: 70px;
  border-radius: 8px;
}
.comp-product-grid .pg-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: var(--gray-100);
}

.comp-product-grid .pg-item-body {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.comp-product-grid[data-variant="list"] .pg-item-body {
  padding: 0;
}

.comp-product-grid .pg-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.comp-product-grid[data-variant="list"] .pg-item-name {
  -webkit-line-clamp: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.comp-product-grid .pg-item-meta {
  display: flex;
  align-items: baseline;
  gap: 5px;
  flex-wrap: wrap;
}
.comp-product-grid .pg-item-price {
  font-size: 15px;
  font-weight: 700;
  color: #E53935;
}
.comp-product-grid .pg-item-original {
  font-size: 11px;
  color: var(--gray-500);
  text-decoration: line-through;
}
.comp-product-grid .pg-item-sales {
  font-size: 11px;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: 1px 5px;
  border-radius: 3px;
}

.comp-product-grid .pg-item-action {
  display: block;
  margin-top: 6px;
  padding: 5px 0;
  border-radius: 6px;
  background: var(--clay, #D97757);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.15s;
}
.comp-product-grid[data-variant="list"] .pg-item-action {
  padding: 4px 10px;
  border-radius: 999px;
  width: auto;
  align-self: flex-start;
  margin-top: 4px;
}
.comp-product-grid .pg-item-action:empty { display: none; }
.comp-product-grid .pg-item-action:hover { opacity: 0.85; }
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-product-grid').forEach(function(el) {
    var variant  = el.getAttribute('data-variant') || 'grid';
    var tabsEl   = el.querySelector('.pg-tabs');
    var bodyEl   = el.querySelector('.pg-body');
    var rawCats  = el.querySelector('.pg-raw-cats');
    var rawItems = el.querySelector('.pg-raw-items');
    var rawColor = el.querySelector('.pg-raw-actcol');
    if (!tabsEl || !bodyEl) return;

    var actionColor = rawColor ? rawColor.textContent.trim() : '';

    // 解析分类
    var catStr = rawCats ? rawCats.textContent.trim() : '';
    var cats   = catStr ? catStr.split('|').map(function(c){ return c.trim(); }).filter(Boolean) : ['全部'];
    if (!cats[0] || cats[0] !== '全部') cats.unshift('全部');

    // 解析商品
    var rows = [];
    if (rawItems) {
      rawItems.textContent.trim().split('\n').forEach(function(line) {
        var l = line.trim();
        if (!l) return;
        var parts = l.split('|');
        rows.push({
          cat:      (parts[0] || '').trim(),
          img:      (parts[1] || '').trim(),
          name:     (parts[2] || '').trim(),
          price:    (parts[3] || '').trim(),
          original: (parts[4] || '').trim(),
          sales:    (parts[5] || '').trim(),
          action:   (parts[6] || '').trim(),
          href:     (parts[7] || '#').trim()
        });
      });
    }

    // 清除原始节点
    [rawCats, rawItems, rawColor].forEach(function(n){ if (n) n.remove(); });

    // 建 tab → panel 映射
    var panelMap = {};

    cats.forEach(function(cat, idx) {
      // tab 按钮
      var tab = document.createElement('button');
      tab.className = 'pg-tab' + (idx === 0 ? ' active' : '');
      tab.textContent = cat;
      tab.setAttribute('data-cat', cat);
      tabsEl.appendChild(tab);

      // 面板
      var panel = document.createElement('div');
      panel.className = 'pg-panel' + (idx === 0 ? ' active' : '');
      panel.setAttribute('data-cat', cat);

      // 填充商品
      var filtered = cat === '全部' ? rows : rows.filter(function(r){ return r.cat === cat; });
      filtered.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'pg-item';

        // 图片
        var imgWrap = document.createElement('div');
        imgWrap.className = 'pg-item-img-wrap';
        var img = document.createElement('img');
        img.className = 'pg-item-img';
        img.src = item.img;
        img.alt = item.name;
        imgWrap.appendChild(img);
        card.appendChild(imgWrap);

        // 信息
        var body = document.createElement('div');
        body.className = 'pg-item-body';

        var nameEl = document.createElement('div');
        nameEl.className = 'pg-item-name';
        nameEl.textContent = item.name;
        body.appendChild(nameEl);

        var meta = document.createElement('div');
        meta.className = 'pg-item-meta';
        var priceEl = document.createElement('span');
        priceEl.className = 'pg-item-price';
        priceEl.textContent = item.price;
        meta.appendChild(priceEl);
        if (item.original) {
          var origEl = document.createElement('span');
          origEl.className = 'pg-item-original';
          origEl.textContent = item.original;
          meta.appendChild(origEl);
        }
        body.appendChild(meta);

        if (item.sales) {
          var salesEl = document.createElement('span');
          salesEl.className = 'pg-item-sales';
          salesEl.textContent = item.sales;
          body.appendChild(salesEl);
        }

        if (item.action) {
          var actEl = document.createElement('a');
          actEl.className = 'pg-item-action';
          actEl.textContent = item.action;
          actEl.href = item.href || '#';
          if (actionColor) actEl.style.background = actionColor;
          body.appendChild(actEl);
        }

        card.appendChild(body);
        panel.appendChild(card);
      });

      bodyEl.appendChild(panel);
      panelMap[cat] = panel;
    });

    // Tab 切换
    tabsEl.addEventListener('click', function(e) {
      var btn = e.target.closest('.pg-tab');
      if (!btn) return;
      var cat = btn.getAttribute('data-cat');
      tabsEl.querySelectorAll('.pg-tab').forEach(function(t){ t.classList.remove('active'); });
      btn.classList.add('active');
      Object.keys(panelMap).forEach(function(k){
        panelMap[k].classList.toggle('active', k === cat);
      });
    });
  });
})();
```
