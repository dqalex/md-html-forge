import { defineComponent, isEmpty, any } from '../_base';

/**
 * Test Step · 测试步骤
 *
 * 带复选框的测试计划条目，支持 done 状态显示勾选标记，
 * 用于 PR writeup 中的测试计划清单。
 */
export default defineComponent({
  id: 'test-step',
  name: '测试步骤',
  description: '带复选框的测试计划条目（支持完成状态）',
  source: '17',
  category: 'list',
  tags: ['test', 'checkbox', 'plan', 'check', 'code-review'],

  slots: {
    testDone: { label: '是否完成（done）', type: 'text', placeholder: 'done' },
    testLabel: { label: '测试描述', type: 'text', placeholder: 'Unit: retry → dead-letter path' },
    testNote: { label: '备注', type: 'text', placeholder: 'packages/notify — 14 cases' },
  },

  sample: {
    testDone: 'done',
    testLabel: 'Unit: retry → dead-letter path, channel mute, singleton dedupe',
    testNote: 'packages/notify — 14 cases, real pg-boss on test db',
  },

  css: `
.comp-test-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--white);
  border: 1.5px solid var(--gray-300);
  border-radius: 10px;
  padding: 13px 18px;
  font-size: 14px;
}
.comp-test-step .ts-check {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 2px;
  border: 1.5px solid var(--gray-300);
  position: relative;
}
.comp-test-step .ts-check.done {
  background: var(--olive);
  border-color: var(--olive);
}
.comp-test-step .ts-check.done::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border-right: 2px solid var(--white);
  border-bottom: 2px solid var(--white);
  transform: rotate(40deg);
}
.comp-test-step .ts-label { color: var(--slate); }
.comp-test-step .ts-note {
  font-size: 13px;
  color: var(--gray-500);
  margin-top: 2px;
}
  `.trim(),

  html: (s) => {
    if (!any(s.testLabel, s.testNote)) return '';
    const isDone = s.testDone === 'done';
    return `
<div class="comp-test-step" data-section="test-step">
  <span class="ts-check${isDone ? ' done' : ''}" data-slot="testDone">${isDone ? 'done' : ''}</span>
  <div>
    ${!isEmpty(s.testLabel) ? `<div class="ts-label" data-slot="testLabel">${s.testLabel}</div>` : ''}
    ${!isEmpty(s.testNote) ? `<div class="ts-note" data-slot="testNote">${s.testNote}</div>` : ''}
  </div>
</div>`.trim();
  },
});
