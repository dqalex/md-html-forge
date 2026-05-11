import { defineComponent, isEmpty, any } from '../_base';

/**
 * Setup Steps · 引导步骤列表
 *
 * 编号步骤列表，每项含主文字和可选说明。
 * 适用于空状态引导、onboarding、设置向导等场景。
 */
export default defineComponent({
  id: 'setup-steps',
  name: '引导步骤',
  description: '编号步骤列表，每项含主文字 + 可选说明',
  source: '02',
  category: 'list',
  tags: ['steps', 'onboarding', 'guide', 'tutorial'],

  slots: {
    stepsTitle: { label: '标题',     type: 'text',    placeholder: 'Set up this project', bind: 'h3' },
    stepsBody:  { label: '步骤内容', type: 'content', placeholder: '1. 第一步\n2. 第二步\n3. 第三步', bind: 'ol' },
  },

  sample: {
    stepsTitle: 'Set up this project',
    stepsBody: `1. Create your first task — Give it a name and an owner.
2. Add a due date — Birchline will surface it on the timeline.
3. Invite a teammate — Shared projects stay in sync automatically.`,
  },

  css: `
.comp-setup-steps {
  width: 100%;
  max-width: 360px;
}
.comp-setup-steps h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 18px;
  color: var(--slate);
  margin-bottom: 14px;
}
.comp-setup-steps ol {
  list-style: none;
  counter-reset: ss-step;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
}
.comp-setup-steps li {
  counter-increment: ss-step;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--white);
  border: var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--slate);
}
.comp-setup-steps li::before {
  content: counter(ss-step);
  font-family: var(--mono);
  font-size: 11px;
  flex: 0 0 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--oat);
  color: var(--slate);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
  `.trim(),

  html: (s) => {
    if (!any(s.stepsTitle, s.stepsBody)) return '';
    return `
<div class="comp-setup-steps" data-section="setup-steps">
  ${!isEmpty(s.stepsTitle) ? `<h3 data-slot="stepsTitle">${s.stepsTitle}</h3>` : ''}
  ${!isEmpty(s.stepsBody) ? `<div data-slot="stepsBody" data-slot-type="content">${s.stepsBody}</div>` : ''}
</div>`.trim();
  },
});
