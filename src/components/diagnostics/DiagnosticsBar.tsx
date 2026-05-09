'use client';

import { useState } from 'react';
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import type { Diagnostic } from '@/builtin/compiler';

export interface DiagnosticsBarProps {
  diagnostics: readonly Diagnostic[];
  onJumpTo?: (line: number, col: number) => void;
}

export function DiagnosticsBar({ diagnostics, onJumpTo }: DiagnosticsBarProps) {
  const [expanded, setExpanded] = useState(false);

  if (!diagnostics || diagnostics.length === 0) return null;

  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');
  const infos    = diagnostics.filter(d => d.severity === 'info');

  const chips: React.ReactNode[] = [];
  if (errors.length > 0)
    chips.push(<Chip key="e" severity="error"   count={errors.length}   />);
  if (warnings.length > 0)
    chips.push(<Chip key="w" severity="warning" count={warnings.length} />);
  if (infos.length > 0)
    chips.push(<Chip key="i" severity="info"    count={infos.length}    />);

  return (
    <div className="border-t border-[color:var(--border)] bg-[color:var(--surface)] shrink-0">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 h-8 text-xs hover:bg-[color:var(--surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {chips}
        </div>
        {expanded
          ? <ChevronDownIcon className="h-3.5 w-3.5 text-[color:var(--text-tertiary)]" />
          : <ChevronUpIcon   className="h-3.5 w-3.5 text-[color:var(--text-tertiary)]" />}
      </button>

      {expanded && (
        <ul
          className="overflow-y-auto border-t border-[color:var(--border-subtle)] divide-y divide-[color:var(--border-subtle)]"
          style={{ maxHeight: 240 }}
        >
          {diagnostics.map((d, i) => (
            <li
              key={i}
              className={`px-4 py-2 flex items-start gap-3 ${
                d.loc && onJumpTo ? 'cursor-pointer hover:bg-[color:var(--surface-hover)]' : ''
              }`}
              onClick={() => d.loc && onJumpTo?.(d.loc.line, d.loc.col)}
            >
              <SeverityIcon severity={d.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  {d.loc && (
                    <span className="text-[10px] text-[color:var(--text-quaternary)] tabular-nums font-mono">
                      {d.loc.line}:{d.loc.col}
                    </span>
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--text-tertiary)]">
                    {d.code}
                  </span>
                </div>
                <div className="text-[13px] text-[color:var(--text-primary)] mt-0.5 leading-snug">
                  {d.message}
                </div>
                {d.hint && (
                  <div className="text-[11px] text-[color:var(--text-tertiary)] mt-1 flex items-start gap-1">
                    <span className="text-[color:var(--accent)]">→</span>
                    <span>{d.hint}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ severity, count }: { severity: Diagnostic['severity']; count: number }) {
  const color =
    severity === 'error' ? 'text-rose-600 bg-rose-50 border-rose-200'
    : severity === 'warning' ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-sky-700 bg-sky-50 border-sky-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2 h-5 text-[11px] font-medium rounded-full border ${color}`}>
      <SeverityIcon severity={severity} />
      {count}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: Diagnostic['severity'] }) {
  const cls = 'h-3 w-3 shrink-0';
  if (severity === 'error')   return <AlertCircleIcon   className={`${cls} text-rose-500`} />;
  if (severity === 'warning') return <AlertTriangleIcon className={`${cls} text-amber-500`} />;
  return <InfoIcon className={`${cls} text-sky-500`} />;
}
