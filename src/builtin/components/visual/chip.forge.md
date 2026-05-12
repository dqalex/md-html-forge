---
id: chip
category: visual
tags: chip, pill, badge, risk, incident, legend
trust: builtin
defaultVariant: risk
---

# 标签芯片

## Variants

- `risk` — 风险等级胶囊：带圆点的 chip，safe / medium / attention 三种等级
- `incident` — 事件标签：圆角 pill，sev / resolved / neutral 三种状态
- `legend` — 图例条：带色块标识的流程图节点类型图例

## Slots

```yaml
riskLabel:
  label: 标签文字
  type: text
  placeholder: useOptimisticTasks.ts
riskLevel:
  label: 风险等级（safe/medium/attention）
  type: text
  placeholder: attention
pillType:
  label: 标签类型（sev/resolved/neutral）
  type: text
  placeholder: neutral
pillKey:
  label: 键名（仅 neutral 类型显示）
  type: text
  placeholder: Duration
pillValue:
  label: 标签值
  type: text
  placeholder: 47 min
legendItems:
  label: 图例项（每行 chipType|label）
  type: data
  placeholder: 'step|process step\ngate|decision\nok|terminal success\nbad|failure path'
```

## HTML

```html
<div class="comp-chip" data-section="chip" data-variant="{{variant}}">
  <!-- variant: risk -->
  <span class="cp-risk">
    <span class="cp-risk-dot"></span>
    <span data-slot="riskLabel"></span>
  </span>

  <!-- variant: incident -->
  <span class="cp-incident">
    <span class="cp-incident-key" data-slot="pillKey"></span>
    <span class="cp-incident-val" data-slot="pillValue"></span>
  </span>

  <!-- variant: legend -->
  <div class="cp-legend" data-slot="legendItems" data-slot-type="data"></div>
</div>
```

## CSS

