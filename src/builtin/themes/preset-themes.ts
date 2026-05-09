import type { ThemeDef } from './types';

/**
 * 内置主题
 *
 * 设计原则：
 * - 所有主题共享 SHARED_TOKENS 的字体/圆角/间距 → 视觉协调
 * - 每个主题只覆盖颜色和（可选）字体，避免改"骨"只改"皮"
 * - 主题 id 用 kebab-case，便于 @theme 引用
 */

const EDITORIAL: ThemeDef = {
  id: 'editorial',
  name: 'Editorial（默认）',
  description: 'ivory 底 + clay 强调 + serif 标题（首屏默认风格）',
  // 不覆盖 → 全部用 SHARED_TOKENS 默认值
};

const DARK: ThemeDef = {
  id: 'dark',
  name: 'Dark Slate',
  description: '深色背景 + oat 强调，适合"重点段"',
  background: '#141413',
  text: '#E3DACC',
  heading: '#FAF9F5',
  strong: '#FAF9F5',
  accent: '#D97757',
  accentSoft: '#E3DACC',
  muted: '#87867F',
  surface: '#1F1F1E',
  border: '1px solid rgba(227,218,204,0.18)',
};

const SAGE: ThemeDef = {
  id: 'sage',
  name: 'Sage Olive',
  description: '橄榄绿强调，沉稳的工程报告风',
  background: '#F5F4ED',
  text: '#3D3D3A',
  heading: '#141413',
  strong: '#141413',
  accent: '#788C5D',
  accentSoft: '#A4B583',
  surface: '#FFFFFF',
};

const COBALT: ThemeDef = {
  id: 'cobalt',
  name: 'Cobalt Blue',
  description: '科技蓝，适合数据看板/产品 landing',
  background: '#F5F8FF',
  text: '#1F2937',
  heading: '#0F172A',
  strong: '#0F172A',
  accent: '#0056FF',
  accentSoft: '#60A5FA',
  surface: '#FFFFFF',
  fontSerif: '"Inter", system-ui, sans-serif',
};

const SUNSET: ThemeDef = {
  id: 'sunset',
  name: 'Sunset Coral',
  description: '暖橘红 + 米色，营销页/活动页',
  background: '#FFF5EE',
  text: '#3D3D3A',
  heading: '#141413',
  strong: '#B04A3F',
  accent: '#D97757',
  accentSoft: '#FFE0CC',
  surface: '#FFFFFF',
};

const MONO: ThemeDef = {
  id: 'mono',
  name: 'Mono Print',
  description: '黑白印刷感，适合"严肃文档"',
  background: '#FFFFFF',
  text: '#222222',
  heading: '#000000',
  strong: '#000000',
  accent: '#000000',
  accentSoft: '#666666',
  muted: '#999999',
  surface: '#FFFFFF',
  border: '1px solid #DDDDDD',
  fontSerif: 'Georgia, "Times New Roman", serif',
};

export const BUILTIN_THEMES: ThemeDef[] = [
  EDITORIAL,
  DARK,
  SAGE,
  COBALT,
  SUNSET,
  MONO,
];

export const BUILTIN_THEME_MAP = new Map(BUILTIN_THEMES.map(t => [t.id, t]));

export function getBuiltinTheme(id: string): ThemeDef | undefined {
  return BUILTIN_THEME_MAP.get(id);
}

export const DEFAULT_THEME_ID = 'editorial';
