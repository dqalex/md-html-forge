import { defineComponent, isEmpty } from '../_base';

/**
 * Slide Agenda · 幻灯片议程/待办
 *
 * 用于幻灯片末尾展示"下一步"或"待办事项"列表。
 * 带横线标记和可选的脚注。
 */
export default defineComponent({
  id: 'slide-agenda',
  name: '幻灯片议程',
  description: '下一步/待办列表，每条带横线标记 + 可选脚注',
  source: '09',
  category: 'list',
  tags: ['agenda', 'next', 'todo', 'slide', 'on-deck'],

  slots: {
    agendaItems:  { label: '议程项（每行一条）', type: 'content', placeholder: '- 第一步\n- 第二步\n- 第三步', bind: 'list' },
    agendaFootnote: { label: '脚注（可选）', type: 'text', placeholder: 'Questions → drop them in the channel.' },
  },

  sample: {
    agendaItems: '- Finish recurring tasks — timezone matrix tests, then dogfood on the internal ops board.\n- Audit log export to private beta — three workspaces lined up.\n- Start scoping rate-limit headers for the public API; RFC draft by Thursday.',
    agendaFootnote: 'Questions → drop them in the platform channel or grab anyone after standup.',
  },

  css: `
.comp-slide-agenda {
  margin-bottom: 0;
}
.comp-slide-agenda .sa-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0;
  margin: 0;
}
.comp-slide-agenda .sa-list li {
  font-family: var(--serif);
  font-size: 21px;
  line-height: 1.45;
  padding-left: 36px;
  position: relative;
}
.comp-slide-agenda .sa-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 18px;
  height: 1.5px;
  background: var(--clay);
}
.comp-slide-agenda .sa-footnote {
  margin-top: 56px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
}
  `.trim(),

  html: (s) => {
    if (isEmpty(s.agendaItems)) return '';
    return `
<section class="comp-slide-agenda" data-section="slide-agenda">
  <div data-slot="agendaItems" data-slot-type="content">${s.agendaItems}</div>
  ${!isEmpty(s.agendaFootnote) ? `<div class="sa-footnote" data-slot="agendaFootnote">${s.agendaFootnote}</div>` : ''}
</section>`.trim();
  },
});
