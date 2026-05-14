/**
 * md-html-forge/icons — 图标渲染子路径
 *
 * 此模块依赖 react + react-dom + lucide-react（peerDependencies）。
 * 如果你的项目不使用 React，请勿导入此模块。
 *
 * 用法：
 * ```ts
 * import { renderIconsInHtml } from 'md-html-forge/icons';
 * ```
 */

// Forge 内联规则中的 lucide 渲染
export { renderLucideIcon, renderIconsInHtml as renderIconsInHtmlForge, AVAILABLE_ICON_NAMES } from '../builtin/icons';

// Markdown 插槽中的图标渲染
export {
  renderIconsInHtml,
  renderIconToSvg,
  getAvailableIconNames,
  isIconAvailable,
} from '../lib/markdown-slots/icon-render';
export type { IconRenderConfig } from '../lib/markdown-slots/icon-render';

// Lucide 内联规则
export { LUCIDE_RULES } from '../builtin/inline-rules/lucide';

// === 副作用：导入时自动注册 LUCIDE_RULES 到 forgeRegistry ===
import { forgeRegistry } from '../builtin/compiler/registry';
import { LUCIDE_RULES as _rules } from '../builtin/inline-rules/lucide';
for (const rule of _rules) forgeRegistry.registerInlineRule(rule);
