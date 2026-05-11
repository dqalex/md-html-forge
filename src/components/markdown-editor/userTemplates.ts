'use client';

/**
 * 用户模板（UserTemplate）
 *
 * 定位：
 *   用户把调好的当前 MD 存为"我的模板"，下次新建文档可一键拉起。
 *   也支持 .md 文件导入 / 导出，跨设备 + 团队分享。
 *
 * 存储：
 *   - 浏览器 localStorage key=`forge:user-templates`
 *   - 文件格式：MD + YAML frontmatter（Jekyll 风格）
 *     ```markdown
 *     ---
 *     id: tpl-abc123
 *     name: 我的周报模板
 *     description: 团队周报 v2
 *     icon: BarChart3
 *     color: '#FDE4D3'
 *     group: report
 *     createdAt: 2026-05-10T12:34:56Z
 *     version: '1.0'
 *     ---
 *     <!-- @compose: header, metric, table, footer -->
 *     ...（实际 MD 内容）
 *     ```
 *
 * Q1 决策：保存 = MD 完整快照（含已填 slot 内容 / @theme / @page 指令）
 *   → 用户可直接把调好的文档沉淀为下次起点
 */

// ============================================================
// 类型
// ============================================================

export interface UserTemplate {
  /** 稳定 id */
  id: string;
  /** 显示名 */
  name: string;
  /** 一句话描述 */
  description?: string;
  /** lucide 图标名（与 TemplatePicker ICON_MAP 对齐） */
  icon?: string;
  /** 图标徽标背景色 */
  color?: string;
  /** 分组（UserTemplate 默认都归入 "我的模板"，此字段仅供未来扩展） */
  group?: string;
  /** 创建时间（ISO 8601） */
  createdAt: string;
  /** MD 完整快照（含 @compose / @slot / @theme / @page 等指令） */
  markdown: string;
  /** 版本号 */
  version: string;
}

// ============================================================
// localStorage 存取
// ============================================================

const STORAGE_KEY = 'forge:user-templates';

export function loadUserTemplates(): UserTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidUserTemplate);
  } catch {
    return [];
  }
}

export function saveUserTemplates(templates: UserTemplate[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function upsertUserTemplate(tpl: UserTemplate): UserTemplate[] {
  const all = loadUserTemplates();
  const idx = all.findIndex(t => t.id === tpl.id);
  if (idx >= 0) all[idx] = tpl;
  else all.push(tpl);
  saveUserTemplates(all);
  return all;
}

export function removeUserTemplate(id: string): UserTemplate[] {
  const next = loadUserTemplates().filter(t => t.id !== id);
  saveUserTemplates(next);
  return next;
}

function isValidUserTemplate(t: unknown): t is UserTemplate {
  if (!t || typeof t !== 'object') return false;
  const o = t as Record<string, unknown>;
  return typeof o.id === 'string'
    && typeof o.name === 'string'
    && typeof o.markdown === 'string'
    && typeof o.version === 'string'
    && typeof o.createdAt === 'string';
}

// ============================================================
// 工厂 / 更新
// ============================================================

export function createUserTemplate(args: {
  name: string;
  markdown: string;
  description?: string;
  icon?: string;
  color?: string;
}): UserTemplate {
  return {
    id: `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: args.name.trim(),
    description: args.description?.trim() || undefined,
    icon: args.icon || 'User',
    color: args.color || 'var(--accent-soft)',
    createdAt: new Date().toISOString(),
    markdown: args.markdown,
    version: '1.0',
  };
}

// ============================================================
// YAML frontmatter 序列化 / 反序列化
// ============================================================
//
// 我们只支持有限的标量（string/boolean/number）+ 无嵌套。
// 这对模板元信息够用；不引入外部 yaml 库（减少依赖）。

const FM_FENCE = '---';

/** 把 UserTemplate 序列化为 MD（含 frontmatter） */
export function serializeTemplateToMd(tpl: UserTemplate): string {
  const fm = [
    FM_FENCE,
    `id: ${yamlString(tpl.id)}`,
    `name: ${yamlString(tpl.name)}`,
    tpl.description ? `description: ${yamlString(tpl.description)}` : null,
    tpl.icon ? `icon: ${yamlString(tpl.icon)}` : null,
    tpl.color ? `color: ${yamlString(tpl.color)}` : null,
    tpl.group ? `group: ${yamlString(tpl.group)}` : null,
    `createdAt: ${yamlString(tpl.createdAt)}`,
    `version: ${yamlString(tpl.version)}`,
    FM_FENCE,
    '',
  ].filter(Boolean).join('\n');

  return `${fm}\n${tpl.markdown}`;
}

/** 把 MD（含 frontmatter）解析为 UserTemplate */
export function parseTemplateFromMd(source: string): UserTemplate {
  const trimmed = source.replace(/^\uFEFF/, '').trimStart(); // strip BOM
  if (!trimmed.startsWith(FM_FENCE)) {
    throw new Error('文件缺少 frontmatter（需以 --- 开头）');
  }

  // 找到第二个 --- 的位置
  const afterFirst = trimmed.slice(FM_FENCE.length);
  const nlAfterFirst = afterFirst.indexOf('\n');
  if (nlAfterFirst < 0) throw new Error('frontmatter 格式错误');

  const body = afterFirst.slice(nlAfterFirst + 1);
  const endMatch = body.match(/\n---\s*\n/);
  if (!endMatch) throw new Error('frontmatter 未闭合（缺少结尾 ---）');

  const yaml = body.slice(0, endMatch.index!);
  const markdown = body.slice(endMatch.index! + endMatch[0].length);

  const meta = parseYamlScalars(yaml);

  if (!meta.id || !meta.name) {
    throw new Error('frontmatter 缺少必填字段 id / name');
  }

  return {
    id: String(meta.id),
    name: String(meta.name),
    description: meta.description ? String(meta.description) : undefined,
    icon: meta.icon ? String(meta.icon) : undefined,
    color: meta.color ? String(meta.color) : undefined,
    group: meta.group ? String(meta.group) : undefined,
    createdAt: meta.createdAt ? String(meta.createdAt) : new Date().toISOString(),
    version: meta.version ? String(meta.version) : '1.0',
    markdown,
  };
}

/** 仅支持 `key: value` 形式（单行）。不支持嵌套 / 数组。 */
function parseYamlScalars(yaml: string): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const rawLine of yaml.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1]!;
    let val = m[2]!.trim();
    // 去除注释
    // （简单：不处理引号内的 #）
    const hashIdx = val.indexOf(' #');
    if (hashIdx > 0) val = val.slice(0, hashIdx).trim();
    // 引号
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    // boolean / number
    if (val === 'true') result[key] = true;
    else if (val === 'false') result[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) result[key] = Number(val);
    else result[key] = val;
  }
  return result;
}

function yamlString(s: string): string {
  // 需要加引号的情况：含 :  # " ' 特殊字符 / 空串
  if (/[:#"']/.test(s) || s === '' || /^\s/.test(s) || /\s$/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

// ============================================================
// 导出 / 导入 文件
// ============================================================

export function downloadTemplateMd(tpl: UserTemplate): void {
  if (typeof window === 'undefined') return;
  const md = serializeTemplateToMd(tpl);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = tpl.name.replace(/[^\w\u4e00-\u9fa5]+/g, '-') || tpl.id;
  a.download = `${safeName}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readTemplateFile(file: File): Promise<UserTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const tpl = parseTemplateFromMd(String(reader.result));
        resolve(tpl);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
