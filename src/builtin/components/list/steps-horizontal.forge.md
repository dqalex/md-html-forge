---
id: steps-horizontal
category: list
tags: steps, flow, process, horizontal, onboarding, guide
trust: builtin
defaultVariant: horizontal
description: 流程步骤：横排（horizontal）或竖排（vertical），每步图标 + 标题 + 描述，适合落地页引导流程
whenToUse: 营销页"如何开始"4步流程（横排）; 引导注册/开通的步骤（竖排）; 操作手册的多步骤流程
whenNot: 单步说明（用 callout）; 步骤超过 6 步且描述较长（竖排更合适）
keySlots: stepTitle; stepDesc
---

# 流程步骤

## Variants

- `horizontal` — 横向排列，步骤图标在上、标题+描述在下，步骤间有箭头连接
- `vertical` — 竖向排列，左侧序号圆圈 + 右侧内容，适合移动端或步骤较多场景

## Slots

```yaml
stepIcon:
  label: 步骤图标（emoji 或文字，可留空用序号代替）
  type: data
  placeholder: |
    🏪
    📦
    🎯
    💰
  description: 每行对应一个步骤的图标；行数决定步骤数
stepTitle:
  label: 步骤标题
  type: data
  placeholder: |
    开通店铺
    选品上架
    营销推广
    收益提现
  description: 每行对应一个步骤标题，行数需与 stepIcon 一致
stepDesc:
  label: 步骤描述（可选）
  type: data
  placeholder: |
    一键入驻，快速审核
    海量优质商品供选择
    智能推广工具助力引流
    T+1 快速结算到账
  description: 每行对应一个步骤描述
stepSectionTitle:
  label: 区块总标题（可选）
  type: text
  placeholder: 4 步入驻，轻松享受红利
  bind: h2
```

## HTML

```html
<div class="comp-steps-horizontal" data-section="steps-horizontal" data-variant="{{variant}}">
  <h2 class="sh-section-title" data-slot="stepSectionTitle"></h2>
  <div class="sh-track">
    <!-- steps injected by JS -->
    <div class="sh-raw-icon" data-slot="stepIcon" data-slot-type="data" style="display:none"></div>
    <div class="sh-raw-title" data-slot="stepTitle" data-slot-type="data" style="display:none"></div>
    <div class="sh-raw-desc" data-slot="stepDesc" data-slot-type="data" style="display:none"></div>
  </div>
</div>
```

## CSS

```css
.comp-steps-horizontal {
  font-family: var(--sans);
  padding: 8px 0;
}

.comp-steps-horizontal .sh-section-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--slate);
  text-align: center;
  margin: 0 0 24px;
}
.comp-steps-horizontal .sh-section-title:empty { display: none; }

/* ===== horizontal ===== */
.comp-steps-horizontal[data-variant="horizontal"] .sh-track {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;
}

.comp-steps-horizontal .sh-step {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 8px;
  position: relative;
}

/* 步骤间箭头（horizontal only） */
.comp-steps-horizontal[data-variant="horizontal"] .sh-step:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -12px;
  top: 20px;
  color: var(--clay);
  font-size: 18px;
  font-weight: 700;
}

.comp-steps-horizontal .sh-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--oat, #E3DACC);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.comp-steps-horizontal .sh-step-num {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--clay);
}

.comp-steps-horizontal .sh-step-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--slate);
  margin: 0 0 4px;
}

.comp-steps-horizontal .sh-step-desc {
  font-size: 12px;
  color: var(--gray-500);
  line-height: 1.5;
}

/* ===== vertical ===== */
.comp-steps-horizontal[data-variant="vertical"] .sh-track {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.comp-steps-horizontal[data-variant="vertical"] .sh-step {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
  max-width: 100%;
  padding: 0 0 24px;
  position: relative;
}

/* 竖向连接线 */
.comp-steps-horizontal[data-variant="vertical"] .sh-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 27px;
  top: 56px;
  bottom: 0;
  width: 2px;
  background: var(--gray-300);
}

.comp-steps-horizontal[data-variant="vertical"] .sh-icon-wrap {
  flex-shrink: 0;
  margin-bottom: 0;
}

.comp-steps-horizontal[data-variant="vertical"] .sh-step-content {
  flex: 1;
  padding-top: 14px;
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-steps-horizontal').forEach(function(el) {
    var iconRaw  = el.querySelector('.sh-raw-icon');
    var titleRaw = el.querySelector('.sh-raw-title');
    var descRaw  = el.querySelector('.sh-raw-desc');
    var track = el.querySelector('.sh-track');
    if (!track) return;

    function lines(el) {
      if (!el) return [];
      return el.textContent.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    }

    var icons  = lines(iconRaw);
    var titles = lines(titleRaw);
    var descs  = lines(descRaw);
    var count  = Math.max(icons.length, titles.length);
    if (count === 0) return;

    // 清除原始 hidden 节点
    [iconRaw, titleRaw, descRaw].forEach(function(n){ if (n) n.remove(); });

    for (var i = 0; i < count; i++) {
      var step = document.createElement('div');
      step.className = 'sh-step';

      var iconWrap = document.createElement('div');
      iconWrap.className = 'sh-icon-wrap';
      if (icons[i]) {
        iconWrap.textContent = icons[i];
      } else {
        var num = document.createElement('span');
        num.className = 'sh-step-num';
        num.textContent = String(i + 1);
        iconWrap.appendChild(num);
      }
      step.appendChild(iconWrap);

      var content = document.createElement('div');
      content.className = 'sh-step-content';

      if (titles[i]) {
        var t = document.createElement('div');
        t.className = 'sh-step-title';
        t.textContent = titles[i];
        content.appendChild(t);
      }
      if (descs[i]) {
        var d = document.createElement('div');
        d.className = 'sh-step-desc';
        d.textContent = descs[i];
        content.appendChild(d);
      }
      step.appendChild(content);
      track.appendChild(step);
    }
  });
})();
```
