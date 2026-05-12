---
id: panel
category: visual
tags: panel, snippet, glossary, prompt
trust: builtin
defaultVariant: snippet
---

# 信息面板

## Variants

- `snippet` — 带标题栏的代码预览面板，深色代码区
- `glossary` — 术语定义列表面板，sticky 侧栏定位
- `prompt` — 提示词展示框，带标签的灰色底面板

## Slots

```yaml
panelTitle:
  label: 标题
  type: text
  placeholder: 标题文字
  bind: h3
panelBody:
  label: 内容
  type: content
  bind: content
  placeholder: 内容段落或代码
panelData:
  label: 结构化数据
  type: data
  placeholder: term|definition
  description: 仅 glossary 变体使用，每行 term|definition
```

## HTML

```html
<div class="comp-panel" data-section="panel" data-variant="{{variant}}">
  <div class="panel-head" data-slot="panelTitle"></div>
  <div class="panel-body" data-slot="panelBody" data-slot-type="content"></div>
  <dl class="panel-dl" data-slot="panelData" data-slot-type="data"></dl>
</div>
```

## CSS

```css
.comp-panel {
  border: var(--border);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: var(--white);
}

/* 公共 head */
.comp-panel .panel-head {
  padding: 10px 16px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
  background: var(--gray-100);
  border-bottom: 1px solid var(--gray-300);
}

/* 公共 body */
.comp-panel .panel-body {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-700);
}

/* 公共 dl */
.comp-panel .panel-dl {
  margin: 0;
  padding: 18px 18px 8px;
}
.comp-panel .panel-dl dt {
  font-family: var(--serif);
  font-size: 15px;
  color: var(--slate);
  margin-top: 0;
}
.comp-panel .panel-dl dd {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--gray-700);
  margin: 2px 0 14px;
}

/* ===== variant: snippet ===== */
.comp-panel[data-variant="snippet"] {
  margin-top: 40px;
}
.comp-panel[data-variant="snippet"] .panel-body {
  margin: 0;
  padding: 20px;
  background: var(--slate);
  color: var(--ivory);
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  min-height: 120px;
}
.comp-panel[data-variant="snippet"] .panel-body code {
  background: transparent;
  color: var(--ivory);
  font-family: var(--mono);
  font-size: 13px;
  padding: 0;
}
.comp-panel[data-variant="snippet"] .panel-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.comp-panel[data-variant="snippet"] .panel-dl {
  display: none;
}

/* ===== variant: glossary ===== */
.comp-panel[data-variant="glossary"] {
  position: sticky;
  top: 32px;
  align-self: start;
  padding: 0;
}
.comp-panel[data-variant="glossary"] .panel-head {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-500);
  background: transparent;
  border-bottom: none;
  margin-bottom: 12px;
  padding: 18px 18px 0;
}
.comp-panel[data-variant="glossary"] .panel-body {
  display: none;
}

/* ===== variant: prompt ===== */
.comp-panel[data-variant="prompt"] {
  background: var(--gray-100);
  padding: 16px 20px;
}
.comp-panel[data-variant="prompt"] .panel-head {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  background: transparent;
  border-bottom: none;
  margin-bottom: 6px;
  padding: 0;
}
.comp-panel[data-variant="prompt"] .panel-body {
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--gray-700);
  padding: 0;
}
.comp-panel[data-variant="prompt"] .panel-dl {
  display: none;
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-panel').forEach(function(el) {
  var variant = el.getAttribute('data-variant') || 'snippet';
  if (variant !== 'glossary') return;

  var dl = el.querySelector('[data-slot="panelData"]');
  if (!dl) return;
  var raw = (dl.textContent || '').trim();
  if (!raw) return;

  var esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  var html = raw.split('\n').map((line) => line.trim()).filter(Boolean).mapfunction((line) {
    var [term = '', def = ''] = line.split('|').map((s) => s.trim());
    return `<dt>${esc(term)}</dt><dd>${esc(def)}</dd>`;
  }).join('');
  dl.innerHTML = html;
  });
})();
```

## Sample

```markdown
<!-- @use panel variant=snippet -->

### JSX — hover a variant above

```
<Card variant="outlined" padding={20} border="hairline">
  <Card.Header avatar title="Weekly planning" />
  <Card.Meta tags={["Q2", "Roadmap"]} />
  <Button variant="ghost">Open</Button>
</Card>
```

<!-- @use panel variant=glossary -->

### Glossary

<!-- @slot:panelData -->
ring|The hash function's output range, treated as a circle.
node|A server placed on the ring at hash(node_id).
<!-- @/slot -->

<!-- @use panel variant=prompt -->

### Prompt

Show me three different ways to implement debounced search for the task filter input in our React codebase, with tradeoffs for each.
```
