---
id: stat-badges
category: data
tags: stat, badge, kpi, inline, marketing, number
trust: builtin
defaultVariant: light
description: 行内数据徽章组：一排小卡片展示多个数字指标，常嵌入 Banner 或独立作为"核心数字"条
whenToUse: Banner 内嵌入粉丝数/商品数/好评率等核心指标; 独立的"本项目关键数字"横条; 合作指标/荣誉数字展示
whenNot: 需要趋势箭头的指标（用 metric band）; 大号独立展示（用 metric hero）
keySlots: badgeValue; badgeLabel
---

# 数据徽章组

## Variants

- `light` — 白色半透明底（适合深色 / 渐变背景上叠加，如 cta-banner 内使用）
- `solid` — 主题 accent 色块底（适合浅色页面上作为强调条）
- `outline` — 描边无填充（低调版，适合浅色背景）

## Slots

```yaml
badgeItems:
  label: 徽章数据（每行：[emoji图标｜]数值｜标签）
  type: data
  placeholder: |
    🏪｜10+｜合作品牌
    📦｜200+｜精选商品
    ⭐｜98%｜好评率
  description: |
    每行格式：图标(可省)｜数值｜标签
    也支持无图标格式：数值｜标签
    分隔符支持 ｜（全角）或 | （半角）
```

## HTML

```html
<div class="comp-stat-badges" data-section="stat-badges" data-variant="{{variant}}">
  <div class="sb-track">
    <!-- items by JS -->
  </div>
  <div class="sb-raw" data-slot="badgeItems" data-slot-type="data" style="display:none;visibility:hidden;position:absolute;"></div>
</div>
```

## CSS

```css
.comp-stat-badges {
  font-family: var(--sans);
  padding: 8px 0;
}

.comp-stat-badges .sb-track {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: stretch;
}

.comp-stat-badges .sb-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border-radius: 10px;
  padding: 10px 18px;
  min-width: 80px;
  text-align: center;
  flex: 1;
  color: #fff;
}

/* light: 白色半透明，适合深色底 */
.comp-stat-badges[data-variant="light"] .sb-badge {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.35);
  color: #fff;
}

/* solid: accent 底 */
.comp-stat-badges[data-variant="solid"] .sb-badge {
  background: var(--clay, #D97757);
  color: #fff;
}

/* outline: 描边无填充，文字走主题色 */
.comp-stat-badges[data-variant="outline"] .sb-badge {
  background: transparent;
  border: 1.5px solid var(--clay, #D97757);
  color: var(--gray-700, #3D3D3A);
}
.comp-stat-badges[data-variant="outline"] .sb-value {
  color: var(--clay, #D97757);
}

.comp-stat-badges .sb-icon {
  font-size: 18px;
  line-height: 1;
}

.comp-stat-badges .sb-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: inherit;
}

.comp-stat-badges .sb-label {
  font-size: 11px;
  opacity: 0.85;
  color: inherit;
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-stat-badges').forEach(function(el) {
    var track  = el.querySelector('.sb-track');
    var rawEl  = el.querySelector('.sb-raw');
    if (!track) return;

    // 读取原始数据：兼容 forge data-slot 的两种注入方式
    // 1) 直接 textContent（emitter 直接写入文本）
    // 2) 内部多个 <div> 子节点（每行一个 div）
    var rawText = '';
    if (rawEl) {
      var children = rawEl.querySelectorAll('div, p, li');
      if (children.length > 0) {
        // data 类型注入：每行是一个子节点
        rawText = Array.from(children).map(function(c){ return c.textContent.trim(); }).join('\n');
      } else {
        rawText = rawEl.textContent.trim();
      }
      rawEl.remove();
    }

    if (!rawText) return;

    rawText.split('\n').forEach(function(line) {
      var l = line.trim();
      if (!l) return;

      // 支持 | 和 ｜（全角）分隔
      var parts = l.split(/[｜|]/).map(function(p){ return p.trim(); });

      var icon = '', value = '', label = '';

      if (parts.length >= 3) {
        // 格式：图标｜数值｜标签
        icon  = parts[0];
        value = parts[1];
        label = parts[2];
      } else if (parts.length === 2) {
        // 格式：数值｜标签
        value = parts[0];
        label = parts[1];
      } else {
        // 只有数值
        value = parts[0];
      }

      var badge = document.createElement('div');
      badge.className = 'sb-badge';

      if (icon) {
        var ic = document.createElement('div');
        ic.className = 'sb-icon';
        ic.textContent = icon;
        badge.appendChild(ic);
      }

      var val = document.createElement('div');
      val.className = 'sb-value';
      val.textContent = value;
      badge.appendChild(val);

      if (label) {
        var lbl = document.createElement('div');
        lbl.className = 'sb-label';
        lbl.textContent = label;
        badge.appendChild(lbl);
      }

      track.appendChild(badge);
    });
  });
})();
```

## Sample

```markdown
<!-- @use stat-badges variant=outline -->

<!-- @slot:badgeItems -->
🏪｜10+｜合作品牌
📦｜200+｜精选商品
⭐｜98%｜好评率
<!-- @/slot -->
```
