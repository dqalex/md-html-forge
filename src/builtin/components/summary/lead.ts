import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'lead',
  name: '导语 / 引语',
  description: '衬线大字开篇引言',
  source: '14,15',
  category: 'summary',
  tags: ['intro', 'quote'],
  slots: {
    lead: { label: '导语内容', type: 'content', placeholder: '一段开篇引言或大字摘要', bind: 'blockquote' },
  },
  sample: {
    lead: '我们相信，文档的质感应当与它承载的思考同等重要。这个 Playground 就是为那些既不愿写一堆 CSS、又不满足于"像个网页"的人准备的。',
  },
  css: `
.comp-lead { margin: 24px 0 32px; }
.comp-lead p { font-family: var(--serif); font-size: 20px; line-height: 1.55; color: var(--slate); margin: 0; max-width: 720px; font-weight: 400; letter-spacing: -0.005em; }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.lead)) return '';
    return `<section class="comp-lead" data-section="lead"><div data-slot="lead" data-slot-type="content">${s.lead}</div></section>`;
  },
});
