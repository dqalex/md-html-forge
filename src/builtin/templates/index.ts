/**
 * 内置模板库
 *
 * 模板 = 组件组合 + 起始 MD。每个模板只负责：
 * 1. 声明默认使用哪些组件（componentIds）
 * 2. 可选：提供模板专属的扩展组件（customComponents）
 * 3. 提供起始 MD 骨架
 *
 * 渲染时的组件查找顺序：
 *   MD 中 @compose 引用的 id →
 *     1. 先在模板 customComponents 中找
 *     2. 找不到就在 BUILTIN_COMPONENTS 中找
 *     3. 都找不到就忽略
 */

import type { TemplateDef } from '../types';
import { makeTemplate } from './make-template';

/* HTML Effectiveness Templates */
import { BATCH_A_TEMPLATES } from './batches/he-batch-a';
import { BATCH_B_TEMPLATES } from './batches/he-batch-b';
import { BATCH_C_TEMPLATES } from './batches/he-batch-c';
import { BATCH_D_TEMPLATES } from './batches/he-batch-d';
import { BATCH_E_TEMPLATES } from './batches/he-batch-e';

// ===== 内置模板 =====

export const BUILTIN_TEMPLATES: TemplateDef[] = [
  makeTemplate({
    id: 'blank',
    name: '空白文档',
    description: '只有标题和正文 — 自由扩展',
    emoji: '📄',
    icon: 'FileText',
    color: 'var(--color-ivory-300)',
    group: 'playground',
    componentIds: ['header', 'body', 'footer'],
    docTitle: '新文档',
    starterMode: 'skeleton',
  }),

  /* HTML Effectiveness Templates (20) */
  ...BATCH_A_TEMPLATES,
  ...BATCH_B_TEMPLATES,
  ...BATCH_C_TEMPLATES,
  ...BATCH_D_TEMPLATES,
  ...BATCH_E_TEMPLATES,
];

export const BUILTIN_TEMPLATE_MAP = new Map(BUILTIN_TEMPLATES.map(t => [t.id, t]));

export function getBuiltinTemplate(id: string): TemplateDef | undefined {
  return BUILTIN_TEMPLATE_MAP.get(id);
}
