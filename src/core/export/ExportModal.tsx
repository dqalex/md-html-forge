'use client';

/**
 * ExportModal - 导出面板（v4）
 *
 * v4 变更（vs v3）：
 *  - 设计语言对齐项目：CSS 变量（var(--surface)/var(--accent) 等）+ lucide-react 图标
 *  - 新增「复制富文本」模式：navigator.clipboard.write() 写 text/html，公众号 / 飞书 / 钉钉
 *    编辑器粘贴可保留样式，是公众号作者的高频路径
 *  - 整体布局：左侧导出方式 tab + 右侧设置区，更清晰
 *
 * 支持：
 * - 长图导出（html-to-image，JPG，宽度预设 + 自定义 + 4 档清晰度）
 * - 字体内嵌（Material Icons + Inter，woff2 魔数校验，多 CDN fallback）
 * - HTML 文件导出（清理编辑器注入属性 + standalone 渲染）
 * - 复制富文本到剪贴板（适合微信公众号 / 飞书文档 / 钉钉）
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  XIcon,
  ImageIcon,
  CodeXmlIcon,
  ClipboardCopyIcon,
  CheckIcon,
  LockIcon,
  AlertTriangleIcon,
  Loader2Icon,
  DownloadIcon,
} from 'lucide-react';
import { parsePageConfig } from '@/builtin';
import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

// ===== 字体安全加载 =====

const FONT_SOURCES: Record<string, string[]> = {
  'Material Icons': [
    'https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    'https://fonts.gstatic.com/s/materialicons/v141/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  ],
  'Inter': [
    'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50ojIw2ycMkxLE.woff2',
    'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50ojIw2w.woff2',
  ],
  'Plus Jakarta Sans': [
    'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Koz.woff2',
  ],
};

async function isValidWoff2(blob: Blob): Promise<boolean> {
  if (blob.size < 4) return false;
  const head = await blob.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(head);
  return bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46 && bytes[3] === 0x32;
}

async function fetchFontSafely(urls: string[]): Promise<{ base64: string; url: string }> {
  for (const url of urls) {
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) continue;
      const blob = await resp.blob();
      if (!(await isValidWoff2(blob))) continue;
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      return { base64, url };
    } catch {
      continue;
    }
  }
  throw new Error(`All font sources failed: ${urls.join(', ')}`);
}

// ===== 预设配置 =====

// WIDTH_PRESETS 仅用于"页面宽度"卡片反查 label（如 880px → "平衡"）。
// 与 src/components/markdown-editor/PageWidthPicker.tsx 的 PAGE_WIDTH_PRESETS 同源。
// v4 已移除「让用户选宽度」的逻辑：导出宽度永远跟随编辑器顶部「页宽」按钮，
// ExportModal 内只显示，不修改。
const WIDTH_PRESET_IDS = ['mobile', 'narrow', 'wechat', 'reading', 'default', 'wide', 'xwide'] as const;
const WIDTH_PRESET_VALUES = [420, 680, 750, 760, 880, 1080, 1280];
const WIDTH_PRESET_KEY_MAP: Record<string, string> = {
  mobile: 'export.width.mobile',
  narrow: 'export.width.narrow',
  wechat: 'export.width.wechat',
  reading: 'export.width.reading',
  default: 'export.width.default',
  wide: 'export.width.wide',
  xwide: 'export.width.xwide',
};

const SCALE_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];

type ExportMode = 'image' | 'html' | 'rich';

const MODE_TAB_IDS: ExportMode[] = ['image', 'rich', 'html'];

// ===== Props =====

interface ExportModalProps {
  /** 预览用 HTML（可含交互脚本） */
  htmlContent: string;
  /**
   * 可选：返回"精简独立"的 HTML（不含编辑器脚本 / 辅助属性）
   * 用于下载 / 图片导出 / 富文本复制；未提供则降级使用 htmlContent
   */
  getStandaloneHtml?: () => string;
  fileName?: string;
  /**
   * 可选：当前 markdown 源码。用于解析 @page width 指令：
   *   - 已指定固定 px 宽度 → 锁定该宽度，不让用户重选
   *   - 未指定 / @page full（自适应）→ 显示宽度选择器
   * 让导出与编辑器页宽心智模型一致：所见即所得。
   */
  markdown?: string;
  onClose: () => void;
}

