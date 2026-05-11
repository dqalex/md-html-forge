/**
 * ForgeLogo · 可复用品牌 mark（纯 SVG inline）
 *
 * 设计要点：
 * - 内联 SVG：不依赖 next/image、不发额外请求、也不受 public/ 路径影响
 * - 支持 3 个变体：`default`（浅底）/ `dark`（深底反色）/ `mono`（currentColor 单色）
 * - size 只决定 width/height，内部 stroke 基于 viewBox 自适应
 * - 所有色值对齐项目主题：`#141413` slate / `#FAF9F5` ivory / `#D97757` clay
 *
 * 品牌源文件仍在 `public/brand/*.svg`，本组件是为 React 页面准备的轻量等价物，
 * 两处保持一致：修改形状时请同步更新两边。
 */

export type ForgeLogoVariant = 'default' | 'dark' | 'mono';

export interface ForgeLogoProps {
  /** 绘制尺寸（正方形），单位 px。默认 28 */
  size?: number;
  variant?: ForgeLogoVariant;
  className?: string;
  /** 供无障碍读屏用；传 '' 表示完全装饰性（默认） */
  title?: string;
}

export function ForgeLogo({
  size = 28,
  variant = 'default',
  className,
  title = '',
}: ForgeLogoProps) {
  const palette = PALETTE[variant];
  const ariaHidden = title === '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={ariaHidden ? 'presentation' : 'img'}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : title}
    >
      {title && <title>{title}</title>}

      {/* 底板 */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="12"
        fill={palette.bg}
        stroke={palette.stroke}
        strokeWidth="2.5"
      />

      {/* M 三笔 */}
      <path d="M14 18 L14 46" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 18 L32 46" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M14 18 L23 32 L32 18"
        stroke={palette.stroke}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 锻造痕 + 火花 */}
      <path
        d="M23 32 L41 32"
        stroke={palette.spark}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={palette.sparkOpacity}
      />
      <circle
        cx="23"
        cy="32"
        r="2.2"
        fill={palette.spark}
        opacity={palette.sparkOpacity}
      />

      {/* H 两笔 */}
      <path d="M50 18 L50 46" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M41 32 L50 32" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================
// ForgeLogoHorizontal · mark + 产品名，给 AppHeader / 文档顶栏用
// ============================================================

export interface ForgeLogoHorizontalProps {
  /** 整体高度，宽度按比例自适应。默认 32 */
  height?: number;
  variant?: ForgeLogoVariant;
  /** 是否显示副标题 "markdown → html"。默认 false（紧凑场景关掉） */
  showTagline?: boolean;
  className?: string;
}

export function ForgeLogoHorizontal({
  height = 32,
  variant = 'default',
  showTagline = false,
  className,
}: ForgeLogoHorizontalProps) {
  const palette = PALETTE[variant];
  // viewBox 宽度：紧凑版 168 / 带副标题 280
  const vbWidth = showTagline ? 280 : 168;
  const width = Math.round((height * vbWidth) / 64);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${vbWidth} 64`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="md-html-forge"
    >
      {/* mark */}
      <rect x="2" y="2" width="60" height="60" rx="12"
            fill={palette.bg} stroke={palette.stroke} strokeWidth="2.5" />
      <path d="M14 18 L14 46" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 18 L32 46" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M14 18 L23 32 L32 18" stroke={palette.stroke} strokeWidth="3"
            strokeLinejoin="round" strokeLinecap="round" />
      <path d="M23 32 L41 32" stroke={palette.spark} strokeWidth="3"
            strokeLinecap="round" opacity={palette.sparkOpacity} />
      <circle cx="23" cy="32" r="2.2" fill={palette.spark} opacity={palette.sparkOpacity} />
      <path d="M50 18 L50 46" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M41 32 L50 32" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />

      {/* 产品名 */}
      <text
        x="78"
        y={showTagline ? 32 : 40}
        fill={palette.stroke}
        fontFamily="'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
        fontSize="18"
        fontWeight="600"
        letterSpacing="-0.01em"
      >
        md-html-forge
      </text>

      {/* 副标题（可选） */}
      {showTagline && (
        <g transform="translate(78, 44)">
          <text
            x="0" y="10"
            fill={palette.tagline}
            fontFamily="'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
            fontSize="10"
            letterSpacing="0.02em"
          >
            markdown
          </text>
          <path
            d="M65 7 L77 7 M73 3 L77 7 L73 11"
            stroke={palette.spark}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <text
            x="82" y="10"
            fill={palette.tagline}
            fontFamily="'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
            fontSize="10"
            letterSpacing="0.02em"
          >
            html
          </text>
        </g>
      )}
    </svg>
  );
}

// ============================================================
// 调色板
// ============================================================

interface Palette {
  bg: string;
  stroke: string;
  spark: string;
  sparkOpacity: number;
  tagline: string;
}

const PALETTE: Record<ForgeLogoVariant, Palette> = {
  default: {
    bg: '#FAF9F5',
    stroke: '#141413',
    spark: '#D97757',
    sparkOpacity: 1,
    tagline: '#87867F',
  },
  dark: {
    bg: '#141413',
    stroke: '#FAF9F5',
    spark: '#D97757',
    sparkOpacity: 1,
    tagline: '#87867F',
  },
  mono: {
    // mono 变体：全部走 currentColor，父元素 color 决定全部颜色
    bg: 'transparent',
    stroke: 'currentColor',
    spark: 'currentColor',
    sparkOpacity: 0.55,
    tagline: 'currentColor',
  },
};
