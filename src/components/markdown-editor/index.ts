/**
 * Markdown 编辑器组件 — 公开入口
 *
 * - 预览侧使用 Streamdown（复用 core/streamdown/plugins）
 * - 编辑侧使用 CodeMirror 6
 * - 支持本地 preset 模板（src/templates/presets/）
 * - 受控组件（value/onChange/mode/onModeChange/templateManifest/onPresetChange）
 *
 * 移植自 TRFP/frontend/src/components/markdown-editor/。主要差异：
 *  - 模板来源由"资产库 API"改为"本地 preset registry"
 *  - 新增"导出单文件 HTML"按钮
 */

export { MarkdownEditor } from './MarkdownEditor';
export type { MarkdownEditorProps, ViewMode } from './MarkdownEditor';
export { Toolbar } from './Toolbar';
export { HtmlPreview } from './HtmlPreview';
export { TemplatePicker } from './TemplatePicker';
export type { TemplatePickerProps } from './TemplatePicker';
export { useAutoSave } from './hooks/useAutoSave';
export type { SaveState, UseAutoSaveOptions } from './hooks/useAutoSave';
