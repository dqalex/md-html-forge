import fs from 'node:fs';
import path from 'node:path';
import { SyntaxDocView } from './SyntaxDocView';

export const metadata = {
  title: 'Syntax Specification · md-html-forge',
  description: 'Forge syntax documentation rendered by forge itself. Source is forge Markdown, render pipeline identical to editor preview.',
};

/**
 * /docs/syntax · Forge syntax documentation (dogfooding)
 *
 * Supports bilingual (zh / en) documentation:
 *   - `syntax-doc.md`     → Chinese
 *   - `syntax-doc.en.md`  → English
 *
 * Server reads both files at build time; client-side SyntaxDocView
 * selects which to render based on the current i18n language.
 */
export default function SyntaxDocPage() {
  const dir = path.join(process.cwd(), 'src/app/docs/syntax');
  const zhMd = fs.readFileSync(path.join(dir, 'syntax-doc.md'), 'utf-8');
  const enMd = fs.readFileSync(path.join(dir, 'syntax-doc.en.md'), 'utf-8');
  return <SyntaxDocView markdownZh={zhMd} markdownEn={enMd} />;
}
