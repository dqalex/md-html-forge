---
id: card
category: card
tags: card, common, feature, stat, decision, ticket
trust: builtin
defaultVariant: standard
---

# 通用卡片

## Variants

- `standard` — 图标 + 标题 + 描述 + 可选链接，常用于网格布局
- `stat` — 大数值 + 指标名 + 趋势，数据展示型卡片
- `decision` — 核心问题 + 背景 + 选项标签，用于决策场景
- `ticket` — 紧凑工单卡片，ID + 标签 + 估时 + 标题 + 负责人

## Slots

```yaml
cardIcon:
  label: 图标 (lucide 名称)
  type: text
  placeholder: zap
cardTitle:
  label: 标题
  type: text
  placeholder: 功能名称
  bind: h3
cardBody:
  label: 描述
  type: content
  placeholder: 一段介绍文字
cardLink:
  label: 跳转链接（可选）
  type: text
  placeholder: /docs
cardLinkText:
  label: 链接文字（可选）
  type: text
  placeholder: Learn more →
statValue:
  label: 数值
  type: text
  placeholder: 184ms
statLabel:
  label: 指标名
  type: text
  placeholder: API p95 延迟
statDelta:
  label: 趋势（可选）
  type: text
  placeholder: ↓ 12% wk/wk
statAccent:
  label: 强调边框（可选）
  type: text
  placeholder: warn
decisionQ:
  label: 核心问题
  type: content
  placeholder: 需要决策的问题描述...
decisionContext:
  label: 背景说明
  type: content
  placeholder: 问题的上下文和影响...
decisionOptions:
  label: 选项（逗号分隔，加 * 标记推荐）
  type: text
  placeholder: '*A — Flag it ship Friday, B — Hold for 2.5'
ticketId:
  label: 工单 ID
  type: text
  placeholder: BIR-241
ticketTag:
  label: 标签类型 (bug/feat/chore/debt)
  type: text
  placeholder: bug
ticketEst:
  label: 估时 (S/M/L)
  type: text
  placeholder: M
ticketTitle:
  label: 标题
  type: text
  placeholder: Fix sync conflict toast firing twice on reconnect
ticketOwner:
  label: 负责人缩写
  type: text
  placeholder: AK
```

## HTML

```html
<div class="comp-card" data-section="card" data-variant="{{variant}}">
  <!-- variant: standard -->
  <div class="card-standard">
    <div class="cs-icon" data-slot="cardIcon"></div>
    <h3 data-slot="cardTitle"></h3>
    <div class="cs-body" data-slot="cardBody" data-slot-type="content"></div>
    <a class="cs-link" data-slot="cardLink"><span data-slot="cardLinkText"></span></a>
  </div>

  <!-- variant: stat -->
  <div class="card-stat">
    <div class="cst-num" data-slot="statValue"></div>
    <div class="cst-label" data-slot="statLabel"></div>
    <div class="cst-delta" data-slot="statDelta"></div>
    <span class="cst-accent" data-slot="statAccent" hidden></span>
  </div>

  <!-- variant: decision -->
  <div class="card-decision">
    <div class="cd-q" data-slot="decisionQ" data-slot-type="content"></div>
    <div class="cd-context" data-slot="decisionContext" data-slot-type="content"></div>
    <div class="cd-options" data-slot="decisionOptions"></div>
  </div>

  <!-- variant: ticket -->
  <div class="card-ticket">
    <div class="ct-top">
      <span class="ct-id" data-slot="ticketId"></span>
      <span class="ct-tag" data-slot="ticketTag"></span>
      <span class="ct-est" data-slot="ticketEst"></span>
    </div>
    <div class="ct-title" data-slot="ticketTitle"></div>
    <span class="ct-owner" data-slot="ticketOwner"></span>
  </div>
</div>
```

## CSS

