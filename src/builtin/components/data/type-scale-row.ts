import { defineComponent, isEmpty, any } from '../_base';

/**
 * Type Scale · 字号展示表
 *
 * 展示设计系统的排版 token 表：每行一个 specimen + 元数据。
 * 在设计系统文档中展示完整的字号体系。
 */
export default defineComponent({
  id: 'type-scale-row',
  name: '字号展示行',
  description: '设计系统排版 token 行（示例文本 + 名称 + 规格）',
  source: '05',
  category: 'data',
  tags: ['design-system', 'typography', 'type-scale'],

  slots: {
    specimenText: { label: '示例文本',       type: 'text',    placeholder: 'Plan the week ahead' },
    specimenName: { label: '排版名称',       type: 'text',    placeholder: 'Display' },
    specimenMeta: { label: '规格（字号/行高/字重）', type: 'text', placeholder: '48 / 1.1 / 500' },
    specimenFont: { label: '字体族 serif/sans/mono', type: 'text', placeholder: 'serif' },
    specimenSize: { label: '字号 px',        type: 'text',    placeholder: '48' },
    specimenWeight: { label: '字重',         type: 'text',    placeholder: '500' },
    specimenLineHeight: { label: '行高',     type: 'text',    placeholder: '1.1' },
    specimenLetterSpacing: { label: '字间距（可选）', type: 'text', placeholder: '-0.02em' },
    specimenColor: { label: '文字颜色（可选）', type: 'text', placeholder: '' },
  },

  sample: {
    specimenText: 'Plan the week ahead',
    specimenName: 'Display',
    specimenMeta: '48 / 1.1 / 500',
    specimenFont: 'serif',
    specimenSize: '48',
    specimenWeight: '500',
    specimenLineHeight: '1.1',
    specimenLetterSpacing: '-0.02em',
  },

  css: `
.comp-type-scale-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-100);
}
.comp-type-scale-row:last-child { border-bottom: none; }
.comp-type-scale-row .specimen {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--slate);
}
.comp-type-scale-row .type-meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
  text-align: right;
  flex-shrink: 0;
}
.comp-type-scale-row .type-meta .name {
  color: var(--gray-700);
  display: block;
  margin-bottom: 2px;
}
  `.trim(),

  html: (s) => {
    if (!any(s.specimenText, s.specimenName, s.specimenMeta)) return '';

    // Determine font-family
    const fontMap: Record<string, string> = {
      serif: 'var(--serif)',
      sans: 'var(--sans)',
      mono: 'var(--mono)',
    };
    const fontRaw = !isEmpty(s.specimenFont) ? s.specimenFont!.trim().toLowerCase() : 'serif';
    const fontFamily = fontMap[fontRaw] || fontRaw;

    // Build inline styles for the specimen (dynamic per-row styling is expected here)
    const styles: string[] = [`font-family:${fontFamily}`];
    if (!isEmpty(s.specimenSize)) styles.push(`font-size:${s.specimenSize!.trim()}px`);
    if (!isEmpty(s.specimenWeight)) styles.push(`font-weight:${s.specimenWeight!.trim()}`);
    if (!isEmpty(s.specimenLineHeight)) styles.push(`line-height:${s.specimenLineHeight!.trim()}`);
    if (!isEmpty(s.specimenLetterSpacing)) styles.push(`letter-spacing:${s.specimenLetterSpacing!.trim()}`);
    if (!isEmpty(s.specimenColor)) styles.push(`color:${s.specimenColor!.trim()}`);

    return `
<div class="comp-type-scale-row" data-section="type-scale-row">
  <div class="specimen" style="${styles.join(';')}" data-slot="specimenText">${s.specimenText || ''}</div>
  <div class="type-meta">
    ${!isEmpty(s.specimenName) ? `<span class="name" data-slot="specimenName">${s.specimenName}</span>` : ''}
    ${!isEmpty(s.specimenMeta) ? `<span data-slot="specimenMeta">${s.specimenMeta}</span>` : ''}
  </div>
</div>`.trim();
  },
});
