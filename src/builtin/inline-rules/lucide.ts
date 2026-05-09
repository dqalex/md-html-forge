/**
 * Lucide 图标 inline rule
 *
 * 两种源码形态都转换为 SVG：
 *   - :lucide:zap:     / :icon:zap:    （用户直接写在 slot 内容里）
 *   - <i data-lucide="zap"></i>       （经 inlineMdToHtml 规范化后的中间形态）
 */

import { renderLucideIcon } from '../icons';
import type { InlineRule } from '../compiler/registry';

export const LucideColonRule: InlineRule = {
  id: 'lucide-colon',
  pattern: /:(?:lucide|icon):([a-z0-9-]+):/g,
  render: (m) => renderLucideIcon(m[1]!) || m[0],
};

export const LucideTagRule: InlineRule = {
  id: 'lucide-tag',
  pattern: /<i\s+data-lucide="([a-z0-9-]+)"[^>]*>\s*<\/i>/gi,
  render: (m) => renderLucideIcon(m[1]!) || m[0],
};

export const LUCIDE_RULES: readonly InlineRule[] = [LucideColonRule, LucideTagRule];
