'use client';

/**
 * ExportModal - 导出面板（v2）
 *
 * 移植自 GrowthPilot/src/components/ExportModal.jsx，用 TypeScript 重写
 * 适配 md-html-forge 的 editorial 设计语言（ivory + serif + clay）
 *
 * 支持：
 * - 图片导出（html-to-image，JPG，16:9 / 长图，自定义宽度/倍率）
 * - 字体内嵌（Material Icons + Inter，woff2 魔数校验，多 CDN fallback）
 * - HTML 文件导出（清理编辑器注入属性）
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';

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

const WIDTH_PRESETS = {
  '16:9': [
    { label: '1920px', value: 1920 },
    { label: '1280px', value: 1280 },
    { label: '960px', value: 960 },
  ],
  long: [
    { label: '800px', value: 800 },
    { label: '750px (微信)', value: 750 },
    { label: '1080px', value: 1080 },
  ],
};

const SCALE_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];

// ===== 组件 =====

interface ExportModalProps {
  /** 预览用 HTML（可含交互脚本） */
  htmlContent: string;
  /**
   * 可选：返回"精简独立"的 HTML（不含编辑器脚本 / 辅助属性）
   * 用于下载 / 图片导出；未提供则降级使用 htmlContent
   */
  getStandaloneHtml?: () => string;
  fileName?: string;
  onClose: () => void;
}

