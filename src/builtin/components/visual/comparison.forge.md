---
id: comparison
category: visual
tags: comparison, before-after, options, mockup, decision
trust: builtin
defaultVariant: ba
---

# 对比展示

## Variants

- `ba` — 前后对比：左右两栏卡片，Before / After 对比
- `options` — 方案对比：决策问题 + 上下文 + 选项 chip 列表（首项高亮）
- `mockup` — 设计预览：标签 + 预览区 + 设计理由说明

## Slots

```yaml
baBefore:
  label: Before 内容
  type: content
  placeholder: '- 旧方式 1\n- 旧方式 2'
baAfter:
  label: After 内容
  type: content
  placeholder: '- 新方式 1\n- 新方式 2'
optionTitle:
  label: 决策问题
  type: text
  placeholder: 本周是否发布？
optionContext:
  label: 上下文
  type: content
  placeholder: 提前发布 → X 收益，但有 Y 风险...
optionItems:
  label: 选项（每行一个，第一项默认高亮）
  type: data
  placeholder: 'A — 本周发布\nB — 推迟到下版本'
mockupLabel:
  label: 方案标签
  type: text
  placeholder: A — Minimal
  bind: h3
mockupPreview:
  label: 预览内容
  type: content
  placeholder: 方案预览区域
mockupRationale:
  label: 设计理由
  type: content
  placeholder: 解释为什么选择这个方向...
```

## HTML

```html
<div class="comp-comparison" data-section="comparison" data-variant="{{variant}}">
  <!-- variant: ba -->
  <div class="cp-ba" data-ba-view="both">
    <div class="cp-ba-tabs" data-no-jump>
      <button type="button" class="cp-ba-tab" data-ba-target="both">并排</button>
      <button type="button" class="cp-ba-tab" data-ba-target="before">Before</button>
      <button type="button" class="cp-ba-tab" data-ba-target="after">After</button>
    </div>
    <div class="cp-ba-grid">
      <div class="cp-ba-panel cp-ba-before">
        <div class="cp-ba-key">Before</div>
        <div data-slot="baBefore" data-slot-type="content"></div>
      </div>
      <div class="cp-ba-panel cp-ba-after">
        <div class="cp-ba-key">After</div>
        <div data-slot="baAfter" data-slot-type="content"></div>
      </div>
    </div>
  </div>

  <!-- variant: options -->
  <div class="cp-options">
    <div class="cp-options-card">
      <div class="cp-options-q" data-slot="optionTitle"></div>
      <div class="cp-options-ctx" data-slot="optionContext" data-slot-type="content"></div>
      <div class="cp-options-chips" data-slot="optionItems" data-slot-type="data" data-no-jump></div>
    </div>
  </div>

  <!-- variant: mockup -->
  <div class="cp-mockup">
    <span class="cp-mockup-tag" data-slot="mockupLabel"></span>
    <div class="cp-mockup-stage" data-slot="mockupPreview" data-slot-type="content"></div>
    <div class="cp-mockup-rationale" data-slot="mockupRationale" data-slot-type="content"></div>
  </div>
</div>
```

## CSS

```css
.comp-comparison {
  background: transparent;
}

/* ===== variant: ba ===== */
.comp-comparison .cp-ba {
  margin: 22px 0 40px;
}
.comp-comparison .cp-ba-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.comp-comparison .cp-ba-tab {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-500);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.comp-comparison .cp-ba-tab:hover { color: var(--slate); }
.comp-comparison .cp-ba-tab.active {
  background: var(--slate);
  color: var(--ivory);
  border-color: var(--slate);
}
.comp-comparison .cp-ba-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  /* 关键：让 grid 子项在内容超长（宽代码块 / 超长单词）时允许收缩，
     否则 <pre> 会把单元格撑爆 → 整体横向溢出父容器。
     CSS grid 的 auto tracks 默认 min-width 是 auto（内容宽），要显式设 0。 */
  min-width: 0;
}
.comp-comparison .cp-ba[data-ba-view="before"] .cp-ba-grid { grid-template-columns: 1fr; }
.comp-comparison .cp-ba[data-ba-view="after"]  .cp-ba-grid { grid-template-columns: 1fr; }
.comp-comparison .cp-ba[data-ba-view="before"] .cp-ba-after  { display: none; }
.comp-comparison .cp-ba[data-ba-view="after"]  .cp-ba-before { display: none; }
.comp-comparison .cp-ba-panel {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 18px 20px;
  /* 同上：面板自身也要允许收缩。同时给超宽子内容（如 <pre>）提供横向滚动容器，
     避免撑爆整个对比布局。 */
  min-width: 0;
  overflow: hidden;
}
/* pre / code / table 这类天然宽度大的内容，在 ba 面板里统一给横向滚动 */
.comp-comparison .cp-ba-panel pre,
.comp-comparison .cp-ba-panel table {
  max-width: 100%;
  overflow-x: auto;
}
.comp-comparison .cp-ba-panel pre code {
  /* 放宽换行：代码行过长时优先横向滚动，而非强制换行破坏代码结构 */
  white-space: pre;
}
.comp-comparison .cp-ba-panel.cp-ba-after {
  border-color: var(--olive);
}
.comp-comparison .cp-ba-key {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  margin-bottom: 10px;
}
.comp-comparison .cp-ba-after .cp-ba-key {
  color: var(--olive);
}
.comp-comparison .cp-ba-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.comp-comparison .cp-ba-panel li {
  padding-left: 14px;
  position: relative;
  line-height: 1.65;
  margin-bottom: 6px;
  font-size: 14px;
}
.comp-comparison .cp-ba-panel li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: var(--gray-500);
}
.comp-comparison .cp-ba-after li::before {
  color: var(--olive);
}

/* ===== variant: options ===== */
.comp-comparison .cp-options {
  margin-bottom: 40px;
}
.comp-comparison .cp-options-card {
  border: 1.5px solid var(--clay);
  border-radius: 14px;
  padding: 28px 32px;
  background: color-mix(in srgb, var(--clay) 4%, transparent);
}
.comp-comparison .cp-options-q {
  font-family: var(--serif);
  font-size: 22px;
  line-height: 1.4;
  margin-bottom: 10px;
  color: var(--slate);
}
.comp-comparison .cp-options-ctx {
  font-size: 14px;
  line-height: 1.65;
  color: var(--gray-700);
  margin-bottom: 20px;
}
.comp-comparison .cp-options-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.comp-comparison .cp-options-chips .cp-chip {
  font-family: var(--mono);
  font-size: 12px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--gray-300);
  color: var(--gray-700);
  background: var(--white);
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.comp-comparison .cp-options-chips .cp-chip:hover {
  transform: translateY(-1px);
  border-color: var(--clay);
}
.comp-comparison .cp-options-chips .cp-chip.primary {
  border-color: var(--clay);
  color: var(--clay);
  background: color-mix(in srgb, var(--clay) 6%, transparent);
}

/* ===== variant: mockup ===== */
.comp-comparison .cp-mockup {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 20px;
  position: relative;
}
.comp-comparison .cp-mockup-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  background: var(--oat);
  color: var(--slate);
  padding: 4px 10px;
  border-radius: 8px;
  z-index: 2;
}
.comp-comparison .cp-mockup-stage {
  min-height: 280px;
  border-radius: 8px;
  border: var(--border);
  background: var(--ivory);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
}
.comp-comparison .cp-mockup-rationale {
  margin-top: 16px;
  font-size: 13px;
  color: var(--gray-500);
  line-height: 1.5;
}
```

