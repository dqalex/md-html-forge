'use client';

import {
  FileDownIcon,
  ImageIcon,
  Undo2Icon,
  Redo2Icon,
  LayersIcon,
  Code2Icon,
  EyeIcon,
  SplitSquareHorizontalIcon,
  PanelsTopLeftIcon,
} from 'lucide-react';

import { Button, ButtonGroup } from '@/components/ui';
import { PageWidthPicker } from './PageWidthPicker';
import type { ViewMode } from './MarkdownEditor';

export interface ToolbarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  readOnly?: boolean;
  saveState?: 'idle' | 'saving' | 'saved' | 'error';
  hasTemplate?: boolean;
  onExportHtml?: () => void;
  onExportImage?: () => void;
  onOpenLibrary?: () => void;
  markdown?: string;
  onMarkdownChange?: (md: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const MODE_ITEMS: Array<{ value: ViewMode; label: string; icon: React.ReactNode }> = [
  { value: 'edit',    label: '编辑',   icon: <Code2Icon /> },
  { value: 'split',   label: '分屏',   icon: <SplitSquareHorizontalIcon /> },
  { value: 'preview', label: '预览',   icon: <EyeIcon /> },
  { value: 'html',    label: 'HTML',   icon: <PanelsTopLeftIcon /> },
];

const SAVE_STATE = {
  idle:   { dot: '',               text: '' },
  saving: { dot: 'bg-amber-500',   text: '保存中' },
  saved:  { dot: 'bg-emerald-500', text: '已保存' },
  error:  { dot: 'bg-rose-500',    text: '保存失败' },
} as const;

export function Toolbar({
  mode,
  onModeChange,
  readOnly,
  saveState = 'idle',
  hasTemplate,
  onExportHtml,
  onExportImage,
  onOpenLibrary,
  markdown,
  onMarkdownChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolbarProps) {
  const stateConfig = SAVE_STATE[saveState];

  const availableModes = readOnly
    ? MODE_ITEMS.filter((m) => m.value === 'preview')
    : hasTemplate
      ? MODE_ITEMS
      : MODE_ITEMS.filter((m) => m.value !== 'html');

  return (
    <div
      className="flex items-center justify-between px-3 shrink-0 bg-[color:var(--surface)] border-b border-[color:var(--border)]"
      style={{ height: 'var(--toolbar-height)' }}
    >
      {/* 左：视图切换 + 组件库 + undo */}
      <div className="flex items-center gap-3">
        <ButtonGroup>
          {availableModes.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onModeChange(value)}
              title={label}
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
            组件库
          </Button>
        )}

        {(onUndo || onRedo) && (
          <>
            <span className="w-px h-5 bg-[color:var(--border)]" />
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                icon={<Undo2Icon />}
                onClick={onUndo}
                disabled={!canUndo}
                title="撤销 (⌘Z)"
                className="!px-1.5"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Redo2Icon />}
                onClick={onRedo}
                disabled={!canRedo}
                title="重做 (⌘⇧Z)"
                className="!px-1.5"
              />
            </div>
          </>
        )}
      </div>

      {/* 右：页宽 + 状态 + 导出 */}
      <div className="flex items-center gap-2">
        {markdown !== undefined && onMarkdownChange && (
          <PageWidthPicker markdown={markdown} onChange={onMarkdownChange} />
        )}

        {stateConfig.text && (
          <div className="flex items-center gap-1.5 px-2 text-[11px] text-[color:var(--text-tertiary)]">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${stateConfig.dot} ${saveState === 'saving' ? 'animate-pulse' : ''}`} />
            <span>{stateConfig.text}</span>
          </div>
        )}

        <span className="w-px h-5 bg-[color:var(--border)] mx-0.5" />

        {onExportImage && hasTemplate && (
          <Button variant="ghost" size="sm" icon={<ImageIcon />} onClick={onExportImage}>
            图片
          </Button>
        )}
        {onExportHtml && hasTemplate && (
          <Button variant="solid" size="sm" icon={<FileDownIcon />} onClick={onExportHtml}>
            导出
          </Button>
        )}
      </div>
    </div>
  );
}
