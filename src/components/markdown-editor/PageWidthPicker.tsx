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
import { useI18n } from '@/lib/i18n';

const PRESET_IDS: PageWidthPreset[] = ['mobile', 'narrow', 'reading', 'default', 'wide', 'xwide', 'full'];
const PRESET_I18N_KEYS: Record<string, { label: string; hint: string }> = {
  mobile:  { label: 'pageWidth.mobile.label',  hint: 'pageWidth.mobile.hint' },
  narrow:  { label: 'pageWidth.narrow.label',  hint: 'pageWidth.narrow.hint' },
  reading: { label: 'pageWidth.reading.label', hint: 'pageWidth.reading.hint' },
  default: { label: 'pageWidth.default.label', hint: 'pageWidth.default.hint' },
  wide:    { label: 'pageWidth.wide.label',    hint: 'pageWidth.wide.hint' },
  xwide:   { label: 'pageWidth.xwide.label',   hint: 'pageWidth.xwide.hint' },
  full:    { label: 'pageWidth.full.label',     hint: 'pageWidth.full.hint' },
};

export interface PageWidthPickerProps {
  markdown: string;
  onChange: (newMd: string) => void;
}

export function PageWidthPicker({ markdown, onChange }: PageWidthPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const current = parsePageConfig(markdown);
  const rawLabel = resolveLabel(current?.width);
  // Translate the label: if it matches a preset id, use i18n; otherwise use raw
  const label = PRESET_I18N_KEYS[rawLabel] ? t(PRESET_I18N_KEYS[rawLabel]!.label as any) : (rawLabel === '页宽' ? t('pageWidth.defaultLabel') : rawLabel);

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
        title={t('pageWidth.title')}
      >
        {label}
      </Button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchor="top-right"
        width={300}
      >
        <PanelSection title={t('pageWidth.sectionTitle')}>
          <ul className="py-1">
            {PRESET_IDS.map((presetId) => {
              const matched = current?.width === PAGE_WIDTH_PRESETS[presetId];
              const i18nKey = PRESET_I18N_KEYS[presetId]!;
              return (
                <li key={presetId}>
                  <button
                    type="button"
                    onClick={() => apply(presetId, current?.band)}
                    className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-[color:var(--surface-hover)] transition-colors"
                  >
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={`text-sm font-medium ${matched ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'}`}>
                        {t(i18nKey.label as any)}
                      </span>
                      <span className="text-[11px] text-[color:var(--text-tertiary)] font-mono truncate">
                        {t(i18nKey.hint as any)}
                      </span>
                    </div>
                    {matched && <CheckIcon className="h-3.5 w-3.5 text-[color:var(--accent)] shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </PanelSection>

        <PanelSection title={t('pageWidth.bandTitle')}>
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm text-[color:var(--text-primary)]">{t('pageWidth.bandDesc')}</div>
              <div className="text-[11px] text-[color:var(--text-tertiary)] mt-0.5">
                {t('pageWidth.bandHint')}
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
  // Note: this runs before i18n is available, returns raw width value
  // The button itself uses the default label from i18n when no width is set
  for (const [key, val] of Object.entries(PAGE_WIDTH_PRESETS)) {
    if (val === width) {
      return key;
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
