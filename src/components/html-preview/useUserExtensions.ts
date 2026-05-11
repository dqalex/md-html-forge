'use client';

/**
 * useUserExtensions —— 把 localStorage 中保存的「用户扩展」加载到 forge 引擎
 *
 * 启动时一次性加载：
 *   1. 自定义主题（forge:custom-themes）→ forgeRegistry.registerTheme
 *   2. 用户自定义组件（forge:user-components）→ forgeRegistry.registerComponent
 *   3. 上次激活的品牌包（forge:active-brand-pack）→ applyBrandPack
 *
 * 在 MarkdownEditor 顶层调用一次即可。
 */

import { useEffect, useState } from 'react';
import { forgeRegistry } from '@/builtin/compiler/registry';
import { registerForgeRuntimeScript } from '@/builtin/components/forge-registry';
import { parseForgeMd, forgeToComponentDef, getForgeJs } from '@/builtin/components/forge-loader';
import type { ThemeDef } from '@/builtin/themes';

import { loadCustomThemes } from './ThemeEditorModal';
import { loadUserComponents } from './userComponents';
import { loadBrandPacks, loadActiveBrandPackId } from './brandpack';

export interface UserExtensionState {
  customThemes: ThemeDef[];
  userComponentIds: string[];
  activeBrandPackId: string | null;
}

export function useUserExtensions(): UserExtensionState & { refresh: () => void } {
  const [state, setState] = useState<UserExtensionState>({
    customThemes: [],
    userComponentIds: [],
    activeBrandPackId: null,
  });

  const sync = () => {
    if (typeof window === 'undefined') return;

    // 1. 自定义主题
    const themes = loadCustomThemes();
    for (const t of themes) {
      forgeRegistry.registerTheme(t);
    }

    // 2. 用户组件
    const userComps = loadUserComponents();
    const userIds: string[] = [];
    for (const c of userComps) {
      try {
        const forge = parseForgeMd(c.source);
        if (!forge.meta.id) continue;
        forge.meta.trust = 'user';
        const def = forgeToComponentDef(forge);
        forgeRegistry.registerComponent(def);
        const js = getForgeJs(forge);
        if (js) registerForgeRuntimeScript({ ...js, trust: 'user' });
        userIds.push(forge.meta.id);
      } catch {
        // 忽略坏组件，不阻塞
      }
    }

    // 3. 激活的品牌包（如果不是上面已加载的内容则补齐）
    const activeId = loadActiveBrandPackId();
    if (activeId) {
      const pack = loadBrandPacks().find((p) => p.id === activeId);
      if (pack) {
        for (const t of pack.themes) {
          if (!themes.find((x) => x.id === t.id)) forgeRegistry.registerTheme(t);
        }
        for (const c of pack.components) {
          if (!userIds.includes(c.id)) {
            try {
              const forge = parseForgeMd(c.source);
              if (forge.meta.id) {
                forge.meta.trust = 'user';
                forgeRegistry.registerComponent(forgeToComponentDef(forge));
                const js = getForgeJs(forge);
                if (js) registerForgeRuntimeScript({ ...js, trust: 'user' });
                userIds.push(forge.meta.id);
              }
            } catch {
              // skip
            }
          }
        }
      }
    }

    setState({
      customThemes: themes,
      userComponentIds: userIds,
      activeBrandPackId: activeId,
    });
  };

  useEffect(() => {
    sync();
    const handler = (e: StorageEvent) => {
      if (
        e.key === 'forge:custom-themes'
        || e.key === 'forge:user-components'
        || e.key === 'forge:brand-packs'
        || e.key === 'forge:active-brand-pack'
      ) {
        sync();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, refresh: sync };
}