/**
 * 解析 @page 指令的 width，返回 px 数值；
 * 返回 null 表示需要用户选（自适应 / 百分比 / 未指定）
 */
function parsePageWidthPx(md: string | undefined): number | null {
  if (!md) return null;
  const cfg = parsePageConfig(md);
  if (!cfg) return null;
  const m = cfg.width.match(/^(\d+)px$/i);
  if (!m) return null;
  return parseInt(m[1]!, 10);
}

// ===== 富文本剪贴板：把 HTML 写到 clipboard.write 让公众号编辑器识别样式 =====

/**
 * 准备粘贴到公众号 / 飞书的富文本 HTML：
 *   - 去掉 <html>/<head>，只保留 <body> 内容（很多编辑器对完整 doc 不友好）
 *   - 把 <style> 内联到对应元素上（粘贴后样式不丢失）
 *
 * 简化版：先不做完整的 inline-style 转换（那是个独立大特性），
 * 而是保留 <style> 标签 + body 内容；公众号编辑器对 <style> 的支持各家不一，
 * 但保守做法是直接写整段 HTML，让编辑器自己尽力解析。
 */
function prepareRichTextHtml(fullHtml: string): string {
  // 去掉 doctype + html / body 包裹层（保留 head 内的 style）
  const styleMatches = Array.from(fullHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
    .map(m => m[0])
    .join('\n');
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : fullHtml;
  // 公众号识别 <section> 比 <div> 更稳，但我们不强转
  return `${styleMatches}\n${body}`;
}

async function copyRichTextToClipboard(html: string): Promise<void> {
  // 优先用 navigator.clipboard.write 写 text/html
  if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([html.replace(/<[^>]+>/g, '')], { type: 'text/plain' });
    const item = new window.ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });
    await navigator.clipboard.write([item]);
    return;
  }
  // 降级：用 document.execCommand('copy')
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.innerHTML = html;
  div.style.position = 'fixed';
  div.style.left = '-99999px';
  document.body.appendChild(div);
  const range = document.createRange();
  range.selectNodeContents(div);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  document.execCommand('copy');
  sel?.removeAllRanges();
  document.body.removeChild(div);
}

// ===== 组件 =====

