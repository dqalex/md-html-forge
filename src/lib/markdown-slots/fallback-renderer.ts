/**
 * 兜底渲染器（保持向后兼容的 API）
 *
 * ⚠️ 新代码请直接使用 `@/builtin` 的 renderComposed。
 *
 * 这个文件只是个薄壳，把旧调用点路由到新的 Compose 渲染引擎。
 * 优先级：
 *   1. MD 有 @compose → 走 builtin/renderer.ts 的 renderComposed
 *   2. 有 templateHtml → 走 slot-sync 的传统注入
 *   3. 都没有 → editorial 兜底渲染
 */

import { syncMdToHtml, extractSlotsFromMd, simpleMdToHtml, sanitizeHtml, inlineMdToHtml } from './slot-sync';
import { SHARED_TOKENS_CSS } from '@/builtin/components/shared-tokens';
import { parseComposeDirective } from '@/builtin/renderer';
import { compile } from '@/builtin/compiler';
import { forgeRegistry } from '@/builtin/compiler/registry';
import '@/builtin/bootstrap'; // 确保 registry 已初始化
import type { Diagnostic } from '@/builtin/compiler';
import { DEFAULT_THEME_ID } from '@/builtin/themes';
import type { ComponentDef, TemplateDef } from '@/builtin/types';
import type { ThemeDef } from '@/builtin/themes/types';
import type { SlotDef } from './types';

export interface RenderResult {
  html: string;
  mode: 'compose' | 'template' | 'editorial';
  componentIds?: string[];
  orphanSlots?: string[];
  /** 编译诊断（compose 模式才有） */
  diagnostics?: readonly Diagnostic[];
}

export { parseComposeDirective } from '@/builtin/renderer';

export function renderWithFallback(
  mdContent: string,
  templateHtml: string,
  slotDefs: Record<string, SlotDef>,
  cssTemplate?: string,
  templateDef?: TemplateDef,
  /** 输出模式：preview(默认，含交互) / standalone(精简独立) */
  outputMode: 'preview' | 'standalone' = 'preview',
): RenderResult {
  // ─── 模式 1：@compose 指令 or 激活了新模板 ───────────────
  const hasCompose = parseComposeDirective(mdContent) !== null;
  if (hasCompose || templateDef) {
    const result = compileForPreview(mdContent, templateDef, outputMode);
    return {
      html: result.html,
      mode: 'compose',
      componentIds: result.doc.composeIds,
      orphanSlots: result.orphanSlotNames,
      diagnostics: result.diagnostics,
    };
  }

  // ─── 模式 2：老版 templateHtml 注入 ──────────────────────
  if (templateHtml.trim()) {
    return renderTemplate(mdContent, templateHtml, slotDefs, cssTemplate);
  }

  // ─── 模式 3：Editorial 兜底 ──────────────────────────────
  return { html: renderEditorial(mdContent), mode: 'editorial' };
}

/** 内部：走 compile pipeline，和 renderComposed 等价但额外暴露诊断 */
function compileForPreview(
  mdContent: string,
  templateDef?: TemplateDef,
  mode: 'preview' | 'standalone' = 'preview',
) {
  const componentMap = new Map<string, ComponentDef>();
  for (const c of forgeRegistry.getAllComponents()) componentMap.set(c.id, c);
  if (templateDef?.customComponents) {
    for (const c of templateDef.customComponents) componentMap.set(c.id, c);
  }
  const themeMap = new Map<string, ThemeDef>();
  for (const t of forgeRegistry.getAllThemes()) themeMap.set(t.id, t);

  let source = mdContent;
  const hasCompose = parseComposeDirective(mdContent) !== null;
  if (!hasCompose && templateDef?.componentIds && templateDef.componentIds.length > 0) {
    source = `<!-- @compose: ${templateDef.componentIds.join(', ')} -->\n\n${mdContent}`;
  }

  // 默认主题 = 文档首个 @theme（没有/未注册则回退内置默认）
  // 这是"全局主题"能影响整页 body 背景的关键：emitter 会据此生成 :root+body CSS
  const firstThemeMatch = source.match(/<!--\s*@theme\s*:?\s*([\w-]+)\s*-->/);
  const firstThemeId = firstThemeMatch?.[1];
  const defaultThemeId =
    firstThemeId && themeMap.has(firstThemeId) ? firstThemeId : DEFAULT_THEME_ID;

  return compile(source, {
    env: {
      componentMap,
      themeMap,
      defaultThemeId,
      defaultLayoutId: 'stack',
      pageWidth: 880,
      mode,
    },
  });
}

// ===== 模式 2：传统模板填充 =====

