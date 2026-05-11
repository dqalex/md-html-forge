---
id: info-panel
category: card
tags: panel, approach, variant, detail, sample
trust: builtin
defaultVariant: approach
---

# 信息面板

## Variants

- `approach` — 方案对比面板：编号 + 标题 + 代码 + 优劣表格 + 标签
- `variant` — 组件变体展示：标签 + 内嵌卡片 + chips + 用途说明
- `detail` — 详情侧边面板：提示 + 标题 + 元信息 + 正文 + 代码
- `sample` — 样本预览：头部 bar + 客户名 + plan badge + 渲染内容

## Slots

```yaml
approachNum:
  label: 编号
  type: text
  placeholder: '01'
approachTitle:
  label: 方案标题
  type: text
  placeholder: Inline useEffect + setTimeout
  bind: h3
approachDesc:
  label: 方案描述
  type: text
  placeholder: Debounce logic lives directly inside the component.
approachCode:
  label: 代码
  type: content
  placeholder: '```js\nconsole.log("hello")\n```'
approachPros:
  label: 优势（每行一条）
  type: data
  placeholder: |-
    Zero new abstractions to learn
    Easy to step through
approachCons:
  label: 劣势（每行一条）
  type: data
  placeholder: |-
    Logic duplicated everywhere
    Two pieces of state
approachTags:
  label: 标签（每行 key: value）
  type: data
  placeholder: |-
    Bundle impact: +0 kb
    Reuse: low
variantLabel:
  label: 变体标签
  type: text
  placeholder: A · Flat
variantStyle:
  label: 变体类型（flat/outlined/elevated/stripe/inset/horizontal）
  type: text
  placeholder: outlined
avatarText:
  label: 头像缩写
  type: text
  placeholder: WP
cardTitle:
  label: 卡片标题
  type: text
  placeholder: Weekly planning
cardSubtitle:
  label: 卡片副标题
  type: text
  placeholder: 12 tasks · due Friday
cardChips:
  label: 标签（逗号分隔）
  type: text
  placeholder: 'Q2, Roadmap'
cardAction:
  label: 操作按钮文字
  type: text
  placeholder: Open
variantNote:
  label: 用途说明
  type: text
  placeholder: 'best for: default content cards on ivory'
panelHint:
  label: 提示文字（可选）
  type: text
  placeholder: Click a step in the chart →
panelTitle:
  label: 详情标题
  type: text
  placeholder: git push main
panelMeta:
  label: 元信息行（可选）
  type: text
  placeholder: trigger · 0s
panelBody:
  label: 描述正文
  type: content
  placeholder: A push or merge to main fires the deploy workflow...
panelCode:
  label: 代码块（可选）
  type: content
  placeholder: |-
    on:
      push:
        branches: [main]
sampleLabel:
  label: 样本标签
  type: text
  placeholder: SAMPLE 1
sampleName:
  label: 客户名
  type: text
  placeholder: Priya N.
samplePlan:
  label: 计划名称
  type: text
  placeholder: Free
sampleContent:
  label: 渲染内容
  type: content
  placeholder: ''
```

## HTML

