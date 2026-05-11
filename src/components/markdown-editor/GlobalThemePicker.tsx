'use client';

/**
 * GlobalThemePicker —— 工具栏上的"全局主题"下拉
 *
 * ## 设计定位
 *
 * 之前的主题编辑 / 切换只能在「选中某个 forge 组件」后的 `ForgePropertyPanel` 里做，
 * 对于「我想给整个文档换个基调」「我想调整保存过的自定义主题」这些场景非常不顺手。
 *
 * 本组件作为独立的文档级入口，语义对齐 `PageWidthPicker`：
 *   - 读/写的是「文档顶部第一个 `@theme`」—— 它是整个文档起始段的主题，即事实上的"全局默认"。
 *     forge 引擎里 `@theme` 是段级指令，但文档首个 @theme 就覆盖了从头到下一个 @theme 之前的所有内容，
 *     对绝大多数只有一段主题的文档，它等价于"全局主题"。
 *   - 点击下拉后可以直接切换内置主题 / 自定义主题；
 *   - 也暴露「编辑当前选中的自定义主题」和「新建自定义主题」两个入口，不再依赖组件选中。
 *
 * ## 行为约定
 *
 * - 若文档已有 @theme，**只改第一个**，不影响后续段级覆盖
 * - 若文档没有 @theme：在 @page 之后插入一行；若没有 @page，则插到最前面
 * - 下拉以「当前激活的主题」为视觉焦点，内置和自定义分组展示
 */

import { useMemo, useState } from 'react';
import { PaintbrushIcon, CheckIcon, ChevronDownIcon, PenLineIcon, PlusIcon } from 'lucide-react';

import { Button, Popover, PanelSection } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import {
  BUILTIN_THEMES,
  DEFAULT_THEME_ID,
  type ThemeDef,
} from '@/builtin/themes';

export interface GlobalThemePickerProps {
  markdown: string;
  onChange: (next: string) => void;
  /** 自定义主题列表（来自 useUserExtensions，包含 localStorage 里注册的） */
  customThemes: ThemeDef[];
  /** 点击「编辑」/「新建」时触发，参数 = 作为起点的主题 id（编辑模式传自定义主题 id，新建模式传内置 id） */
  onOpenThemeEditor?: (baseOrEditingId: string) => void;
}

