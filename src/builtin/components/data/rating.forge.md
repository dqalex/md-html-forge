---
id: rating
category: data
tags: rating, star, score, review, ecommerce
trust: builtin
defaultVariant: standard
description: 星级评分组件：支持整星/半星，配合评分数值和评价数量，可嵌入商品卡片或独立使用
whenToUse: 商品/服务评分展示; 用户满意度评分; 嵌入卡片组件时的评分行
whenNot: 数据指标（用 metric）; 复杂评测对比（用 table）
keySlots: ratingScore; ratingCount
---

# 星级评分

## Variants

- `standard` — 标准：五星 + 分值 + 评价数
- `compact` — 紧凑：小尺寸，常内嵌在列表行里

## Slots

```yaml
ratingScore:
  label: 分数（0.0 - 5.0）
  type: text
  placeholder: '4.8'
ratingCount:
  label: 评价数量（如 2381 条评价）
  type: text
  placeholder: 2381 条评价
ratingLabel:
  label: 附加描述（如 好评如潮）
  type: text
  placeholder: 好评如潮
```

## HTML

```html
<div class="comp-rating" data-section="rating" data-variant="{{variant}}">
  <div class="rt-stars"></div>
  <span class="rt-score" data-slot="ratingScore"></span>
  <span class="rt-count" data-slot="ratingCount"></span>
  <span class="rt-label" data-slot="ratingLabel"></span>
</div>
```

## CSS

```css
.comp-rating {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--sans);
}

.comp-rating .rt-stars {
  display: inline-flex;
  gap: 1px;
  line-height: 1;
}

.comp-rating[data-variant="standard"] .rt-stars { font-size: 16px; }
.comp-rating[data-variant="compact"]  .rt-stars { font-size: 12px; }

.comp-rating .rt-star-full  { color: #FFB300; }
.comp-rating .rt-star-half  { color: #FFB300; opacity: 0.6; }
.comp-rating .rt-star-empty { color: var(--gray-300, #D1CFC5); }

.comp-rating .rt-score {
  font-weight: 700;
  color: #FFB300;
}
.comp-rating[data-variant="standard"] .rt-score { font-size: 15px; }
.comp-rating[data-variant="compact"]  .rt-score { font-size: 12px; }

.comp-rating .rt-count,
.comp-rating .rt-label {
  color: var(--gray-500);
}
.comp-rating[data-variant="standard"] .rt-count,
.comp-rating[data-variant="standard"] .rt-label { font-size: 12px; }
.comp-rating[data-variant="compact"]  .rt-count,
.comp-rating[data-variant="compact"]  .rt-label { font-size: 11px; }

.comp-rating .rt-count:empty,
.comp-rating .rt-label:empty { display: none; }
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-rating').forEach(function(el) {
    var scoreEl = el.querySelector('.rt-score');
    var starsEl = el.querySelector('.rt-stars');
    if (!scoreEl || !starsEl) return;
    var score = parseFloat(scoreEl.textContent.trim());
    if (isNaN(score)) return;
    score = Math.min(5, Math.max(0, score));
    var full = Math.floor(score);
    var half = (score - full) >= 0.3 && (score - full) < 0.8;
    var html = '';
    for (var i = 0; i < 5; i++) {
      if (i < full) {
        html += '<span class="rt-star-full">★</span>';
      } else if (i === full && half) {
        html += '<span class="rt-star-half">★</span>';
      } else {
        html += '<span class="rt-star-empty">☆</span>';
      }
    }
    starsEl.innerHTML = html;
  });
})();
```
