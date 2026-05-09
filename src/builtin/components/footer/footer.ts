import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'footer',
  name: '页脚',
  description: '细线 + mono 小字',
  source: '11,12',
  category: 'footer',
  tags: ['footer'],
  slots: {
    footer: { label: '页脚文字', type: 'text', placeholder: '生成于 2026-01-01 · 数据来源：xxx' },
  },
  sample: {
    footer: 'md-html-forge · Markdown → Styled HTML Playground · 2026',
  },
  css: `
.comp-footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--gray-300); font-family: var(--mono); font-size: 12px; color: var(--gray-500); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.footer)) return '';
    return `<footer class="comp-footer" data-slot="footer">${s.footer}</footer>`;
  },
});
