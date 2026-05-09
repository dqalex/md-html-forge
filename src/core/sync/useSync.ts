/**
 * useSync - MD ↔ HTML 双向同步 Hook（v2）
 *
 * 移植自 GrowthPilot/src/hooks/useSync.js，用 TypeScript 重写
 * 并与 md-html-forge 的 slot-sync.ts 管线深度整合：
 *
 * - MD 中使用 <!-- @slot:name -->...<!-- @/slot --> 标记槽位
 * - HTML 中使用 data-slot="name" data-slot-type="text|richtext|image|data" 标记槽位
 * - 双向同步：MD 改 → HTML 刷新；HTML 改 → MD 槽位更新
 * - 初始化：从 HTML 的 data-slot/data-section 自动构建 MD 骨架
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  extractSlotsFromMd,
  extractSlotsFromHtml,
  injectSlotsToHtml,
  syncHtmlToMd,
  htmlToSimpleMd,
} from '@/lib/markdown-slots/slot-sync';
import type { SlotDef, SlotValue } from '@/lib/markdown-slots/types';

// ===== 类型 =====

export interface SyncState {
  htmlContent: string;
  mdContent: string;
}

export interface UseSyncReturn {
  htmlContent: string;
  mdContent: string;
  updateHtml: (newHtml: string) => void;
  updateMd: (newMd: string) => void;
  syncFromHtml: () => void;
  syncFromMd: () => void;
  getSlots: () => Map<string, SlotValue>;
  /** 直接设置内容（不触发双向同步，用于历史版本恢复） */
  setContents: (html: string, md: string) => void;
}

// ===== 工具函数 =====

/**
 * 从 HTML 模板中提取 data-section 和 data-slot 分组配置
 */
function buildConfigFromHtml(html: string): {
  sections: Array<{ id: string; label: string; slots: string[] }>;
  slotLabels: Record<string, string>;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections: Array<{ id: string; label: string; slots: string[] }> = [];
  const slotLabels: Record<string, string> = {};
  const sectionSlotSet = new Set<string>();

  const sectionElements = doc.querySelectorAll('[data-section]');

  if (sectionElements.length > 0) {
    sectionElements.forEach((sectionEl) => {
      const sectionId = sectionEl.getAttribute('data-section') || '';
      const sectionSlots: string[] = [];

      sectionEl.querySelectorAll('[data-slot]').forEach((slotEl) => {
        const slotName = slotEl.getAttribute('data-slot') || '';
        sectionSlots.push(slotName);
        sectionSlotSet.add(slotName);
        const textContent = slotEl.textContent?.trim().slice(0, 20) || '';
        slotLabels[slotName] = textContent || slotName;
      });

      if (sectionSlots.length > 0) {
        sections.push({ id: sectionId, label: sectionId, slots: sectionSlots });
      }
    });
  }

  // 收集不在 section 中的孤立 slot
  const allSlotEls = doc.querySelectorAll('[data-slot]');
  const orphanSlots: string[] = [];
  allSlotEls.forEach((el) => {
    const name = el.getAttribute('data-slot') || '';
    if (!sectionSlotSet.has(name) && !orphanSlots.includes(name)) {
      orphanSlots.push(name);
      const textContent = el.textContent?.trim().slice(0, 20) || '';
      slotLabels[name] = textContent || name;
    }
  });

  if (orphanSlots.length > 0) {
    sections.push({ id: 'other', label: '其他内容', slots: orphanSlots });
  }

  return { sections, slotLabels };
}

/**
 * 从 HTML 模板生成 MD 骨架（含 <!-- @slot:name --> 标记）
 */
function generateMdFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const { sections, slotLabels } = buildConfigFromHtml(html);

  let md = '';

  if (sections.length > 0) {
    sections.forEach((section) => {
      md += `## ${section.label}\n\n`;
      section.slots.forEach((slotName) => {
        const el = doc.querySelector(`[data-slot="${slotName}"]`);
        if (!el) return;
        const slotType = el.getAttribute('data-slot-type') || el.getAttribute('data-type') || 'text';
        let content = '';
        if (slotType === 'image') {
          const img = el.tagName === 'IMG' ? el as HTMLImageElement : el.querySelector('img');
          content = img?.getAttribute('src') || '';
        } else {
          const rawHtml = el.innerHTML.trim();
          content = htmlToSimpleMd(rawHtml) || el.textContent?.trim() || '';
        }
        const label = slotLabels[slotName] || slotName;
        md += `### ${label}\n`;
        md += `<!-- @slot:${slotName} -->\n`;
        md += `${content || `[${slotName}]`}\n`;
        md += `<!-- @/slot -->\n\n`;
      });
    });
  } else {
    // 无分组，按顺序列出所有 slot
    const allSlotEls = doc.querySelectorAll('[data-slot]');
    allSlotEls.forEach((el) => {
      const slotName = el.getAttribute('data-slot') || '';
      const slotType = el.getAttribute('data-slot-type') || el.getAttribute('data-type') || 'text';
      let content = '';
      if (slotType === 'image') {
        const img = el.tagName === 'IMG' ? el as HTMLImageElement : el.querySelector('img');
        content = img?.getAttribute('src') || '';
      } else {
        const rawHtml = el.innerHTML.trim();
        content = htmlToSimpleMd(rawHtml) || el.textContent?.trim() || '';
      }
      md += `<!-- @slot:${slotName} -->\n`;
      md += `${content || `[${slotName}]`}\n`;
      md += `<!-- @/slot -->\n\n`;
    });
  }

  return md.trim();
}

/**
 * 从 HTML 提取 slotDefs（用于传给 slot-sync 管线）
 */
function extractSlotDefsFromHtml(html: string): Record<string, SlotDef> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const defs: Record<string, SlotDef> = {};

  doc.querySelectorAll('[data-slot]').forEach((el) => {
    const name = el.getAttribute('data-slot') || '';
    const typeAttr = el.getAttribute('data-slot-type') || el.getAttribute('data-type') || 'content';
    const label = el.textContent?.trim().slice(0, 20) || name;
    defs[name] = {
      label,
      type: typeAttr as SlotDef['type'],
    };
  });

  return defs;
}

// ===== Hook =====

