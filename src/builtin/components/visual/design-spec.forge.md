---
id: design-spec
category: visual
tags: design-system, token, swatch, spacing, radius, shadow, keyframe, animation
trust: builtin
defaultVariant: swatch
---

# 设计系统展示

## Variants

- `swatch` — 颜色色板：色块 + hex 值 + token 名称
- `spacing` — 间距标尺：竖条 + 像素值 + token 名
- `radius` — 圆角/阴影示例卡：带圆角或阴影的卡片 + token 名 + 数值
- `keyframe` — 动画关键帧时间线：水平轨道 + 节点标签 + 时间戳

## Slots

```yaml
swatchColor:
  label: 色值（hex 或 CSS）
  type: text
  placeholder: '#D97757'
swatchHex:
  label: hex 显示值
  type: text
  placeholder: '#D97757'
swatchToken:
  label: token 名称
  type: text
  placeholder: '--clay'
swatchGroup:
  label: 分组名（可选）
  type: text
  placeholder: 'Primary'
swatchBorder:
  label: 是否显示边框（可选）
  type: text
  placeholder: ''
spSize:
  label: 间距像素值（多个用逗号分隔）
  type: text
  placeholder: '4,8,12,16,24,32,48,64'
spToken:
  label: token 名称（多个用逗号分隔）
  type: text
  placeholder: '--sp-1,--sp-2,--sp-3,--sp-4,--sp-5,--sp-6,--sp-7,--sp-8'
rsType:
  label: 类型 radius/shadow
  type: text
  placeholder: 'radius'
rsValue:
  label: CSS 值（圆角 px / 阴影表达式）
  type: text
  placeholder: '12px'
rsToken:
  label: token 名称
  type: text
  placeholder: '--r-md'
rsDetail:
  label: 规格说明（可选）
  type: text
  placeholder: '0 4px 10px / 8%'
keyframeTitle:
  label: 标题
  type: text
  placeholder: 'Keyframes'
  bind: h2
keyframes:
  label: 关键帧数据（格式：label|time|position; ...）
  type: data
  placeholder: 'fill|0ms|0;check|80ms|13;strike|120ms|20;confetti|200ms|33;collapse|600ms|100'
specContent:
  label: 规范内容（Markdown 表格或段落）
  type: content
  bind: content
  description: swatch/spacing/radius 变体用于直接渲染 Markdown 规范内容
```

## HTML

```html
<div class="comp-design-spec" data-section="design-spec" data-variant="{{variant}}">
  <!-- variant: swatch -->
  <div class="ds-swatch">
    <div class="ds-swatch-group" data-slot="swatchGroup"></div>
    <div class="ds-swatch-body">
      <div class="ds-swatch-chip" data-slot="swatchColor" data-slot-type="data"></div>
      <span class="ds-swatch-hex" data-slot="swatchHex"></span>
      <span class="ds-swatch-token" data-slot="swatchToken"></span>
    </div>
  </div>

  <!-- variant: spacing -->
  <div class="ds-spacing" data-slot="spSize" data-slot-type="data">
    <div class="ds-spacing-item">
      <div class="ds-spacing-bar"></div>
      <div class="ds-spacing-label"></div>
    </div>
  </div>

  <!-- variant: radius -->
  <div class="ds-radius" data-slot="rsValue" data-slot-type="data">
    <div class="ds-radius-lbl">
      <span data-slot="rsToken"></span>
      <span data-slot="rsDetail"></span>
    </div>
  </div>
  <div style="display:none" data-slot="rsType" data-slot-type="data"></div>

  <!-- variant: keyframe -->
  <section class="ds-keyframe">
    <h2 data-slot="keyframeTitle"></h2>
    <div class="ds-kf-track" data-slot="keyframes" data-slot-type="data">
      <div class="ds-kf-key">
        <em class="ds-kf-label"></em>
        <span class="ds-kf-time"></span>
      </div>
    </div>
  </section>

  <!-- 通用内容区：swatch/spacing/radius/keyframe 均可用 specContent 传入 Markdown 内容 -->
  <div class="ds-spec-content" data-slot="specContent" data-slot-type="content"></div>
</div>
```

