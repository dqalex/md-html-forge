'use client';

/**
 * ForgePropertyPanel —— 选中 forge 组件后的属性编辑面板
 *
 * 设计目标：
 *   1. 显示当前组件的变体（可点击切换 → 改 MD 中的 @use ... variant=xxx）
 *   2. 当前段主题切换（找到上文最近的 @theme，改它 / 插一个）
 *   3. 字体配色（当前段或全局，写入 @theme 的 inline 覆盖）
 *
 * 这个面板的"操作对象"全部是 MD 文本本身——所有调整都通过 onMarkdownChange 回写，
 * 编辑器是单一真相源。面板自身不持有任何"未保存"状态。
 */

import { useMemo } from 'react';
import { XIcon } from 'lucide-react';

import { getBuiltinComponent } from '@/builtin/components';
import type { ComponentDef } from '@/builtin/types';

export interface ForgeSelection {
  componentId: string;
  variant?: string;
  /** @use 行号（1-based） */
  useLine?: number | null;
}

export interface ForgePropertyPanelProps {
  selection: ForgeSelection | null;
  markdown: string;
  onMarkdownChange: (next: string) => void;
  onClose: () => void;
  /** 当用户点"自定义主题"按钮时触发，参数 = 当前段已选主题作为基础 */
  onOpenThemeEditor?: (baseThemeId: string) => void;
  /** 用户自定义主题（来自 localStorage），合并到选项里展示 */
  customThemes?: Array<{ id: string; name: string }>;
}

// 内置主题选项（精简到 3 个推荐 + 用户自定义）
const RECOMMENDED_THEMES = [
  { id: 'editorial', label: 'Editorial', color: '#FAF9F5' },
  { id: 'dark', label: 'Dark', color: '#141413' },
  { id: 'mono', label: 'Mono', color: '#FFFFFF' },
];

