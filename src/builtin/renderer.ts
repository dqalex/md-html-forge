/**
 * renderComposed - 编译器 Facade
 *
 * 为了向后兼容，保留原有 API；内部完全走 compiler pipeline。
 * 新代码请直接用 `compile()` from `@/builtin/compiler`。
 */

import { compile } from './compiler';
import { forgeRegistry } from './compiler/registry';
import { DEFAULT_THEME_ID } from './themes';
import './bootstrap'; // 确保内置组件/主题/inline rule 已注册
import type { ComponentDef, TemplateDef } from './types';
import type { ThemeDef } from './themes/types';

// @compose: a, b  或  @compose a, b  （冒号可选）
const COMPOSE_PATTERN = /<!--\s*@compose\s*:?\s*([\w,\s-]+)\s*-->/;

// 文档顶部第一个 @theme，用于决定整页默认主题（body/:root 级）
const FIRST_THEME_PATTERN = /<!--\s*@theme\s*:?\s*([\w-]+)\s*-->/;

export interface ComposeResult {
  html: string;
  componentIds: string[];
  unresolvedIds: string[];
  orphanSlots: string[];
}

/** 从 MD 中取出 @compose id 列表（纯工具函数，不触发完整编译） */
export function parseComposeDirective(md: string): string[] | null {
  const match = md.match(COMPOSE_PATTERN);
  if (!match) return null;
  return match[1]!.split(',').map(s => s.trim()).filter(Boolean);
}

export function renderComposed(
  md: string,
  options: {
    template?: TemplateDef;
    pageWidth?: number;
  } = {},
): ComposeResult {
  const { template, pageWidth = 880 } = options;

  // 组件查找：registry (= 内置 + 用户扩展) + 模板 custom 覆盖
  const componentMap = new Map<string, ComponentDef>();
  for (const c of forgeRegistry.getAllComponents()) componentMap.set(c.id, c);
  if (template?.customComponents) {
    for (const c of template.customComponents) componentMap.set(c.id, c);
  }

  // 主题查找
  const themeMap = new Map<string, ThemeDef>();
  for (const t of forgeRegistry.getAllThemes()) themeMap.set(t.id, t);

  // 若用户没写 @compose 指令，注入 template.componentIds 作为"隐式 compose"
  const userCompose = parseComposeDirective(md);
  let source = md;
  if (!userCompose && template?.componentIds && template.componentIds.length > 0) {
    source = `<!-- @compose: ${template.componentIds.join(', ')} -->\n\n${md}`;
  }

  // 默认主题 = 文档里第一个 @theme；读不到或该主题未注册时退回内置默认
  //
  // 这样工具栏上的"全局主题"切换（upsert 文档首个 @theme）就能影响整页 body 背景，
  // 因为 emitter 会据此生成 :root + body 级的 rootThemeCss。
  const firstThemeMatch = source.match(FIRST_THEME_PATTERN);
  const firstThemeId = firstThemeMatch?.[1];
  const defaultThemeId =
    firstThemeId && themeMap.has(firstThemeId) ? firstThemeId : DEFAULT_THEME_ID;

  const result = compile(source, {
    env: {
      componentMap,
      themeMap,
      defaultThemeId,
      defaultLayoutId: 'stack',
      pageWidth,
    },
  });

  return {
    html: result.html,
    componentIds: result.doc.composeIds,
    unresolvedIds: result.unresolvedComponentIds,
    orphanSlots: result.orphanSlotNames,
  };
}

// ===== 导出（保持原文件对外 API） =====

export { BUILTIN_COMPONENTS } from './components';
export { BUILTIN_TEMPLATES, getBuiltinTemplate } from './templates';
export { BUILTIN_THEMES } from './themes';
