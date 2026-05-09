/**
 * Markdown 插槽渲染 - 公开 API
 *
 * 移植自 teamclaw/src/shared/lib/slot-sync.ts
 *
 * 核心功能：
 * - MD ↔ HTML 双向槽位同步
 * - MD 按标记提取/更新 slot 值
 * - HTML 模板注入 slot 内容
 * - 简易 MD↔HTML 互转（用于 slot 内容）
 * - iframe 编辑脚本生成
 * - DOMPurify 安全清洗
 */

// 类型
export type { SlotType, SlotDef, SlotValue, SlotSyncResult, TemplateManifest, SlotRenderOptions } from './types';

// 核心同步
export {
  extractSlotsFromMd,
  updateMdSlot,
  updateMdSlots,
  extractSlotsFromHtml,
  injectSlotsToHtml,
  syncMdToHtml,
  syncHtmlToMd,
} from './slot-sync';

// MD↔HTML 转换
export {
  simpleMdToHtml,
  htmlToSimpleMd,
} from './slot-sync';

// 安全
export {
  sanitizeHtml,
  cleanEditorAttributes,
} from './slot-sync';

// 模板生成
export {
  generateMdFromTemplate,
  generateIframeScript,
  generatePreviewHtml,
  MD_RICHTEXT_STYLES,
  // 消除 viewer 重复代码的共享工具
  SLOT_HIGHLIGHT_CSS,
  extractHtmlSlotNames,
  injectVarsToHtml,
  buildEmptyPreviewHtml,
  buildMdPreviewHtml,
  buildVarsPreviewHtml,
} from './slot-sync';

// 可选依赖注入
export { setIconRenderer } from './slot-sync';

// Lucide 图标渲染（默认自动接线，把 <i data-lucide="xxx"></i> 渲染成 SVG）
export {
  renderIconsInHtml,
  renderIconToSvg,
  getAvailableIconNames,
  isIconAvailable,
} from './icon-render';
export type { IconRenderConfig } from './icon-render';

// === 自动接线：模块加载时即注入 lucide 渲染器 ===
// 这样所有调用 syncMdToHtml / generatePreviewHtml 的业务侧无需感知，
// :lucide:icon-name: 短码会被直接渲染为真实 SVG。
import { setIconRenderer as _setIconRenderer } from './slot-sync';
import { renderIconsInHtml as _renderIconsInHtml } from './icon-render';
_setIconRenderer(_renderIconsInHtml);

// 统一插槽规范
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
} from './universal-slots';

export type { UniversalSlotName } from './universal-slots';