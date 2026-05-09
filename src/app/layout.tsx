import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'md-html-forge · Markdown → Styled HTML Playground',
  description:
    'Pipe Markdown into slot-based HTML templates. Inspired by html-effectiveness, dressed in teamclaw editorial language.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