export function GlobalThemePicker({
  markdown,
  onChange,
  customThemes,
  onOpenThemeEditor,
}: GlobalThemePickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const currentId = useMemo(() => findFirstThemeId(markdown) ?? DEFAULT_THEME_ID, [markdown]);
  const currentBuiltin = BUILTIN_THEMES.find((x) => x.id === currentId);
  const currentCustom = customThemes.find((x) => x.id === currentId);
  const currentLabel = currentBuiltin?.name ?? currentCustom?.name ?? currentId;
  const currentIsCustom = !!currentCustom;

  const apply = (themeId: string) => {
    const next = upsertGlobalTheme(markdown, themeId);
    if (next !== markdown) onChange(next);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<PaintbrushIcon />}
        iconRight={<ChevronDownIcon />}
        onClick={() => setOpen(true)}
        title={t('globalTheme.title')}
      >
        {currentLabel}
      </Button>

      <Popover open={open} onClose={() => setOpen(false)} anchor="top-right" width={320}>
        <PanelSection title={t('globalTheme.builtinGroup')}>
          <ul className="py-1">
            {BUILTIN_THEMES.map((theme) => {
              const matched = theme.id === currentId;
              return (
                <li key={theme.id}>
                  <button
                    type="button"
                    onClick={() => apply(theme.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-1.5 hover:bg-[color:var(--surface-hover)] transition-colors text-left"
                  >
                    {/* 色卡 */}
                    <span
                      className="w-5 h-5 rounded shrink-0 border"
                      style={{
                        background: theme.background,
                        borderColor: theme.border ?? 'var(--border-subtle)',
                      }}
                    >
                      <span className="block w-full h-full rounded" style={{
                        background: `linear-gradient(135deg, ${theme.background} 50%, ${theme.accent ?? theme.heading} 50%)`,
                      }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          matched ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'
                        }`}
                      >
                        {theme.name}
                      </div>
                      {theme.description && (
                        <div className="text-[11px] text-[color:var(--text-tertiary)] truncate">
                          {theme.description}
                        </div>
                      )}
                    </div>
                    {matched && (
                      <CheckIcon className="h-3.5 w-3.5 text-[color:var(--accent)] shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </PanelSection>

        {customThemes.length > 0 && (
          <PanelSection title={t('globalTheme.customGroup')}>
            <ul className="py-1">
              {customThemes.map((theme) => {
                const matched = theme.id === currentId;
                return (
                  <li key={theme.id}>
                    <div
                      className={`w-full flex items-center gap-2.5 px-4 py-1.5 transition-colors ${
                        matched
                          ? 'bg-[color:var(--accent-soft)]'
                          : 'hover:bg-[color:var(--surface-hover)]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => apply(theme.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                      >
                        <span
                          className="w-5 h-5 rounded shrink-0 border"
                          style={{
                            borderColor: theme.border ?? 'var(--border-subtle)',
                            background: `linear-gradient(135deg, ${theme.background} 50%, ${theme.accent ?? theme.heading} 50%)`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium truncate ${
                              matched ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'
                            }`}
                          >
                            {theme.name}
                          </div>
                          <code className="text-[10px] text-[color:var(--text-tertiary)] font-mono truncate block">
                            {theme.id}
                          </code>
                        </div>
                        {matched && (
                          <CheckIcon className="h-3.5 w-3.5 text-[color:var(--accent)] shrink-0" />
                        )}
                      </button>
                      {onOpenThemeEditor && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenThemeEditor(theme.id);
                            setOpen(false);
                          }}
                          className="shrink-0 w-6 h-6 inline-flex items-center justify-center rounded text-[color:var(--text-tertiary)] hover:bg-[color:var(--surface)] hover:text-[color:var(--accent)]"
                          title={t('globalTheme.editThisTheme')}
                        >
                          <PenLineIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </PanelSection>
        )}

        {onOpenThemeEditor && (
          <PanelSection title={t('globalTheme.manageGroup')}>
            <div className="px-2 py-1.5 grid grid-cols-1 gap-1">
              {currentIsCustom && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenThemeEditor(currentId);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-left border border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] hover:opacity-90 transition"
                >
                  <PenLineIcon className="w-3.5 h-3.5" />
                  {t('globalTheme.editCurrent')}
                  <span className="ml-auto text-[10px] font-mono opacity-70 truncate max-w-[120px]">
                    {currentLabel}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  // 新建：以当前激活主题为起点。若当前是自定义，则回退到 editorial，
                  // 避免 ThemeEditorModal 把传入 id 识别为「编辑模式」
                  onOpenThemeEditor(currentIsCustom ? DEFAULT_THEME_ID : currentId);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-left border border-dashed border-[color:var(--border)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] transition"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                {t('globalTheme.createNew')}
              </button>
            </div>
          </PanelSection>
        )}
      </Popover>
    </>
  );
}

// ============================================================
// markdown helpers
// ============================================================

const THEME_RE = /<!--\s*@theme\s*:?\s*([\w-]+)\s*-->/;
const PAGE_RE = /<!--\s*@page[^-]*?-->/;

/** 读取文档里第一个 @theme 指令的 id；没有则返回 undefined（= 走引擎默认） */
export function findFirstThemeId(md: string): string | undefined {
  const m = md.match(THEME_RE);
  return m ? m[1] : undefined;
}

/**
 * 把"全局主题"改成 themeId。
 *   1) 文档里已有 @theme → 只改第一个（保留后续段级覆盖）
 *   2) 没有 @theme → 插在 @page 之后（或文件最前）
 */
export function upsertGlobalTheme(md: string, themeId: string): string {
  const directive = `<!-- @theme ${themeId} -->`;

  const firstThemeMatch = md.match(THEME_RE);
  if (firstThemeMatch) {
    // 只改第一个
    return md.replace(THEME_RE, directive);
  }

  // 没有 @theme，找 @page 插后面
  const pageMatch = md.match(PAGE_RE);
  if (pageMatch && pageMatch.index !== undefined) {
    const insertAt = pageMatch.index + pageMatch[0].length;
    const before = md.slice(0, insertAt);
    const after = md.slice(insertAt);
    // 保证 @theme 独占一行；若 @page 紧跟着一个换行，就直接接 directive；否则补一个换行
    const gap = after.startsWith('\n') ? '\n' : '\n\n';
    return before + gap + directive + after;
  }

  // 啥都没有 → 插到最前
  return `${directive}\n\n${md}`;
}

// 对单测 / 其它模块暴露
export const __globalThemePickerInternals = {
  findFirstThemeId,
  upsertGlobalTheme,
};
