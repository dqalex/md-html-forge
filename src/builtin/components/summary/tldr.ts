import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'tldr',
  name: 'TL;DR 摘要',
  description: '深色背景的一句话或列表式摘要',
  source: '12,17',
  category: 'summary',
  tags: ['summary', 'highlight', 'abstract'],
  slots: {
    tldr: { label: 'TL;DR 内容', type: 'content', placeholder: '一段或几条要点', bind: 'list' },
  },
  sample: {
    tldr: `- **写 MD，不写 HTML** — 用 \`<!-- @slot:xxx -->\` 标记填充内容，样式交给组件
- **20+ 个默认组件自由组合** — 顶部 \`@compose\` 指令决定页面结构
- **空 slot = 组件消失** — 删掉 slot 里的内容，对应模块不会留下空架子`,
  },
  css: `
.comp-tldr { background: var(--slate); color: var(--ivory); border-radius: var(--radius-panel); padding: 22px 26px; margin-bottom: 40px; }
.comp-tldr .tldr-label { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--oat); margin-bottom: 10px; }
.comp-tldr p { margin: 0 0 8px; font-size: 15.5px; line-height: 1.65; color: var(--ivory); }
.comp-tldr p:last-child { margin-bottom: 0; }
.comp-tldr ul { padding-left: 18px; margin: 0; }
.comp-tldr li { color: var(--ivory); margin-bottom: 4px; }
.comp-tldr strong { color: var(--ivory); }
.comp-tldr code { background: rgba(250,249,245,0.12); color: inherit; }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.tldr)) return '';
    return `
<div class="comp-tldr" data-section="tldr">
  <div class="tldr-label">TL;DR</div>
  <div data-slot="tldr" data-slot-type="content">${s.tldr}</div>
</div>`.trim();
  },
});
