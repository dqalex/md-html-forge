---
id: illustration
category: visual
tags: svg, illustration, figure, canvas, notes, annotation, design-decision
trust: builtin
defaultVariant: frame
---

# 插图与注解

## Variants

- `frame` — SVG 外框 + 标题说明：将 SVG 插图包裹在带边框的画布容器中，下方附标题与说明
- `notes` — 交互注解面板：标题 + 导语 + 带 clay 方块 bullet 的列表

## Slots

```yaml
frameTitle:
  label: 插图标题
  type: text
  placeholder: 'Queue'
frameSub:
  label: 插图说明
  type: text
  placeholder: 'For "How jobs are picked up" — intro page header.'
frameSvg:
  label: SVG 内容
  type: content
  placeholder: '<svg>...</svg>'
notesTitle:
  label: 标题
  type: text
  placeholder: "What you're feeling"
  bind: h2
notesLeade:
  label: 导语
  type: text
  placeholder: 'Design decisions baked into this prototype...'
notesBody:
  label: 要点列表
  type: content
  placeholder: '- **第一条**：说明\n- **第二条**：说明'
  bind: list
```

## HTML

```html
<div class="comp-illustration" data-section="illustration" data-variant="{{variant}}">
  <!-- variant: frame -->
  <figure class="il-frame">
    <div class="il-canvas" data-slot="frameSvg" data-slot-type="content"></div>
    <figcaption class="il-caption">
      <div class="il-cap-text">
        <div class="il-cap-title" data-slot="frameTitle"></div>
        <div class="il-cap-sub" data-slot="frameSub"></div>
      </div>
    </figcaption>
  </figure>

  <!-- variant: notes -->
  <section class="il-notes">
    <h2 data-slot="notesTitle"></h2>
    <p class="il-lede" data-slot="notesLeade"></p>
    <div data-slot="notesBody" data-slot-type="content"></div>
  </section>
</div>
```

## CSS

```css
.comp-illustration {
  background: transparent;
}

/* ===== variant: frame ===== */
.comp-illustration .il-frame {
  margin: 0 0 72px 0;
}
.comp-illustration .il-canvas {
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: var(--ivory);
}
.comp-illustration .il-canvas svg {
  display: block;
  width: 100%;
  height: auto;
}
.comp-illustration .il-caption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 4px 0;
}
.comp-illustration .il-cap-text {
  flex: 1;
}
.comp-illustration .il-cap-title {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  margin-bottom: 4px;
}
.comp-illustration .il-cap-sub {
  font-size: 13px;
  line-height: 1.55;
  color: var(--gray-500);
}

/* ===== variant: notes ===== */
.comp-illustration[data-variant="notes"] .il-notes {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 22px 24px;
}
.comp-illustration .il-notes h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 18px;
  margin: 0 0 6px;
  color: var(--slate);
}
.comp-illustration .il-lede {
  color: var(--gray-500);
  font-size: 13px;
  margin: 0 0 16px;
}
.comp-illustration .il-notes ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.comp-illustration .il-notes li {
  position: relative;
  padding: 10px 0 10px 22px;
  border-top: 1.5px solid var(--gray-100);
  font-size: 13px;
  color: var(--gray-700);
}
.comp-illustration .il-notes li:first-child {
  border-top: none;
}
.comp-illustration .il-notes li::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 16px;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--clay);
}
.comp-illustration .il-notes li b,
.comp-illustration .il-notes li strong {
  color: var(--slate);
  font-weight: 600;
}
```

## Sample

```markdown
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Queue<!-- @/slot -->
<!-- @slot:frameSub -->For "How jobs are picked up" — intro page header.<!-- @/slot -->
<!-- @slot:frameSvg -->
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="320" viewBox="0 0 720 320"><rect width="720" height="320" fill="var(--ivory)"/></svg>
<!-- @/slot -->

---

<!-- @use illustration variant=notes -->

<!-- @slot:notesTitle -->What you're feeling<!-- @/slot -->
<!-- @slot:notesLeade -->Design decisions baked into this prototype, so you can push back on them.<!-- @/slot -->
<!-- @slot:notesBody -->
- **Drop indicator snaps to the nearest gap**, not the raw cursor Y. It only moves when you cross a row's midpoint — feels more decisive, less jittery.
- **Dragged row stays in place at 35% opacity** with a 2° tilt. Keeping the ghost in the list preserves your sense of where you started; the tilt reads as "lifted."
- **Grip dots are the affordance, but the whole row is draggable.** Dots darken on hover to teach the gesture without forcing a tiny hit target.
<!-- @/slot -->
```
