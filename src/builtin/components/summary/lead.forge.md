---
id: lead
category: summary
tags: intro, quote, summary, tldr, phase, header, numbered
trust: builtin
defaultVariant: lead
---

# 导语

## Variants

- `lead` — 导语段落：衬线大字开篇引言
- `tldr` — 要点列表 TL;DR：深色背景的一句话或列表式摘要
- `phase` — 阶段标题：带编号徽章的章节标题（如 "01 Milestones"）

## Slots

```yaml
lead:
  label: 导语内容
  type: content
  placeholder: '一段开篇引言或大字摘要'
  bind: blockquote
tldr:
  label: TL;DR 内容
  type: content
  placeholder: '一段或几条要点'
  bind: list
phaseNum:
  label: 阶段编号
  type: text
  placeholder: '01'
phaseTitle:
  label: 章节标题
  type: text
  placeholder: 'Milestones'
phaseIntro:
  label: 章节简介
  type: text
  placeholder: 'Ship in four slices, each independently reviewable.'
```

## HTML

```html
<div class="comp-lead" data-section="lead" data-variant="{{variant}}">
  <!-- variant: lead -->
  <section class="ld-lead">
    <div data-slot="lead" data-slot-type="content"></div>
  </section>

  <!-- variant: tldr -->
  <div class="ld-tldr">
    <div class="ld-tldr-label">TL;DR</div>
    <div data-slot="tldr" data-slot-type="content"></div>
  </div>

  <!-- variant: phase -->
  <div class="ld-phase">
    <span class="ld-ph-num" data-slot="phaseNum"></span>
    <h2 data-slot="phaseTitle"></h2>
    <p class="ld-ph-intro" data-slot="phaseIntro"></p>
  </div>
</div>
```

## CSS

```css
/* ===== 变体隔离：只显示当前 variant 对应的 pane ===== */
.comp-lead .ld-lead,
.comp-lead .ld-tldr,
.comp-lead .ld-phase {
  display: none;
}
.comp-lead[data-variant="lead"] .ld-lead { display: block; }
.comp-lead[data-variant="tldr"] .ld-tldr { display: block; }
.comp-lead[data-variant="phase"] .ld-phase { display: block; }

.comp-lead {
  background: transparent;
}

/* ===== variant: lead ===== */
.comp-lead .ld-lead {
  margin: 24px 0 32px;
}
.comp-lead .ld-lead p {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.55;
  color: var(--slate);
  margin: 0;
  max-width: 720px;
  font-weight: 400;
  letter-spacing: -0.005em;
}

/* ===== variant: tldr ===== */
.comp-lead[data-variant="tldr"] .ld-tldr {
  background: var(--slate);
  color: var(--ivory);
  border-radius: var(--radius-panel);
  padding: 22px 26px;
  margin-bottom: 40px;
}
.comp-lead .ld-tldr-label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--oat);
  margin-bottom: 10px;
}
.comp-lead .ld-tldr p {
  margin: 0 0 8px;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--ivory);
}
.comp-lead .ld-tldr p:last-child {
  margin-bottom: 0;
}
.comp-lead .ld-tldr ul {
  padding-left: 18px;
  margin: 0;
}
.comp-lead .ld-tldr li {
  color: var(--ivory);
  margin-bottom: 4px;
}
.comp-lead .ld-tldr strong {
  color: var(--ivory);
}
.comp-lead .ld-tldr code {
  background: color-mix(in srgb, var(--ivory) 12%, transparent);
  color: inherit;
}

/* ===== variant: phase ===== */
.comp-lead[data-variant="phase"] .ld-phase {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.comp-lead .ld-ph-num {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--oat);
  color: var(--slate);
  padding: 3px 9px;
  border-radius: 8px;
}
.comp-lead .ld-phase h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 26px;
  color: var(--slate);
  letter-spacing: -0.01em;
  margin: 0;
}
.comp-lead .ld-ph-intro {
  font-size: 14.5px;
  color: var(--gray-500);
  max-width: 720px;
  margin-bottom: 28px;
  width: 100%;
}
```

## Sample

```markdown
<!-- @use lead variant=lead -->

<!-- @slot:lead -->
我们相信，文档的质感应当与它承载的思考同等重要。这个 Playground 就是为那些既不愿写一堆 CSS、又不满足于"像个网页"的人准备的。
<!-- @/slot -->

---

<!-- @use lead variant=tldr -->

<!-- @slot:tldr -->
- **写 MD，不写 HTML** — 用 `<!-- @slot:xxx -->` 标记填充内容，样式交给组件
- **20+ 个默认组件自由组合** — 顶部 `@compose` 指令决定页面结构
- **空 slot = 组件消失** — 删掉 slot 里的内容，对应模块不会留下空架子
<!-- @/slot -->

---

<!-- @use lead variant=phase -->

<!-- @slot:phaseNum -->01<!-- @/slot -->
<!-- @slot:phaseTitle -->Milestones<!-- @/slot -->
<!-- @slot:phaseIntro -->Ship in four slices, each independently reviewable and each behind the flag.<!-- @/slot -->
```