```html
<div class="comp-info-panel" data-section="info-panel" data-variant="{{variant}}">
  <!-- variant: approach -->
  <article class="ip-approach">
    <header class="ip-head">
      <h3 data-slot="approachTitle">
        <span class="ip-num" data-slot="approachNum"></span>
      </h3>
      <p class="ip-desc" data-slot="approachDesc"></p>
    </header>
    <div class="ip-code" data-slot="approachCode" data-slot-type="content"></div>
    <div class="ip-tradeoffs">
      <span data-slot="approachPros" data-slot-type="data" hidden></span>
      <span data-slot="approachCons" data-slot-type="data" hidden></span>
    </div>
    <div class="ip-chips" data-slot="approachTags" data-slot-type="data"></div>
  </article>

  <!-- variant: variant -->
  <div class="ip-variant" data-slot-style="variantStyle">
    <span class="ip-vlabel" data-slot="variantLabel"></span>
    <div class="ip-vinner">
      <div class="ip-vhead">
        <div class="ip-vavatar" data-slot="avatarText"></div>
        <div class="ip-vtitles">
          <p class="ip-vtitle" data-slot="cardTitle"></p>
          <p class="ip-vsub" data-slot="cardSubtitle"></p>
        </div>
      </div>
      <div class="ip-vchips" data-slot="cardChips"></div>
      <span class="ip-vaction" data-slot="cardAction"></span>
    </div>
    <p class="ip-vnote" data-slot="variantNote"></p>
    <span data-slot="variantStyle" hidden></span>
  </div>

  <!-- variant: detail -->
  <div class="ip-detail">
    <div class="ip-dhint" data-slot="panelHint"></div>
    <div class="ip-dtitle" data-slot="panelTitle"></div>
    <div class="ip-dmeta" data-slot="panelMeta"></div>
    <div class="ip-dbody" data-slot="panelBody" data-slot-type="content"></div>
    <pre class="ip-dcode" data-slot="panelCode" data-slot-type="content"></pre>
  </div>

  <!-- variant: sample -->
  <div class="ip-sample">
    <div class="ip-shead">
      <span class="ip-sbadge" data-slot="sampleLabel"></span>
      <span class="ip-sname" data-slot="sampleName"></span>
      <span class="ip-sspacer"></span>
      <span class="ip-splan" data-slot="samplePlan"></span>
    </div>
    <div class="ip-sbody" data-slot="sampleContent" data-slot-type="content"></div>
  </div>
</div>
```

## CSS

```css
.comp-info-panel {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 24px;
}

/* approach */
.comp-info-panel .ip-approach {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.comp-info-panel .ip-head h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 21px;
  color: var(--slate);
  margin: 0 0 6px;
}
.comp-info-panel .ip-num {
  display: inline-block;
  font-family: var(--mono);
  font-size: 12px;
  background: var(--oat);
  color: var(--slate);
  padding: 2px 8px;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: 3px;
}
.comp-info-panel .ip-desc {
  font-size: 14px;
  color: var(--gray-500);
  margin: 0;
}
.comp-info-panel .ip-code {
  background: var(--slate);
  border-radius: var(--radius-panel);
  padding: 18px 20px;
  overflow-x: auto;
}
.comp-info-panel .ip-code pre {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--ivory);
  white-space: pre;
  margin: 0;
  background: transparent;
}
.comp-info-panel .ip-code code {
  font-family: var(--mono);
  font-size: 12.5px;
  background: transparent;
  color: inherit;
  padding: 0;
}
.comp-info-panel .ip-tradeoffs {
  border: 1.5px solid var(--gray-300);
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}
.comp-info-panel .ip-trow {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.comp-info-panel .ip-trow + .ip-trow {
  border-top: 1.5px solid var(--gray-300);
}
.comp-info-panel .ip-tcell {
  padding: 10px 14px;
}
.comp-info-panel .ip-tcell + .ip-tcell {
  border-left: 1.5px solid var(--gray-300);
}
.comp-info-panel .ip-thead {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--slate);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.comp-info-panel .ip-tpro {
  position: relative;
  padding-left: 24px;
  color: var(--gray-700);
}
.comp-info-panel .ip-tpro::before {
  content: "";
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--olive);
}
.comp-info-panel .ip-tcon {
  position: relative;
  padding-left: 24px;
  color: var(--gray-700);
}
.comp-info-panel .ip-tcon::before {
  content: "";
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--clay);
}
.comp-info-panel .ip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.comp-info-panel .ip-chip {
  font-family: var(--mono);
  font-size: 11.5px;
  background: var(--gray-100);
  border: 1.5px solid var(--gray-300);
  color: var(--gray-700);
  padding: 5px 10px;
  border-radius: 8px;
  white-space: nowrap;
}
.comp-info-panel .ip-chip strong {
  color: var(--slate);
  font-weight: 600;
}

/* ===== variant: variant ===== */
.comp-info-panel[data-variant="variant"] { padding: 0; border: none; background: transparent; }
.comp-info-panel .ip-vlabel {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--gray-700);
  background: var(--gray-100);
  border-radius: 999px;
  margin-bottom: 10px;
}
.comp-info-panel .ip-vinner {
  border-radius: var(--radius-panel);
  padding: 20px;
  background: var(--white);
  border: var(--border);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.comp-info-panel .ip-vinner:hover {
  outline: 2px solid var(--clay);
  outline-offset: 2px;
}
.comp-info-panel .ip-vhead {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.comp-info-panel .ip-vavatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--oat);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}
.comp-info-panel .ip-vtitles { min-width: 0; }
.comp-info-panel .ip-vtitle {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  margin: 0 0 2px;
  line-height: 1.3;
  color: var(--slate);
}
.comp-info-panel .ip-vsub {
  font-size: 13px;
  color: var(--gray-500);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.comp-info-panel .ip-vchips {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.comp-info-panel .ip-vchip {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 999px;
  background: var(--gray-100);
  color: var(--gray-700);
}
.comp-info-panel .ip-vchip.olive { background: var(--gray-100); color: var(--olive); }
.comp-info-panel .ip-vaction {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  background: transparent;
  border: 1.5px solid var(--gray-300);
  border-radius: 8px;
}
.comp-info-panel .ip-vnote {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 10px;
}

/* ===== variant: detail ===== */
.comp-info-panel[data-variant="detail"] { position: sticky; top: 24px; border-radius: 14px; padding: 20px 20px 22px; }
.comp-info-panel .ip-dhint {
  font-size: 12px;
  color: var(--gray-500);
  margin-bottom: 14px;
}
.comp-info-panel .ip-dtitle {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 19px;
  margin-bottom: 6px;
  color: var(--slate);
}
.comp-info-panel .ip-dmeta {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  margin-bottom: 14px;
}
.comp-info-panel .ip-dbody {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--gray-700);
  margin-bottom: 12px;
}
.comp-info-panel .ip-dbody code {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--gray-100);
  padding: 1px 5px;
  border-radius: 4px;
}
.comp-info-panel .ip-dcode {
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.55;
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 10px 12px;
  white-space: pre-wrap;
  color: var(--slate);
  margin: 0;
}

/* ===== variant: sample ===== */
.comp-info-panel[data-variant="sample"] { padding: 0; border: 1.5px solid var(--gray-300); border-radius: 10px; overflow: hidden; background: var(--white); }
.comp-info-panel .ip-shead {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 13px;
  border-bottom: 1.5px solid var(--gray-300);
  background: var(--gray-100);
}
.comp-info-panel .ip-sbadge {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--gray-500);
}
.comp-info-panel .ip-sname {
  font-family: var(--serif);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--slate);
}
.comp-info-panel .ip-sspacer { flex: 1; }
.comp-info-panel .ip-splan {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1.5px solid var(--gray-300);
  color: var(--gray-700);
  background: var(--white);
}
.comp-info-panel .ip-splan.team { background: var(--oat); border-color: var(--oat); color: var(--clay); }
.comp-info-panel .ip-splan.studio { background: var(--olive); border-color: var(--olive); color: var(--ivory); }
.comp-info-panel .ip-sbody {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--gray-700);
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px 13px 14px;
}
```