export function useSync(
  initialHtml: string,
  initialMd?: string,
): UseSyncReturn {
  const [htmlContent, setHtmlContent] = useState(initialHtml);
  const [mdContent, setMdContent] = useState('');

  /** 原始 HTML 模板结构（不会随内容更新而改变） */
  const htmlTemplateRef = useRef(initialHtml);
  /** 防止双向同步循环 */
  const syncLock = useRef(false);
  /** 当前 slotDefs（从 HTML 模板提取，切换模板时更新） */
  const slotDefsRef = useRef<Record<string, SlotDef>>(
    extractSlotDefsFromHtml(initialHtml),
  );
  /** 是否已完成首次初始化 */
  const isInitializedRef = useRef(false);

  // 监听外部传入的 initialHtml 变化（切换模板、历史回滚时触发）
  useEffect(() => {
    if (syncLock.current) return;
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    syncLock.current = true;
    setHtmlContent(initialHtml);
    htmlTemplateRef.current = initialHtml;
    slotDefsRef.current = extractSlotDefsFromHtml(initialHtml);

    // 同步更新 MD 中的槽位内容
    setMdContent((prev) => {
      const slots = extractSlotsFromHtml(initialHtml, slotDefsRef.current);
      const updates: Record<string, string> = {};
      slots.forEach((slot, name) => {
        updates[name] = Array.isArray(slot.content)
          ? slot.content.join('\n')
          : slot.content;
      });
      // 更新已有的 @slot 标记
      let updated = prev;
      Object.entries(updates).forEach(([name, content]) => {
        const re = new RegExp(
          `(<!--\\s*@slot:${name}\\s*-->)[\\s\\S]*?(<!--\\s*@\\/slot\\s*-->)`,
          'g',
        );
        if (re.test(updated)) {
          re.lastIndex = 0;
          updated = updated.replace(re, `$1\n${content}\n$2`);
        }
      });
      return updated;
    });

    setTimeout(() => { syncLock.current = false; }, 50);
  }, [initialHtml]);

  // 初始化：从 HTML 生成 MD
  useEffect(() => {
    if (initialHtml && !initialMd) {
      const generatedMd = generateMdFromHtml(initialHtml);
      setMdContent(generatedMd);
    } else if (initialMd) {
      setMdContent(initialMd);
    }
    htmlTemplateRef.current = initialHtml;
    slotDefsRef.current = extractSlotDefsFromHtml(initialHtml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 从 HTML 面板编辑触发（contentEditable 或 PropertyPanel 修改）
   * HTML 变化 → 提取 slot 差异 → 更新 MD
   */
  const updateHtml = useCallback((newHtml: string) => {
    if (syncLock.current) return;
    syncLock.current = true;
    setHtmlContent(newHtml);
    htmlTemplateRef.current = newHtml;

    const slots = extractSlotsFromHtml(newHtml, slotDefsRef.current);
    setMdContent((prev) => {
      let updated = prev;
      slots.forEach((slot, name) => {
        const content = Array.isArray(slot.content)
          ? slot.content.join('\n')
          : slot.content;
        const re = new RegExp(
          `(<!--\\s*@slot:${name}\\s*-->)[\\s\\S]*?(<!--\\s*@\\/slot\\s*-->)`,
          'g',
        );
        if (re.test(updated)) {
          re.lastIndex = 0;
          updated = updated.replace(re, `$1\n${content}\n$2`);
        }
      });
      return updated;
    });

    setTimeout(() => { syncLock.current = false; }, 50);
  }, []);

  /**
   * 从 MD 编辑器触发（用户编辑 MD）
   * MD 变化 → 提取 slot → 注入 HTML 模板
   */
  const updateMd = useCallback((newMd: string) => {
    if (syncLock.current) return;
    syncLock.current = true;
    setMdContent(newMd);

    const slots = extractSlotsFromMd(newMd, slotDefsRef.current);
    const newHtml = injectSlotsToHtml(htmlTemplateRef.current, slots);
    setHtmlContent(newHtml);

    setTimeout(() => { syncLock.current = false; }, 50);
  }, []);

  /** 手动：从 HTML 全量同步到 MD */
  const syncFromHtml = useCallback(() => {
    const { md } = syncHtmlToMd(htmlContent, mdContent, slotDefsRef.current);
    setMdContent(md);
  }, [htmlContent, mdContent]);

  /** 手动：从 MD 全量同步到 HTML */
  const syncFromMd = useCallback(() => {
    const slots = extractSlotsFromMd(mdContent, slotDefsRef.current);
    const newHtml = injectSlotsToHtml(htmlTemplateRef.current, slots);
    setHtmlContent(newHtml);
  }, [mdContent]);

  /** 获取当前所有槽位值 */
  const getSlots = useCallback(() => {
    return extractSlotsFromHtml(htmlContent, slotDefsRef.current);
  }, [htmlContent]);

  /**
   * 直接设置内容（不触发同步，用于历史版本恢复）
   */
  const setContents = useCallback((html: string, md: string) => {
    syncLock.current = true;
    setHtmlContent(html);
    setMdContent(md);
    htmlTemplateRef.current = html;
    slotDefsRef.current = extractSlotDefsFromHtml(html);
    setTimeout(() => { syncLock.current = false; }, 50);
  }, []);

  return {
    htmlContent,
    mdContent,
    updateHtml,
    updateMd,
    syncFromHtml,
    syncFromMd,
    getSlots,
    setContents,
  };
}