function renderTemplate(
  mdContent: string,
  templateHtml: string,
  slotDefs: Record<string, SlotDef>,
  cssTemplate?: string,
): RenderResult {
  const { html: baseHtml } = syncMdToHtml(mdContent, templateHtml, slotDefs, cssTemplate);

  const allDefs: Record<string, SlotDef> = { ...slotDefs };
  const slotNameRe = /<!--\s*@slot:(\w+)\s*-->/g;
  let m: RegExpExecArray | null;
  while ((m = slotNameRe.exec(mdContent)) !== null) {
    if (!allDefs[m[1]!]) allDefs[m[1]!] = { label: m[1]!, type: 'content' };
  }
  const slotsMap = extractSlotsFromMd(mdContent, allDefs);
  const templateSlotNames = extractTemplateSlotNames(templateHtml);

  const orphans: string[] = [];
  slotsMap.forEach((_, name) => {
    if (!templateSlotNames.has(name)) orphans.push(name);
  });

  let html = baseHtml;
  if (orphans.length > 0) {
    const orphanHtml = renderOrphanBlock(orphans, slotsMap);
    html = injectBeforeBodyEnd(html, orphanHtml);
  }

  return { html, mode: 'template', orphanSlots: orphans };
}

function extractTemplateSlotNames(templateHtml: string): Set<string> {
  const names = new Set<string>();
  const re = /data-slot="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(templateHtml)) !== null) names.add(m[1]!);
  return names;
}

// ===== 模式 3：Editorial 兜底 =====

function renderEditorial(mdContent: string): string {
  const slotNameRe = /<!--\s*@slot:(\w+)\s*-->/g;
  const hasSlots = slotNameRe.test(mdContent);

  if (!hasSlots) {
    const bodyHtml = sanitizeHtml(simpleMdToHtml(mdContent));
    return wrapInEditorial(`<div>${bodyHtml}</div>`);
  }

  const defs: Record<string, SlotDef> = {};
  let m: RegExpExecArray | null;
  slotNameRe.lastIndex = 0;
  while ((m = slotNameRe.exec(mdContent)) !== null) {
    defs[m[1]!] = { label: m[1]!, type: 'content' };
  }
  const slotsMap = extractSlotsFromMd(mdContent, defs);
  const sections: string[] = [];
  slotsMap.forEach((slot, name) => {
    const raw = Array.isArray(slot.content) ? slot.content.join('\n\n') : slot.content;
    if (!raw.trim()) return;
    const html = sanitizeHtml(simpleMdToHtml(raw));
    sections.push(`
<div class="slot-block">
  <span class="slot-label">${name}</span>
  <div>${html}</div>
</div>`.trim());
  });

  return wrapInEditorial(sections.join('\n'));
}

// ===== 辅助 =====

function renderOrphanBlock(
  orphanSlots: string[],
  slotsMap: ReturnType<typeof extractSlotsFromMd>,
): string {
  const sections = orphanSlots.map(name => {
    const slot = slotsMap.get(name);
    if (!slot) return '';
    const raw = Array.isArray(slot.content) ? slot.content.join('\n\n') : slot.content;
    if (!raw.trim()) return '';
    const html = sanitizeHtml(simpleMdToHtml(raw));
    return `<div class="forge-orphan"><span class="forge-orphan-label">${name}</span><div class="forge-orphan-body">${html}</div></div>`;
  }).filter(Boolean);
  if (sections.length === 0) return '';
  const css = `<style>.forge-orphan{margin-top:24px;padding:16px 20px;background:rgba(217,119,87,0.04);border:1px dashed rgba(217,119,87,0.3);border-radius:10px;}.forge-orphan-label{font-family:var(--mono,monospace);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--clay,#D97757);margin-bottom:6px;display:block;}.forge-orphan-body{font-size:14px;color:var(--gray-700,#3D3D3A);line-height:1.6;}</style>`;
  return css + sections.join('\n');
}

function injectBeforeBodyEnd(html: string, injection: string): string {
  if (!injection) return html;
  if (html.includes('</body>')) return html.replace('</body>', `${injection}\n</body>`);
  return html + '\n' + injection;
}

function wrapInEditorial(body: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${SHARED_TOKENS_CSS}
.forge-doc { max-width: 720px; margin: 0 auto; padding: 56px 24px 120px; }
.forge-doc .slot-block { margin-bottom: 28px; }
.forge-doc .slot-label {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--gray-500); margin-bottom: 6px; display: block;
}
</style>
</head>
<body>
<div class="forge-doc">
${body}
</div>
</body>
</html>`;
}
