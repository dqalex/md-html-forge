import { makeLayout } from './_layout-factory';

/**
 * Scroll Row · 横向滑块
 *
 * 与 layout-flex-row 的区别：
 *   - flex-row 会换行（适合 chip / 标签墙）
 *   - scroll-row **不换行**，内容超出视口 → 横向滚动（适合"多张卡片并排不能换行"的场景）
 *
 * 使用：
 *
 *   <!-- @compose-group: scroll-row -->
 *   <!-- @item card variant=stat statValue="30+" statLabel="A" --><!-- @/item -->
 *   <!-- @item card variant=stat statValue="12"  statLabel="B" --><!-- @/item -->
 *   <!-- @item card variant=stat statValue="∞"   statLabel="C" --><!-- @/item -->
 *   <!-- ...更多 item，直到超出视口... -->
 *   <!-- @/compose-group -->
 *
 * 视觉细节：
 *   - 右侧 padding 留白，让最后一张卡片"若隐若现"暗示还能滚动
 *   - 原生滚动条样式做了轻量化（细 + 半透明）
 *   - 卡片 min-width 240px 起，避免太窄失去卡片感
 *   - scroll-snap 让滑动终点对齐到卡片边，手感更稳
 */
export default makeLayout({
  id: 'scroll-row',
  name: '横向滑块',
  description: '子项横向排列、不换行；溢出范围时横向滚动显示',
  source: 'common',
  tags: ['scroll', 'row', 'carousel', 'horizontal'],
  containerCss: `
.comp-scroll-row { margin-bottom: 40px; }
.comp-scroll-row .layout-heading { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 12px; color: var(--slate); }
.comp-scroll-row .layout-children {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 32px 14px 0;
  scroll-snap-type: x proximity;
  scroll-padding-inline-start: 0;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.comp-scroll-row .layout-children > * {
  flex: 0 0 auto;
  min-width: 240px;
  max-width: 90%;
  scroll-snap-align: start;
}
/* 轻量滚动条样式（Chromium / Safari） */
.comp-scroll-row .layout-children::-webkit-scrollbar {
  height: 8px;
}
.comp-scroll-row .layout-children::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--slate) 18%, transparent);
  border-radius: 999px;
}
.comp-scroll-row .layout-children::-webkit-scrollbar-track {
  background: transparent;
}
/* Firefox */
.comp-scroll-row .layout-children {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--slate) 25%, transparent) transparent;
}
  `.trim(),
  sampleChildren: ['card', 'card', 'card', 'card', 'card'],
  headingPlaceholder: '横向滑块',
});