```css
.comp-chip {
  background: transparent;
}

/* ===== variant: risk ===== */
.comp-chip .cp-risk {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: var(--border);
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--slate);
  text-decoration: none;
  background: var(--white);
  transition: transform 0.12s ease;
}
.comp-chip .cp-risk:hover {
  transform: translateY(-1px);
}
.comp-chip .cp-risk { cursor: pointer; }
.comp-chip .cp-risk.active {
  outline: 2px solid var(--clay);
  outline-offset: 2px;
}
.comp-chip .cp-risk-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.comp-chip .cp-risk.safe {
  background: color-mix(in srgb, var(--olive) 10%, transparent);
  border-color: color-mix(in srgb, var(--olive) 45%, transparent);
}
.comp-chip .cp-risk.safe .cp-risk-dot {
  background: var(--olive);
}
.comp-chip .cp-risk.medium {
  background: var(--oat);
}
.comp-chip .cp-risk.medium .cp-risk-dot {
  background: var(--oat);
}
.comp-chip .cp-risk.attention {
  background: color-mix(in srgb, var(--clay) 12%, transparent);
  border-color: color-mix(in srgb, var(--clay) 55%, transparent);
}
.comp-chip .cp-risk.attention .cp-risk-dot {
  background: var(--clay);
}

/* ===== variant: incident ===== */
.comp-chip .cp-incident {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  padding: 5px 12px;
  line-height: 1;
}
.comp-chip .cp-incident-key {
  font-weight: 400;
  opacity: 0.75;
}
.comp-chip .cp-incident-val {
  font-family: var(--mono);
}
.comp-chip .cp-incident.sev {
  background: var(--clay);
  color: var(--white);
  letter-spacing: 0.03em;
}
.comp-chip .cp-incident.resolved {
  background: var(--olive);
  color: var(--white);
}
.comp-chip .cp-incident.neutral {
  background: var(--gray-100);
  color: var(--gray-700);
  border: var(--border);
}

/* ===== variant: legend ===== */
.comp-chip .cp-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  font-size: 12px;
  color: var(--gray-700);
}
.comp-chip .cp-legend .le-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.comp-chip .cp-legend .le-item:hover {
  background: var(--gray-100);
}
.comp-chip .cp-legend .le-item.active {
  background: color-mix(in srgb, var(--clay) 10%, transparent);
  border-color: var(--clay);
  color: var(--clay);
}
.comp-chip .cp-legend .le-chip {
  display: inline-block;
  width: 22px;
  height: 14px;
  border: 1.5px solid var(--gray-300);
  border-radius: 4px;
  background: var(--white);
  flex-shrink: 0;
}
.comp-chip .cp-legend .le-chip.gate {
  transform: rotate(45deg);
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
.comp-chip .cp-legend .le-chip.ok {
  background: var(--gray-100);
  border-color: var(--olive);
}
.comp-chip .cp-legend .le-chip.bad {
  background: var(--gray-100);
  border-color: var(--rust);
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-chip').forEach(function(el) {
  var variant = el.getAttribute('data-variant');
  var esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  if (variant === 'risk') {
    var riskEl = el.querySelector('[data-slot="riskLevel"]');
    var chipEl = el.querySelector('.cp-risk');
    if (riskEl && chipEl) {
      var risk = (riskEl.textContent || '').trim().toLowerCase();
      var valid = ['safe', 'medium', 'attention'];
      if (valid.includes(risk)) {
        chipEl.classList.add(risk);
      }
    }
    // 点击切 active（视觉强调，本组件作为 chip 有时用于筛选输入）
    if (chipEl) {
      chipEl.setAttribute('role', 'button');
      chipEl.setAttribute('tabindex', '0');
      chipEl.setAttribute('data-no-jump', '1');
      var active = api.state.get('active', false) === true;
      chipEl.classList.toggle('active', active);
      chipEl.addEventListener('click', function(e) {
        e.stopPropagation();
        var next = !chipEl.classList.contains('active');
        chipEl.classList.toggle('active', next);
        api.state.set('active', next);
        var riskLabelEl = el.querySelector('[data-slot="riskLabel"]');
        api.emit('chip-toggle', { active: next, label: riskLabelEl ? (riskLabelEl.textContent || '').trim() : '' });
      });
    }
  }

  if (variant === 'incident') {
    var typeEl = el.querySelector('[data-slot="pillType"]');
    var chipEl = el.querySelector('.cp-incident');
    if (chipEl) {
      var type = typeEl ? (typeEl.textContent || '').trim().toLowerCase() : '';
      var typeClass = (type === 'sev' || type === 'resolved' || type === 'neutral') ? type : 'neutral';
      chipEl.classList.add(typeClass);
    }
  }

  if (variant === 'legend') {
    var itemsEl = el.querySelector('[data-slot="legendItems"]');
    if (itemsEl && itemsEl.textContent) {
      var lines = itemsEl.textContent.split('\n').filter(l => l.trim());
      itemsEl.setAttribute('data-no-jump', '1');
      itemsEl.innerHTML = lines.map(function(line, idx) {
        var [rawType, ...rest] = line.split('|');
        var chipType = rawType.trim().toLowerCase();
        var label = rest.join('|').trim();
        var chipClass =
          chipType === 'gate' ? 'le-chip gate' :
          chipType === 'ok' ? 'le-chip ok' :
          chipType === 'bad' ? 'le-chip bad' :
          'le-chip';
        return `<button type="button" class="le-item" data-le-idx="${idx}" data-le-type="${esc(chipType)}"><i class="${chipClass}"></i>${esc(label)}</button>`;
      }).join('');
      // 持久化 active 集合（多选）
      var activeSet = new Set(api.state.get('activeTypes', []) || []);
      var items = itemsEl.querySelectorAll('.le-item');
      var sync = function() {
        items.forEach(function(it) {
          var t = it.getAttribute('data-le-type') || '';
          it.classList.toggle('active', activeSet.has(t));
        });
      };
      sync();
      items.forEach(function(it) {
        it.addEventListener('click', function(e) {
          e.stopPropagation();
          var t = it.getAttribute('data-le-type') || '';
          if (activeSet.has(t)) activeSet.delete(t); else activeSet.add(t);
          api.state.set('activeTypes', Array.from(activeSet));
          sync();
          api.emit('filter-change', { activeTypes: Array.from(activeSet) });
        });
      });
    }
  }
  });
})();
```

## Sample

```markdown
<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->useOptimisticTasks.ts<!-- @/slot -->
<!-- @slot:riskLevel -->attention<!-- @/slot -->

---

<!-- @use chip variant=incident -->

<!-- @slot:pillType -->neutral<!-- @/slot -->
<!-- @slot:pillKey -->Duration<!-- @/slot -->
<!-- @slot:pillValue -->47 min<!-- @/slot -->

---

<!-- @use chip variant=legend -->

<!-- @slot:legendItems -->
step|process step
gate|decision
ok|terminal success
bad|failure path
<!-- @/slot -->
```
