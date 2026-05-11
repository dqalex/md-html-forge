import { defineComponent, isEmpty, any } from '../_base';

/**
 * Slide Cover · 幻灯片封面页
 *
 * 用于演示文稿首页，包含标题、副标题和署名行。
 * 在 inverted 主题下自动反色（深底浅字）。
 */
export default defineComponent({
  id: 'slide-cover',
  name: '幻灯片封面',
  description: '演示文稿首页，标题 + 副标题 + 署名',
  source: '09',
  category: 'special',
  tags: ['slide', 'cover', 'presentation', 'deck'],

  slots: {
    coverTitle:    { label: '主标题', type: 'text', placeholder: 'Platform Eng — Week of Mar 10', bind: 'h1' },
    coverSubtitle: { label: '副标题', type: 'content', placeholder: '一段补充说明文字', bind: 'h2' },
    coverByline:   { label: '署名行（逗号分隔）', type: 'text', placeholder: 'Friday demo, 6 slides, ~4 min' },
  },

  sample: {
    coverTitle: 'Platform Eng — Week of Mar 10',
    coverSubtitle: 'What shipped, what\'s moving, and one decision we need from the room before the Birchline 2.4 cut.',
    coverByline: 'Friday demo, 6 slides, ~4 min',
  },

  css: `
.comp-slide-cover {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8vh 6vw;
}
.comp-slide-cover .sc-inner {
  width: 100%;
  max-width: 780px;
}
.comp-slide-cover h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1.08;
  letter-spacing: -0.01em;
  margin-bottom: 20px;
}
.comp-slide-cover .sc-subtitle {
  font-size: 17px;
  line-height: 1.6;
  color: var(--gray-700);
  max-width: 520px;
}
.comp-slide-cover .sc-byline {
  margin-top: 56px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
  display: flex;
  gap: 24px;
}
  `.trim(),

  html: (s) => {
    if (!any(s.coverTitle, s.coverSubtitle)) return '';
    return `
<section class="comp-slide-cover" data-section="slide-cover">
  <div class="sc-inner">
    ${!isEmpty(s.coverTitle) ? `<h1 data-slot="coverTitle">${s.coverTitle}</h1>` : ''}
    ${!isEmpty(s.coverSubtitle) ? `<div class="sc-subtitle" data-slot="coverSubtitle" data-slot-type="content">${s.coverSubtitle}</div>` : ''}
    ${!isEmpty(s.coverByline) ? `<div class="sc-byline" data-slot="coverByline">${s.coverByline}</div>` : ''}
  </div>
</section>`.trim();
  },
});
