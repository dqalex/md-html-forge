'use client';

/**
 * HtmlPreview - HTML 预览/编辑面板（v2）
 *
 * 移植自 GrowthPilot/src/components/HtmlPane.jsx + PropertyPanel.jsx
 * 功能：
 * - iframe 隔离渲染（支持 slot-sync 注入脚本）
 * - 预览模式：点击 data-slot 元素 → 定位到 MD
 * - 编辑模式：单击选中 → PropertyPanel 调色/改字号；双击直接编辑文字；图片双击替换
 * - 设备模拟：桌面/移动切换 + 自适应缩放
 * - 内容变化 → 通知 onChange 回写 HTML（双向同步入口）
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import PropertyPanel from './PropertyPanel';
import { cleanEditorAttributes, generateIframeScript } from '@/lib/markdown-slots/slot-sync';

// ===== 类型 =====

interface SelectedElementInfo {
  tagName: string;
  textContent?: string;
  canEditText?: boolean;
  slotName?: string | null;
  slotType?: string;
  styles: Record<string, string>;
  isImage?: boolean;
  className?: string;
}

interface HtmlPreviewProps {
  content: string;
  onChange?: (html: string) => void;
  /** 预览区 slot 点击 → 定位到 MD */
  onLocateSlot?: (slotName: string) => void;
  onClearMdHighlight?: () => void;
}

// ===== 组件 =====

