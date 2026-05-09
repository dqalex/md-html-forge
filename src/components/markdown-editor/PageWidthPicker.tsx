'use client';

import { useState } from 'react';
import { MonitorIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import {
  PAGE_WIDTH_PRESETS,
  parsePageConfig,
  type PageWidthPreset,
  type BandStyle,
} from '@/builtin';
import { Button, Popover, PanelSection } from '@/components/ui';

const PRESETS: Array<{ id: PageWidthPreset; label: string; hint: string }> = [
  { id: 'mobile',  label: '手机',    hint: '420px · 移动预览' },
  { id: 'narrow',  label: '窄',      hint: '680px · 博客 / 文章' },
  { id: 'reading', label: '阅读',    hint: '760px · 长文' },
  { id: 'default', label: '平衡',    hint: '880px · 默认' },
  { id: 'wide',    label: '宽',      hint: '1080px · PC' },
  { id: 'xwide',   label: '超宽',    hint: '1280px · 看板' },
  { id: 'full',    label: '自适应',  hint: '100% · 容器跟随' },
];

export interface PageWidthPickerProps {
  markdown: string;
  onChange: (newMd: string) => void;
}

export function PageWidthPicker({ markdown, onChange }: PageWidthPickerProps) {
  const [open, setOpen] = useState(false);

  const current = parsePageConfig(markdown);
  const label = resolveLabel(current?.width);

  const apply = (presetId: PageWidthPreset, band?: BandStyle) => {
    const directive = `<!-- @page ${presetId}${band ? ` band=${band}` : ''} -->`;
    onChange(upsertPageDirective(markdown, directive));
    setOpen(false);
  };

  const toggleBand = () => {
    const next: BandStyle = current?.band === 'full-bleed' ? 'contained' : 'full-bleed';
    const widthToken = findWidthToken(markdown) ?? 'default';
    onChange(upsertPageDirective(markdown, `<!-- @page ${widthToken} band=${next} -->`));
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<MonitorIcon />}
        iconRight={<ChevronDownIcon />}
        onClick={() => setOpen(true)}
        title="页面宽度与段样式"
      >
        {label}
      </Button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchor="top-right"
        width={300}
      >
        <PanelSection title="页面宽度">
          <ul className="py-1">
            {PRESETS.map((p) => {
              const matched = current?.width === PAGE_WIDTH_PRESETS[p.id];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => apply(p.id, current?.band)}
                    className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[color:var(--surface-hover)] transition-colors"
                  >
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={`text-sm font-medium ${matched ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'}`}>
                        {p.label}
                      </span>
                      <span className="text-[11px] text-[color:var(--text-tertiary)] font-mono truncate">
                        {p.hint}
                      </span>
                    </div>
                    {matched && <CheckIcon className="h-3.5 w-3.5 text-[color:var(--accent)] shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </PanelSection>

        <PanelSection title="Banner 通栏">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm text-[color:var(--text-primary)]">带主题段铺满视口</div>
              <div className="text-[11px] text-[color:var(--text-tertiary)] mt-0.5">
                深色 / 彩色主题推荐开启
              </div>
            </div>
            <button
              type="button"
              onClick={toggleBand}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                current?.band === 'full-bleed' ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--border)]'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-[var(--shadow-xs)] transition-transform ${
                  current?.band === 'full-bleed' ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </PanelSection>
      </Popover>
    </>
  );
}

function resolveLabel(width: string | undefined): string {
  if (!width) return '页宽';
  for (const [key, val] of Object.entries(PAGE_WIDTH_PRESETS)) {
    if (val === width) {
      const p = PRESETS.find(x => x.id === key);
      if (p) return p.label;
    }
  }
  return width;
}

function findWidthToken(md: string): string | null {
  const m = md.match(/<!--\s*@page\s*:?\s*(\S+)/);
  if (!m) return null;
  const tok = m[1]!.trim();
  if (tok.startsWith('band=')) return null;
  return tok;
}

function upsertPageDirective(md: string, directive: string): string {
  const re = /<!--\s*@page[^-]*?-->/;
  if (re.test(md)) return md.replace(re, directive);
  return `${directive}\n${md}`;
}
