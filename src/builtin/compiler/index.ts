/**
 * Forge 编译器统一入口
 *
 * pipeline：source → tokens → AST → plan → HTML
 */

export { tokenize } from './lexer';
export type { Token, TokenKind } from './lexer';

export { parse } from './parser';
export type { ParseResult } from './parser';

export { resolve } from './resolver';
export type {
  ResolveResult,
  ResolveEnv,
  SectionPlan,
  ComponentPlan,
  GroupPlan,
} from './resolver';

export { emit } from './emitter';
export type { EmitEnv, EmitInput, EmitResult } from './emitter';

export {
  DiagnosticBag,
  Codes as DiagnosticCodes,
  formatDiagnostic,
} from './diagnostics';
export type { Diagnostic, Severity } from './diagnostics';

export { LRU, fnv1aHash, fingerprint, debugCacheStats } from './cache';

export {
  PAGE_WIDTH_PRESETS,
  DEFAULT_PAGE_CONFIG,
  parsePageConfig,
  resolvePageConfig,
} from './page-config';
export type { PageConfig, PageWidthPreset, BandStyle } from './page-config';

export type {
  AnyNode,
  DocumentNode,
  TopNode,
  SlotNode,
  GroupNode,
  GroupItemNode,
  ComposeNode,
  LayoutNode,
  ThemeNode,
  UseNode,
  TextNode,
  SourceLoc,
  NodeKind,
} from './ast';
export { isKind } from './ast';

// ===== 高层 compile() 便捷函数 =====

import { tokenize } from './lexer';
import { parse } from './parser';
import { resolve, type ResolveEnv } from './resolver';
import { emit, type EmitEnv } from './emitter';
import { bindNativeMd } from './md-binding';
import type { Diagnostic } from './diagnostics';
import type { DocumentNode } from './ast';
import { cachedCompile, fingerprint } from './cache';
import {
  parsePageConfig,
  resolvePageConfig,
  type PageConfig,
} from './page-config';

export interface CompileOptions {
  env: ResolveEnv & EmitEnv;
  /** 模板提供的 page 配置默认值（@page 指令可覆盖） */
  templatePage?: Partial<PageConfig>;
  /** 禁用顶层缓存（调试用） */
  noCache?: boolean;
}

export interface CompileResult {
  html: string;
  diagnostics: readonly Diagnostic[];
  doc: DocumentNode;
  usedComponentIds: string[];
  unresolvedComponentIds: string[];
  orphanSlotNames: string[];
  /** 最终采用的 page 配置（诊断/调试用） */
  pageConfig: PageConfig;
}

/**
 * 一键编译：MD 源码 → HTML + 诊断
 */
export function compile(source: string, opts: CompileOptions): CompileResult {
  if (opts.noCache) return doCompile(source, opts);
  const envKey = buildEnvKey(opts.env, opts.templatePage);
  const key = `${fingerprint(source)}|${envKey}`;
  return cachedCompile(key, () => doCompile(source, opts));
}

function doCompile(source: string, opts: CompileOptions): CompileResult {
  // 0. @page 解析 (pre-pass，不进入 AST)
  const fromDirective = parsePageConfig(source);
  const pageConfig = resolvePageConfig(fromDirective, opts.templatePage);

  const tokens = tokenize(source);
  const { doc: rawDoc, diagnostics } = parse(source, tokens);

  // 0.5 MD 原生块 → slot 自动绑定（基于组件 slot.bind 规则）
  const doc = bindNativeMd(rawDoc, source, opts.env.componentMap);

  const resolved = resolve(doc, opts.env, diagnostics);
  const emitted = emit(
    {
      sections: resolved.sections,
      orphanSlotValues: resolved.orphanSlotValues,
      usedThemeIds: resolved.usedThemeIds,
    },
    { ...opts.env, page: pageConfig },
  );

  return {
    html: emitted.html,
    diagnostics: diagnostics.all(),
    doc,
    usedComponentIds: emitted.usedComponentIds,
    unresolvedComponentIds: resolved.unresolvedComponentIds,
    orphanSlotNames: Object.keys(resolved.orphanSlotValues),
    pageConfig,
  };
}

/**
 * 构建 env 的缓存键
 */
function buildEnvKey(env: ResolveEnv & EmitEnv, templatePage?: Partial<PageConfig>): string {
  const compIds = Array.from(env.componentMap.keys()).sort().join(',');
  const themeIds = Array.from(env.themeMap.keys()).sort().join(',');
  const tpl = templatePage ? `|tpl=${templatePage.width ?? ''}:${templatePage.band ?? ''}` : '';
  const mode = env.mode ?? 'preview';
  return `c=${fingerprint(compIds)}|t=${fingerprint(themeIds)}|dl=${env.defaultLayoutId}|dt=${env.defaultThemeId}|m=${mode}${tpl}`;
}
