'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import dynamic from 'next/dynamic';

import {
  updateMdSlots,
  extractHtmlSlotNames,
  UNIVERSAL_SLOTS,
} from '@/lib/markdown-slots';
import { renderWithFallback } from '@/lib/markdown-slots/fallback-renderer';
import type { SlotDef, TemplateManifest, UniversalSlotName } from '@/lib/markdown-slots';
import type { PresetTemplate } from '@/templates/presets/registry';
import { getPresetById } from '@/templates/presets/registry';
import { Toolbar } from './Toolbar';
import { DiagnosticsBar } from '@/components/diagnostics/DiagnosticsBar';
import { useHistory } from '@/core/history/useHistory';
import {
  ForgePropertyPanel,
  type ForgeSelection,
} from '@/components/html-preview/ForgePropertyPanel';
import { ThemeEditorModal } from '@/components/html-preview/ThemeEditorModal';
import { useUserExtensions } from '@/components/html-preview/useUserExtensions';
import { BrandPackPanel } from '@/components/html-preview/BrandPackPanel';
import { AiComponentModal } from '@/components/html-preview/AiComponentModal';

// 动态导入 ExportModal（避免 SSR 问题）
const ExportModal = dynamic(() => import('@/core/export/ExportModal'), { ssr: false });

// 动态导入组件库面板
const ComponentLibraryPanel = dynamic(
  () => import('@/components/component-library/ComponentLibraryPanel').then(m => m.ComponentLibraryPanel),
  { ssr: false },
);

// 动态导入：保存为模板对话框
const SaveTemplateDialog = dynamic(
  () => import('./SaveTemplateDialog').then(m => m.SaveTemplateDialog),
  { ssr: false },
);

export type ViewMode = 'edit' | 'preview' | 'split';

export interface MarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  mode?: ViewMode;
  onModeChange?: (mode: ViewMode) => void;
  /** 当前套用的模板 manifest（由 preset 注入） */
  templateManifest?: TemplateManifest | null;
  /** 当前 preset id（用于 Toolbar 高亮） */
  selectedPresetId?: string | null;
  /** 用户选了一个 preset 时通知宿主，由宿主决定是否同时替换 value */
  onPresetChange?: (preset: PresetTemplate) => void;
  /** 用户保存了一个「我的模板」后通知宿主刷新列表 */
  onUserTemplateSaved?: () => void;
  readOnly?: boolean;
  saveState?: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

/**
 * 通用 Markdown 编辑器组件
 *
 * 移植自 TRFP/frontend/src/components/markdown-editor/MarkdownEditor.tsx。
 * 主要改动：
 *  - 去掉对 `@/lib/api/assets` 的依赖
 *  - 模板选择从"资产库后端"改为"本地 preset registry"
 *  - 新增 onExportHtml（导出单文件）
 */
