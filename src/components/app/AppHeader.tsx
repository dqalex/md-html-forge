'use client';

/**
 * AppHeader · 顶部导航（editorial）
 *
 * 设计：
 * - logo 用衬线字体 + clay 小方块图标，体现"文档工具"气质
 * - 中央显示：当前模板徽标（可点击切换），克制不喧宾夺主
 * - 右侧：文档 / Inspiration，ghost 按钮
 */

import Link from 'next/link';
import { BookOpenIcon, GithubIcon, SparklesIcon, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { TemplatePicker } from '@/components/markdown-editor/TemplatePicker';
import type { PresetTemplate } from '@/templates/presets/registry';

export interface AppHeaderProps {
  selectedPreset: PresetTemplate | null;
  onSelectPreset: (p: PresetTemplate) => void;
}

export function AppHeader({ selectedPreset, onSelectPreset }: AppHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 shrink-0 bg-[color:var(--surface)] border-b border-[color:var(--border)]"
      style={{ height: 'var(--header-height)' }}
    >
      {/* 左：品牌 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shadow-[var(--shadow-sm)]"
            style={{
              background: 'linear-gradient(135deg, var(--color-clay-500) 0%, var(--color-clay-700) 100%)',
            }}
          >
            <SparklesIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="font-serif text-[17px] font-medium text-[color:var(--text-primary)] tracking-tight">
              forge
            </h1>
            <p className="text-[10px] text-[color:var(--text-tertiary)] font-mono tracking-wide uppercase">
              Markdown → HTML
            </p>
          </div>
        </div>

        {/* 分隔 */}
        <span className="w-px h-6 bg-[color:var(--border)] mx-1" />

        {/* 模板切换入口 */}
        <TemplatePicker onSelect={onSelectPreset} selectedId={selectedPreset?.id ?? null}>
          {({ open }) => (
            <Button variant="subtle" size="sm" onClick={open} iconRight={<ChevronDownIcon />}>
              {selectedPreset ? (
                <span className="flex items-center gap-2">
                  <span className="text-sm">{selectedPreset.emoji}</span>
                  <span>{selectedPreset.name.split('·')[0]?.trim() ?? selectedPreset.name}</span>
                </span>
              ) : (
                <span className="text-[color:var(--text-tertiary)]">选择模板</span>
              )}
            </Button>
          )}
        </TemplatePicker>
      </div>

      {/* 右：文档 / 源码 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<BookOpenIcon />}
          onClick={() => window.open('/docs/slots', '_self')}
        >
          语法
        </Button>
        <Link
          href="https://github.com/ThariqS/html-effectiveness"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="ghost" size="sm" icon={<GithubIcon />}>
            Inspiration
          </Button>
        </Link>
      </div>
    </header>
  );
}
