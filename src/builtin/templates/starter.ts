/**
 * Starter Markdown 生成器
 *
 * 两种模式：
 * - 'sample'（默认）：用组件自带的 sample 填充 slot，首屏即示范
 * - 'skeleton'：只留提示注释，slot 为空，组件不渲染（空白文档）
 *
 * 布局组件特殊处理：
 * - isLayout=true 的组件 → 生成 `@compose-group` 嵌套块
 * - sampleChildren 数组 → 每个 id 生成一个 `@item` 子项
 * - 同一 child 在 layout 中多次出现时，从 SAMPLE_VARIANTS 取不同数据，避免重复
 */

import type { ComponentDef } from '../types';

export type StarterMode = 'sample' | 'skeleton';

/** 当 layout.sampleChildren 重复同一 id 时，循环使用不同变体让示范更生动 */
const SAMPLE_VARIANTS: Record<string, Array<Record<string, string>>> = {
  'feature-card': [
    {
      cardIcon: 'zap', cardTitle: '极速渲染',
      cardBody: '从 MD 到样式 HTML，**纯前端、零后端**，所见即所得。',
    },
    {
      cardIcon: 'layers', cardTitle: '组件自由组合',
      cardBody: '20+ 个内置组件，通过 `@compose` 任意拼装，每个 slot 独立编辑。',
    },
    {
      cardIcon: 'sparkles', cardTitle: '设计语言一致',
      cardBody: '所有组件共享 ivory + clay + serif 设计 token，无需手调样式。',
    },
    {
      cardIcon: 'wand-2', cardTitle: 'Markdown 优先',
      cardBody: '保留 \\`**bold**\\` / 列表 / 表格 / 代码块的完整支持。',
    },
  ],
  'stat-card': [
    { statValue: '20+', statLabel: 'Built-in Components', statDelta: 'expanding to 122' },
    { statValue: '8', statLabel: 'Default Templates', statDelta: 'all composable' },
    { statValue: '80+', statLabel: 'Lucide Icons', statDelta: 'tree-shaken' },
    { statValue: '0', statLabel: 'Backend Required', statDelta: 'pure frontend' },
  ],
};

export function generateStarterMarkdown(
  componentIds: string[],
  docTitle: string,
  availableComponents: readonly ComponentDef[],
  mode: StarterMode = 'sample',
): string {
  const componentMap = new Map(availableComponents.map(c => [c.id, c]));

  const lines: string[] = [
    `<!-- @compose: ${componentIds.join(', ')} -->`,
    '',
    `<!-- 顶部 @compose 声明了页面包含的组件，按顺序渲染 -->`,
    `<!-- 每个 slot 块可以自由编辑；留空则对应组件不渲染 -->`,
    `<!-- 布局组件（layout-grid-* / layout-flex-*）通过 @compose-group + @item 嵌套子组件 -->`,
    '',
  ];

  const seenSlots = new Set<string>();

  for (const id of componentIds) {
    const comp = componentMap.get(id);
    if (!comp) continue;

    if (comp.isLayout) {
      lines.push(...renderLayoutBlock(comp, componentMap, mode));
      lines.push('');
    } else {
      lines.push(`<!-- ─── ${comp.name} (${id}) ─── -->`);
      for (const [slotName, slotDef] of Object.entries(comp.slots)) {
        if (seenSlots.has(slotName)) continue;
        seenSlots.add(slotName);
        const body = makeSlotBody(comp, slotName, slotDef, docTitle, mode);
        lines.push(`<!-- @slot:${slotName} -->`);
        lines.push(body);
        lines.push(`<!-- @/slot -->`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function makeSlotBody(
  comp: ComponentDef,
  slotName: string,
  slotDef: { label: string; placeholder?: string },
  docTitle: string,
  mode: StarterMode,
  variantOverride?: Record<string, string>,
): string {
  // 优先使用变体（布局子项循环时用）
  if (mode === 'sample' && variantOverride?.[slotName]) {
    return variantOverride[slotName]!.trimEnd();
  }
  if (mode === 'sample' && comp.sample?.[slotName]) {
    if (slotName === 'title' && docTitle) return docTitle;
    return comp.sample[slotName]!.trimEnd();
  }
  const hint = [
    slotDef.label,
    slotDef.placeholder ? `e.g. ${slotDef.placeholder.split('\n')[0]}` : '',
  ].filter(Boolean).join(' · ');
  return `<!-- ${hint} -->`;
}

/** 为布局组件生成 @compose-group 块 */
function renderLayoutBlock(
  layout: ComponentDef,
  componentMap: Map<string, ComponentDef>,
  mode: StarterMode,
): string[] {
  const lines: string[] = [];
  lines.push(`<!-- ─── ${layout.name} (${layout.id}) ─── -->`);

  // 布局自身的 slot
  for (const [slotName, slotDef] of Object.entries(layout.slots)) {
    const body = makeSlotBody(layout, slotName, slotDef, '', mode);
    lines.push(`<!-- @slot:${slotName} -->`);
    lines.push(body);
    lines.push(`<!-- @/slot -->`);
  }

  // 子项
  lines.push(`<!-- @compose-group: ${layout.id} -->`);
  const children = layout.sampleChildren ?? [];

  // 统计每个 child id 出现次数，给变体计数
  const variantCounter: Record<string, number> = {};

  for (const childId of children) {
    const child = componentMap.get(childId);
    if (!child) continue;

    // 从 SAMPLE_VARIANTS 取下一个变体
    const variants = SAMPLE_VARIANTS[childId];
    let variant: Record<string, string> | undefined;
    if (variants && variants.length > 0) {
      const idx = (variantCounter[childId] ?? 0) % variants.length;
      variant = variants[idx];
      variantCounter[childId] = (variantCounter[childId] ?? 0) + 1;
    }

    lines.push(`<!-- @item: ${childId} -->`);
    for (const [slotName, slotDef] of Object.entries(child.slots)) {
      const body = makeSlotBody(child, slotName, slotDef, '', mode, variant);
      lines.push(`<!-- @slot:${slotName} -->`);
      lines.push(body);
      lines.push(`<!-- @/slot -->`);
    }
    lines.push(`<!-- @/item -->`);
    lines.push('');
  }
  lines.push(`<!-- @/compose-group -->`);

  return lines;
}
