import { defineComponent, isEmpty, any } from '../_base';

/**
 * Drag List Item · 可拖拽排序列表项
 *
 * 侧边栏导航 / 列表排序原型中的单行项。
 * 包含 grip 手柄 + 标签 + 计数，用纯 CSS 渲染 grip 点阵。
 */
export default defineComponent({
  id: 'drag-list-item',
  name: '拖拽列表项',
  description: '带 grip 手柄的排序列表项，常用于原型交互演示',
  source: '08',
  category: 'card',
  tags: ['card', 'drag', 'reorder', 'list-item'],

  slots: {
    itemLabel: { label: '项名称', type: 'text', placeholder: 'Inbox', bind: 'paragraph' },
    itemCount: { label: '计数（可选）', type: 'text', placeholder: '14' },
  },

  sample: {
    itemLabel: 'Inbox',
    itemCount: '14',
  },

  css: `
.comp-drag-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  margin: 2px 0;
  border-radius: 8px;
  background: var(--white);
  cursor: grab;
  user-select: none;
  transition: background 120ms linear, transform 120ms ease-out, opacity 120ms linear;
}
.comp-drag-list-item:hover {
  background: var(--gray-100);
}
.comp-drag-list-item:hover .grip i {
  background: var(--gray-700);
}
.comp-drag-list-item .label {
  font-size: 14px;
  color: var(--slate);
}
.comp-drag-list-item .count {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
}
.comp-drag-list-item .grip {
  flex: none;
  width: 10px;
  height: 16px;
  display: grid;
  grid-template-columns: repeat(2, 3px);
  grid-template-rows: repeat(3, 3px);
  gap: 3px;
  align-content: center;
}
.comp-drag-list-item .grip i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--gray-300);
  transition: background 120ms linear;
}
  `.trim(),

  html: (s) => {
    if (isEmpty(s.itemLabel)) return '';
    return `
<div class="comp-drag-list-item" data-section="drag-list-item">
  <span class="grip"><i></i><i></i><i></i><i></i><i></i><i></i></span>
  <span class="label" data-slot="itemLabel">${s.itemLabel}</span>
  ${!isEmpty(s.itemCount) ? `<span class="count" data-slot="itemCount">${s.itemCount}</span>` : ''}
</div>`.trim();
  },
});
