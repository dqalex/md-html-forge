/**
 * 编译诊断 (Diagnostics)
 *
 * 编译器风格的错误/警告/提示，每条都带：
 *   - severity (error | warning | info)
 *   - code     (FORGE_xxxx，便于 i18n 与文档引用)
 *   - message  (人类可读)
 *   - loc      (源码位置，可点击跳转)
 *
 * 收集器 DiagnosticBag 在整个编译流水线里传递，最后随 result 一并返回。
 */

import type { SourceLoc } from './ast';

export type Severity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  severity: Severity;
  code: string;
  message: string;
  loc?: SourceLoc;
  /** 可选：补充修复建议 */
  hint?: string;
}

/** 标准错误码（集中维护，方便文档化） */
export const Codes = {
  // 解析层
  UNCLOSED_SLOT:           'FORGE_E_UNCLOSED_SLOT',
  UNCLOSED_GROUP:          'FORGE_E_UNCLOSED_GROUP',
  UNCLOSED_ITEM:           'FORGE_E_UNCLOSED_ITEM',
  EMPTY_DIRECTIVE_VALUE:   'FORGE_E_EMPTY_DIRECTIVE',
  // 解析层 - 警告
  DUPLICATE_COMPOSE:       'FORGE_W_DUPLICATE_COMPOSE',
  // 解析层 - 提示
  ITEM_OUTSIDE_GROUP:      'FORGE_W_ITEM_OUTSIDE_GROUP',

  // 解析层 (resolver)
  UNKNOWN_COMPONENT:       'FORGE_E_UNKNOWN_COMPONENT',
  UNKNOWN_LAYOUT:          'FORGE_E_UNKNOWN_LAYOUT',
  UNKNOWN_THEME:           'FORGE_E_UNKNOWN_THEME',
  ORPHAN_SLOT:             'FORGE_W_ORPHAN_SLOT',
  GROUP_WITHOUT_LAYOUT:    'FORGE_W_GROUP_WITHOUT_LAYOUT',
} as const;

export class DiagnosticBag {
  private items: Diagnostic[] = [];

  add(d: Diagnostic): void {
    this.items.push(d);
  }

  error(code: string, message: string, loc?: SourceLoc, hint?: string): void {
    this.add({ severity: 'error', code, message, loc, hint });
  }

  warn(code: string, message: string, loc?: SourceLoc, hint?: string): void {
    this.add({ severity: 'warning', code, message, loc, hint });
  }

  info(code: string, message: string, loc?: SourceLoc, hint?: string): void {
    this.add({ severity: 'info', code, message, loc, hint });
  }

  all(): readonly Diagnostic[] {
    return this.items;
  }

  filter(severity: Severity): readonly Diagnostic[] {
    return this.items.filter(d => d.severity === severity);
  }

  hasErrors(): boolean {
    return this.items.some(d => d.severity === 'error');
  }

  /** 用于测试快照：统一字符串格式 */
  format(): string {
    return this.items.map(formatDiagnostic).join('\n');
  }
}

export function formatDiagnostic(d: Diagnostic): string {
  const where = d.loc ? `[${d.loc.line}:${d.loc.col}] ` : '';
  const sev = d.severity.toUpperCase();
  const hint = d.hint ? `\n  hint: ${d.hint}` : '';
  return `${where}${sev} ${d.code}: ${d.message}${hint}`;
}
