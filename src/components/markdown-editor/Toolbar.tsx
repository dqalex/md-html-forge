'use client';

import {
  DownloadIcon, Undo2Icon, Redo2Icon, LayersIcon, Code2Icon, EyeIcon,
  SplitSquareHorizontalIcon, PackageIcon, WandSparklesIcon, BookmarkPlusIcon,
} from 'lucide-react';

import { Button, ButtonGroup } from '@/components/ui';
import { PageWidthPicker } from './PageWidthPicker';
import { GlobalThemePicker } from './GlobalThemePicker';
import type { ViewMode } from './MarkdownEditor';
import { useI18n } from '@/lib/i18n';
import type { ThemeDef } from '@/builtin/themes';

export interface ToolbarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  readOnly?: boolean;
  saveState?: 'idle' | 'saving' | 'saved' | 'error';
  hasTemplate?: boolean;
  onExport?: () => void;
  onSaveAsTemplate?: () => void;
  onOpenLibrary?: () => void;
  onOpenBrandPack?: () => void;
  onOpenAiCreate?: () => void;
  markdown?: string;
  onMarkdownChange?: (md: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  /** 自定义主题（来自 useUserExtensions）；用于工具栏的"主题"下拉 */
  customThemes?: ThemeDef[];
  /** 点击"编辑/新建自定义主题"时打开 ThemeEditorModal */
  onOpenThemeEditor?: (baseOrEditingId: string) => void;
}

export function Toolbar({
  mode, onModeChange, readOnly, saveState = 'idle',
  onExport, onSaveAsTemplate, onOpenLibrary, onOpenBrandPack, onOpenAiCreate,
  markdown, onMarkdownChange, canUndo, canRedo, onUndo, onRedo,
  customThemes, onOpenThemeEditor,
}: ToolbarProps) {
  const { t, lang } = useI18n();

  const MODE_ITEMS = [
    { value: 'edit' as ViewMode,    label: t('toolbar.edit'),    icon: <Code2Icon /> },
    { value: 'split' as ViewMode,   label: t('toolbar.split'),   icon: <SplitSquareHorizontalIcon /> },
    { value: 'preview' as ViewMode, label: t('toolbar.preview'), icon: <EyeIcon /> },
  ];

  const SAVE_LABEL: Record<string, string> = {
    saving: lang === 'zh' ? '保存中' : 'Saving…',
    saved:  lang === 'zh' ? '已保存' : 'Saved',
    error:  lang === 'zh' ? '保存失败' : 'Save failed',
  };
  const SAVE_DOT: Record<string, string> = {
    saving: 'bg-amber-500 animate-pulse',
    saved:  'bg-emerald-500',
    error:  'bg-rose-500',
  };

  const availableModes = readOnly
    ? MODE_ITEMS.filter((m) => m.value === 'preview')
    : MODE_ITEMS;

  return (
    <div
      className="flex items-center justify-between px-3 shrink-0 bg-[color:var(--surface)] border-b border-[color:var(--border)]"
      style={{ height: 'var(--toolbar-height)' }}
    >
      <div className="flex items-center gap-3">
        <ButtonGroup>
          {availableModes.map(({ value, label, icon }) => (
            <button key={value} type="button" onClick={() => onModeChange(value)} title={label}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded transition-all ${
                mode === value
                  ? 'bg-[color:var(--surface)] text-[color:var(--text-primary)] shadow-[var(--shadow-xs)]'
                  : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </ButtonGroup>

        {onOpenLibrary && (
          <Button variant="ghost" size="sm" icon={<LayersIcon />} onClick={onOpenLibrary}>
            {t('toolbar.components')}
          </Button>
        )}
        {onOpenBrandPack && (
          <Button variant="ghost" size="sm" icon={<PackageIcon />} onClick={onOpenBrandPack}>
            {t('toolbar.brand')}
          </Button>
        )}
        {onOpenAiCreate && (
          <Button variant="ghost" size="sm" icon={<WandSparklesIcon />} onClick={onOpenAiCreate}>
            {t('toolbar.aiGenerate')}
          </Button>
        )}

        {(onUndo || onRedo) && (
          <>
            <span className="w-px h-5 bg-[color:var(--border)]" />
            <div className="flex items-center">
              <Button variant="ghost" size="sm" icon={<Undo2Icon />} onClick={onUndo} disabled={!canUndo}
                title={`${t('toolbar.undo')} (⌘Z)`} className="!px-1.5" />
              <Button variant="ghost" size="sm" icon={<Redo2Icon />} onClick={onRedo} disabled={!canRedo}
                title={`${t('toolbar.redo')} (⌘⇧Z)`} className="!px-1.5" />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {markdown !== undefined && onMarkdownChange && (
          <GlobalThemePicker
            markdown={markdown}
            onChange={onMarkdownChange}
            customThemes={customThemes ?? []}
            onOpenThemeEditor={onOpenThemeEditor}
          />
        )}
        {markdown !== undefined && onMarkdownChange && (
          <PageWidthPicker markdown={markdown} onChange={onMarkdownChange} />
        )}

        {saveState !== 'idle' && SAVE_LABEL[saveState] && (
          <div className="flex items-center gap-1.5 px-2 text-[11px] text-[color:var(--text-tertiary)]">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${SAVE_DOT[saveState] ?? ''}`} />
            <span>{SAVE_LABEL[saveState]}</span>
          </div>
        )}

        <span className="w-px h-5 bg-[color:var(--border)] mx-0.5" />

        {onSaveAsTemplate && (
          <Button variant="outline" size="sm" icon={<BookmarkPlusIcon />} onClick={onSaveAsTemplate}>
            {t('header.saveTemplate')}
          </Button>
        )}
        {onExport && (
          <Button variant="solid" size="sm" icon={<DownloadIcon />} onClick={onExport}>
            {t('header.export')}
          </Button>
        )}
      </div>
    </div>
  );
}
