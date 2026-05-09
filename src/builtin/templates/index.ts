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
import { BUILTIN_COMPONENTS } from '../components';
import { generateStarterMarkdown, type StarterMode } from './starter';

// ===== 内置模板 =====

/**
 * 创建一个基础模板（仅引用内置组件，无自定义组件）
 */
function makeTemplate(
  id: string,
  name: string,
  description: string,
  emoji: string,
  group: TemplateDef['group'],
  componentIds: string[],
  docTitle: string,
  starterMode: StarterMode = 'sample',
): TemplateDef {
  return {
    id,
    name,
    description,
    emoji,
    group,
    componentIds,
    starterMarkdown: generateStarterMarkdown(componentIds, docTitle, BUILTIN_COMPONENTS, starterMode),
  };
}

export const BUILTIN_TEMPLATES: TemplateDef[] = [
  makeTemplate(
    'blank',
    '空白文档',
    '只有标题和正文 — 自由扩展',
    '📄',
    'playground',
    ['header', 'body', 'footer'],
    '新文档',
    'skeleton',
  ),
  makeTemplate(
    'status-report',
    '工程周报',
    '4 列指标 + 亮点 + 交付表格 + 结转清单',
    '📊',
    'report',
    ['header', 'summary-band', 'highlights', 'table', 'actions', 'footer'],
    '工程状态周报 · 2026-W19',
  ),
  makeTemplate(
    'incident-report',
    '事故复盘',
    '状态 pill + TL;DR + 时间线 + 行动清单',
    '🚨',
    'report',
    ['header', 'meta-pills', 'tldr', 'timeline', 'table', 'actions', 'footer'],
    '事故复盘 · 登录超时',
  ),
  makeTemplate(
    'impl-plan',
    '实施计划',
    '指标 + 里程碑 + Before/After + 代码 + 风险',
    '📋',
    'plan',
    ['header', 'summary-band', 'milestones', 'before-after', 'code', 'checklist', 'qa', 'footer'],
    '组件库拆分实施计划',
  ),
  makeTemplate(
    'pr-writeup',
    'PR 说明',
    'TL;DR + Before/After + 代码 + 测试 + 发布',
    '🔀',
    'code-review',
    ['header', 'tldr', 'before-after', 'code', 'actions', 'rollout', 'footer'],
    'PR · 拆分组件目录',
  ),
  makeTemplate(
    'explainer',
    '技术讲解',
    '标题 + 导语 + TL;DR + 正文 + 问答',
    '📖',
    'research',
    ['header', 'lead', 'tldr', 'body', 'qa', 'footer'],
    'md-html-forge 是什么',
  ),
  makeTemplate(
    'metrics-board',
    '数据看板',
    '大指标卡 + 进度条 + 亮点',
    '📈',
    'report',
    ['header', 'metrics', 'progress', 'highlights', 'footer'],
    '组件库进度看板',
  ),
  makeTemplate(
    'decision-doc',
    '决策文档',
    'TL;DR + Before/After + 方案对比 + 待办',
    '⚖️',
    'plan',
    ['header', 'tldr', 'before-after', 'options', 'actions', 'footer'],
    '组件库规模决策',
  ),
];

export const BUILTIN_TEMPLATE_MAP = new Map(BUILTIN_TEMPLATES.map(t => [t.id, t]));

export function getBuiltinTemplate(id: string): TemplateDef | undefined {
  return BUILTIN_TEMPLATE_MAP.get(id);
}
