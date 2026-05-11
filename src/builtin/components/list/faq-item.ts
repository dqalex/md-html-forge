import { defineComponent, isEmpty, any } from '../_base';

/**
 * FAQ Item · 问答条目
 *
 * 一个 FAQ 问答对，serif 字体问题 + 正文答案。
 */
export default defineComponent({
  id: 'faq-item',
  name: '问答条目',
  description: 'FAQ 问答对，serif 问题 + 正文答案',
  source: '14',
  category: 'list',
  tags: ['faq', 'question', 'answer', 'definition'],

  slots: {
    faqQ: { label: '问题', type: 'text', placeholder: 'How do I exempt internal traffic?' },
    faqA: { label: '回答', type: 'content', placeholder: 'Set `x-birchline-internal: 1` from the caller...', bind: 'content' },
  },

  sample: {
    faqQ: 'How do I exempt internal traffic?',
    faqA: 'Set `x-birchline-internal: 1` from the caller; the middleware checks it against the mTLS peer name and skips the bucket entirely.',
  },

  css: `
.comp-faq-item {
  margin-top: 18px;
}
.comp-faq-item .faq-q {
  font-family: var(--serif);
  font-size: 16px;
  color: var(--slate);
  margin: 0;
}
.comp-faq-item .faq-a {
  font-size: 14px;
  color: var(--gray-700);
  margin: 4px 0 0;
  max-width: 640px;
}
.comp-faq-item code {
  font-family: var(--mono);
  font-size: 0.88em;
  background: var(--gray-100);
  padding: 1px 5px;
  border-radius: 4px;
}
  `.trim(),

  html: (s) => {
    if (!any(s.faqQ, s.faqA)) return '';
    return `
<div class="comp-faq-item" data-section="faq-item">
  ${!isEmpty(s.faqQ) ? `<dt class="faq-q" data-slot="faqQ">${s.faqQ}</dt>` : ''}
  ${!isEmpty(s.faqA) ? `<dd class="faq-a" data-slot="faqA" data-slot-type="content">${s.faqA}</dd>` : ''}
</div>`.trim();
  },
});
