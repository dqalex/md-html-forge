import { makeLayout } from './_layout-factory';

export default makeLayout({
  id: 'layout-flex-row',
  name: '横向 Flex 行',
  description: '一行横向排列，自动换行（适合 chip / button / logo 墙）',
  source: 'common,landing',
  tags: ['flex', 'row', 'inline'],
  containerCss: `
.comp-layout-flex-row { margin-bottom: 40px; }
.comp-layout-flex-row .layout-heading { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 12px; color: var(--slate); }
.comp-layout-flex-row .layout-children {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}
.comp-layout-flex-row .layout-children > * { flex: 0 0 auto; }
  `.trim(),
  sampleChildren: ['chip', 'chip'],
});
