import { makeLayout } from './_layout-factory';

export default makeLayout({
  id: 'layout-grid-2',
  name: '2 列网格',
  description: '横向 2 列等宽网格，子项可以是任意组件',
  source: 'common',
  tags: ['grid', 'layout', '2col'],
  headingPlaceholder: '可选标题',
  containerCss: `
.comp-layout-grid-2 { margin-bottom: 40px; }
.comp-layout-grid-2 .layout-heading { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-layout-grid-2 .layout-children {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
@media (max-width: 640px) {
  .comp-layout-grid-2 .layout-children { grid-template-columns: 1fr; }
}
  `.trim(),
  sampleChildren: ['feature-card', 'feature-card'],
});
