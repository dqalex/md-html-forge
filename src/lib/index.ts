/**
 * md-html-forge — Markdown → styled HTML 渲染引擎
 *
 * 核心能力：
 *   1. Forge 编译器管线：MD → Tokens → AST → Plan → HTML
 *   2. 30+ 内置组件（header/summary/data/list/visual/card/footer/layout/special）
 *   3. 主题系统（editorial/mono/dark/magazine 等）
 *   4. 插槽同步（MD ↔ HTML 双向同步）
 *   5. 兜底渲染（compose → template → editorial 自动降级）
 *
 * 快速开始：
 * ```ts
 * import { renderComposed } from 'md-html-forge';
 * const { html } = renderComposed(mdContent);
 * ```
 *
 * 使用编译器（高级）：
 * ```ts
 * import { compile, forgeRegistry } from 'md-html-forge';
 * const result = compile(source, { env: { ... } });
 * ```
 *
 * 扩展：
 * ```ts
 * import { forgeRegistry } from 'md-html-forge';
 * forgeRegistry.registerComponent(myDef);
 * forgeRegistry.registerTheme(myTheme);
 * ```
 */

// ===== 编译器管线 =====
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
} from '../builtin/compiler';

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
} from '../builtin/compiler';

// ===== 插件注册 =====
export { forgeRegistry } from '../builtin/compiler/registry';
export type { Registry, InlineRule, DirectivePlugin } from '../builtin/compiler/registry';

// ===== 组件库 =====
export {
  BUILTIN_COMPONENTS,
  getBuiltinComponent,
  hasBuiltinComponent,
  defineComponent,
  SHARED_TOKENS_CSS,
} from '../builtin/components';
export type { ComponentDef, ComponentCategory } from '../builtin/components';

// ===== 模板库 =====
export {
  BUILTIN_TEMPLATES,
  BUILTIN_TEMPLATE_MAP,
  getBuiltinTemplate,
} from '../builtin/templates';
export type { TemplateDef } from '../builtin/types';

// ===== 主题系统 =====
export {
  BUILTIN_THEMES,
  BUILTIN_THEME_MAP,
  getBuiltinTheme,
  DEFAULT_THEME_ID,
  RECOMMENDED_THEME_IDS,
  buildThemeCss,
  buildThemesCss,
  buildRootThemeCss,
} from '../builtin/themes';
export type { ThemeDef } from '../builtin/themes/types';

// ===== 渲染器门面 =====
export {
  renderComposed,
  parseComposeDirective as parseCompose,
  BUILTIN_THEMES as ALL_THEMES,
  BUILTIN_TEMPLATES as ALL_TEMPLATES,
  BUILTIN_COMPONENTS as ALL_COMPONENTS,
} from '../builtin/renderer';
export type { ComposeResult } from '../builtin/renderer';

// ===== 兜底渲染 =====
export {
  renderWithFallback,
  parseComposeDirective,
} from '../builtin/fallback-renderer';
export type { RenderResult } from '../builtin/fallback-renderer';

// ===== 类型 =====
export type { TemplateGroup, ComponentLookup } from '../builtin/types';
export type { SlotDef, SlotType, SlotValue, SlotBindKind } from '../lib/markdown-slots/types';

// ===== 启动 =====
// 导入 bootstrap 以确保内置组件/主题/inline rule 已注册
import '../builtin/bootstrap';

// ===== Markdown 插槽同步 =====
export {
  extractSlotsFromMd,
  updateMdSlot,
  updateMdSlots,
  extractSlotsFromHtml,
  injectSlotsToHtml,
  syncMdToHtml,
  syncHtmlToMd,
  simpleMdToHtml,
  htmlToSimpleMd,
  sanitizeHtml,
  cleanEditorAttributes,
  generateMdFromTemplate,
  generateIframeScript,
  generatePreviewHtml,
  MD_RICHTEXT_STYLES,
  SLOT_HIGHLIGHT_CSS,
  extractHtmlSlotNames,
  injectVarsToHtml,
  buildEmptyPreviewHtml,
  buildMdPreviewHtml,
  buildVarsPreviewHtml,
  setIconRenderer,
} from '../lib/markdown-slots/slot-sync';

export type {
  SlotType as MarkdownSlotType,
  SlotDef as MarkdownSlotDef,
  SlotValue as MarkdownSlotValue,
  SlotSyncResult,
  TemplateManifest,
  SlotRenderOptions,
} from '../lib/markdown-slots/types';

// ===== 图标渲染（可选） =====
// 图标渲染需要 react + lucide-react，已拆分为独立子路径 'md-html-forge/icons'。
// 请按需导入：import { renderIconsInHtml } from 'md-html-forge/icons';
//
// 不需要图标渲染的纯 Node/非 React 环境无需关心此模块。

// ===== 通用插槽规范 =====
export {
  UNIVERSAL_SLOTS,
  CORE_SLOTS,
  CONTENT_SLOTS,
  DATA_SLOTS,
  LANDING_SLOTS,
  WECHAT_SLOTS,
  PRESET_REPORT_CARD,
  PRESET_TECH_SHARING,
  PRESET_INSIGHT_POSTER,
  PRESET_NEWSPAPER,
  PRESET_NEWSPAPER_MOBILE,
  PRESET_SOCIAL_CARD,
  PRESET_LANDING_PAGE,
  PRESET_WECHAT,
  PRESET_WEEKLY,
  pickSlots,
  generateMdSkeleton,
  detectUsedSlots,
  getSlotGroup,
} from '../lib/markdown-slots/universal-slots';
export type { UniversalSlotName } from '../lib/markdown-slots/universal-slots';

// ===== Forge 组件加载器 =====
export {
  parseForgeMd,
  forgeToComponentDef,
  getForgeJs,
  renderForgeHtml,
} from '../builtin/components/forge-loader';
export type { ForgeMeta, ForgeComponent } from '../builtin/components/forge-loader';
