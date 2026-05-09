/**
 * 图标渲染
 *
 * 方案：用 lucide-react 的 React 组件 + react-dom/server 的 renderToStaticMarkup
 *       在浏览器/SSR 中都能跑（Next.js webpack 自动打包对应版本）。
 *
 * 语法（在 MD 的 slot 内容里）：
 *   :lucide:check-square:    → <svg>...</svg>
 *   :icon:check-square:      → 同上（别名）
 *
 * 扩展图标：在 ICON_MAP 加一行 import + 映射
 */

import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CheckSquare, FileText, Wrench, ClipboardList, Users, Bot,
  Send, Clock, MessageSquare, LayoutDashboard, Calendar,
  Target, Zap, Shield, Globe, Database, Code, Terminal,
  BookOpen, Lightbulb, Rocket, Star, Heart,
  AlertCircle, Info, HelpCircle, CheckCircle, XCircle,
  Check, X,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ChevronRight, ChevronDown,
  Plus, Minus,
  Search, Edit, Trash2, Save, Download, Upload, RefreshCw, Copy,
  ExternalLink, Link, Share2, Settings, User, Lock, Mail,
  Image as ImageIcon, File, Folder, Home,
  TrendingUp, TrendingDown, BarChart, PieChart, Activity,
  Monitor, Cloud, Server, Cpu,
  Sparkles, Brain, MessageCircle, Mic, Camera,
  Layers, Grid, Columns, Square, Circle, Triangle,
  Award, Trophy, Flag, Tag, Hash, Filter,
  Github, Twitter, Linkedin,
  Quote, List, ListChecks,
  Eye, Bell, Timer, Play, Pause,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = ComponentType<any>;

const ICON_MAP: Record<string, IconComponent> = {
  // General
  'check-square': CheckSquare, 'file-text': FileText, 'wrench': Wrench,
  'clipboard-list': ClipboardList, 'users': Users, 'bot': Bot,
  'send': Send, 'clock': Clock, 'message-square': MessageSquare,
  'layout-dashboard': LayoutDashboard, 'calendar': Calendar, 'target': Target,
  'zap': Zap, 'shield': Shield, 'globe': Globe, 'database': Database,
  'code': Code, 'terminal': Terminal, 'book-open': BookOpen,
  'lightbulb': Lightbulb, 'rocket': Rocket, 'star': Star, 'heart': Heart,
  // Status
  'alert-circle': AlertCircle, 'info': Info, 'help-circle': HelpCircle,
  'check-circle': CheckCircle, 'x-circle': XCircle, 'check': Check, 'x': X,
  // Arrows
  'arrow-right': ArrowRight, 'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
  'chevron-right': ChevronRight, 'chevron-down': ChevronDown,
  'plus': Plus, 'minus': Minus,
  // Actions
  'search': Search, 'edit': Edit, 'trash-2': Trash2, 'save': Save,
  'download': Download, 'upload': Upload, 'refresh-cw': RefreshCw, 'copy': Copy,
  'external-link': ExternalLink, 'link': Link, 'share-2': Share2,
  'settings': Settings, 'user': User, 'lock': Lock, 'mail': Mail,
  // Files
  'image': ImageIcon, 'file': File, 'folder': Folder, 'home': Home,
  // Data
  'trending-up': TrendingUp, 'trending-down': TrendingDown,
  'bar-chart': BarChart, 'pie-chart': PieChart, 'activity': Activity,
  // Devices
  'monitor': Monitor, 'cloud': Cloud, 'server': Server, 'cpu': Cpu,
  // AI
  'sparkles': Sparkles, 'brain': Brain,
  'message-circle': MessageCircle, 'mic': Mic, 'camera': Camera,
  // Layout
  'layers': Layers, 'grid': Grid, 'columns': Columns,
  'square': Square, 'circle': Circle, 'triangle': Triangle,
  // Reward
  'award': Award, 'trophy': Trophy, 'flag': Flag,
  'tag': Tag, 'hash': Hash, 'filter': Filter,
  // Social
  'github': Github, 'twitter': Twitter, 'linkedin': Linkedin,
  // Text
  'quote': Quote, 'list': List, 'list-checks': ListChecks,
  // Misc
  'eye': Eye, 'bell': Bell, 'timer': Timer,
  'play': Play, 'pause': Pause,
};

// SVG 缓存（同一图标多次渲染只调一次 renderToStaticMarkup）
const cache = new Map<string, string>();

/**
 * 渲染单个 lucide 图标为 SVG 字符串
 */
export function renderLucideIcon(
  name: string,
  options: { size?: number; color?: string; strokeWidth?: number; className?: string } = {},
): string {
  const Comp = ICON_MAP[name];
  if (!Comp) return '';

  const {
    size = 18,
    color = 'currentColor',
    strokeWidth = 2,
    className = 'lucide-icon',
  } = options;

  const cacheKey = `${name}|${size}|${color}|${strokeWidth}|${className}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const element = createElement(Comp, {
      size,
      color,
      strokeWidth,
      className,
      'aria-label': name,
      style: { display: 'inline-block', verticalAlign: '-0.15em' },
    });
    const svg = renderToStaticMarkup(element);
    cache.set(cacheKey, svg);
    return svg;
  } catch (e) {
    console.warn('[icons] render failed:', name, e);
    return '';
  }
}

/** 替换 HTML 中的 :lucide:name: / :icon:name: 以及 <i data-lucide="name"> 为 SVG */
export function renderIconsInHtml(html: string): string {
  // <i data-lucide="..."></i>  （经过 inlineMdToHtml 后的形态）
  html = html.replace(
    /<i\s+data-lucide="([a-z0-9-]+)"[^>]*>\s*<\/i>/gi,
    (match, name) => renderLucideIcon(name) || match,
  );
  // :lucide:name: / :icon:name:
  html = html.replace(
    /:(?:lucide|icon):([a-z0-9-]+):/g,
    (match, name) => renderLucideIcon(name) || match,
  );
  return html;
}

/** 所有内置图标 id（供组件浏览器搜索提示） */
export const AVAILABLE_ICON_NAMES: readonly string[] = Object.keys(ICON_MAP).sort();