## JS

```js
export function mount(el, api) {
  const variant = el.getAttribute('data-variant');

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  if (variant === 'approach') {
    // Build tradeoffs table from data slots（pros 和 cons 各自是 hidden span，写到外层 .ip-tradeoffs）
    const wrap = el.querySelector('.ip-tradeoffs');
    if (wrap) {
      const prosEl = wrap.querySelector('[data-slot="approachPros"]');
      const consEl = wrap.querySelector('[data-slot="approachCons"]');
      const prosRaw = prosEl ? (prosEl.getAttribute('data-value') || prosEl.textContent || '') : '';
      const consRaw = consEl ? (consEl.getAttribute('data-value') || consEl.textContent || '') : '';
      const pros = prosRaw.split('\n').map(v => v.trim()).filter(Boolean);
      const cons = consRaw.split('\n').map(v => v.trim()).filter(Boolean);
      const maxRows = Math.max(pros.length, cons.length);
      if (maxRows > 0) {
        let rowsHtml = '<div class="ip-trow ip-thead"><div class="ip-tcell">Pro</div><div class="ip-tcell">Con</div></div>';
        for (let i = 0; i < maxRows; i++) {
          rowsHtml += `<div class="ip-trow"><div class="ip-tcell ip-tpro">${esc(pros[i] || '')}</div><div class="ip-tcell ip-tcon">${esc(cons[i] || '')}</div></div>`;
        }
        wrap.innerHTML = rowsHtml;
      }
    }

    // Build chips from data slot
    const chipsEl = el.querySelector('[data-slot="approachTags"]');
    if (chipsEl) {
      const raw = chipsEl.getAttribute('data-value') || chipsEl.textContent || '';
      const tags = raw.split('\n').map(v => v.trim()).filter(Boolean);
      const chipItems = tags.map(t => {
        const colonIdx = t.indexOf(':');
        if (colonIdx === -1) return `<span class="ip-chip">${esc(t)}</span>`;
        const key = t.slice(0, colonIdx).trim();
        const val = t.slice(colonIdx + 1).trim();
        return `<span class="ip-chip">${esc(key)}: <strong>${esc(val)}</strong></span>`;
      });
      chipsEl.innerHTML = chipItems.join('\n  ');
    }
  }

  if (variant === 'variant') {
    // variantStyle slot: 用作样式 modifier（如 "olive" / "compact"）
    const styleEl = el.querySelector('[data-slot="variantStyle"]');
    if (styleEl) {
      const styleVal = (styleEl.textContent || '').trim().toLowerCase();
      if (styleVal && /^[a-z][a-z0-9-]*$/.test(styleVal)) {
        const inner = el.querySelector('.ip-vinner');
        if (inner) inner.classList.add('vstyle-' + styleVal);
      }
    }

    // Parse chips
    const chipsEl = el.querySelector('[data-slot="cardChips"]');
    if (chipsEl) {
      const raw = chipsEl.textContent || '';
      const chips = raw.split(',').map(c => c.trim()).filter(Boolean);
      chipsEl.innerHTML = chips.map((c, i) => {
        const cls = i === 1 ? 'ip-vchip olive' : 'ip-vchip';
        return `<span class="${cls}">${esc(c)}</span>`;
      }).join('');
    }
  }

  if (variant === 'sample') {
    // Plan badge class
    const planEl = el.querySelector('[data-slot="samplePlan"]');
    if (planEl) {
      const plan = (planEl.textContent || '').trim().toLowerCase();
      if (plan === 'team') planEl.classList.add('team');
      if (plan === 'studio') planEl.classList.add('studio');
    }
  }
}
```

