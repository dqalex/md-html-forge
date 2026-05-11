---
id: callout
category: visual
tags: callout, note, warn, concept, questions, recommendation
trust: builtin
defaultVariant: concept
---

# 提示块

## Variants

- `concept` — 概念提示块，clay 色边框 + 标题 + 内容列表
- `note` — 提示标注框，含图标和正文；支持 warn 警示子样式
- `questions` — 待决问题面板，oat 底色 + 有序列表
- `recommendation` — 推荐结论块，左侧 clay 强调边线

## Slots

```yaml
calloutTitle:
  label: 标题
  type: text
  placeholder: Gotchas / Open questions / Recommendation
  bind: h3
calloutBody:
  label: 内容
  type: content
  bind: content
  placeholder: 提示内容（列表或段落）
calloutIcon:
  label: 图标字符
  type: text
  placeholder: '★'
  description: 仅 note 变体使用，如 ★ 或 ⚠
```

## HTML

```html
<div class="comp-callout" data-section="callout" data-variant="{{variant}}">
  <div class="co-head">
    <span class="co-icon" data-slot="calloutIcon"></span>
    <h3 data-slot="calloutTitle"></h3>
  </div>
  <div class="co-body" data-slot="calloutBody" data-slot-type="content"></div>
</div>
```

## CSS

```css
.comp-callout {
  border-radius: var(--radius-panel);
  padding: 18px 20px;
  margin: 18px 0;
}

/* 公共 head */
.comp-callout .co-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}
.comp-callout .co-icon {
  font-weight: 600;
  flex-shrink: 0;
}
.comp-callout h3 {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

/* 公共 body */
.comp-callout .co-body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-700);
}
.comp-callout .co-body p {
  margin: 0 0 8px;
}
.comp-callout .co-body p:last-child {
  margin-bottom: 0;
}
.comp-callout .co-body ul {
  list-style: none;
  padding: 0;
}
.comp-callout .co-body li {
  position: relative;
  padding-left: 16px;
  font-size: 13px;
  margin-bottom: 8px;
}
.comp-callout .co-body li:last-child {
  margin-bottom: 0;
}
.comp-callout .co-body li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 2px;
}
.comp-callout .co-body code {
  font-family: var(--mono);
  font-size: 11.5px;
  background: var(--gray-100);
  padding: 1px 5px;
  border-radius: 4px;
}

/* ===== variant: concept ===== */
.comp-callout[data-variant="concept"] {
  border: 1.5px solid var(--clay);
  background: var(--gray-100);
}
.comp-callout[data-variant="concept"] h3 {
  color: var(--clay);
}
.comp-callout[data-variant="concept"] .co-icon {
  display: none;
}
.comp-callout[data-variant="concept"] .co-body li::before {
  background: var(--clay);
}

/* ===== variant: note ===== */
.comp-callout[data-variant="note"] {
  display: flex;
  gap: 12px;
  border: 1.5px solid var(--oat);
  background: var(--gray-100);
  padding: 14px 16px;
}
.comp-callout[data-variant="note"] .co-head {
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 0;
}
.comp-callout[data-variant="note"] .co-icon {
  display: inline-block;
  color: var(--clay);
  font-size: 14px;
  margin-bottom: 4px;
}
.comp-callout[data-variant="note"] h3 {
  display: none;
}
.comp-callout[data-variant="note"] .co-body {
  flex: 1;
  min-width: 0;
  font-size: 14px;
}
.comp-callout[data-variant="note"] .co-body li {
  font-size: 14px;
}
.comp-callout[data-variant="note"] .co-body li::before {
  background: var(--clay);
}

/* note 的 warn 警示子样式（通过 .is-warn 或图标内容驱动） */
.comp-callout[data-variant="note"].is-warn {
  color: var(--clay);
  border-color: var(--oat);
}
.comp-callout[data-variant="note"].is-warn .co-icon {
  color: var(--clay);
}
.comp-callout[data-variant="note"].is-warn .co-body {
  color: var(--clay);
}

/* ===== variant: questions ===== */
.comp-callout[data-variant="questions"] {
  margin-top: 28px;
  background: var(--oat);
  border: var(--border);
  padding: 20px 24px;
}
.comp-callout[data-variant="questions"] h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 17px;
  text-transform: none;
  letter-spacing: normal;
  color: var(--slate);
  margin-bottom: 12px;
}
.comp-callout[data-variant="questions"] .co-icon {
  display: none;
}
.comp-callout[data-variant="questions"] .co-body ol {
  margin: 0;
  padding-left: 20px;
}
.comp-callout[data-variant="questions"] .co-body li {
  font-size: 13px;
  color: var(--gray-700);
  padding: 4px 0;
}
.comp-callout[data-variant="questions"] .co-body li::before {
  display: none;
}
.comp-callout[data-variant="questions"] .co-body li::marker {
  font-family: var(--mono);
  color: var(--olive);
  font-weight: 600;
}
.comp-callout[data-variant="questions"] .co-body li b,
.comp-callout[data-variant="questions"] .co-body li strong {
  color: var(--slate);
  font-weight: 600;
}
.comp-callout[data-variant="questions"] .co-body code {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--gray-100);
  border: 1.5px solid var(--gray-300);
  padding: 1px 5px;
  border-radius: 4px;
}

/* ===== variant: recommendation ===== */
.comp-callout[data-variant="recommendation"] {
  border-left: 4px solid var(--clay);
  background: var(--white);
  border-radius: 0 var(--radius-panel) var(--radius-panel) 0;
  padding: 24px 28px;
}
.comp-callout[data-variant="recommendation"] h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 22px;
  text-transform: none;
  letter-spacing: normal;
  color: var(--slate);
  margin-bottom: 10px;
}
.comp-callout[data-variant="recommendation"] .co-icon {
  display: none;
}
.comp-callout[data-variant="recommendation"] .co-body {
  font-size: 15px;
  line-height: 1.55;
}
.comp-callout[data-variant="recommendation"] .co-body li {
  font-size: 15px;
}
.comp-callout[data-variant="recommendation"] .co-body li::before {
  background: var(--clay);
}
```

## Sample

```markdown
<!-- @use callout variant=concept -->

### Gotchas

- The LRU in `SessionStore` is per-process. Revoking a session only clears the local cache.
- `verifyToken` compares `expiresAt` against `Date.now()`, but the column is `timestamptz`.

<!-- @use callout variant=note -->

### Note

If you only need the default tier, you don't need a YAML entry at all.

<!-- @use callout variant=note -->
<!-- @slot:calloutIcon -->⚠<!-- @/slot -->

### Warning

1 flag is enabled without its prerequisite.

<!-- @use callout variant=questions -->

### Open questions

1. Should **Trash** be pinned to the bottom and excluded from reordering?
2. Do we want rows to **slide** to their new slot on drop?
3. Keyboard path: is `Alt + Arrow` to move the focused row enough?

<!-- @use callout variant=recommendation -->

### Recommendation

Go with **approach 02, the custom `useDebounce` hook**. Birchline already has three places that hand-roll the inline pattern.
```
