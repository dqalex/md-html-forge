/**
 * 图标渲染工具
 *
 * 将 simpleMdToHtml 产出的 `<i data-lucide="xxx"></i>` 占位符替换为
 * 真实的 Lucide SVG，使 :lucide:icon-name: 短码在最终 HTML 中可见。
 *
 * 移植自 teamclaw/src/shared/lib/icon-render.ts，依赖：
 *   - lucide-react（已在 package.json）
 *   - react-dom/server.renderToString（仅在浏览器/Node SSR 期间调用）
 */

import {
  CheckSquare, FileText, Wrench, ClipboardList, Users, Bot,
  Send, Clock, MessageSquare, LayoutDashboard, Calendar,
  Target, Zap, Shield, Globe, Database, Code, Terminal,
  BookOpen, Lightbulb, Rocket, Star, Heart, ThumbsUp,
  AlertCircle, Info, HelpCircle, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Menu, X, Plus, Minus,
  Search, Filter, Edit, Trash2, Save, Download, Upload,
  RefreshCw, RotateCcw, Copy, ExternalLink, Link, Share2,
  Settings, User, Lock, Unlock, Key, Mail, Phone, MapPin,
  Image, File, Folder, FolderOpen, Home, Building, Briefcase,
  CreditCard, DollarSign, TrendingUp, TrendingDown, BarChart,
  PieChart, Activity, Monitor, Smartphone, Tablet, Wifi,
  Cloud, CloudOff, HardDrive, Server, Cpu, MemoryStick,
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Bell, BellOff, Timer,
  Check, MoreHorizontal, MoreVertical, GripVertical,
  GripHorizontal, Move, ZoomIn, ZoomOut, Maximize, Minimize,
  Eye, EyeOff, Printer, QrCode, Barcode, Tag, Hash, AtSign,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, ListChecks, Indent, Outdent,
  Quote, Link2, Unlink, Table, ImagePlus,
  Paperclip, Smile, Frown, Meh, ThumbsDown, Laugh, Angry,
  HeartHandshake, Sparkles, Wand2, Brain,
  MessageCircle, MessagesSquare,
  PhoneCall, Video, Mic, Camera, Scan,
  Focus, Crosshair, Layers, Grid, Rows, Columns, Square,
  Circle, Triangle, Hexagon, Octagon, Pentagon, Diamond,
  Badge, Award, Trophy, Crown, Medal, Ribbon, Stamp,
} from "lucide-react";
import React from "react";

// 动态导入 react-dom/server 以避免 webpack/turbopack 在客户端 bundle 中静态分析报错。
// 仅在 renderIconToSvg 真正被调用时才加载。
type RenderToString = (element: React.ReactElement) => string;
let _renderToString: RenderToString | null = null;
function getRenderToString(): RenderToString {
  if (_renderToString) return _renderToString;
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const mod = require("react-dom/server") as { renderToString: RenderToString };
  _renderToString = mod.renderToString;
  return _renderToString;
}

