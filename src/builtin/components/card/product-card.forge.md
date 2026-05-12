---
id: product-card
category: card
tags: product, ecommerce, shop, ranking, goods, card
trust: builtin
defaultVariant: list
description: 商品卡片：排行榜列表（list）或宫格展示（grid），含序号、图片、标题、价格、销量、评分
whenToUse: 商品排行榜（TOP N 列表）; 商品宫格展示（活动页货架）; 带价格/销量/评分的任意内容清单
whenNot: 纯文字列表（用 list-item）; 数据指标（用 metric）; 简单特性说明（用 card standard）
keySlots: productTitle; productPrice; productImage
---

# 商品卡片

## Variants

- `list` — 排行榜竖向列表：序号 + 图片 + 标题 + 价格 + 销量标签
- `grid` — 宫格卡片：图片居上 + 标题 + 价格 + 评分，配合 layout-grid-2/3/4 使用

## Slots

```yaml
productTitle:
  label: 商品名称
  type: text
  placeholder: 天然有机燕麦片 1kg
  bind: h3
productImage:
  label: 商品图片 URL
  type: text
  placeholder: https://example.com/product.jpg
productPrice:
  label: 价格（含单位，如 ¥39.9）
  type: text
  placeholder: ¥39.9
productOriginalPrice:
  label: 划线原价（可选）
  type: text
  placeholder: ¥59
productSales:
  label: 销量/热度标签（可选）
  type: text
  placeholder: 已售 2.1万
productRating:
  label: 评分（0-5，可含小数）
  type: text
  placeholder: '4.8'
productTag:
  label: 角标标签（可选，如 爆款/新品/热销）
  type: text
  placeholder: 爆款
productRank:
  label: 排名序号（可选，list 变体左侧编号）
  type: text
  placeholder: '1'
productAction:
  label: 操作按钮文字（可选，如 去选品）
  type: text
  placeholder: 去选品
productActionUrl:
  label: 操作按钮链接（可选）
  type: text
  placeholder: '#'
```

## HTML

```html
<div class="comp-product-card" data-section="product-card" data-variant="{{variant}}">
  <!-- variant: list -->
  <div class="pc-list-row">
    <div class="pc-rank" data-slot="productRank"></div>
    <div class="pc-img-wrap">
      <img class="pc-img" data-slot="productImage" alt="" src="" />
      <span class="pc-tag" data-slot="productTag"></span>
    </div>
    <div class="pc-info">
      <h3 class="pc-title" data-slot="productTitle"></h3>
      <div class="pc-meta">
        <span class="pc-price" data-slot="productPrice"></span>
        <span class="pc-original" data-slot="productOriginalPrice"></span>
        <span class="pc-sales" data-slot="productSales"></span>
      </div>
      <div class="pc-rating-row">
        <span class="pc-stars"></span>
        <span class="pc-rating-val" data-slot="productRating"></span>
      </div>
      <a class="pc-action" data-slot="productAction" data-href-slot="productActionUrl" href="#"></a>
    </div>
  </div>

  <!-- variant: grid -->
  <div class="pc-grid-card">
    <div class="pc-img-wrap">
      <img class="pc-img" data-slot="productImage" alt="" src="" />
      <span class="pc-tag" data-slot="productTag"></span>
    </div>
    <div class="pc-grid-body">
      <h3 class="pc-title" data-slot="productTitle"></h3>
      <div class="pc-rating-row">
        <span class="pc-stars"></span>
        <span class="pc-rating-val" data-slot="productRating"></span>
      </div>
      <div class="pc-meta">
        <span class="pc-price" data-slot="productPrice"></span>
        <span class="pc-original" data-slot="productOriginalPrice"></span>
      </div>
      <span class="pc-sales" data-slot="productSales"></span>
      <a class="pc-action" data-slot="productAction" data-href-slot="productActionUrl" href="#"></a>
    </div>
  </div>
</div>
```

## CSS