function ExportModal({ htmlContent, getStandaloneHtml, fileName = 'export', markdown, onClose }: ExportModalProps) {
  const { t, lang } = useI18n();
  // 来自 @page 指令的"声明宽度"（仅展示用：告诉用户这是 @page 的值）
  // 注：实际导出宽度永远以 iframe 内 .page 元素测量结果为准（所见即所得）
  const declaredWidth = useMemo(() => parsePageWidthPx(markdown), [markdown]);

  const [mode, setMode] = useState<ExportMode>('image');
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [previewHeight, setPreviewHeight] = useState(0);
  // 真实输出宽度：直接来自 iframe 内 .page 的 scrollWidth/rect.width
  // 这是"所见即所得"的核心：UI 显示的、预览渲染的、最终导出的，都是这个值
  const [previewWidth, setPreviewWidth] = useState<number>(declaredWidth ?? 880);
  // 富文本复制成功后的 transient 状态
  const [copySuccess, setCopySuccess] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // ESC 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 测量预览 iframe 的真实页宽（仅 image 模式需要）
  // 策略：iframe srcdoc=htmlContent，等加载完测 .page 的 scrollWidth/scrollHeight
  // 因为 htmlContent 已经按 @page 渲染好（.page max-width 是定值），不需要双轮测量
  const lastSrcRef = useRef('');
  const lastModeRef = useRef<ExportMode | null>(null);
  useEffect(() => {
    if (mode !== 'image') return;
    const iframe = previewIframeRef.current;
    if (!iframe) return;

    let cancelled = false;

    // 关键修复 1：从其他 tab 切回 image 时，iframe 是新挂的 DOM 节点，
    //   srcKey 没变但 iframe.srcdoc 是空的，必须强制重写
    const srcKey = htmlContent;
    const tabSwitched = lastModeRef.current !== 'image';
    lastModeRef.current = 'image';
    if (lastSrcRef.current !== srcKey || tabSwitched) {
      lastSrcRef.current = srcKey;
      iframe.srcdoc = htmlContent;
    }

    const handleLoad = async () => {
      if (cancelled) return;
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // 等图片 + 字体 + 一帧
        const imgs = Array.from(doc.querySelectorAll('img'));
        await Promise.all(imgs.map((img) => {
          if ((img as HTMLImageElement).complete && (img as HTMLImageElement).naturalHeight > 0) return Promise.resolve();
          return new Promise<void>((res) => {
            const timer = setTimeout(res, 2000);
            img.addEventListener('load', () => { clearTimeout(timer); res(); }, { once: true });
            img.addEventListener('error', () => { clearTimeout(timer); res(); }, { once: true });
          });
        }));
        if (cancelled) return;
        try { if (doc.fonts?.ready) await doc.fonts.ready; } catch { /* ignore */ }
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 200));
        if (cancelled) return;

        const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
        // 真实页宽：以 .page 的 rect.width 为准（即 max-width 实际值）
        // scrollWidth 兜底：当 .page 子元素横向溢出（窄屏 420 + 多列网格）时
        const measuredWidth = pageEl
          ? Math.max(pageEl.scrollWidth, Math.ceil(pageEl.getBoundingClientRect().width))
          : Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth);
        const measuredHeight = pageEl
          ? Math.max(pageEl.scrollHeight, Math.ceil(pageEl.getBoundingClientRect().height))
          : (doc.body.scrollHeight || doc.documentElement.scrollHeight);

        setPreviewWidth(measuredWidth);
        setPreviewHeight(measuredHeight);
      } catch {
        if (cancelled) return;
        setPreviewHeight(800);
      }
    };

    iframe.onload = handleLoad;
    // 关键修复 2：如果 iframe 已经 load 完（同一 srcdoc 第二次切回），
    //   onload 不会再触发，要手动跑一次测量
    if (!tabSwitched && iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => {
      cancelled = true;
      try { iframe.onload = null; } catch { /* ignore */ }
    };
  }, [mode, htmlContent]);

  // 切到非 image tab 时记录，下次切回 image 触发重测
  useEffect(() => {
    if (mode !== 'image') {
      lastModeRef.current = mode;
    }
  }, [mode]);

  // ResizeObserver：监听 .page 字体加载等导致的高度变化
  useEffect(() => {
    if (mode !== 'image') return;
    const iframe = previewIframeRef.current;
    if (!iframe) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow as (Window & typeof globalThis) | null;
      if (!doc || !win) return;

      const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
      const target = pageEl ?? doc.documentElement;

      const measure = () => {
        if (cancelled) return;
        try {
          const w = pageEl
            ? Math.max(pageEl.scrollWidth, Math.ceil(pageEl.getBoundingClientRect().width))
            : Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth);
          const h = pageEl
            ? Math.max(pageEl.scrollHeight, Math.ceil(pageEl.getBoundingClientRect().height))
            : (doc.body.scrollHeight || doc.documentElement.scrollHeight);
          setPreviewWidth(w);
          setPreviewHeight(h);
        } catch { /* iframe 已卸载 */ }
      };

      const RO = win.ResizeObserver ?? (typeof ResizeObserver !== 'undefined' ? ResizeObserver : null);
      if (!RO) return;
      let ro: ResizeObserver | null = null;
      try {
        ro = new RO(measure);
        ro.observe(target);
      } catch { /* 跨 document 监听失败 */ }
      cleanup = () => {
        cancelled = true;
        try { ro?.disconnect(); } catch { /* ignore */ }
      };
    } catch {
      // iframe 不可访问，静默
    }

    return cleanup;
  }, [mode, htmlContent]);

  // ===== HTML 清理（共享给 html / rich 两种模式） =====
  const buildCleanHtml = useCallback(() => {
    let cleanHtml = getStandaloneHtml ? getStandaloneHtml() : htmlContent;
    cleanHtml = cleanHtml.replace(/<script[^>]*data-studio-inject[^>]*>[\s\S]*?<\/script>/g, '');
    cleanHtml = cleanHtml.replace(/<base[^>]*>/g, '');
    cleanHtml = cleanHtml.replace(/\s*contenteditable="true"/g, '');
    cleanHtml = cleanHtml.replace(/\s*data-editable="true"/g, '');
    cleanHtml = cleanHtml.replace(/\bclass="([^"]*)"/g, (_, classes: string) => {
      const cleaned = classes.split(/\s+/)
        .filter((c: string) => c && c !== 'element-selected' && c !== 'element-hover' && c !== 'studio-edit-mode')
        .join(' ');
      return cleaned ? `class="${cleaned}"` : '';
    });
    cleanHtml = cleanHtml.replace(/\s+class=""/g, '');
    return cleanHtml;
  }, [htmlContent, getStandaloneHtml]);

  // ===== 导出：HTML 文件 =====
  const handleExportHtml = useCallback(() => {
    setIsExporting(true);
    try {
      const cleanHtml = buildCleanHtml();
      const blob = new Blob([cleanHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const exportFileName = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
      link.download = exportFileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
      showToast(`${t('export.success.downloaded')} ${exportFileName}`);
    } catch (error) {
      alert(t('export.error.failed') + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  }, [buildCleanHtml, fileName, onClose]);

  // ===== 导出：复制富文本到剪贴板 =====
  const handleCopyRichText = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(t('export.progress.preparingRich'));
    try {
      const cleanHtml = buildCleanHtml();
      const richHtml = prepareRichTextHtml(cleanHtml);
      await copyRichTextToClipboard(richHtml);
      setCopySuccess(true);
      setExportProgress('');
      showToast(t('export.success.richCopied'));
      // 1.5s 后关闭弹窗，避免用户还想多看一眼
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setExportProgress('');
      alert(t('export.error.copyFailed') + (error as Error).message + t('export.error.clipboardPolicy'));
    } finally {
      setIsExporting(false);
    }
  }, [buildCleanHtml, onClose]);

  // ===== 导出：长图（html-to-image） =====
  const handleExportImage = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(t('export.progress.preparing'));

    // initialWidth：iframe 起步视口宽度。优先用预览测得的真实页宽，
    // 没测过就用 @page 声明值兜底，最后兜底 880。
    // 实际 .page 由文档 CSS 决定 max-width，iframe 容器仅控制视口；
    // 后续会用 scrollWidth 兜底任何溢出
    const initialWidth = previewWidth || declaredWidth || 880;

    let container: HTMLDivElement | null = null;
    try {
      container = document.createElement('div');
      container.style.cssText = `
        position: fixed; left: -99999px; top: 0;
        width: ${initialWidth}px; overflow: visible;
        background: var(--background, #FAF9F5); z-index: -9999;
      `;
      document.body.appendChild(container);

      const iframe = document.createElement('iframe');
      iframe.style.cssText = `width: ${initialWidth}px; border: none; background: #FAF9F5;`;
      container.appendChild(iframe);

      setExportProgress(t('export.progress.rendering'));
      await new Promise<void>((resolve, reject) => {
        iframe.onload = () => resolve();
        iframe.onerror = () => reject(new Error('iframe load failed'));
        iframe.srcdoc = getStandaloneHtml ? getStandaloneHtml() : htmlContent;
      });

      setExportProgress(t('export.progress.loadingResources'));
      await new Promise(r => setTimeout(r, 2000));

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('Cannot access iframe document');

      const images = Array.from(doc.querySelectorAll('img'));
      await Promise.all(images.map((img) => {
        if ((img as HTMLImageElement).complete && (img as HTMLImageElement).naturalHeight > 0) return Promise.resolve();
        return new Promise<void>((res) => {
          const timer = setTimeout(res, 3000);
          img.addEventListener('load', () => { clearTimeout(timer); res(); }, { once: true });
          img.addEventListener('error', () => { clearTimeout(timer); res(); }, { once: true });
        });
      }));

      try { if (doc.fonts?.ready) await doc.fonts.ready; } catch { /* ignore */ }
      await new Promise(r => setTimeout(r, 300));

      // 测量真实尺寸（用 scrollWidth/scrollHeight 兜底窄屏溢出）
      let actualWidth = initialWidth;
      let finalHeight: number;
      const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
      if (pageEl) {
        actualWidth = Math.max(pageEl.scrollWidth, Math.ceil(pageEl.getBoundingClientRect().width)) || initialWidth;
        finalHeight = Math.max(pageEl.scrollHeight, Math.ceil(pageEl.getBoundingClientRect().height));
      } else {
        actualWidth = Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth, initialWidth);
        finalHeight = Math.max(
          doc.body.scrollHeight, doc.body.offsetHeight,
          doc.documentElement.scrollHeight, doc.documentElement.offsetHeight,
        );
      }
      finalHeight = Math.max(finalHeight, 400);

      if (actualWidth > initialWidth) {
        container.style.width = `${actualWidth}px`;
        iframe.style.width = `${actualWidth}px`;
      }
      container.style.height = `${finalHeight}px`;
      iframe.style.height = `${finalHeight}px`;
      await new Promise(r => setTimeout(r, 500));

      setExportProgress(t('export.progress.loadingFonts'));
      for (const [fontName, urls] of Object.entries(FONT_SOURCES)) {
        try {
          const { base64 } = await fetchFontSafely(urls);
          const fontStyle = doc.createElement('style');
          fontStyle.setAttribute('data-export-font', fontName.toLowerCase().replace(' ', '-'));

          if (fontName === 'Material Icons') {
            fontStyle.textContent = `
              @font-face {
                font-family: 'Material Icons';
                font-style: normal; font-weight: 400; font-display: block;
                src: url(${base64}) format('woff2');
              }
              .material-icons {
                font-family: 'Material Icons' !important;
                font-weight: normal; font-style: normal; font-size: 24px; line-height: 1;
                letter-spacing: normal; text-transform: none; display: inline-block;
                white-space: nowrap; direction: ltr;
                font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';
                -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
              }
            `;
          } else {
            fontStyle.textContent = `
              @font-face {
                font-family: '${fontName}';
                font-style: normal; font-weight: 100 900; font-display: block;
                src: url(${base64}) format('woff2');
              }
            `;
          }

          if (doc.head.firstChild) doc.head.insertBefore(fontStyle, doc.head.firstChild);
          else doc.head.appendChild(fontStyle);

          try {
            const iframeWin = iframe.contentWindow as (Window & { FontFace?: typeof FontFace }) | null;
            if (iframeWin?.FontFace) {
              const weight = fontName === 'Material Icons' ? '400' : '100 900';
              const ff = new iframeWin.FontFace!(fontName, `url(${base64}) format('woff2')`, {
                style: 'normal', weight, display: 'block',
              });
              const loaded = await ff.load();
              doc.fonts.add(loaded);
            }
          } catch { /* non-fatal */ }
        } catch {
          console.warn(`[Export] ${fontName} unavailable, using system font fallback`);
        }
      }

      try { if (doc.fonts?.ready) await doc.fonts.ready; } catch { /* ignore */ }
      doc.documentElement.offsetHeight;

      doc.querySelectorAll('.tracking-widest').forEach((el) => {
        const cs = iframe.contentWindow!.getComputedStyle(el as Element);
        const fontSize = parseFloat(cs.fontSize);
        (el as HTMLElement).style.letterSpacing = `${fontSize * 0.1}px`;
        (el as HTMLElement).style.whiteSpace = 'nowrap';
      });

      await new Promise(r => setTimeout(r, 1000));

      // 字体加载后重测
      if (pageEl) {
        finalHeight = Math.max(pageEl.scrollHeight, Math.ceil(pageEl.getBoundingClientRect().height)) || finalHeight;
        actualWidth = Math.max(pageEl.scrollWidth, Math.ceil(pageEl.getBoundingClientRect().width)) || actualWidth;
      } else {
        actualWidth = Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth, actualWidth);
        finalHeight = Math.max(
          doc.body.scrollHeight, doc.body.offsetHeight,
          doc.documentElement.scrollHeight, doc.documentElement.offsetHeight,
          finalHeight,
        );
      }
      if (actualWidth > parseInt(iframe.style.width || `${initialWidth}`, 10)) {
        container.style.width = `${actualWidth}px`;
        iframe.style.width = `${actualWidth}px`;
      }
      container.style.height = `${finalHeight}px`;
      iframe.style.height = `${finalHeight}px`;
      await new Promise(r => setTimeout(r, 200));

      setExportProgress(t('export.progress.generatingImage'));
      const captureTarget = doc.documentElement;
      const captureWidth = actualWidth;

      const dataUrl = await htmlToImage.toJpeg(captureTarget as HTMLElement, {
        width: captureWidth,
        height: finalHeight,
        pixelRatio: scale,
        quality: 0.9,
        backgroundColor: '#FAF9F5',
        style: { margin: '0', padding: '0', overflow: 'visible', transform: 'none' },
        skipFonts: true,
        cacheBust: false,
        filter: (node) => node.tagName !== 'IFRAME',
      });

      setExportProgress(t('export.progress.downloading'));
      const link = document.createElement('a');
      const exportFileName = `${fileName.replace('.html', '')}_${captureWidth}x${finalHeight}_${scale}x.jpg`;
      link.download = exportFileName;
      link.href = dataUrl;
      link.click();

      setExportProgress('');
      onClose();
      showToast(`${t('export.success.downloaded')} ${exportFileName}`);
    } catch (error) {
      console.error('Export error:', error);
      setExportProgress('');
      alert(t('export.error.failed') + (error as Error).message);
    } finally {
      setIsExporting(false);
      if (container?.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }, [htmlContent, getStandaloneHtml, fileName, previewWidth, declaredWidth, scale, onClose]);

  const handlePrimary = mode === 'image' ? handleExportImage
    : mode === 'rich' ? handleCopyRichText
    : handleExportHtml;

  // 实际渲染尺寸：完全以预览测量为准（所见即所得）
  const renderWidth = previewWidth || declaredWidth || 880;
  const renderHeight = previewHeight || 800;
  const previewScale = Math.min(1, 320 / renderWidth);
  const previewDisplayHeight = Math.min(420, renderHeight * previewScale);

  const primaryLabel = mode === 'image' ? t('export.btn.image')
    : mode === 'rich' ? (copySuccess ? t('export.btn.richCopied') : t('export.btn.richCopy'))
    : t('export.btn.htmlDownload');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26, 25, 21, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] w-[760px] max-h-[88vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div>
            <h2
              className="text-[17px] font-semibold leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
            >
              {t('export.header.title')}
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {t('export.header.desc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title={t('export.closeEsc')}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </header>

        {/* 主体：左 tab + 右内容 */}
        <div className="flex flex-1 min-h-0">
          {/* 左侧：模式 tab */}
          <nav
            className="w-[200px] shrink-0 p-3 space-y-1"
            style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
          >
            {MODE_TAB_IDS.map((tabId) => {
              const active = mode === tabId;
              const icon = tabId === 'image' ? <ImageIcon /> : tabId === 'rich' ? <ClipboardCopyIcon /> : <CodeXmlIcon />;
              const label = tabId === 'image' ? t('export.mode.image.label') : tabId === 'rich' ? t('export.mode.rich.label') : t('export.mode.html.label');
              const desc = tabId === 'image' ? t('export.mode.image.desc') : tabId === 'rich' ? t('export.mode.rich.desc') : t('export.mode.html.desc');
              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setMode(tabId)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-md text-left transition-all"
                  style={{
                    background: active ? 'var(--surface)' : 'transparent',
                    boxShadow: active ? 'var(--shadow-xs)' : 'none',
                    border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
                  }}
                >
                  <span
                    className="shrink-0 mt-0.5 [&>svg]:w-4 [&>svg]:h-4"
                    style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}
                  >
                    {icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-[13px] font-medium leading-tight"
                      style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                      {label}
                    </span>
                    <span
                      className="block text-[11px] mt-0.5 leading-snug"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* 右侧：每种模式独立面板 */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {mode === 'image' && (
              <ImagePanel
                scale={scale}
                renderWidth={renderWidth}
                renderHeight={renderHeight}
                previewHeight={previewHeight}
                previewScale={previewScale}
                previewDisplayHeight={previewDisplayHeight}
                declaredWidth={declaredWidth}
                previewIframeRef={previewIframeRef}
                onSetScale={setScale}
              />
            )}
            {mode === 'rich' && <RichTextPanel copySuccess={copySuccess} />}
            {mode === 'html' && <HtmlPanel />}
          </div>
        </div>

        {/* 底部操作 */}
        <footer
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
        >
          <div className="text-[12px] flex items-center gap-2 min-w-0" style={{ color: 'var(--text-tertiary)' }}>
            {exportProgress ? (
              <>
                <Loader2Icon className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="truncate">{exportProgress}</span>
              </>
            ) : (
              <span>
                {mode === 'image' && `${lang === 'zh' ? '输出' : 'Output'}: ${renderWidth} × ${previewHeight || t('export.image.autoFit')} @ ${scale}x`}
                {mode === 'rich' && t('export.footer.richNoFile')}
                {mode === 'html' && t('export.footer.htmlFile')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose} disabled={isExporting}>
              {t('export.cancel')}
            </Button>
            <Button
              variant="solid"
              size="md"
              icon={
                isExporting ? <Loader2Icon className="animate-spin" />
                  : copySuccess && mode === 'rich' ? <CheckIcon />
                  : mode === 'rich' ? <ClipboardCopyIcon />
                  : <DownloadIcon />
              }
              onClick={handlePrimary}
              disabled={isExporting}
            >
              {isExporting ? t('export.processing') : primaryLabel}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ===== 各模式独立面板 =====

interface ImagePanelProps {
  scale: number;
  renderWidth: number;
  renderHeight: number;
  previewHeight: number;
  previewScale: number;
  previewDisplayHeight: number;
  /** 来自 @page 的声明宽度（px）；null 表示未指定 / 自适应 */
  declaredWidth: number | null;
  previewIframeRef: React.RefObject<HTMLIFrameElement | null>;
  onSetScale: (s: number) => void;
}

function ImagePanel({
  scale,
  renderWidth, renderHeight, previewHeight, previewScale, previewDisplayHeight,
  declaredWidth, previewIframeRef,
  onSetScale,
}: ImagePanelProps) {
  const { t } = useI18n();
  // 从内置预设里反查 label，方便用户识别（如 "880px = 平衡"）
  const matchedPresetIdx = WIDTH_PRESET_VALUES.indexOf(renderWidth);
  const matchedPresetId = matchedPresetIdx >= 0 ? WIDTH_PRESET_IDS[matchedPresetIdx] : null;

  return (
    <div className="grid grid-cols-[300px_1fr] h-full min-h-0">
      {/* 缩略预览 */}
      <div
        className="p-5 shrink-0 overflow-hidden flex flex-col"
        style={{ borderRight: '1px solid var(--border-subtle)' }}
      >
        <SectionLabel>{t('export.image.preview')}</SectionLabel>
        <div
          className="flex items-center justify-center rounded-[var(--radius-md)]"
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            height: previewDisplayHeight + 32,
            minHeight: 200,
          }}
        >
          <div
            style={{
              width: renderWidth * previewScale,
              height: renderHeight * previewScale,
              overflow: 'hidden',
              borderRadius: 'var(--radius-xs)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <iframe
              ref={previewIframeRef}
              style={{
                width: renderWidth,
                height: renderHeight,
                border: 'none',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
                background: '#FAF9F5',
              }}
              title="Export Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-[12px] font-mono" style={{ color: 'var(--accent)' }}>
            {renderWidth} × {previewHeight || t('export.image.autoFit')}
            <span className="text-[11px] ml-1.5" style={{ color: 'var(--text-quaternary)' }}>
              @ {scale}x
            </span>
          </div>
        </div>
      </div>

      {/* 设置区 */}
      <div className="p-5 space-y-5">
        {/* 页面宽度（只读，跟编辑器保持一致；想改去顶部「页宽」按钮） */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <SectionLabel className="!mb-0">{t('export.image.pageWidth')}</SectionLabel>
            <span
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--surface-sunken)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <LockIcon className="w-3 h-3" />
              {t('export.image.wysiwyg')}
            </span>
          </div>

          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)]"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
          >
            <div className="flex items-baseline gap-2 min-w-0">
              {matchedPresetId && (
                <span className="text-[13px] font-medium" style={{ color: 'var(--accent-strong)' }}>
                  {t(WIDTH_PRESET_KEY_MAP[matchedPresetId]! as any)}
                </span>
              )}
              <span className="text-[13px] font-mono font-medium" style={{ color: 'var(--accent-strong)' }}>
                {renderWidth}px
              </span>
            </div>
            <CheckIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>

          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            {declaredWidth !== null
              ? <>{t('export.image.followPagePrefix')} <code style={{ background: 'var(--surface-sunken)', padding: '0 4px', borderRadius: 3 }}>@page</code> {t('export.image.pageDirectiveSuffix')}</>
              : t('export.image.noPageWidth')}
          </p>

          {renderWidth < 600 && (
            <div
              className="mt-2 px-3 py-2 rounded-[var(--radius-sm)] text-[11px] leading-relaxed flex items-start gap-1.5"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent-strong)' }}
            >
              <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {t('export.image.narrowWarning')}
              </span>
            </div>
          )}
        </div>

        {/* 清晰度 */}
        <div>
          <SectionLabel>{t('export.image.scale')}</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {SCALE_OPTIONS.map((opt) => {
              const active = scale === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSetScale(opt.value)}
                  className="h-8 rounded-[var(--radius-sm)] text-[12px] font-medium transition-all"
                  style={{
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? 'var(--accent-foreground)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            {t('export.image.scaleHint')}
          </p>
        </div>
      </div>
    </div>
  );
}

function RichTextPanel({ copySuccess }: { copySuccess: boolean }) {
  const { t } = useI18n();
  return (
    <div className="p-6 space-y-4">
      <div
        className="p-5 rounded-[var(--radius-md)]"
        style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{ background: copySuccess ? 'var(--accent)' : 'var(--accent-soft)' }}
          >
            {copySuccess
              ? <CheckIcon className="w-5 h-5" style={{ color: 'var(--accent-foreground)' }} />
              : <ClipboardCopyIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            }
          </div>
          <div className="min-w-0">
            <h3
              className="text-[14px] font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
            >
              {copySuccess ? t('export.rich.copiedToClipboard') : t('export.rich.copyToClipboard')}
            </h3>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('export.rich.clipboardDesc')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>{t('export.rich.useCases')}</SectionLabel>
        <ul className="space-y-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <SceneRow>{t('export.rich.useCase1')}</SceneRow>
          <SceneRow>{t('export.rich.useCase2')}</SceneRow>
          <SceneRow>{t('export.rich.useCase3')}</SceneRow>
          <SceneRow>{t('export.rich.useCase4')}</SceneRow>
        </ul>
      </div>

      <div>
        <SectionLabel>{t('export.rich.notes')}</SectionLabel>
        <ul className="space-y-1.5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          <NoteRow>{t('export.rich.note1')}</NoteRow>
          <NoteRow>{t('export.rich.note2')}</NoteRow>
          <NoteRow>{t('export.rich.note3')}</NoteRow>
        </ul>
      </div>
    </div>
  );
}

function HtmlPanel() {
  const { t } = useI18n();
  return (
    <div className="p-6 space-y-4">
      <div
        className="p-5 rounded-[var(--radius-md)]"
        style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-soft)' }}
          >
            <CodeXmlIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-[14px] font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
            >
              {t('export.html.downloadStandalone')}
            </h3>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('export.html.standaloneDesc')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>{t('export.html.includes')}</SectionLabel>
        <ul className="space-y-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <SceneRow>{t('export.html.include1')}</SceneRow>
          <SceneRow>{t('export.html.include2')}</SceneRow>
          <SceneRow>{t('export.html.include3')}</SceneRow>
          <SceneRow>{t('export.html.include4')}</SceneRow>
        </ul>
      </div>
    </div>
  );
}

// ===== 共用小原语 =====

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h4
      className={`text-[10px] font-semibold uppercase tracking-[0.08em] mb-2 ${className}`}
      style={{ color: 'var(--text-tertiary)' }}
    >
      {children}
    </h4>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center px-1 h-4 text-[10px] font-mono rounded mx-0.5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </kbd>
  );
}

function SceneRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckIcon className="w-3 h-3 shrink-0 mt-1" style={{ color: 'var(--accent)' }} />
      <span>{children}</span>
    </li>
  );
}

function NoteRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="w-1 h-1 rounded-full shrink-0 mt-1.5"
        style={{ background: 'var(--text-quaternary)' }}
      />
      <span>{children}</span>
    </li>
  );
}

// ===== Toast =====

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: var(--text-primary, #1a1915); color: var(--text-inverse, #fdfcf8);
    padding: 10px 20px; border-radius: 10px; font-size: 13px; z-index: 9999;
    box-shadow: var(--shadow-lg, 0 12px 28px -8px rgba(26,25,21,0.18));
    font-family: var(--font-sans, system-ui);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2200);
}

export default ExportModal;
