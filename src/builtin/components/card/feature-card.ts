import { defineComponent, isEmpty, any } from '../_base';

/**
 * Feature Card · 通用功能卡片
 *
 * 设计为"可被布局组件循环使用"的最小单元。
 * 在 layout-grid-3 等布局里通过 @item: feature-card 出现 N 次。
 */
export default defineComponent({
  id: 'feature-card',
  name: '功能卡片',
  description: '图标 + 标题 + 描述的小卡片，常用于 3-4 列网格',
  source: '06,landing',
  category: 'card',
  tags: ['card', 'feature', 'icon'],
  slots: {
    cardIcon:  { label: '图标 (lucide 名称)', type: 'text', placeholder: 'zap' },
    cardTitle: { label: '标题', type: 'text', placeholder: '功能名称' },
    cardBody:  { label: '描述', type: 'content', placeholder: '一段介绍文字' },
    cardLink:  { label: '跳转链接（可选）', type: 'text', placeholder: '/docs' },
    cardLinkText: { label: '链接文字（可选）', type: 'text', placeholder: 'Learn more →' },
  },
  sample: {
    cardIcon: 'zap',
    cardTitle: '极速渲染',
    cardBody: '从 MD 到样式 HTML，**纯前端、零后端**，所见即所得。',
    cardLink: '#',
    cardLinkText: '了解更多 →',
  },
  css: `
.comp-feature-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 22px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.comp-feature-card:hover {
  border-color: var(--clay);
  transform: translateY(-1px);
}
.comp-feature-card .fc-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: rgba(217,119,87,0.10);
  color: var(--clay);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}
.comp-feature-card .fc-icon svg { width: 18px; height: 18px; }
.comp-feature-card h3 {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 500;
  color: var(--slate);
  letter-spacing: -0.005em;
  margin: 0;
}
.comp-feature-card .fc-body {
  font-size: 14px;
  line-height: 1.65;
  color: var(--gray-700);
  margin: 0;
  flex: 1;
}
.comp-feature-card .fc-body p { margin: 0 0 6px; font-size: 14px; }
.comp-feature-card .fc-link {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--clay);
  margin-top: 6px;
}
.comp-feature-card .fc-link a { color: var(--clay); border-bottom: 1px solid transparent; }
.comp-feature-card .fc-link a:hover { border-bottom-color: var(--clay); }
  `.trim(),
  html: (s) => {
    if (!any(s.cardTitle, s.cardBody, s.cardIcon)) return '';
    const iconHtml = !isEmpty(s.cardIcon)
      ? `<div class="fc-icon"><i data-lucide="${s.cardIcon.trim()}"></i></div>`
      : '';
    const linkHtml = !isEmpty(s.cardLink) && !isEmpty(s.cardLinkText)
      ? `<div class="fc-link"><a href="${s.cardLink}">${s.cardLinkText}</a></div>`
      : '';
    return `
<div class="comp-feature-card" data-section="feature-card">
  ${iconHtml}
  ${!isEmpty(s.cardTitle) ? `<h3 data-slot="cardTitle">${s.cardTitle}</h3>` : ''}
  ${!isEmpty(s.cardBody) ? `<div class="fc-body" data-slot="cardBody" data-slot-type="content">${s.cardBody}</div>` : ''}
  ${linkHtml}
</div>`.trim();
  },
});