## Sample

```markdown
<!-- @use info-panel variant=approach -->

### Inline useEffect + setTimeout

<!-- @slot:approachNum -->01<!-- @/slot -->
<!-- @slot:approachDesc -->Debounce logic lives directly inside the component.<!-- @/slot -->

<!-- @slot:approachCode -->
```js
const [draft, setDraft] = useState("");
```
<!-- @/slot -->

<!-- @slot:approachPros -->
Zero new abstractions to learn
Easy to step through
<!-- @/slot -->

<!-- @slot:approachCons -->
Logic duplicated everywhere
Two pieces of state
<!-- @/slot -->

<!-- @slot:approachTags -->
Bundle impact: +0 kb
Reuse: low
<!-- @/slot -->

---

<!-- @use info-panel variant=variant -->

<!-- @slot:variantLabel -->A · Flat<!-- @/slot -->
<!-- @slot:variantStyle -->flat<!-- @/slot -->
<!-- @slot:avatarText -->WP<!-- @/slot -->
<!-- @slot:cardTitle -->Weekly planning<!-- @/slot -->
<!-- @slot:cardSubtitle -->12 tasks · due Friday<!-- @/slot -->
<!-- @slot:cardChips -->Q2, Roadmap<!-- @/slot -->
<!-- @slot:cardAction -->Open<!-- @/slot -->
<!-- @slot:variantNote -->best for: dense lists on tinted backgrounds<!-- @/slot -->

---

<!-- @use info-panel variant=detail -->

<!-- @slot:panelHint -->Click a step in the chart →<!-- @/slot -->
<!-- @slot:panelTitle -->git push main<!-- @/slot -->
<!-- @slot:panelMeta -->trigger · 0s<!-- @/slot -->

A push or merge to `main` fires the `deploy` workflow.

<!-- @slot:panelCode -->
on:
  push:
    branches: [main]
<!-- @/slot -->

---

<!-- @use info-panel variant=sample -->

<!-- @slot:sampleLabel -->SAMPLE 1<!-- @/slot -->
<!-- @slot:sampleName -->Priya N.<!-- @/slot -->
<!-- @slot:samplePlan -->Team<!-- @/slot -->
<!-- @slot:sampleContent -->You are a support agent for Birchline…<!-- @/slot -->
```