export function MarkdownEditor({
  value,
  onChange,
  mode: modeProp,
  onModeChange,
  templateManifest,
  selectedPresetId,
  onPresetChange,
  onUserTemplateSaved,
  readOnly = false,
  saveState = 'idle',
  className,
}: MarkdownEditorProps) {
  const defaultMode = readOnly ? 'preview' : 'split';
  const [internalMode, setInternalMode] = useState<ViewMode>(defaultMode);
  const mode = modeProp ?? internalMode;

  // ===== 导出面板 =====
  const [showExportModal, setShowExportModal] = useState(false);

  // ===== 组件库面板 =====
  const [showLibrary, setShowLibrary] = useState(false);

  // ===== forge 组件选中（PropertyPanel 用）=====
  const [forgeSelection, setForgeSelection] = useState<ForgeSelection | null>(null);

  // ===== 主题编辑器（基于哪个主题克隆） =====
  const [themeEditorBase, setThemeEditorBase] = useState<string | null>(null);

  // ===== 品牌包面板 =====
  const [showBrandPack, setShowBrandPack] = useState(false);

  // ===== AI 造组件 =====
  const [showAiCreate, setShowAiCreate] = useState(false);

  // ===== 保存为模板对话框 =====
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // 加载 localStorage 中的自定义主题 + 用户组件 + 激活的品牌包到 forge 引擎
  const { customThemes, refresh: refreshUserExtensions } = useUserExtensions();

  // ===== 历史版本（undo/redo）=====
  const { pushState, undo, redo, canUndo, canRedo, currentState } = useHistory(
    templateManifest?.templateHtml ?? '',
    value,
  );

  // 监听历史回滚，同步到编辑器
  // isHistoryChange 用 ref 避免过期闭包：undo/redo 触发时置 true，
  // 下一次 currentState 变化时读 ref 判断是否需要回写。
  const isHistoryChange = useRef(false);
  useEffect(() => {
    if (!isHistoryChange.current) return;
    isHistoryChange.current = false;
    // 用 currentState.md 与当前 value 比较，避免重复触发
    if (currentState.md !== value) {
      onChange(currentState.md);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]); // 仅在 currentState 变化时执行；value/onChange 通过 ref 避免依赖

  const handleUndo = useCallback(() => {
    isHistoryChange.current = true;
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    isHistoryChange.current = true;
    redo();
  }, [redo]);

  // 用户编辑时推入历史（debounce 1.5s）
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    if (historyTimer.current) clearTimeout(historyTimer.current);
    historyTimer.current = setTimeout(() => {
      historyTimer.current = null;
      pushState(templateManifest?.templateHtml ?? '', value);
    }, 1500);
    // 清理：组件卸载 or value 再次变化时，取消上一个定时器
    return () => {
      if (historyTimer.current) {
        clearTimeout(historyTimer.current);
        historyTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // pushState / templateManifest 稳定引用，不需要加入

  // Ctrl+Z / Ctrl+Shift+Z 全局快捷键（仅在编辑器聚焦之外有效）
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // 只在非 input/textarea/contenteditable 时拦截
      const target = e.target as HTMLElement;
      if (target.closest('[contenteditable="true"]') || target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleUndo, handleRedo]);

  const setMode = useCallback(
    (m: ViewMode) => {
      if (readOnly && m !== 'preview') return;
      setInternalMode(m);
      onModeChange?.(m);
    },
    [readOnly, onModeChange],
  );

  const editorViewRef = useRef<EditorView | null>(null);
  const splitHtmlIframeRef = useRef<HTMLIFrameElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  /**
   * 记录 preview iframe 重载前的滚动位置。
   * 当 markdown 变化（如用户勾 checkbox、在编辑器输入）时，iframe 的 srcDoc 会被替换，
   * 浏览器重新 navigate 整个 document，滚动位置会丢失。
   * 我们在 srcDoc 变化前记录 scrollY，load 完成后恢复。
   */
  const previewScrollYRef = useRef<number>(0);
  /**
   * 同上，用于 split 模式 HTML 侧 iframe（splitHtmlIframeRef）。
   * 之前 split 这一支没做 scrollY 保留，导致点 checkbox 等触发 MD 变更后，
   * HTML 那栏整页回到顶部 —— 这就是用户反馈的"分屏勾完跳顶"问题。
   */
  const splitScrollYRef = useRef<number>(0);

  /**
   * Iframe 内交互状态的"内存快照"。
   * 组件 mount JS 通过 forge.runtime.state.set(key,val) → postMessage 'forge:state-push'
   * 写到这里；iframe 重新 load 后启动 stateRequestSnapshot → postMessage 'forge:state-pull'，
   * 我们在下面的 effect 里把这份快照原样回传，保证折叠/Tab/排序方向等交互状态跨 reload 不丢。
   */
  const iframeStateRef = useRef<Record<string, unknown>>({});

  // ===== slot 定义提取 =====
  const slotDefs = useMemo<Record<string, SlotDef>>(() => {
    if (!templateManifest) return {};
    if (templateManifest.slots) return templateManifest.slots;
    if (!templateManifest.templateHtml) return {};
    const names = extractHtmlSlotNames(templateManifest.templateHtml);
    const defs: Record<string, SlotDef> = {};
    for (const name of names) {
      defs[name] = UNIVERSAL_SLOTS[name as UniversalSlotName] ?? {
        label: name,
        type: 'content' as const,
        description: `模板插槽 data-slot="${name}"`,
      };
    }
    return defs;
  }, [templateManifest]);

  const renderHtml = templateManifest?.templateHtml ?? '';
  const renderCss = '';

  // 根据 selectedPresetId 查 TemplateDef（新系统，用于组件查找 + fallback）
  const activeTemplateDef = useMemo(() => {
    if (!selectedPresetId) return undefined;
    return getPresetById(selectedPresetId)?.templateDef;
  }, [selectedPresetId]);

  // ===== HTML slot 填充（带兜底：组件化渲染 + 孤儿 slot 提示）=====
  const renderResult = useMemo(() => {
    if (!value) return { html: '', diagnostics: [] as const };
    const r = renderWithFallback(value, renderHtml, slotDefs, renderCss, activeTemplateDef);
    return { html: r.html, diagnostics: r.diagnostics ?? [] };
  }, [renderHtml, renderCss, slotDefs, value, activeTemplateDef]);
  const filledRenderHtml = renderResult.html;
  const diagnostics = renderResult.diagnostics;

  // 预览 srcDoc：有填充结果用填充结果，无模板时用兜底 editorial 渲染
  const previewSrcDoc = useMemo(() => {
    if (filledRenderHtml) return filledRenderHtml;
    if (value) {
      const { html } = renderWithFallback(value, '', {}, undefined, activeTemplateDef);
      return html;
    }
    return '';
  }, [filledRenderHtml, value, activeTemplateDef]);

  // 编辑模式 HTML 现在统一走 previewSrcDoc（已含组件化兜底渲染）

  // 分屏 HTML 预览（含轻量选中脚本）
  // 使用 previewSrcDoc 作为基础（已含兜底渲染），追加点击定位脚本
  const splitHtmlWithSelectScript = useMemo(() => {
    const baseHtml = previewSrcDoc;
    if (!baseHtml) return '';
    const selectScript = `
<script>(function(){
  var selected = null;
  document.querySelectorAll('[data-slot]').forEach(function(el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      if (selected) selected.style.outline = '';
      selected = el;
      el.style.outline = '2px solid #D97757';
      el.style.outlineOffset = '2px';
      window.parent.postMessage({
        type: 'splitElementSelected',
        slotName: el.getAttribute('data-slot'),
      }, '*');
    });
    el.addEventListener('mouseover', function() {
      if (el !== selected) el.style.outline = '1px dashed #f4c8a7';
    });
    el.addEventListener('mouseout', function() {
      if (el !== selected) el.style.outline = '';
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('[data-slot]') && selected) {
      selected.style.outline = '';
      selected = null;
    }
  });
})()</script>`;
    if (baseHtml.includes('</body>')) {
      return baseHtml.replace('</body>', `${selectScript}</body>`);
    }
    return baseHtml + selectScript;
  }, [previewSrcDoc]);

  // ===== 分屏 HTML 点击 → 定位到 MD =====
  useEffect(() => {
    if (mode !== 'split') return;
    const handleMessage = (e: MessageEvent) => {
      if (splitHtmlIframeRef.current && e.source !== splitHtmlIframeRef.current.contentWindow) return;
      const { type, slotName } = e.data || {};
      if (type === 'splitElementSelected' && slotName && editorViewRef.current) {
        const lines = value.split('\n');
        const slotPattern = `<!-- @slot:${slotName} -->`;
        let targetLine = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i]!.includes(slotPattern)) {
            targetLine = i;
            break;
          }
        }
        if (targetLine >= 0) {
          const view = editorViewRef.current;
          const lineInfo = view.state.doc.line(targetLine + 1);
          view.dispatch({
            selection: { anchor: lineInfo.from, head: lineInfo.to },
            scrollIntoView: true,
            effects: EditorView.scrollIntoView(lineInfo.from, { y: 'center' }),
          });
          view.focus();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [mode, value]);

  // ===== iframe 编辑 → MD 回写（contenteditable 场景） =====
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // 来源过滤：仅接收 split iframe 消息（目前唯一会触发 contentChanged 的 iframe）
      if (splitHtmlIframeRef.current && e.source !== splitHtmlIframeRef.current.contentWindow) return;
      const { type, slotValues } = e.data || {};
      if (type === 'contentChanged' && slotValues) {
        const newContent = updateMdSlots(value, slotValues as Record<string, string>);
        if (newContent !== value) {
          onChange(newContent);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [value, onChange]);

  // ===== 跳转到指定行（供诊断栏 / iframe click 使用） =====
  const jumpToLine = useCallback((line: number) => {
    const view = editorViewRef.current;
    if (!view) return;
    const safeLine = Math.max(1, Math.min(line, view.state.doc.lines));
    const info = view.state.doc.line(safeLine);
    view.dispatch({
      selection: { anchor: info.from, head: info.from },
      effects: EditorView.scrollIntoView(info.from, { y: 'center' }),
    });
    // 只有编辑器当前可见时才抢焦点；否则 focus 会引起外层页面被迫滚动
    // （Chromium: "focus scrolls the focused element into view"）
    const editorEl = view.dom;
    const rect = editorEl.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    if (isVisible) {
      // preventScroll 防止宿主页面跟着滚
      view.focus();
    }
  }, []);

  // ===== iframe 内 slot 点击 → 跳转 MD 对应行 =====
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const { type, line } = e.data || {};
      if (type !== 'forge:jump-to-line' || typeof line !== 'number') return;
      jumpToLine(line);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [jumpToLine]);

  // ===== iframe 内组件根点击 → 选中组件，显示 PropertyPanel =====
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const { type, componentId, variant, useLine } = e.data || {};
      if (type !== 'forge:select-component') return;
      if (!componentId) {
        setForgeSelection(null);
        return;
      }
      setForgeSelection({
        componentId,
        variant: variant || undefined,
        useLine: typeof useLine === 'number' ? useLine : null,
      });
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ===== iframe 内 checkbox 勾选 → 回写 MD 中的 - [ ] / - [x] =====
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const { type, checked, text } = e.data || {};
      if (type !== 'forge:checkbox-toggle' || typeof text !== 'string') return;
      // 用纯文本对比（去掉所有 MD 修饰符）
      const stripMd = (s: string) => s
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/~~(.+?)~~/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      const targetText = stripMd(text);

      const lines = value.split('\n');
      let mutated = false;
      const newLines = lines.map(line => {
        const m = line.match(/^(\s*[-*]\s+)\[([ xX])\]\s+(.*)$/);
        if (!m) return line;
        if (stripMd(m[3]!) !== targetText) return line;
        const newMark = checked ? 'x' : ' ';
        const currentMark = m[2]!;
        if (currentMark.toLowerCase() === newMark) return line;
        mutated = true;
        return `${m[1]}[${newMark}] ${m[3]}`;
      });
      if (mutated) {
        onChange(newLines.join('\n'));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [value, onChange]);

  // ===== 分屏 HTML iframe 更新（保留滚动位置，与下面 preview 同思路） =====
  useEffect(() => {
    if (mode !== 'split') return;
    const iframe = splitHtmlIframeRef.current;
    if (!iframe) return;

    try {
      splitScrollYRef.current = iframe.contentWindow?.scrollY ?? 0;
    } catch {
      splitScrollYRef.current = 0;
    }
    const onLoad = () => {
      try {
        iframe.contentWindow?.scrollTo(0, splitScrollYRef.current);
      } catch { /* cross-origin */ }
    };
    iframe.addEventListener('load', onLoad, { once: true });
    iframe.srcdoc = splitHtmlWithSelectScript;
    return () => iframe.removeEventListener('load', onLoad);
  }, [mode, splitHtmlWithSelectScript]);

  // ===== iframe 交互状态桥（forge.runtime.state） =====
  // 处理来自 preview / split iframe 的两类消息：
  //   - forge:state-push  组件 set 状态 → 缓存到 iframeStateRef
  //   - forge:state-pull  iframe 启动时拉取整份快照 → 我们回 forge:state-snapshot
  // 这是组件交互能跨 srcdoc 重载保留状态的唯一通道。
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      const d = e.data as { type?: string; key?: string; value?: unknown } | undefined;
      if (!d || !d.type) return;
      if (d.type === 'forge:state-push' && typeof d.key === 'string') {
        iframeStateRef.current[d.key] = d.value;
      } else if (d.type === 'forge:state-pull') {
        // 用 source 回回去（避免广播给所有 iframe）
        const src = e.source as Window | null;
        if (src && typeof src.postMessage === 'function') {
          try {
            src.postMessage(
              { type: 'forge:state-snapshot', snapshot: iframeStateRef.current },
              '*',
            );
          } catch { /* ignore */ }
        }
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, []);

  // ===== 预览 iframe 更新（保留滚动位置） =====
  //
  // 问题：之前用 <iframe srcDoc={previewSrcDoc}>，每次 markdown 变化（比如用户
  // 勾 checkbox 触发回写、编辑器输入）都会导致 srcDoc prop 变化，浏览器把整个
  // iframe 重新 navigate，scrollY 归 0 —— 用户看到的表现就是"点了 checkbox 后
  // 预览跳到顶部"。
  //
  // 解法：改用 ref + effect，在写新 srcdoc 前记录 scrollY，load 完成后恢复。
  useEffect(() => {
    if (mode === 'split') return; // split 走上面的分支
    const iframe = previewIframeRef.current;
    if (!iframe) return;

    // 记录当前滚动
    try {
      previewScrollYRef.current = iframe.contentWindow?.scrollY ?? 0;
    } catch {
      previewScrollYRef.current = 0;
    }

    const onLoad = () => {
      try {
        iframe.contentWindow?.scrollTo(0, previewScrollYRef.current);
      } catch { /* cross-origin 时忽略 */ }
    };
    iframe.addEventListener('load', onLoad, { once: true });
    iframe.srcdoc = previewSrcDoc;

    return () => iframe.removeEventListener('load', onLoad);
  }, [mode, previewSrcDoc]);

  // ===== 导出 standalone HTML（供 ExportModal 使用） =====
  // 注：原工具栏直挂的 handleExportHtml 已废弃。它直接 Blob 下载 previewSrcDoc，
  // 没做编辑器属性清理；ExportModal 内部会调 getStandaloneHtml + 二次清理，
  // 能力完全覆盖且更完善，故合并为单一入口。
  const getStandaloneHtmlFn = useCallback(() => {
    if (!value) return '';
    const r = renderWithFallback(value, renderHtml, slotDefs, renderCss, activeTemplateDef, 'standalone');
    return r.html;
  }, [value, renderHtml, slotDefs, renderCss, activeTemplateDef]);

  return (
    <div className={`flex flex-col h-full ${className ?? ''}`}>
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        readOnly={readOnly}
        saveState={saveState}
        hasTemplate={!!templateManifest}
        onExport={() => setShowExportModal(true)}
        onSaveAsTemplate={() => setShowSaveTemplate(true)}
        onOpenLibrary={() => setShowLibrary(true)}
        onOpenBrandPack={() => setShowBrandPack(true)}
        onOpenAiCreate={() => setShowAiCreate(true)}
        markdown={value}
        onMarkdownChange={onChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        customThemes={customThemes}
        onOpenThemeEditor={(base) => setThemeEditorBase(base)}
      />

      {/* 主体区 */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 编辑区 */}
        {(mode === 'edit' || mode === 'split') && !readOnly && (
          <div
            className={`relative overflow-hidden cm-editor-container ${
              mode === 'split'
                ? 'w-1/2 border-r border-[color:var(--border)]'
                : 'w-full'
                }`}
              >
                {mode === 'split' && (
                  <div className="absolute top-0 left-0 right-0 px-3 py-1 bg-[color:var(--surface-hover)] border-b border-[color:var(--border)] z-10">
                    <span className="text-[10px] font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider">
                      编辑
                    </span>
                  </div>
                )}
                <div className={mode === 'split' ? 'h-full pt-8' : 'h-full'}>
                  <CodeMirror
                    value={value}
                    height="100%"
                    theme="light"
                    placeholder="在此输入 Markdown…"
                    editable={!readOnly}
                    extensions={[
                      markdown({ base: markdownLanguage, codeLanguages: languages }),
                      EditorView.lineWrapping,
                    ]}
                    onChange={(val) => onChange(val)}
                    className="h-full text-[13px] [&>.cm-editor]:h-full [&_.cm-content]:px-6 [&_.cm-content]:py-4 [&_.cm-content]:font-mono"
                    onCreateEditor={(view) => {
                      editorViewRef.current = view;
                    }}
                  />
                </div>
              </div>
            )}

            {/* 预览区 + 属性面板 */}
            {(mode === 'preview' || mode === 'split') && (
              <div
                className={`flex flex-col h-full min-w-0 ${
                  mode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                {mode === 'split' && (
                  <div className="flex-shrink-0 px-3 py-1 bg-[color:var(--surface-hover)] border-b border-[color:var(--border)] z-10">
                    <span className="text-[10px] font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider">
                      预览
                    </span>
                  </div>
                )}
                {/* 预览（mode === 'preview'）/ 分屏（mode === 'split'）统一走 iframe */}
                {previewSrcDoc ? (
                  <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {mode === 'split' ? (
                        <iframe
                          ref={splitHtmlIframeRef}
                          className="block w-full h-full"
                          style={{ border: 'none' }}
                          sandbox="allow-scripts allow-same-origin"
                          title="html-render-preview-split"
                        />
                      ) : (
                        <iframe
                          ref={previewIframeRef}
                          className="block w-full h-full"
                          style={{ border: 'none' }}
                          sandbox="allow-scripts allow-same-origin"
                          title="html-render-preview"
                        />
                      )}
                    </div>
                    {forgeSelection && (
                      <ForgePropertyPanel
                        selection={forgeSelection}
                        markdown={value}
                        onMarkdownChange={onChange}
                        onClose={() => setForgeSelection(null)}
                        onOpenThemeEditor={(base) => setThemeEditorBase(base)}
                        customThemes={customThemes.map((t) => ({ id: t.id, name: t.name }))}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[color:var(--ivory)]">
                    <p className="text-[color:var(--text-tertiary)] italic">暂无内容</p>
                  </div>
                )}
              </div>
            )}
      </div>

      {/* 编译诊断栏（compose 模式） */}
      <DiagnosticsBar
        diagnostics={diagnostics}
        onJumpTo={(line) => jumpToLine(line)}
      />

      {/* 图片/HTML 导出面板（统一入口：含 image / html 两种格式） */}
      {showExportModal && (
        <ExportModal
          htmlContent={filledRenderHtml || previewSrcDoc}
          getStandaloneHtml={getStandaloneHtmlFn}
          markdown={value}
          fileName={`${selectedPresetId || 'md-html-forge'}-${Date.now()}`}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* 组件库浏览面板 */}
      {showLibrary && (
        <ComponentLibraryPanel
          markdown={value}
          onInsert={(newMd) => {
            onChange(newMd);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {/* 主题编辑器 */}
      {themeEditorBase && (
        <ThemeEditorModal
          baseThemeId={themeEditorBase}
          onSave={() => {
            refreshUserExtensions();
          }}
          onClose={() => setThemeEditorBase(null)}
        />
      )}

      {/* 品牌包 */}
      {showBrandPack && (
        <BrandPackPanel
          onClose={() => setShowBrandPack(false)}
          onApplied={() => {
            refreshUserExtensions();
          }}
          onRequestCreateTheme={() => {
            // 关闭品牌包面板，打开主题编辑器（基于默认主题克隆）
            setShowBrandPack(false);
            setThemeEditorBase('editorial');
          }}
          onRequestCreateComponent={() => {
            // 关闭品牌包面板，打开 AI 造组件
            setShowBrandPack(false);
            setShowAiCreate(true);
          }}
        />
      )}

      {/* AI 造组件 */}
      {showAiCreate && (
        <AiComponentModal onClose={() => setShowAiCreate(false)} />
      )}

      {/* 保存为模板 */}
      {showSaveTemplate && (
        <SaveTemplateDialog
          markdown={value}
          onCancel={() => setShowSaveTemplate(false)}
          onConfirm={({ name, description, icon, color }) => {
            // 动态 import，避免 SSR
            import('./userTemplates').then(({ createUserTemplate, upsertUserTemplate }) => {
              const tpl = createUserTemplate({ name, description, icon, color, markdown: value });
              upsertUserTemplate(tpl);
              setShowSaveTemplate(false);
              onUserTemplateSaved?.();
            });
          }}
        />
      )}
    </div>
  );
}