```css
.comp-product-card {
  box-sizing: border-box;
  font-family: var(--sans);
}

/* ===== list 变体 ===== */
.comp-product-card[data-variant="list"] .pc-grid-card { display: none; }
.comp-product-card[data-variant="list"] .pc-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--white);
  border-radius: var(--radius-panel);
  border: 1px solid var(--gray-100);
  margin-bottom: 8px;
  transition: box-shadow 0.15s;
}
.comp-product-card[data-variant="list"] .pc-list-row:hover {
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

/* ===== grid 变体 ===== */
.comp-product-card[data-variant="grid"] .pc-list-row { display: none; }
.comp-product-card[data-variant="grid"] .pc-grid-card {
  background: var(--white);
  border-radius: var(--radius-panel);
  border: 1px solid var(--gray-100);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== 公共 ===== */
/* 排名 */
.comp-product-card .pc-rank {
  font-family: var(--mono);
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-300);
  min-width: 28px;
  text-align: center;
  line-height: 1;
  flex-shrink: 0;
}
/* 前三名特殊颜色 */
.comp-product-card .pc-rank[data-rank="1"] { color: #FF4400; }
.comp-product-card .pc-rank[data-rank="2"] { color: #FF8800; }
.comp-product-card .pc-rank[data-rank="3"] { color: #FFB300; }

/* 图片区 */
.comp-product-card .pc-img-wrap {
  position: relative;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}
.comp-product-card[data-variant="list"] .pc-img-wrap {
  width: 70px;
  height: 70px;
}
.comp-product-card[data-variant="grid"] .pc-img-wrap {
  width: 100%;
  height: 160px;
  border-radius: 0;
}
.comp-product-card .pc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: var(--gray-100);
}
.comp-product-card .pc-img[src=""] {
  min-height: 70px;
  background: var(--gray-100);
}

/* 角标 */
.comp-product-card .pc-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--clay);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.4;
}
.comp-product-card .pc-tag:empty { display: none; }

/* 信息区 */
.comp-product-card .pc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.comp-product-card .pc-grid-body {
  padding: 10px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.comp-product-card .pc-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--slate);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
.comp-product-card[data-variant="grid"] .pc-title {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 价格 */
.comp-product-card .pc-meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}
.comp-product-card .pc-price {
  font-size: 16px;
  font-weight: 700;
  color: #E53935;
  line-height: 1;
}
.comp-product-card .pc-original {
  font-size: 12px;
  color: var(--gray-500);
  text-decoration: line-through;
}
.comp-product-card .pc-original:empty { display: none; }
.comp-product-card .pc-sales {
  font-size: 11px;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: 1px 6px;
  border-radius: 4px;
}
.comp-product-card .pc-sales:empty { display: none; }

/* 评分 */
.comp-product-card .pc-rating-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.comp-product-card .pc-stars {
  display: inline-flex;
  gap: 1px;
  color: #FFB300;
  font-size: 12px;
}
.comp-product-card .pc-rating-val {
  font-size: 12px;
  color: var(--gray-500);
}
.comp-product-card .pc-rating-val:empty,
.comp-product-card .pc-rating-row:has(.pc-stars:empty) { display: none; }

/* 操作按钮 */
.comp-product-card .pc-action {
  display: inline-block;
  margin-top: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--clay, #D97757);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: opacity 0.15s;
  align-self: flex-start;
}
.comp-product-card .pc-action:empty { display: none; }
.comp-product-card .pc-action:hover { opacity: 0.85; }
.comp-product-card[data-variant="grid"] .pc-action {
  width: 100%;
  text-align: center;
  border-radius: 6px;
  margin-top: 8px;
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-product-card').forEach(function(el) {
    // 设置图片 src
    ['pc-img'].forEach(function(cls) {
      var imgs = el.querySelectorAll('.' + cls);
      imgs.forEach(function(img) {
        var slot = img.getAttribute('data-slot');
        if (slot) {
          var srcEl = el.querySelector('[data-slot="' + slot + '"]:not(img)');
          if (srcEl) { img.src = srcEl.textContent.trim(); srcEl.style.display = 'none'; }
        }
      });
    });

    // 设置 rank data 属性（前三名特殊色）
    var rankEl = el.querySelector('.pc-rank');
    if (rankEl) {
      var rank = rankEl.textContent.trim();
      if (rank) rankEl.setAttribute('data-rank', rank);
    }

    // 设置按钮链接
    el.querySelectorAll('.pc-action').forEach(function(btn) {
      var hrefSlot = btn.getAttribute('data-href-slot');
      if (hrefSlot) {
        var hrefEl = el.querySelector('[data-slot="' + hrefSlot + '"]');
        if (hrefEl) {
          var href = hrefEl.textContent.trim();
          if (href && href !== '#') btn.href = href;
          hrefEl.style.display = 'none';
        }
      }
    });
    el.querySelectorAll('.pc-rating-val').forEach(function(val) {
      var score = parseFloat(val.textContent.trim());
      if (!isNaN(score)) {
        var stars = el.querySelector('.pc-stars');
        if (!stars) return;
        var full = Math.floor(score);
        var half = (score - full) >= 0.5;
        var html = '';
        for (var i = 0; i < 5; i++) {
          if (i < full) html += '★';
          else if (i === full && half) html += '☆';
          else html += '☆';
        }
        stars.innerHTML = html;
        // 重新着色
        stars.querySelectorAll('*').forEach(function(){});
      }
    });
  });
})();
```