/** Lucide 图标名 → React 组件 映射表（短横线命名，与 :lucide:xxx: 短码一致）。 */
const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  // 通用操作
  "check-square": CheckSquare,
  "file-text": FileText,
  wrench: Wrench,
  "clipboard-list": ClipboardList,
  users: Users,
  bot: Bot,
  send: Send,
  clock: Clock,
  "message-square": MessageSquare,
  "layout-dashboard": LayoutDashboard,
  calendar: Calendar,
  target: Target,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  database: Database,
  code: Code,
  terminal: Terminal,
  // 文档与知识
  "book-open": BookOpen,
  lightbulb: Lightbulb,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  "thumbs-up": ThumbsUp,
  // 状态提示
  "alert-circle": AlertCircle,
  info: Info,
  "help-circle": HelpCircle,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  // 方向箭头
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  // UI 操作
  menu: Menu,
  x: X,
  plus: Plus,
  minus: Minus,
  search: Search,
  filter: Filter,
  edit: Edit,
  "trash-2": Trash2,
  save: Save,
  download: Download,
  upload: Upload,
  "refresh-cw": RefreshCw,
  "rotate-ccw": RotateCcw,
  copy: Copy,
  "external-link": ExternalLink,
  link: Link,
  "share-2": Share2,
  // 设置与用户
  settings: Settings,
  user: User,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
  // 文件与目录
  image: Image,
  file: File,
  folder: Folder,
  "folder-open": FolderOpen,
  home: Home,
  building: Building,
  briefcase: Briefcase,
  // 财务与统计
  "credit-card": CreditCard,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "bar-chart": BarChart,
  "pie-chart": PieChart,
  activity: Activity,
  // 设备
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  wifi: Wifi,
  cloud: Cloud,
  "cloud-off": CloudOff,
  "hard-drive": HardDrive,
  server: Server,
  cpu: Cpu,
  "memory-stick": MemoryStick,
  // 媒体控制
  play: Play,
  pause: Pause,
  stop: Square,
  "skip-forward": SkipForward,
  "skip-back": SkipBack,
  "volume-2": Volume2,
  "volume-x": VolumeX,
  // 通知与时间
  bell: Bell,
  "bell-off": BellOff,
  timer: Timer,
  // 确认与取消
  check: Check,
  // 布局
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
  "grip-vertical": GripVertical,
  "grip-horizontal": GripHorizontal,
  move: Move,
  "zoom-in": ZoomIn,
  "zoom-out": ZoomOut,
  maximize: Maximize,
  minimize: Minimize,
  // 可见性
  eye: Eye,
  "eye-off": EyeOff,
  printer: Printer,
  "qr-code": QrCode,
  barcode: Barcode,
  tag: Tag,
  hash: Hash,
  "at-sign": AtSign,
  // 文本格式
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  "align-left": AlignLeft,
  "align-center": AlignCenter,
  "align-right": AlignRight,
  list: List,
  "list-ordered": ListOrdered,
  "list-checks": ListChecks,
  indent: Indent,
  outdent: Outdent,
  quote: Quote,
  "link-2": Link2,
  unlink: Unlink,
  table: Table,
  "image-plus": ImagePlus,
  paperclip: Paperclip,
  // 表情
  smile: Smile,
  frown: Frown,
  meh: Meh,
  "thumbs-down": ThumbsDown,
  laugh: Laugh,
  angry: Angry,
  "heart-handshake": HeartHandshake,
  // AI 与智能
  sparkles: Sparkles,
  "wand-2": Wand2,
  brain: Brain,
  "message-circle": MessageCircle,
  "messages-square": MessagesSquare,
  "chat-bubble": MessageCircle,
  // 通讯
  "phone-call": PhoneCall,
  video: Video,
  mic: Mic,
  camera: Camera,
  scan: Scan,
  // 聚焦
  focus: Focus,
  crosshair: Crosshair,
  // 图层与布局
  layers: Layers,
  grid: Grid,
  rows: Rows,
  columns: Columns,
  // 形状
  square: Square,
  circle: Circle,
  triangle: Triangle,
  hexagon: Hexagon,
  octagon: Octagon,
  pentagon: Pentagon,
  diamond: Diamond,
  // 奖励与认证
  badge: Badge,
  award: Award,
  trophy: Trophy,
  crown: Crown,
  medal: Medal,
  ribbon: Ribbon,
  stamp: Stamp,
};

/** 图标渲染配置 */
export interface IconRenderConfig {
  /** 像素尺寸，默认 22 */
  size?: number;
  /** 描边宽度，默认 2 */
  strokeWidth?: number;
  /** 颜色，默认 #0056ff；当 inheritColor=true 时无效 */
  color?: string;
  /** 是否继承父元素颜色，默认 false */
  inheritColor?: boolean;
}

const DEFAULT_CONFIG: Required<IconRenderConfig> = {
  size: 22,
  strokeWidth: 2,
  color: "#0056ff",
  inheritColor: false,
};

/** 把单个图标渲染为 SVG 字符串。未注册的图标返回 null。 */
export function renderIconToSvg(iconName: string, config: IconRenderConfig = {}): string | null {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return null;

  const { size, strokeWidth, color, inheritColor } = { ...DEFAULT_CONFIG, ...config };

  try {
    const renderToString = getRenderToString();
    return renderToString(
      React.createElement(IconComponent, {
        size,
        strokeWidth,
        ...(inheritColor ? {} : { color }),
      }),
    );
  } catch (err) {
    // 浏览器端、且没有 react-dom/server.browser 的极端情形：回退为空，让外层保留占位符。
    if (typeof console !== "undefined") {
      console.warn(`[markdown-slots] Failed to render icon "${iconName}":`, err);
    }
    return null;
  }
}

/**
 * 将 HTML 中所有 `<i data-lucide="xxx"></i>` 占位符替换为真实 SVG。
 *
 * 占位符由 simpleMdToHtml() 在解析 `:lucide:xxx:` 短码时产生。
 * 渲染失败的图标保持原样，下游 DOMPurify 会保留这些 i 标签。
 */
export function renderIconsInHtml(html: string, config: IconRenderConfig = {}): string {
  if (!html) return html;
  // 同时支持 <i ...></i> 和自闭合 <i ... />
  const iconPattern = /<i\s+data-lucide="([a-z0-9-]+)"[^>]*><\/i>|<i\s+data-lucide="([a-z0-9-]+)"[^>]*\/>/gi;
  return html.replace(iconPattern, (match, name1?: string, name2?: string) => {
    const iconName = name1 ?? name2 ?? "";
    const svg = renderIconToSvg(iconName, config);
    return svg ?? match;
  });
}

/** 全部已注册图标名（供未来的图标选择器用） */
export function getAvailableIconNames(): string[] {
  return Object.keys(iconMap);
}

/** 检查图标是否可用 */
export function isIconAvailable(iconName: string): boolean {
  return iconName in iconMap;
}