export default function HtmlPreview({
  content,
  onChange,
  onLocateSlot,
  onClearMdHighlight,
}: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef(content);
  const isInternalChange = useRef(false);

  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [zoom, setZoom] = useState(100);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  const deviceSizes = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  };
  const currentSize = deviceSizes[deviceMode];

  const fitScale = useMemo(() => {
    const sx = containerSize.width / currentSize.width;
    const sy = containerSize.height / currentSize.height;
    return Math.min(sx, sy, 1) * 100;
  }, [containerSize, currentSize]);

  const actualZoom = zoomMode === 'fit' ? fitScale : zoom;

  // 监听容器尺寸
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width: width - 32, height: height - 32 });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 生成注入了编辑脚本的 HTML
  const getEnhancedHtml = useCallback((html: string, isEdit: boolean) => {
    const scriptContent = generateIframeScript();
    const editScript = `<script data-studio-inject="true">${scriptContent}</script>`;

    // 初始化时设置编辑模式
    const initScript = `<script>
      window.addEventListener('load', function() {
        ${isEdit ? "document.body.classList.add('studio-edit-mode');" : ''}
      });
    </script>`;

    let enhanced = html;
    if (enhanced.includes('</body>')) {
      enhanced = enhanced.replace('</body>', `${editScript}${initScript}</body>`);
    } else {
      enhanced = enhanced + editScript + initScript;
    }
    return enhanced;
  }, []);

  // 用 ref 追踪 editMode，供 srcdoc effect 读取初始值而不产生依赖
  const editModeRef = useRef(editMode);
  useEffect(() => { editModeRef.current = editMode; }, [editMode]);

  // 更新 iframe 内容（只在 content 外部变化时重载，editMode 切换不触发）
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      lastContentRef.current = content;
      return;
    }
    if (!iframeRef.current) return;
    // 初始加载时把当前 editMode 状态写入脚本，后续通过 postMessage 切换
    const enhanced = getEnhancedHtml(content, editModeRef.current);
    iframeRef.current.srcdoc = enhanced;
    lastContentRef.current = content;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, getEnhancedHtml]); // 不依赖 editMode，避免每次切换都重载 iframe

  // 切换编辑模式时通过 postMessage 通知 iframe（不重载）
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage({ type: 'toggleEditMode', value: editMode }, '*');
  }, [editMode]);

  // 监听来自 iframe 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data;

      if (type === 'contentChanged') {
        isInternalChange.current = true;
        // 清理注入属性后回写
        let cleanHtml = event.data.html as string;
        cleanHtml = cleanEditorAttributes(cleanHtml);
        onChange?.(cleanHtml);
      } else if (type === 'elementSelected') {
        setSelectedElement(event.data as SelectedElementInfo);
      } else if (type === 'elementDeselected') {
        setSelectedElement(null);
      } else if (type === 'previewLocate') {
        if (event.data.slotName && onLocateSlot) {
          onLocateSlot(event.data.slotName as string);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onChange, onLocateSlot]);

  // PropertyPanel 发送样式命令
  const sendStyleCommand = useCallback((property: string, value: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'setStyle', styles: { [property]: value } }, '*');
  }, []);

  // PropertyPanel 发送文字命令
  const sendTextCommand = useCallback((slotName: string, value: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'setText', slotName, value }, '*');
  }, []);

  // 触发图片替换
  const triggerImageReplace = useCallback((slotName?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'replaceImage', slotName, value: dataUrl },
          '*',
        );
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const closePropertyPanel = useCallback(() => {
    setSelectedElement(null);
    onClearMdHighlight?.();
    iframeRef.current?.contentWindow?.postMessage({ type: 'deselectAll' }, '*');
  }, [onClearMdHighlight]);

  return (
    <div className="h-full flex relative" style={{ background: '#F0EDE6' }}>
      {/* 主预览区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 工具栏 */}
        <div
          className="flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{ background: '#FAF9F5', borderBottom: '1px solid #e0dbd2' }}
        >
          {/* 编辑模式切换 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditMode(!editMode); if (editMode) setSelectedElement(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              style={{
                background: editMode ? '#D97757' : 'transparent',
                color: editMode ? '#fff' : '#6b6560',
                border: `1.5px solid ${editMode ? '#D97757' : '#d4cfc7'}`,
              }}
            >
              <span>{editMode ? '✏️ 编辑中' : '👁 预览'}</span>
              {editMode && <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />}
            </button>
            {editMode && (
              <span className="text-xs" style={{ color: '#b5b0a8' }}>
                单击选中 · 双击编辑文字/替换图片
              </span>
            )}
          </div>

          {/* 设备切换 */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F0EDE6' }}>
            {(['desktop', 'mobile'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setDeviceMode(mode); setZoomMode('fit'); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: deviceMode === mode ? '#fff' : 'transparent',
                  color: deviceMode === mode ? '#2c2825' : '#9c9590',
                  boxShadow: deviceMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {mode === 'desktop' ? '🖥 PC' : '📱 Mobile'}
              </button>
            ))}
          </div>

          {/* 缩放控制 */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#F0EDE6' }}>
            <button
              onClick={() => setZoomMode('fit')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: zoomMode === 'fit' ? '#fff' : 'transparent',
                color: zoomMode === 'fit' ? '#D97757' : '#9c9590',
              }}
            >
              适应
            </button>
            <div className="w-px h-4 mx-1" style={{ background: '#d4cfc7' }} />
            <button
              onClick={() => { setZoomMode('manual'); setZoom(z => Math.max(20, z - 10)); }}
              className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
              style={{ color: '#9c9590' }}
            >
              −
            </button>
            <span className="text-xs font-mono w-10 text-center" style={{ color: zoomMode === 'fit' ? '#D97757' : '#6b6560' }}>
              {Math.round(actualZoom)}%
            </span>
            <button
              onClick={() => { setZoomMode('manual'); setZoom(z => Math.min(200, z + 10)); }}
              className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
              style={{ color: '#9c9590' }}
            >
              +
            </button>
          </div>
        </div>

        {/* iframe 容器 */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-start justify-center p-4"
          style={{ minHeight: 0, background: '#E8E4DC' }}
        >
          <div
            style={{
              width: currentSize.width,
              height: currentSize.height,
              transform: `scale(${actualZoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              borderRadius: deviceMode === 'mobile' ? '16px' : '6px',
              overflow: 'hidden',
              background: '#FAF9F5',
              flexShrink: 0,
            }}
          >
            <iframe
              ref={iframeRef}
              style={{
                width: currentSize.width,
                height: currentSize.height,
                border: 'none',
              }}
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* 属性面板（编辑模式下选中元素时显示） */}
      {editMode && selectedElement && (
        <PropertyPanel
          element={selectedElement}
          onStyleChange={sendStyleCommand}
          onTextChange={sendTextCommand}
          onImageReplace={() => triggerImageReplace(selectedElement.slotName ?? undefined)}
          onClose={closePropertyPanel}
          onLocateSlot={onLocateSlot}
        />
      )}
    </div>
  );
}
