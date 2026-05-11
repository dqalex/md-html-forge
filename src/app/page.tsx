'use client';

import { useEffect, useRef, useState } from 'react';

import { MarkdownEditor } from '@/components/markdown-editor';
import { AppHeader } from '@/components/app/AppHeader';
import type { TemplateManifest } from '@/lib/markdown-slots';
import { PRESETS, type PresetTemplate } from '@/templates/presets/registry';
import { loadUserTemplates, type UserTemplate } from '@/components/markdown-editor/userTemplates';
import { useI18n } from '@/lib/i18n';
import { getDemoMarkdown } from './_home-demo';

/**
 * 首屏 demo：介绍 md-html-forge 的核心价值
 *
 * 演示要点：
 *   1. 项目故事 — 为什么要做这个
 *   2. 实现效果 — 输出什么样的文档
 *   3. 核心优势 — AI token 节省 / 随手修改 / 品牌一致性 / 导出
 *   4. 组件展示 — metric / callout / table / checklist
 *   5. 双向 checkbox 同步
 *
 * 多语言：默认英文（见 i18n.tsx 初始化逻辑 —— 按 navigator.language 推断；
 * 已保存语言会保留用户选择）。中英文使用不同的 DEMO_MARKDOWN 副本，
 * 切换语言按钮会切换 demo 内容（仅当用户尚未编辑时才覆盖）。
 */
export default function HomePage() {
  const { t, lang } = useI18n();
  const [mounted, setMounted] = useState(false);
  const initialDemo = getDemoMarkdown(lang);
  const [markdown, setMarkdown] = useState(initialDemo);
  const [manifest, setManifest] = useState<TemplateManifest | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [selectedUserTemplate, setSelectedUserTemplate] = useState<UserTemplate | null>(null);
  const [pristineMarkdown, setPristineMarkdown] = useState(initialDemo);
  const prevLangRef = useRef(lang);

  useEffect(() => {
    setMounted(true);
    setUserTemplates(loadUserTemplates());
  }, []);

  // 切换语言时，如果用户没改过当前 demo（即仍等于 pristine），自动换成新语言的 demo；
  // 改过就保留，不覆盖用户内容。
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    // 仅当当前没选任何模板 + 内容还是原始 demo 时才替换
    if (!selectedPresetId && !selectedUserTemplate && markdown === pristineMarkdown) {
      const nextDemo = getDemoMarkdown(lang);
      setMarkdown(nextDemo);
      setPristineMarkdown(nextDemo);
    }
  }, [lang, markdown, pristineMarkdown, selectedPresetId, selectedUserTemplate]);

  const refreshUserTemplates = () => {
    setUserTemplates(loadUserTemplates());
  };

  const confirmOverwrite = (): boolean => {
    if (!markdown.trim()) return true;
    if (markdown === pristineMarkdown) return true;
    if (typeof window === 'undefined') return true;
    return window.confirm(t('editor.confirmOverwrite'));
  };

  const handlePresetChange = (preset: PresetTemplate) => {
    if (preset.id === selectedPresetId) return;
    if (!confirmOverwrite()) return;
    setManifest(preset.manifest);
    setSelectedPresetId(preset.id);
    setSelectedUserTemplate(null);
    setMarkdown(preset.starterMarkdown);
    setPristineMarkdown(preset.starterMarkdown);
  };

  const handleUserTemplateChange = (tpl: UserTemplate) => {
    if (selectedUserTemplate?.id === tpl.id) return;
    if (!confirmOverwrite()) return;
    setMarkdown(tpl.markdown);
    setPristineMarkdown(tpl.markdown);
    setSelectedUserTemplate(tpl);
    setSelectedPresetId(null);
    setManifest(null);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      <AppHeader
        selectedPreset={PRESETS.find(p => p.id === selectedPresetId) ?? null}
        selectedUserTemplate={selectedUserTemplate}
        userTemplates={userTemplates}
        onSelectPreset={handlePresetChange}
        onSelectUserTemplate={handleUserTemplateChange}
        onUserTemplatesChanged={refreshUserTemplates}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        {mounted ? (
          <MarkdownEditor
            value={markdown}
            onChange={setMarkdown}
            templateManifest={manifest}
            selectedPresetId={selectedPresetId}
            onPresetChange={handlePresetChange}
            onUserTemplateSaved={refreshUserTemplates}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[color:var(--text-tertiary)] text-sm">
            {t('editor.loadingEditor')}
          </div>
        )}
      </main>
    </div>
  );
}