## JS

```js
function mount(el, api) {
  var variant = el.getAttribute('data-variant');
  var esc = function(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  };

  // ============ variant: ba — Before/After Tab 切换 ============
  if (variant === 'ba') {
    var baEl = el.querySelector('.cp-ba');
    if (!baEl) return;
    var tabs = el.querySelectorAll('.cp-ba-tab');
    var setView = function(view) {
      baEl.setAttribute('data-ba-view', view);
      tabs.forEach(function(t) {
        t.classList.toggle('active', t.getAttribute('data-ba-target') === view);
      });
      api.state.set('view', view);
    };
    var saved = api.state.get('view', 'both');
    setView(['both', 'before', 'after'].indexOf(saved) >= 0 ? saved : 'both');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function(e) {
        e.stopPropagation();
        setView(tab.getAttribute('data-ba-target') || 'both');
      });
    });
    return;
  }

  // ============ variant: options — chip 可点切 active ============
  if (variant === 'options') {
    var chipsEl = el.querySelector('[data-slot="optionItems"]');
    if (!chipsEl) return;
    // 缓存原始数据：第一次 mount 时 textContent 是原始多行；
    // 之后 innerHTML 被替换为 button，textContent 不再可解析，从 dataset 读回。
    var rawLines = chipsEl.dataset.optsRaw;
    if (rawLines === undefined) {
      rawLines = chipsEl.textContent || '';
      chipsEl.dataset.optsRaw = rawLines;
    }
    var lines = rawLines.split('\n').map(function(v){return v.trim();}).filter(Boolean);
    if (lines.length === 0) return;
    var savedIdx = parseInt(api.state.get('activeIdx', '0'), 10) || 0;
    chipsEl.innerHTML = lines.map(function(line, i) {
      return '<button type="button" class="cp-chip' + (i === savedIdx ? ' primary' : '') + '" data-chip-idx="' + i + '">' + esc(line) + '</button>';
    }).join('');
    var chips = chipsEl.querySelectorAll('.cp-chip');
    chips.forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(chip.getAttribute('data-chip-idx') || '0', 10);
        chips.forEach(function(c, i) { c.classList.toggle('primary', i === idx); });
        api.state.set('activeIdx', String(idx));
        api.emit('option-select', { index: idx, label: lines[idx] });
      });
    });
    return;
  }
}
```

## Sample

```markdown
<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
- 所有组件挤在 catalog.ts 一个 800 行文件里
- 新增组件要到唯一文件找插入位置
- Git diff 范围大，多人协作容易冲突
<!-- @/slot -->

<!-- @slot:baAfter -->
- 一个组件 = 一个文件，路径即类目
- `defineComponent` 工厂统一签名，模板化新增
- 类目 `index.ts` 只做 import + 数组聚合
<!-- @/slot -->

---

<!-- @use comparison variant=options -->

<!-- @slot:optionTitle -->是否继续拆分到 122 个组件？<!-- @/slot -->

<!-- @slot:optionContext -->
当前 20 个核心组件已覆盖 80% 文档场景，但 html-effectiveness 里还有 100+ 个小众视觉模式未实现。
<!-- @/slot -->

<!-- @slot:optionItems -->
A — 推进到 122 个，作为长期目标
B — 停在 20-40 个，保持精炼
C — 允许模板提供 customComponents，用户自选扩展
<!-- @/slot -->

---

<!-- @use comparison variant=mockup -->

<!-- @slot:mockupLabel -->A — Minimal<!-- @/slot -->

<!-- @slot:mockupPreview -->
纯排版，单一安静的行动点
<!-- @/slot -->

<!-- @slot:mockupRationale -->
纯排版、单一安静行动点。读起来沉稳自信；假定周围 UI 已承载足够个性。
<!-- @/slot -->
```