export function ForgePropertyPanel({
  selection,
  markdown,
  onMarkdownChange,
  onClose,
  onOpenThemeEditor,
  customThemes = [],
}: ForgePropertyPanelProps) {
  const def: ComponentDef | undefined = useMemo(() => {
    if (!selection?.componentId) return undefined;
    return getBuiltinComponent(selection.componentId);
  }, [selection?.componentId]);

  const variants = useMemo(() => extractVariants(def), [def]);

  // 当前段使用的主题（向上扫描最近的 @theme）
  const currentTheme = useMemo(() => {
    if (!selection?.useLine) return undefined;
    return findNearestTheme(markdown, selection.useLine);
  }, [markdown, selection?.useLine]);

  if (!selection) return null;
  if (!def) {
    return (
      <PanelShell onClose={onClose} title="未知组件">
        <div className="text-xs text-[color:var(--text-tertiary)] p-4">
          组件 <code className="font-mono">{selection.componentId}</code> 未注册
        </div>
      </PanelShell>
    );
  }

  const handleSwitchVariant = (newVariant: string) => {
    if (!selection.useLine) return;
    if (newVariant === selection.variant) return;
    const next = updateUseDirectiveVariant(markdown, selection.useLine, def.id, newVariant);
    if (next !== markdown) onMarkdownChange(next);
  };

  const handleSwitchTheme = (newThemeId: string) => {
    if (newThemeId === currentTheme?.id) return;
    const next = updateOrInsertTheme(markdown, selection.useLine ?? 1, newThemeId);
    if (next !== markdown) onMarkdownChange(next);
  };

  return (
    <PanelShell onClose={onClose} title={def.name}>
      {/* 元信息 */}
      <div className="px-4 py-3 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--text-tertiary)]">
            {def.category}
          </span>
          <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[color:var(--surface)] text-[color:var(--accent-strong)] border border-[color:var(--border-subtle)]">
            {def.id}
          </code>
          {selection.variant && (
            <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
              variant: {selection.variant}
            </code>
          )}
        </div>
        {def.description && (
          <p className="text-[11px] text-[color:var(--text-tertiary)] mt-2 leading-relaxed">
            {def.description}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ===== 变体切换 ===== */}
        {variants.length > 0 && (
          <Section title="变体" subtitle={`${variants.length} 个可选`}>
            <div className="grid grid-cols-2 gap-1.5">
              {variants.map((v) => {
                const active = selection.variant === v.id || (!selection.variant && v.isDefault);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSwitchVariant(v.id)}
                    disabled={!selection.useLine}
                    className={`px-2 py-2 rounded-md text-[12px] text-left transition-colors border ${
                      active
                        ? 'bg-[color:var(--accent-soft)] border-[color:var(--accent)] text-[color:var(--accent-strong)]'
                        : 'bg-[color:var(--surface)] border-[color:var(--border-subtle)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-hover)]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={v.description}
                  >
                    <div className="font-mono text-[11px] truncate">{v.id}</div>
                    {v.description && (
                      <div className="text-[10px] text-[color:var(--text-tertiary)] mt-0.5 line-clamp-2">
                        {v.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {!selection.useLine && (
              <p className="text-[10px] text-[color:var(--text-tertiary)] mt-2">
                该组件由 <code className="font-mono">@compose</code> 隐式注入，无 <code className="font-mono">@use</code> 指令，暂不能切换变体
              </p>
            )}
          </Section>
        )}

        {/* ===== 当前段主题 ===== */}
        <Section title="当前段主题" subtitle={currentTheme ? `当前: ${currentTheme.id}` : '默认'}>
          <div className="grid grid-cols-3 gap-1.5">
            {RECOMMENDED_THEMES.map((t) => {
              const active = currentTheme?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSwitchTheme(t.id)}
                  className={`px-2 py-2 rounded-md text-[12px] text-left transition-colors border ${
                    active
                      ? 'border-[color:var(--accent)] ring-2 ring-[color:var(--accent-soft)]'
                      : 'border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-hover)]'
                  }`}
                >
                  <div
                    className="w-full h-6 rounded mb-1.5 border border-[color:var(--border-subtle)]"
                    style={{ background: t.color }}
                  />
                  <div className="font-mono text-[11px]">{t.label}</div>
                </button>
              );
            })}
          </div>
          {customThemes.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] text-[color:var(--text-tertiary)] mb-1.5">自定义主题</div>
              <div className="flex flex-wrap gap-1.5">
                {customThemes.map((t) => {
                  const active = currentTheme?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSwitchTheme(t.id)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border ${
                        active
                          ? 'bg-[color:var(--accent-soft)] border-[color:var(--accent)] text-[color:var(--accent-strong)]'
                          : 'bg-[color:var(--surface)] border-[color:var(--border-subtle)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-hover)]'
                      }`}
                      title={t.name}
                    >
                      {t.id}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {onOpenThemeEditor && (() => {
            const editingId = currentTheme?.id && customThemes.some(t => t.id === currentTheme.id)
              ? currentTheme.id
              : null;
            return (
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => onOpenThemeEditor(editingId)}
                    className="px-2 py-1.5 rounded-md text-[11px] border border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] hover:opacity-90"
                    title={`编辑「${customThemes.find(t => t.id === editingId)?.name ?? editingId}」`}
                  >
                    ✎ 编辑当前主题
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenThemeEditor(currentTheme && !editingId ? currentTheme.id : 'editorial')}
                  className={`px-2 py-1.5 rounded-md text-[11px] border border-dashed border-[color:var(--border-subtle)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] ${editingId ? '' : 'col-span-2'}`}
                >
                  + 新建自定义主题
                </button>
              </div>
            );
          })()}
        </Section>

        {/* ===== Slot 列表（参考用） ===== */}
        <Section title="Slot" subtitle={`${Object.keys(def.slots).length} 个`}>
          <ul className="space-y-1">
            {Object.entries(def.slots).map(([name, slotDef]) => (
              <li
                key={name}
                className="px-2 py-1.5 rounded bg-[color:var(--surface-sunken)] border border-[color:var(--border-subtle)] text-[11px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-[color:var(--accent-strong)]">{name}</code>
                  <span className="text-[9px] uppercase tracking-wider text-[color:var(--text-tertiary)]">
                    {slotDef.type}
                  </span>
                </div>
                {slotDef.label && (
                  <div className="text-[color:var(--text-secondary)] mt-0.5">{slotDef.label}</div>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </PanelShell>
  );
}

// ============================================================
// Helpers
// ============================================================

function PanelShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      className="w-72 flex flex-col h-full shrink-0 border-l border-[color:var(--border)]"
      style={{ background: 'var(--surface, #FAF9F5)' }}
    >
      <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-[color:var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-serif text-[15px] font-medium text-[color:var(--text-primary)] truncate">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="h-7 w-7 rounded-md hover:bg-[color:var(--surface-hover)] text-[color:var(--text-secondary)] flex items-center justify-center"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-3 border-b border-[color:var(--border-subtle)]">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--text-tertiary)]">
          {title}
        </h3>
        {subtitle && (
          <span className="text-[10px] text-[color:var(--text-quaternary)]">{subtitle}</span>
        )}
      </div>
      {children}
    </section>
  );
}

interface VariantInfo {
  id: string;
  description?: string;
  isDefault?: boolean;
}

/**
 * 从 ComponentDef 中提取变体清单
 * forge-loader 已经把 variants / defaultVariant / variantDescriptions 写到 def 上
 */
function extractVariants(def: ComponentDef | undefined): VariantInfo[] {
  if (!def) return [];
  const variants = (def as ComponentDef & { variants?: string[]; defaultVariant?: string; variantDescriptions?: Record<string, string> }).variants;
  const defaultVariant = (def as ComponentDef & { defaultVariant?: string }).defaultVariant;
  const descriptions = (def as ComponentDef & { variantDescriptions?: Record<string, string> }).variantDescriptions;
  if (!variants?.length) return [];
  return variants.map((id) => ({
    id,
    isDefault: id === defaultVariant,
    description: descriptions?.[id],
  }));
}

// ============================================================
// MD mutation helpers
// ============================================================

/**
 * 修改/插入 @use 指令的 variant 属性
 *
 * 输入：
 *   markdown: 整个 MD
 *   useLine: @use 行号（1-based）
 *   componentId: 组件 id（用于校验）
 *   variant: 新变体 id
 *
 * 处理形式：
 *   <!-- @use card variant=stat -->     → 替换 variant
 *   <!-- @use card -->                  → 添加 variant
 *   <!-- @use: card -->                 → 同上（冒号格式）
 */
export function updateUseDirectiveVariant(
  markdown: string,
  useLine: number,
  componentId: string,
  variant: string,
): string {
  const lines = markdown.split('\n');
  const idx = useLine - 1;
  if (idx < 0 || idx >= lines.length) return markdown;
  const line = lines[idx]!;

  // 匹配 <!-- @use[:] componentId [...attrs] -->
  // 注意：componentId 可能与 attrs 之间用空格分隔
  const match = line.match(/^(\s*<!--\s*@use\s*:?\s*)([\w-]+)([\s\S]*?)(-->\s*)$/);
  if (!match || match[2] !== componentId) return markdown;

  const prefix = match[1];
  const id = match[2];
  let attrs = match[3] || '';
  const suffix = match[4];

  // attrs 例：" variant=stat eyebrow=foo"
  const variantRe = /\bvariant\s*=\s*[\w-]+/;
  if (variantRe.test(attrs)) {
    attrs = attrs.replace(variantRe, `variant=${variant}`);
  } else {
    attrs = `${attrs.trimEnd()} variant=${variant} `;
  }
  // 标准化 attrs 起始空白
  if (attrs && !attrs.startsWith(' ')) attrs = ' ' + attrs;
  if (attrs && !attrs.endsWith(' ')) attrs = attrs + ' ';

  lines[idx] = `${prefix}${id}${attrs}${suffix}`;
  return lines.join('\n');
}

/**
 * 找到给定行之前最近的 @theme 指令（同段或更早）
 */
export function findNearestTheme(markdown: string, line: number): { id: string; line: number } | undefined {
  const lines = markdown.split('\n');
  const upto = Math.min(line, lines.length);
  for (let i = upto - 1; i >= 0; i--) {
    const m = lines[i]!.match(/<!--\s*@theme\s*:?\s*([\w-]+)\s*-->/);
    if (m) return { id: m[1]!, line: i + 1 };
  }
  return undefined;
}

/**
 * 修改/插入 @theme 指令
 *
 * 行为：
 *   - 若 line 之前最近的 @theme 存在且与新主题不同 → 修改它
 *   - 若不存在 @theme → 在最靠近 line 的合适位置插入
 *
 * 简化策略：直接在 line 之前插入新 @theme（保证视觉上"从该组件开始切主题"）
 */
export function updateOrInsertTheme(markdown: string, line: number, newThemeId: string): string {
  const nearest = findNearestTheme(markdown, line);
  const lines = markdown.split('\n');

  if (nearest) {
    // 如果最近的 @theme 已经在"该组件之前的同段"，直接改它
    lines[nearest.line - 1] = `<!-- @theme ${newThemeId} -->`;
    return lines.join('\n');
  }

  // 没有任何 @theme → 在 line 上一行插入
  const insertIdx = Math.max(0, line - 1);
  lines.splice(insertIdx, 0, `<!-- @theme ${newThemeId} -->`, '');
  return lines.join('\n');
}

// 暴露内部 helpers 给单测（也便于其他面板复用）
export const __forge_panel_internals = {
  updateUseDirectiveVariant,
  findNearestTheme,
  updateOrInsertTheme,
};