function ExportModal({ htmlContent, getStandaloneHtml, fileName = 'export', onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<'image' | 'html'>('image');
  const [templateType, setTemplateType] = useState<'16:9' | 'long'>('long');
  const [width, setWidth] = useState(800);
  const [customWidth, setCustomWidth] = useState('');
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [previewHeight, setPreviewHeight] = useState(0);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const getFixedHeight = useCallback(() => Math.round(width * 9 / 16), [width]);

  // 更新预览 iframe
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = htmlContent;

    const handleLoad = async () => {
      if (templateType === 'long') {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) return;
          const imgs = Array.from(doc.querySelectorAll('img'));
          await Promise.all(imgs.map((img) => {
            if ((img as HTMLImageElement).complete && (img as HTMLImageElement).naturalHeight > 0) return Promise.resolve();
            return new Promise<void>((res) => {
              const timer = setTimeout(res, 2000);
              img.addEventListener('load', () => { clearTimeout(timer); res(); }, { once: true });
              img.addEventListener('error', () => { clearTimeout(timer); res(); }, { once: true });
            });
          }));
          try { if (doc.fonts?.ready) await doc.fonts.ready; } catch { /* ignore */ }
          await new Promise(r => setTimeout(r, 200));
          const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
          const height = pageEl
            ? Math.ceil(pageEl.getBoundingClientRect().height)
            : (doc.body.scrollHeight || doc.documentElement.scrollHeight);
          setPreviewHeight(height);
        } catch { setPreviewHeight(800); }
      } else {
        setPreviewHeight(getFixedHeight());
      }
    };

    iframe.onload = handleLoad;
  }, [htmlContent, templateType, width, getFixedHeight]);

  // 导出 HTML 文件
  const handleExportHtml = useCallback(() => {
    setIsExporting(true);
    try {
      // 优先用 standalone 精简版本
      let cleanHtml = getStandaloneHtml ? getStandaloneHtml() : htmlContent;
      // 额外清理（兼容旧路径）
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

      const blob = new Blob([cleanHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const exportFileName = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
      link.download = exportFileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
      showToast(`导出成功: ${exportFileName}`);
    } catch (error) {
      alert('导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  }, [htmlContent, getStandaloneHtml, fileName, onClose]);

  // 导出图片（html-to-image）
  const handleExportImage = useCallback(async () => {
    setIsExporting(true);
    setExportProgress('准备导出...');

    let container: HTMLDivElement | null = null;
    try {
      // 创建离屏容器
      container = document.createElement('div');
      container.style.cssText = `
        position: fixed; left: -99999px; top: 0;
        width: ${width}px; overflow: visible;
        background: #FAF9F5; z-index: -9999;
      `;
      document.body.appendChild(container);

      const iframe = document.createElement('iframe');
      iframe.style.cssText = `width: ${width}px; border: none; background: #FAF9F5;`;
      container.appendChild(iframe);

      setExportProgress('渲染内容...');

      await new Promise<void>((resolve, reject) => {
        iframe.onload = () => resolve();
        iframe.onerror = () => reject(new Error('iframe load failed'));
        iframe.srcdoc = getStandaloneHtml ? getStandaloneHtml() : htmlContent;
      });

      setExportProgress('等待资源加载...');
      await new Promise(r => setTimeout(r, 2000));

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('Cannot access iframe document');

      // 等待图片加载
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

      // 确定最终高度
      let finalHeight: number;
      let actualWidth = width;

      if (templateType === '16:9') {
        finalHeight = getFixedHeight();
      } else {
        const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
        if (pageEl) {
          const rect = pageEl.getBoundingClientRect();
          actualWidth = Math.ceil(rect.width) || width;
          finalHeight = Math.ceil(rect.height);
        } else {
          finalHeight = Math.max(
            doc.body.scrollHeight, doc.body.offsetHeight,
            doc.documentElement.scrollHeight, doc.documentElement.offsetHeight,
          );
        }
        finalHeight = Math.max(finalHeight, 400);
      }

      container.style.height = `${finalHeight}px`;
      iframe.style.height = `${finalHeight}px`;
      await new Promise(r => setTimeout(r, 500));

      setExportProgress('加载字体...');

      // 内嵌字体
      for (const [fontName, urls] of Object.entries(FONT_SOURCES)) {
        try {
          const { base64, url: usedUrl } = await fetchFontSafely(urls);
          console.log(`[Export] ${fontName} loaded from:`, usedUrl);

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

          if (doc.head.firstChild) {
            doc.head.insertBefore(fontStyle, doc.head.firstChild);
          } else {
            doc.head.appendChild(fontStyle);
          }

          // FontFace API 主动加载
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
      doc.documentElement.offsetHeight; // force reflow for ligatures

      // 修复 tracking/whitespace 布局
      doc.querySelectorAll('.tracking-widest').forEach((el) => {
        const cs = iframe.contentWindow!.getComputedStyle(el as Element);
        const fontSize = parseFloat(cs.fontSize);
        (el as HTMLElement).style.letterSpacing = `${fontSize * 0.1}px`;
        (el as HTMLElement).style.whiteSpace = 'nowrap';
      });

      await new Promise(r => setTimeout(r, 1000));

      // 重新测量（字体加载后高度可能变化）
      if (templateType !== '16:9') {
        const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
        if (pageEl) {
          const rect = pageEl.getBoundingClientRect();
          finalHeight = Math.ceil(rect.height) || finalHeight;
          actualWidth = Math.ceil(rect.width) || actualWidth;
        } else {
          finalHeight = Math.max(
            doc.body.scrollHeight, doc.body.offsetHeight,
            doc.documentElement.scrollHeight, doc.documentElement.offsetHeight,
            finalHeight,
          );
        }
        container.style.height = `${finalHeight}px`;
        iframe.style.height = `${finalHeight}px`;
        await new Promise(r => setTimeout(r, 200));
      }

      setExportProgress('生成图片...');

      const pageEl = doc.querySelector('.page, body > .page') as HTMLElement | null;
      const captureTarget = (templateType !== '16:9' && pageEl) ? pageEl : doc.documentElement;
      const captureWidth = (templateType !== '16:9' && pageEl) ? actualWidth : width;

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

      setExportProgress('下载文件...');

      const link = document.createElement('a');
      const exportFileName = `${fileName.replace('.html', '')}_${captureWidth}x${finalHeight}_${scale}x.jpg`;
      link.download = exportFileName;
      link.href = dataUrl;
      link.click();

      setExportProgress('');
      onClose();
      showToast(`导出成功: ${exportFileName}`);
    } catch (error) {
      console.error('Export error:', error);
      setExportProgress('');
      alert('导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
      // 无论成功/失败，都清理离屏容器，避免 DOM 泄漏
      if (container?.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }, [htmlContent, getStandaloneHtml, fileName, width, scale, templateType, getFixedHeight, onClose]);

  const handleCustomWidth = useCallback((value: string) => {
    setCustomWidth(value);
    const num = parseInt(value, 10);
    if (num > 0 && num <= 4096) setWidth(num);
  }, []);

  const previewScale = Math.min(1, 280 / width);
  const previewDisplayHeight = templateType === '16:9'
    ? getFixedHeight() * previewScale
    : Math.min(360, previewHeight * previewScale);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="rounded-2xl shadow-2xl w-[660px] max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: '#FAF9F5', border: '1.5px solid #e8e4dc' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e8e4dc' }}>
          <h2 className="font-serif text-lg font-semibold" style={{ color: '#2c2825' }}>
            导出文件
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#9c9590' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#ede9e2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✕
          </button>
        </div>

        {/* 导出类型切换 */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-2">
            {(['image', 'html'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setExportType(type)}
                className="py-3 px-4 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: exportType === type ? '#D97757' : 'transparent',
                  color: exportType === type ? '#fff' : '#6b6560',
                  border: `1.5px solid ${exportType === type ? '#D97757' : '#d4cfc7'}`,
                }}
              >
                {type === 'image' ? '📷 图片 (JPG)' : '🌐 网页 (HTML)'}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          {exportType === 'image' ? (
            <div className="flex">
              {/* 左侧预览 */}
              <div className="w-[300px] p-5" style={{ borderRight: '1px solid #e8e4dc' }}>
                <div className="text-xs mb-3" style={{ color: '#9c9590' }}>预览</div>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    width: '100%',
                    height: previewDisplayHeight + 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F0EDE6',
                    border: '1px solid #e0dbd2',
                  }}
                >
                  <div style={{
                    width: width * previewScale,
                    height: templateType === '16:9' ? getFixedHeight() * previewScale : previewHeight * previewScale,
                    overflow: 'hidden',
                    borderRadius: '4px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }}>
                    <iframe
                      ref={previewIframeRef}
                      style={{
                        width, height: templateType === '16:9' ? getFixedHeight() : (previewHeight || 800),
                        border: 'none',
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                      }}
                      title="Export Preview"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs" style={{ color: '#9c9590' }}>输出尺寸: </span>
                  <span className="text-sm font-mono" style={{ color: '#D97757' }}>
                    {width} × {templateType === '16:9' ? getFixedHeight() : (previewHeight || '自适应')}
                  </span>
                  <span className="text-xs ml-2" style={{ color: '#b5b0a8' }}>@ {scale}x</span>
                </div>
              </div>

              {/* 右侧设置 */}
              <div className="flex-1 p-5 space-y-5">
                {/* 模板类型 */}
                <div>
                  <div className="text-xs mb-2" style={{ color: '#9c9590' }}>尺寸类型</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['16:9', 'long'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setTemplateType(type);
                          setWidth(WIDTH_PRESETS[type][0].value);
                          setCustomWidth('');
                        }}
                        className="py-2.5 px-3 rounded-xl text-sm transition-all"
                        style={{
                          background: templateType === type ? '#D97757' : 'transparent',
                          color: templateType === type ? '#fff' : '#6b6560',
                          border: `1.5px solid ${templateType === type ? '#D97757' : '#d4cfc7'}`,
                        }}
                      >
                        {type === '16:9' ? '横版 16:9' : '长图'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 宽度 */}
                <div>
                  <div className="text-xs mb-2" style={{ color: '#9c9590' }}>宽度</div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {WIDTH_PRESETS[templateType].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => { setWidth(preset.value); setCustomWidth(''); }}
                        className="py-1.5 px-2 rounded-lg text-xs transition-all"
                        style={{
                          background: width === preset.value && !customWidth ? '#D97757' : 'transparent',
                          color: width === preset.value && !customWidth ? '#fff' : '#6b6560',
                          border: `1.5px solid ${width === preset.value && !customWidth ? '#D97757' : '#d4cfc7'}`,
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="自定义宽度"
                      value={customWidth}
                      onChange={(e) => handleCustomWidth(e.target.value)}
                      min="320"
                      max="4096"
                      className="flex-1 py-1.5 px-3 rounded-lg text-sm outline-none"
                      style={{
                        background: '#F5F2EC',
                        border: '1.5px solid #d4cfc7',
                        color: '#2c2825',
                      }}
                    />
                    <span className="text-xs" style={{ color: '#9c9590' }}>px</span>
                  </div>
                </div>

                {/* 清晰度 */}
                <div>
                  <div className="text-xs mb-2" style={{ color: '#9c9590' }}>清晰度</div>
                  <div className="flex gap-1.5">
                    {SCALE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setScale(opt.value)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: scale === opt.value ? '#D97757' : 'transparent',
                          color: scale === opt.value ? '#fff' : '#6b6560',
                          border: `1.5px solid ${scale === opt.value ? '#D97757' : '#d4cfc7'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-xl p-6" style={{ background: '#F0EDE6', border: '1px solid #e0dbd2' }}>
                <div className="text-4xl mb-3">🌐</div>
                <div className="font-serif font-semibold mb-2" style={{ color: '#2c2825' }}>导出 HTML 文件</div>
                <div className="text-sm mb-4" style={{ color: '#6b6560' }}>
                  导出包含所有样式的独立 HTML 文件，可在浏览器直接打开
                </div>
                <div className="space-y-2 text-sm" style={{ color: '#6b6560' }}>
                  <div>✓ 包含所有样式和脚本</div>
                  <div>✓ 可离线查看</div>
                  <div>✓ 可二次编辑</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #e8e4dc' }}>
          <div className="text-sm" style={{ color: '#9c9590' }}>
            {exportProgress && (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ background: '#D97757' }} />
                {exportProgress}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl text-sm transition-all"
              style={{ color: '#6b6560', border: '1.5px solid #d4cfc7' }}
            >
              取消
            </button>
            <button
              onClick={exportType === 'image' ? handleExportImage : handleExportHtml}
              disabled={isExporting}
              className="px-6 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isExporting ? '#d4cfc7' : '#D97757',
                color: '#fff',
                border: 'none',
                cursor: isExporting ? 'not-allowed' : 'pointer',
              }}
            >
              {isExporting ? '导出中...' : (exportType === 'image' ? '导出 JPG' : '导出 HTML')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 简单 Toast
function showToast(message: string) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: #2c2825; color: #FAF9F5; padding: 10px 20px;
    border-radius: 10px; font-size: 14px; z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}

export default ExportModal;