## CSS

```css
/* ===== 变体隔离：只显示当前 variant 对应的 pane ===== */
.comp-design-spec .ds-swatch,
.comp-design-spec .ds-spacing,
.comp-design-spec .ds-radius,
.comp-design-spec .ds-keyframe {
  display: none;
}
.comp-design-spec[data-variant="swatch"] .ds-swatch { display: block; }
.comp-design-spec[data-variant="spacing"] .ds-spacing { display: block; }
.comp-design-spec[data-variant="radius"] .ds-radius { display: block; }
.comp-design-spec[data-variant="keyframe"] .ds-keyframe { display: block; }

.comp-design-spec {
  background: transparent;
}

/* ===== variant: swatch ===== */
.comp-design-spec .ds-swatch {
  margin-bottom: 28px;
}
.comp-design-spec .ds-swatch-group {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gray-500);
  margin-bottom: 12px;
}
.comp-design-spec .ds-swatch-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.comp-design-spec .ds-swatch-chip {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: var(--border);
  margin-bottom: 8px;
}
.comp-design-spec .ds-swatch-chip.no-border {
  border-color: transparent;
}
.comp-design-spec .ds-swatch-hex {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-700);
  display: block;
}
.comp-design-spec .ds-swatch-token {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  display: block;
}

/* ===== variant: spacing ===== */
.comp-design-spec[data-variant="spacing"] .ds-spacing {
  display: flex;
  align-items: flex-end;
  gap: 28px;
  padding: 28px 24px;
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  overflow-x: auto;
}
.comp-design-spec .ds-spacing-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.comp-design-spec .ds-spacing-bar {
  background: var(--clay);
  border-radius: 3px;
  height: 14px;
}
.comp-design-spec .ds-spacing-label {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-700);
  text-align: center;
}
.comp-design-spec .ds-spacing-label span {
  display: block;
  color: var(--gray-500);
}

/* ===== variant: radius ===== */
.comp-design-spec[data-variant="radius"] .ds-radius {
  display: flex;
  align-items: flex-end;
  padding: 10px 12px;
  background: var(--oat);
  border: var(--border);
  flex-shrink: 0;
}
.comp-design-spec .ds-radius.is-shadow {
  width: 160px;
  height: 96px;
  background: var(--white);
  border-radius: var(--radius-panel);
  border: none;
  padding: 12px 14px;
}
.comp-design-spec .ds-radius.is-radius {
  width: 120px;
  height: 88px;
}
.comp-design-spec .ds-radius-lbl {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-700);
}
.comp-design-spec .ds-radius-lbl span {
  display: block;
  color: var(--gray-500);
}

/* ===== variant: keyframe ===== */
.comp-design-spec[data-variant="keyframe"] .ds-keyframe {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 22px 22px 30px;
}
.comp-design-spec .ds-keyframe h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 16px;
  margin: 0 0 18px;
  color: var(--slate);
}
.comp-design-spec .ds-kf-track {
  position: relative;
  height: 2px;
  background: var(--gray-300);
  margin: 20px 8px 0;
}
.comp-design-spec .ds-kf-key {
  position: absolute;
  top: -5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--clay);
  border: 1.5px solid var(--white);
  box-shadow: 0 0 0 1.5px var(--clay);
  transform: translateX(-50%);
}
.comp-design-spec .ds-kf-key.is-last {
  background: var(--olive);
  box-shadow: 0 0 0 1.5px var(--olive);
}
.comp-design-spec .ds-kf-key .ds-kf-time {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--gray-700);
}
.comp-design-spec .ds-kf-key .ds-kf-label {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-style: normal;
  font-size: 11px;
  color: var(--gray-500);
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-design-spec').forEach(function(el) {
  var variant = el.getAttribute('data-variant');

  if (variant === 'swatch') {
    var chip = el.querySelector('[data-slot="swatchColor"]');
    var borderSlot = el.querySelector('[data-slot="swatchBorder"]');
    if (chip) {
      var color = (chip.textContent || '').trim();
      if (color) {
        chip.style.background = color;
      }
    }
    if (borderSlot) {
      var val = (borderSlot.textContent || '').trim().toLowerCase();
      if (/^(no|false|0|hide)$/.test(val)) {
        if (chip) chip.classList.add('no-border');
      }
    }
  }

  if (variant === 'spacing') {
    var sizeSlot = el.querySelector('[data-slot="spSize"]');
    var tokenSlot = el.querySelector('[data-slot="spToken"]');
    var sizes = (sizeSlot ? sizeSlot.textContent : '').split(',').map(function(v) { return v.trim(); }).filter(Boolean);
    var tokens = (tokenSlot ? tokenSlot.textContent : '').split(',').map(function(v) { return v.trim(); }).filter(Boolean);
    var container = el.querySelector('.ds-spacing');
    if (!container) return;
    container.innerHTML = '';
    var maxLen = Math.max(sizes.length, tokens.length);
    for (var i = 0; i < maxLen; i++) {
      var size = sizes[i] || '';
      var token = tokens[i] || '';
      var item = document.createElement('div');
      item.className = 'ds-spacing-item';
      item.innerHTML = '<div class="ds-spacing-bar" style="width:' + size + 'px"></div><div class="ds-spacing-label">' + size + (token ? '<span>' + token + '</span>' : '') + '</div>';
      container.appendChild(item);
    }
  }

  if (variant === 'radius') {
    var typeSlot = el.querySelector('[data-slot="rsType"]');
    var valueSlot = el.querySelector('[data-slot="rsValue"]');
    var radiusEl = el.querySelector('.ds-radius');
    if (!radiusEl || !valueSlot) return;
    var isShadow = /^(shadow)$/i.test((typeSlot ? typeSlot.textContent : '').trim());
    radiusEl.classList.add(isShadow ? 'is-shadow' : 'is-radius');
    var val = (valueSlot.textContent || '').trim();
    if (val) {
      radiusEl.style[isShadow ? 'boxShadow' : 'borderRadius'] = val;
    }
  }

  if (variant === 'keyframe') {
    var dataSlot = el.querySelector('[data-slot="keyframes"]');
    var track = el.querySelector('.ds-kf-track');
    if (!dataSlot || !track) return;
    var entries = (dataSlot.textContent || '').split(';').map(function(e) { return e.trim(); }).filter(Boolean);
    track.innerHTML = '';
    entries.forEach(function(entry, idx) {
      var parts = entry.split('|').map(function(p) { return p.trim(); });
      var label = parts[0] || '';
      var time = parts[1] || '';
      var pos = parts[2] || '0';
      var isLast = idx === entries.length - 1;
      var key = document.createElement('div');
      key.className = 'ds-kf-key' + (isLast ? ' is-last' : '');
      key.style.left = pos + '%';
      key.innerHTML = '<em class="ds-kf-label">' + label + '</em><span class="ds-kf-time">' + time + '</span>';
      track.appendChild(key);
    });
  }
  });
})();
```

## Sample

```markdown
<!-- @use design-spec variant=swatch -->

<!-- @slot:swatchGroup -->Primary<!-- @/slot -->
<!-- @slot:swatchColor -->#D97757<!-- @/slot -->
<!-- @slot:swatchHex -->#D97757<!-- @/slot -->
<!-- @slot:swatchToken -->--clay<!-- @/slot -->

---

<!-- @use design-spec variant=spacing -->

<!-- @slot:spSize -->4,8,12,16,24,32,48,64<!-- @/slot -->
<!-- @slot:spToken -->--sp-1,--sp-2,--sp-3,--sp-4,--sp-5,--sp-6,--sp-7,--sp-8<!-- @/slot -->

---

<!-- @use design-spec variant=radius -->

<!-- @slot:rsType -->radius<!-- @/slot -->
<!-- @slot:rsValue -->12px<!-- @/slot -->
<!-- @slot:rsToken -->--r-md<!-- @/slot -->

---

<!-- @use design-spec variant=keyframe -->

<!-- @slot:keyframeTitle -->Keyframes<!-- @/slot -->
<!-- @slot:keyframes -->fill|0ms|0;check|80ms|13;strike|120ms|20;confetti|200ms|33;collapse|600ms|100<!-- @/slot -->
```