```css
.comp-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 22px 24px;
  height: 100%;
}

/* ===== variant: standard ===== */
.comp-card .card-standard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}
.comp-card .cs-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--clay) 10%, transparent);
  color: var(--clay);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.comp-card .cs-icon svg { width: 18px; height: 18px; }
.comp-card .card-standard h3 {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 500;
  color: var(--slate);
  letter-spacing: -0.005em;
  margin: 0;
}
.comp-card .cs-body {
  font-size: 14px;
  line-height: 1.65;
  color: var(--gray-700);
  margin: 0;
  flex: 1;
}
.comp-card .cs-body p { margin: 0 0 6px; font-size: 14px; }
.comp-card .cs-link {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--clay);
  margin-top: 6px;
}
.comp-card .cs-link a { color: var(--clay); border-bottom: 1px solid transparent; }
.comp-card .cs-link a:hover { border-bottom-color: var(--clay); }

/* ===== variant: stat ===== */
.comp-card[data-variant="stat"] { padding: 20px 22px 18px; }
.comp-card .cst-num {
  font-family: var(--serif);
  font-size: 36px;
  font-weight: 500;
  line-height: 1;
  color: var(--slate);
  margin-bottom: 8px;
}
.comp-card .cst-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500);
}
.comp-card .cst-delta {
  font-family: var(--mono);
  font-size: 11px;
  margin-top: 6px;
  color: var(--olive);
}
.comp-card[data-variant="stat"].accent-warn {
  border-left: 4px solid var(--clay);
  padding-left: 19px;
}

/* ===== variant: decision ===== */
.comp-card[data-variant="decision"] { border: 1.5px solid var(--clay); border-radius: 14px; padding: 36px 38px; background: var(--ivory); }
.comp-card .cd-q {
  font-family: var(--serif);
  font-size: 24px;
  line-height: 1.4;
  margin-bottom: 12px;
  color: var(--slate);
}
.comp-card .cd-context {
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-700);
}
.comp-card .cd-options {
  display: flex;
  gap: 14px;
  margin-top: 32px;
  flex-wrap: wrap;
}
.comp-card .cd-chip {
  font-family: var(--mono);
  font-size: 12px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--gray-300);
  color: var(--slate);
  background: transparent;
}
.comp-card .cd-chip.lean { border-color: var(--clay); color: var(--clay); }

/* ===== variant: ticket ===== */
.comp-card[data-variant="ticket"] { padding: 10px 11px 9px; border-radius: 8px; border: 1.5px solid var(--gray-300); }
.comp-card .ct-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}
.comp-card .ct-id {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  letter-spacing: 0.01em;
}
.comp-card .ct-tag {
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 999px;
  padding: 1px 7px 2px;
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
  color: var(--gray-700);
}
.comp-card .ct-tag.tag-bug { background: var(--gray-100); color: var(--clay); border-color: var(--gray-300); }
.comp-card .ct-tag.tag-feat { background: var(--gray-100); color: var(--olive); border-color: var(--gray-300); }
.comp-card .ct-est {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--gray-500);
  border: 1.5px solid var(--gray-300);
  border-radius: 4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.comp-card .ct-title {
  font-size: 13px;
  line-height: 1.35;
  color: var(--slate);
  margin-bottom: 7px;
}
.comp-card .ct-owner {
  font-family: var(--mono);
  font-size: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--oat);
  color: var(--gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.02em;
}
```

## JS

```js
export function mount(el, api) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  // standard variant: cardLink (a 标签) — 把内容当 href，cardLinkText 显示文字
  const cardLink = el.querySelector('a[data-slot="cardLink"]');
  if (cardLink) {
    const href = (cardLink.getAttribute('data-href') || cardLink.textContent || '').trim();
    const inner = cardLink.querySelector('[data-slot="cardLinkText"]');
    const linkText = (inner?.textContent || '').trim();
    if (href) {
      // textContent 把整个 a 包括内嵌 span 的 textContent 都包含了，所以要清理：
      // 当 cardLinkText 有值时，外层 cardLink 的 textContent 实际等于 href + linkText。
      // 我们用 cardLinkText 的内容做最终展示，没填则回退到 href。
      const display = linkText || href;
      cardLink.setAttribute('href', href);
      cardLink.textContent = display;
    } else {
      cardLink.remove();
    }
  }

  // decision variant: parse options chips
  const decisionOptions = el.querySelector('[data-slot="decisionOptions"]');
  if (decisionOptions) {
    const raw = decisionOptions.textContent || '';
    if (raw) {
      const options = raw.split(',').map(o => o.trim()).filter(Boolean);
      decisionOptions.innerHTML = options.map(opt => {
        const isLean = opt.startsWith('*');
        const label = isLean ? opt.slice(1).trim() : opt;
        return `<span class="cd-chip${isLean ? ' lean' : ''}">${esc(label)}</span>`;
      }).join('');
    }
  }

  // ticket variant: tag class mapping
  const ticketTag = el.querySelector('[data-slot="ticketTag"]');
  if (ticketTag) {
    const tag = (ticketTag.textContent || '').trim().toLowerCase();
    if (['bug', 'feat', 'chore', 'debt'].includes(tag)) {
      ticketTag.classList.add('tag-' + tag);
    }
  }

  // stat variant: accent border（statAccent 是隐藏 span，只读取值用作 className）
  const statAccent = el.querySelector('[data-slot="statAccent"]');
  if (statAccent) {
    const accent = (statAccent.textContent || '').trim().toLowerCase();
    if (accent === 'warn') {
      el.classList.add('accent-warn');
    }
  }
}
```

## Sample

```markdown
<!-- @use card variant=standard -->

### 极速渲染

从 Markdown 到样式 HTML，**纯前端、零后端**，所见即所得。

<!-- @slot:cardIcon -->zap<!-- @/slot -->
<!-- @slot:cardLink -->#<!-- @/slot -->
<!-- @slot:cardLinkText -->了解更多 →<!-- @/slot -->

---

<!-- @use card variant=stat -->

<!-- @slot:statValue -->184ms<!-- @/slot -->
<!-- @slot:statLabel -->API p95 延迟<!-- @/slot -->
<!-- @slot:statDelta -->↓ 12% wk/wk<!-- @/slot -->

---

<!-- @use card variant=decision -->

Do we ship recurring tasks behind a workspace flag in 2.4, or hold one more week for the timezone fixes?

<!-- @slot:decisionContext -->
Flagged rollout gets it to design partners Friday but means two code paths for ~2 weeks.
<!-- @/slot -->

<!-- @slot:decisionOptions -->*A — Flag it, ship Friday, B — Hold for 2.5<!-- @/slot -->

---

<!-- @use card variant=ticket -->

<!-- @slot:ticketId -->BIR-241<!-- @/slot -->
<!-- @slot:ticketTag -->bug<!-- @/slot -->
<!-- @slot:ticketEst -->M<!-- @/slot -->
<!-- @slot:ticketTitle -->Fix sync conflict toast firing twice on reconnect<!-- @/slot -->
<!-- @slot:ticketOwner -->AK<!-- @/slot -->
```
