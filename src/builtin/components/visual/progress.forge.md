---
id: progress
category: visual
tags: progress, status, rollout, tracking
trust: builtin
defaultVariant: bars
---

# 进度展示

## Variants

- `bars` — 多行进度条列表：标题 + 百分比 + 进度条 + 备注
- `item` — 单个进度条：标题 + 百分比 + 进度条 + 备注说明
- `rollout` — 分阶段灰度发布：时间 + 百分比 + 描述的水平步骤条

## Slots

```yaml
barsHeading:
  label: 区块标题
  type: text
  placeholder: In Progress
barsItems:
  label: 进度（每行：标题|百分比|说明）
  type: data
  placeholder: '功能开发|70%|核心完成\n测试覆盖|35%|单测通过'
itemTitle:
  label: 标题
  type: text
  placeholder: Recurring tasks engine
  bind: h3
itemPct:
  label: 完成百分比
  type: text
  placeholder: '~70%'
itemNote:
  label: 备注说明
  type: content
  placeholder: 剩余工作说明...
rolloutHeading:
  label: 区块标题
  type: text
  placeholder: Rollout
rolloutSteps:
  label: 阶段（每行：when|pct|描述）
  type: data
  placeholder: 'Day 0|internal|仅团队\nDay 2|10%|抽样\nDay 4|100%|全量'
```

## HTML

```html
<div class="comp-progress" data-section="progress" data-variant="{{variant}}">
  <!-- variant: bars -->
  <div class="cp-bars">
    <h2 data-slot="barsHeading"></h2>
    <hr class="cp-rule">
    <ul data-slot="barsItems" data-slot-type="data"></ul>
  </div>

  <!-- variant: item -->
  <div class="cp-item">
    <div class="cp-item-head">
      <h3 data-slot="itemTitle"></h3>
      <span class="cp-item-pct" data-slot="itemPct"></span>
    </div>
    <div class="cp-item-track">
      <div class="cp-item-fill"></div>
    </div>
    <div class="cp-item-note" data-slot="itemNote" data-slot-type="content"></div>
  </div>

  <!-- variant: rollout -->
  <div class="cp-rollout">
    <h2 data-slot="rolloutHeading"></h2>
    <div class="cp-rollout-steps" data-slot="rolloutSteps" data-slot-type="data"></div>
  </div>
</div>
```

## CSS

