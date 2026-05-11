import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'md-html-forge · Markdown → Styled HTML Playground',
  description:
    'Pipe Markdown into beautifully designed components. AI-friendly, brand-consistent, export-ready.',
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/logo-mark.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: '/brand/logo-mark.svg',
  },
  openGraph: {
    type: 'website',
    title: 'md-html-forge',
    description:
      'Pipe Markdown into beautifully designed components. AI-friendly, brand-consistent, export-ready.',
    images: [
      {
        url: '/brand/logo-horizontal.svg',
        width: 280,
        height: 64,
        alt: 'md-html-forge · markdown → html',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'md-html-forge',
    description:
      'Pipe Markdown into beautifully designed components. AI-friendly, brand-consistent, export-ready.',
    images: ['/brand/logo-mark.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

