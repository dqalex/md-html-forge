/**
 * md-html-forge 内置库
 *
 * 使用方式：
 * ```ts
 * import { renderComposed, BUILTIN_COMPONENTS, BUILTIN_TEMPLATES } from '@/builtin';
 *
 * const { html } = renderComposed(mdContent, { template: activeTemplate });
 * ```
 *
 * 扩展 Forge（编译器风格）：
 * ```ts
 * import { forgeRegistry } from '@/builtin';
 *
 * forgeRegistry.registerComponent(myDef);
 * forgeRegistry.registerTheme(myTheme);
 * forgeRegistry.registerInlineRule({
 *   id: 'my-emoji', pattern: /:smile:/g, render: () => '😀'
 * });
 * ```
 *
 * 直接用编译器（高级）：
 * ```ts
 * import { compile } from '@/builtin';
 * const { html, diagnostics } = compile(source, { env: {...} });
 * ```
 */

// 副作用：启动时把内置组件/主题/inline rule 注册进 registry
import './bootstrap';

export * from './types';
export * from './components';
export * from './templates';
export * from './renderer';

// 编译器 API
export {
  compile,
  tokenize,
  parse,
  resolve,
  emit,
  DiagnosticBag,
  DiagnosticCodes,
  formatDiagnostic,
  isKind,
  PAGE_WIDTH_PRESETS,
  DEFAULT_PAGE_CONFIG,
  parsePageConfig,
  resolvePageConfig,
} from './compiler';
export type {
  CompileResult,
  CompileOptions,
  Diagnostic,
  Severity,
  Token,
  TokenKind,
  ParseResult,
  ResolveResult,
  ResolveEnv,
  SectionPlan,
  ComponentPlan,
  GroupPlan,
  EmitEnv,
  EmitInput,
  EmitResult,
  DocumentNode,
  TopNode,
  AnyNode,
  SourceLoc,
  NodeKind,
  PageConfig,
  PageWidthPreset,
  BandStyle,
} from './compiler';

// 插件注册
export { forgeRegistry } from './compiler/registry';
export type { Registry, InlineRule, DirectivePlugin } from './compiler/registry';

// 兜底渲染
export { renderWithFallback, parseComposeDirective as parseComposeDirectiveFromFallback } from './fallback-renderer';
export type { RenderResult } from './fallback-renderer';
