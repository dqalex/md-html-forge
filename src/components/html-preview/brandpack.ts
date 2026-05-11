'use client';

/**
 * 品牌包（Brand Pack）—— 用户的"渲染配方"集合
 *
 * 一个品牌包包含：
 *   1. 自定义主题（themes）——继承自基础主题的 token 覆盖
 *   2. 用户自定义组件（components）——`.forge.md` 源码字符串
 *   3. 默认偏好（defaults）——可选的全局默认值
 *
 * 存储：浏览器 localStorage（forge:brand-packs，键为 packs[id] 数组）
 *      用户也可以导出 JSON / 从 JSON 导入（跨设备）
 *
 * 当下没有"激活"概念——品牌包里的主题/组件被**单独 register** 到引擎单例。
 * 未来若需要"切换品牌包"再加 active 概念。
 */

import type { ThemeDef } from '@/builtin/themes';
import { forgeRegistry } from '@/builtin/compiler/registry';
import { parseForgeMd, forgeToComponentDef, getForgeJs } from '@/builtin/components/forge-loader';
import { registerForgeRuntimeScript } from '@/builtin/components/forge-registry';
import { saveCustomThemes } from './ThemeEditorModal';

// ============================================================
// 类型
// ============================================================

export interface UserComponent {
  /** .forge.md 源码 */
  source: string;
  /** 解析得到的组件 id（冗余，便于检索） */
  id: string;
  /** 创建时间戳 */
  createdAt: number;
}

export interface BrandPack {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: number;
  themes: ThemeDef[];
  components: UserComponent[];
  defaults?: {
    themeId?: string;
    fontSans?: string;
    fontSerif?: string;
    fontMono?: string;
  };
}

// ============================================================
// localStorage 存取
// ============================================================

const STORAGE_KEY = 'forge:brand-packs';
const ACTIVE_KEY = 'forge:active-brand-pack';

export function loadBrandPacks(): BrandPack[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidBrandPack);
  } catch {
    return [];
  }
}

export function saveBrandPacks(packs: BrandPack[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

export function upsertBrandPack(pack: BrandPack): BrandPack[] {
  const all = loadBrandPacks();
  const idx = all.findIndex((p) => p.id === pack.id);
  if (idx >= 0) all[idx] = pack;
  else all.push(pack);
  saveBrandPacks(all);
  return all;
}

export function removeBrandPack(id: string): BrandPack[] {
  const next = loadBrandPacks().filter((p) => p.id !== id);
  saveBrandPacks(next);
  if (loadActiveBrandPackId() === id) saveActiveBrandPackId(null);
  return next;
}

export function loadActiveBrandPackId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveBrandPackId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) window.localStorage.setItem(ACTIVE_KEY, id);
  else window.localStorage.removeItem(ACTIVE_KEY);
}

function isValidBrandPack(p: unknown): p is BrandPack {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return typeof o.id === 'string'
    && typeof o.name === 'string'
    && typeof o.version === 'string'
    && Array.isArray(o.themes)
    && Array.isArray(o.components);
}

// ============================================================
// 注册到引擎（应用品牌包）
// ============================================================

/**
 * 把一个品牌包的主题 + 组件注册到 forgeRegistry
 *
 * 副作用：
 *   - 主题：调用 forgeRegistry.registerTheme 一次
 *   - 组件：解析 .forge.md，registerComponent
 *   - JS mount：⚠️ 无法注入到当前预览页，下次 emit 会自动包含
 */
export function applyBrandPack(pack: BrandPack): { themesApplied: number; componentsApplied: number; errors: string[] } {
  const errors: string[] = [];
  let themesApplied = 0;
  let componentsApplied = 0;

  for (const theme of pack.themes) {
    try {
      forgeRegistry.registerTheme(theme);
      themesApplied++;
    } catch (e) {
      errors.push(`主题 ${theme.id} 注册失败：${(e as Error).message}`);
    }
  }

  for (const comp of pack.components) {
    try {
      const forge = parseForgeMd(comp.source);
      if (!forge.meta.id) {
        errors.push(`组件源码缺少 id 字段`);
        continue;
      }
      const def = forgeToComponentDef(forge);
      forgeRegistry.registerComponent(def);
      // user trust 组件的 mount JS 单独注册
      const js = getForgeJs(forge);
      if (js) registerForgeRuntimeScript(js);
      componentsApplied++;
    } catch (e) {
      errors.push(`组件 ${comp.id} 注册失败：${(e as Error).message}`);
    }
  }

  // 同步 themes 到 ThemeEditorModal 共享的存储
  if (pack.themes.length) {
    saveCustomThemes([...new Map(pack.themes.map((t) => [t.id, t])).values()]);
  }

  return { themesApplied, componentsApplied, errors };
}

// ============================================================
// 导入 / 导出
// ============================================================

const EXPORT_VERSION = '1.0';

export function exportBrandPackToJson(pack: BrandPack): string {
  return JSON.stringify(
    {
      __forge_brand_pack: true,
      version: EXPORT_VERSION,
      pack,
    },
    null,
    2,
  );
}

export function downloadBrandPackJson(pack: BrandPack): void {
  if (typeof window === 'undefined') return;
  const json = exportBrandPackToJson(pack);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pack.id || 'brand-pack'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBrandPackFromJson(json: string): BrandPack {
  const parsed = JSON.parse(json);
  if (!parsed?.__forge_brand_pack || !parsed?.pack) {
    throw new Error('不是有效的 forge 品牌包文件');
  }
  if (!isValidBrandPack(parsed.pack)) {
    throw new Error('品牌包结构无效（缺少必要字段）');
  }
  return parsed.pack;
}

/** 从 File 对象读取并解析品牌包 */
export function readBrandPackFile(file: File): Promise<BrandPack> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(importBrandPackFromJson(String(reader.result)));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// ============================================================
// 创建空品牌包模板
// ============================================================

export function createEmptyBrandPack(name = 'My Brand'): BrandPack {
  return {
    id: `pack-${Date.now()}`,
    name,
    version: '1.0',
    createdAt: Date.now(),
    themes: [],
    components: [],
  };
}
