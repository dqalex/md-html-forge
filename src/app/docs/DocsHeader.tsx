'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ListIcon, BookOpenIcon, BotIcon, LanguagesIcon } from 'lucide-react';
import { ForgeLogo } from '@/components/brand/ForgeLogo';
import { useI18n } from '@/lib/i18n';

/**
 * /docs/* 下统一的顶部导航栏。
 *
 * 设计：
 *  - 轻量 header，不抢 /docs 内容的视觉重心
 *  - 与 AppHeader（Playground 专用）并存：Playground 走 AppHeader，文档走 DocsHeader
 *  - 4 个入口：Playground · Cheatsheet · Syntax · Agent Docs
 *  - 当前页用边框/颜色高亮
 */
const NAV: Array<{
  href: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}> = [
  { href: '/', label: 'Playground', hint: '实时编辑预览', icon: HomeIcon },
  { href: '/docs/slots', label: 'Cheatsheet', hint: '速查 + 选型', icon: ListIcon, matchPrefix: '/docs/slots' },
  { href: '/docs/syntax', label: 'Syntax', hint: '语法 (人类)', icon: BookOpenIcon, matchPrefix: '/docs/syntax' },
  { href: '/docs/agent', label: 'Agent Docs', hint: '给 AI 看的纯文本', icon: BotIcon, matchPrefix: '/docs/agent' },
];

export function DocsHeader() {
  const pathname = usePathname() || '';
  const { lang, setLang, t } = useI18n();
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 py-2.5 border-b sticky top-0 z-40"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--ivory, #FAF9F5) 92%, transparent)',
        backdropFilter: 'saturate(160%) blur(8px)',
      }}
    >
      {/* 品牌 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[13px] font-mono tracking-[0.04em] text-[color:var(--foreground)] hover:text-[color:var(--accent-strong,#B04A3F)] transition-colors"
      >
        <ForgeLogo size={22} className="shrink-0" />
        <span>md-html-forge <span className="text-[color:var(--text-tertiary)]">· docs</span></span>
      </Link>

      {/* 导航入口 + 语言切换 */}
      <nav className="flex items-center gap-1">
        {NAV.map((item) => {
          const active =
            item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.hint}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px]
                transition-colors border
                ${active
                  ? 'bg-[color:var(--foreground,#141413)] text-[color:var(--ivory,#FAF9F5)] border-[color:var(--foreground,#141413)]'
                  : 'border-transparent text-[color:var(--text-secondary)] hover:text-[color:var(--foreground)] hover:border-[color:var(--border)]'
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* 语言切换 */}
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          title={t('docs.lang.switch')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px]
            transition-colors border border-transparent
            text-[color:var(--text-secondary)] hover:text-[color:var(--foreground)] hover:border-[color:var(--border)]"
        >
          <LanguagesIcon className="h-3.5 w-3.5" />
          <span>{lang === 'zh' ? 'EN' : '中文'}</span>
        </button>
      </nav>
    </header>
  );
}