```css
.comp-progress {
  background: transparent;
}

/* ===== variant: bars ===== */
.comp-progress .cp-bars {
  margin-bottom: 40px;
}
.comp-progress .cp-bars h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 22px;
  margin: 0 0 8px;
  color: var(--slate);
}
.comp-progress .cp-rule {
  border: none;
  border-top: 1.5px solid var(--gray-100);
  margin: 0 0 12px;
}
.comp-progress .cp-bars ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 12px 0 0;
}
.comp-progress .cp-bars li {
  display: block;
}
.comp-progress .cp-bars .prog-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.comp-progress .cp-bars .prog-title {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  color: var(--slate);
}
.comp-progress .cp-bars .prog-pct {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
}
.comp-progress .cp-bars .prog-track {
  width: 100%;
  height: 5px;
  background: var(--gray-100);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}
.comp-progress .cp-bars .prog-fill {
  height: 100%;
  background: var(--clay);
  border-radius: 3px;
}
.comp-progress .cp-bars .prog-note {
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray-700);
}

/* ===== variant: item ===== */
.comp-progress .cp-item {
  margin-bottom: 40px;
}
.comp-progress .cp-item:last-child {
  margin-bottom: 0;
}
.comp-progress .cp-item-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}
.comp-progress .cp-item-head h3 {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: var(--slate);
}
.comp-progress .cp-item-pct {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
}
.comp-progress .cp-item-track {
  width: 100%;
  height: 5px;
  background: var(--gray-100);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}
.comp-progress .cp-item-fill {
  height: 100%;
  background: var(--clay);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.comp-progress .cp-item-note {
  font-size: 13px;
  line-height: 1.55;
  color: var(--gray-700);
}

/* ===== variant: rollout ===== */
.comp-progress .cp-rollout {
  margin-bottom: 40px;
}
.comp-progress .cp-rollout h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 22px;
  margin: 0 0 14px;
  color: var(--slate);
}
.comp-progress .cp-rollout-steps {
  display: flex;
  gap: 0;
}
.comp-progress .cp-rollout-steps .step {
  flex: 1;
  background: var(--white);
  border: var(--border);
  padding: 16px 18px;
}
.comp-progress .cp-rollout-steps .step:first-child {
  border-radius: 12px 0 0 12px;
}
.comp-progress .cp-rollout-steps .step:last-child {
  border-radius: 0 12px 12px 0;
}
.comp-progress .cp-rollout-steps .step + .step {
  border-left: none;
}
.comp-progress .cp-rollout-steps .pct {
  font-family: var(--mono);
  font-size: 22px;
  font-weight: 600;
  color: var(--clay);
  margin-bottom: 6px;
}
.comp-progress .cp-rollout-steps .when {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.comp-progress .cp-rollout-steps .d {
  font-size: 13px;
  color: var(--gray-500);
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-progress').forEach(function(el) {
  var variant = el.getAttribute('data-variant');
  var esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  if (variant === 'bars') {
    var itemsEl = el.querySelector('[data-slot="barsItems"]');
    if (itemsEl && itemsEl.textContent) {
      var lines = itemsEl.textContent.split('\n').map(v => v.trim()).filter(Boolean);
      itemsEl.innerHTML = lines.map(function(line) {
        var parts = line.split('|').map(v => v.trim());
        var title = parts[0];
        var pct = parts[1] || '';
        var note = parts[2] || '';
        if (!title) return '';
        var numPct = Math.max(0, Math.min(100, parseInt(pct) || 0));
        return `<li>
          <div class="prog-head">
            <span class="prog-title">${esc(title)}</span>
            ${pct ? `<span class="prog-pct">${esc(pct)}</span>` : ''}
          </div>
          <div class="prog-track"><div class="prog-fill" style="width:${numPct}%"></div></div>
          ${note ? `<p class="prog-note">${esc(note)}</p>` : ''}
        </li>`;
      }).join('');
    }
  }

  if (variant === 'item') {
    var pctEl = el.querySelector('[data-slot="itemPct"]');
    if (pctEl) {
      var pctRaw = (pctEl.textContent || '').trim();
      var match = pctRaw.match(/(\d+)/);
      var width = match ? match[1] : '0';
      var fillEl = el.querySelector('.cp-item-fill');
      if (fillEl) fillEl.style.width = width + '%';
    }
  }

  if (variant === 'rollout') {
    var stepsEl = el.querySelector('[data-slot="rolloutSteps"]');
    if (stepsEl && stepsEl.textContent) {
      var lines = stepsEl.textContent.split('\n').map(v => v.trim()).filter(Boolean);
      stepsEl.innerHTML = lines.map(function(line) {
        var parts = line.split('|').map(v => v.trim());
        var when = parts[0] || '';
        var pct = parts[1] || '';
        var d = parts[2] || '';
        if (!when && !pct && !d) return '';
        return `<div class="step">${when ? `<div class="when">${esc(when)}</div>` : ''}${pct ? `<div class="pct">${esc(pct)}</div>` : ''}${d ? `<div class="d">${esc(d)}</div>` : ''}</div>`;
      }).join('');
    }
  }
  });
})();
```

## Sample

```markdown
<!-- @use progress variant=bars -->

<!-- @slot:barsHeading -->In Progress<!-- @/slot -->

<!-- @slot:barsItems -->
组件库 Core 20|100%|已完成，可用于组合
组件库扩展到 40+|45%|进行中，优先补齐 chip/callout/flow
组件浏览器搜索 & 多选|25%|原型已跑通，待打磨
模板导入/导出|0%|设计阶段
<!-- @/slot -->

---

<!-- @use progress variant=item -->

<!-- @slot:itemTitle -->Recurring tasks engine<!-- @/slot -->
<!-- @slot:itemPct -->~70%<!-- @/slot -->

<!-- @slot:itemNote -->
Scheduler and RRULE parsing are done; remaining work is the timezone edge cases and the "skip holidays" toggle.
<!-- @/slot -->

---

<!-- @use progress variant=rollout -->

<!-- @slot:rolloutHeading -->Rollout Plan<!-- @/slot -->

<!-- @slot:rolloutSteps -->
Day 0|internal|仅团队，观察 30 min
Day 1|5%|抽样用户，错误率 < 0.1%
Day 3|30%|扩大样本，p95 不劣化
Day 5|100%|全量切换，保留 flag 一周
<!-- @/slot -->
```
