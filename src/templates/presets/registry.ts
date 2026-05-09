/**
 * 模板注册表（适配层）
 *
 * 所有模板数据现在由 @/builtin/templates 提供。
 * 本文件保留 PresetTemplate 类型以兼容现有编辑器组件调用。
 *
 * 未来编辑器完成重构后，可直接使用 @/builtin 的 TemplateDef。
 */

import type { TemplateManifest } from '@/lib/markdown-slots';
import { BUILTIN_TEMPLATES, BUILTIN_COMPONENTS } from '@/builtin';
import type { TemplateDef } from '@/builtin/types';

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  group: 'research' | 'report' | 'code-review' | 'plan' | 'playground';
  emoji: string;
  manifest: TemplateManifest;
  starterMarkdown: string;
  /** 新系统：完整模板定义（供 MarkdownEditor 传给渲染器） */
  templateDef: TemplateDef;
}

/** 把 TemplateDef 转换为老的 PresetTemplate + TemplateManifest */
function toPreset(t: TemplateDef): PresetTemplate {
  // 把模板引用的所有组件 slot 汇总为 manifest.slots（供编辑器识别 slot 列表）
  const slots: TemplateManifest['slots'] = {};
  const componentMap = new Map(BUILTIN_COMPONENTS.map(c => [c.id, c]));
  for (const id of t.componentIds) {
    const comp = t.customComponents?.find(c => c.id === id) ?? componentMap.get(id);
    if (comp) Object.assign(slots, comp.slots);
  }

  // 最小骨架：只保留一个占位 div（真实渲染走 @/builtin 的 renderComposed）
  const templateHtml = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"></head>
<body><div data-forge-compose="${t.componentIds.join(',')}"></div></body></html>`;

  return {
    id: t.id,
    name: t.name,
    description: t.description,
    group: t.group,
    emoji: t.emoji,
    starterMarkdown: t.starterMarkdown,
    manifest: {
      skillMd: '',
      templateHtml,
      references: {},
      version: '3.0',
      slots,
    },
    templateDef: t,
  };
}

export const PRESETS: PresetTemplate[] = BUILTIN_TEMPLATES.map(toPreset);

export function getPresetById(id: string): PresetTemplate | undefined {
  return PRESETS.find(p => p.id === id);
}
