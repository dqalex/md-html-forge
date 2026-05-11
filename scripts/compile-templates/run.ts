/**
 * 批量编译所有内置模板为 HTML 文件 + 自动检测渲染问题（纯字符串/正则扫描，无 DOM）
 *
 * 用法：
 *   node --import tsx --import ./scripts/compile-templates/raw-loader.mjs \
 *     scripts/compile-templates/run.ts
 *
 * 输出：
 *   /tmp/forge-audit/<template-id>.html       # 编译产物
 *   /tmp/forge-audit/_audit.md                # 问题汇总
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import '../../src/builtin/bootstrap';
import { compile } from '../../src/builtin/compiler';
import { forgeRegistry } from '../../src/builtin/compiler/registry';
import { BUILTIN_TEMPLATES } from '../../src/builtin/templates';

const OUT = '/tmp/forge-audit';
mkdirSync(OUT, { recursive: true });

// ===== 准备 env =====
const componentMap = new Map();
for (const c of forgeRegistry.getAllComponents()) componentMap.set(c.id, c);
const themeMap = new Map();
for (const t of forgeRegistry.getAllThemes()) themeMap.set(t.id, t);

const env = {
  componentMap: componentMap as any,
  themeMap: themeMap as any,
  defaultThemeId: 'editorial',
  defaultLayoutId: 'stack',
  mode: 'standalone' as const,
};

// ===== 审查项类型 =====
interface AuditIssue {
  templateId: string;
  templateName: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  evidence?: string;
}
const issues: AuditIssue[] = [];

interface TplSummary {
  id: string;
  name: string;
  ok: boolean;
  diagnostics: number;
  orphanCount: number;
  freeTextCount: number;
  commentResidue: number;
  emptyComponents: number;
  unresolvedComponentIds: string[];
  htmlBytes: number;
  componentSections: number;
}
const summary: TplSummary[] = [];

// ===== 工具：从 HTML 中提取 <body> 内容（剥离 <style> / <script>） =====
function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return html;
  let body = bodyMatch[1]!;
  // 剥离 style 块
  body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // 剥离 script 块
  body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  return body;
}

// ===== 工具：提取所有 className=xxx 块（含其内部 text） =====
function extractBlocksByClass(html: string, className: string): string[] {
  const re = new RegExp(`<([a-z][a-z0-9-]*)\\s[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'gi');
  const blocks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[1]!;
    const startIdx = m.index;
    const openEnd = m.index + m[0].length;
    // 找匹配的闭合标签（简单 stack，自闭合标签按 0 计）
    const closeRe = new RegExp(`</${tag}\\s*>|<${tag}[\\s>]`, 'gi');
    closeRe.lastIndex = openEnd;
    let depth = 1;
    let endIdx = -1;
    let cm: RegExpExecArray | null;
    while ((cm = closeRe.exec(html))) {
      if (cm[0]!.toLowerCase().startsWith('</')) {
        depth--;
        if (depth === 0) { endIdx = cm.index + cm[0].length; break; }
      } else {
        depth++;
      }
    }
    if (endIdx > 0) {
      blocks.push(html.slice(startIdx, endIdx));
      re.lastIndex = endIdx;
    } else {
      // 匹配失败，跳过
      break;
    }
  }
  return blocks;
}

// ===== 工具：从 HTML 块里提取纯文本 =====
function stripTags(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ===== 工具：提取所有 [data-section="xxx"] 元素 =====
interface SectionInfo {
  componentId: string;
  variant: string | null;
  innerHTML: string;
  text: string;
}
function extractSections(html: string): SectionInfo[] {
  const re = /<([a-z][a-z0-9-]*)\s[^>]*data-section="([^"]+)"[^>]*>/gi;
  const sections: SectionInfo[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[1]!;
    const componentId = m[2]!;
    const tagOpenStart = m.index;
    const openEnd = m.index + m[0].length;
    const variantMatch = m[0].match(/data-variant="([^"]*)"/);
    const variant = variantMatch ? variantMatch[1]! : null;

    // 找匹配的闭合标签
    const closeRe = new RegExp(`</${tag}\\s*>|<${tag}[\\s>]`, 'gi');
    closeRe.lastIndex = openEnd;
    let depth = 1;
    let endIdx = -1;
    let cm: RegExpExecArray | null;
    while ((cm = closeRe.exec(html))) {
      if (cm[0]!.toLowerCase().startsWith('</')) {
        depth--;
        if (depth === 0) { endIdx = cm.index; break; }
      } else {
        depth++;
      }
    }
    if (endIdx <= 0) continue;
    const innerHTML = html.slice(openEnd, endIdx);
    sections.push({
      componentId,
      variant,
      innerHTML,
      text: stripTags(innerHTML),
    });
    re.lastIndex = endIdx;
  }
  return sections;
}

// ===== 逐个模板编译 + 审查 =====

// 这些组件即使没 textContent 也算正常（它们是数据驱动 / 装饰 / 仅 SVG）
const DATA_DRIVEN_COMPONENTS = new Set([
  'metric',          // mc-num/label/delta 由 mount JS 渲染，但渲染时 text 也会有
  'chip',            // 标签类
  'design-spec',     // swatch / spacing 也是数据驱动
  'illustration',    // 含 SVG，textContent 可能为空
]);

for (const tpl of BUILTIN_TEMPLATES) {
  if (!tpl.starterMarkdown) continue;

  let html = '';
  let diagnostics: readonly any[] = [];
  let orphanSlotNames: string[] = [];
  let unresolvedComponentIds: string[] = [];

  try {
    const result = compile(tpl.starterMarkdown, { env, noCache: true });
    html = result.html;
    diagnostics = result.diagnostics;
    orphanSlotNames = result.orphanSlotNames;
    unresolvedComponentIds = result.unresolvedComponentIds;
  } catch (e) {
    issues.push({
      templateId: tpl.id, templateName: tpl.name,
      severity: 'high', category: 'compile-error',
      message: `编译异常：${(e as Error).message}`,
    });
    summary.push({
      id: tpl.id, name: tpl.name, ok: false,
      diagnostics: 0, orphanCount: 0, freeTextCount: 0,
      commentResidue: 0, emptyComponents: 0,
      unresolvedComponentIds: [], htmlBytes: 0, componentSections: 0,
    });
    continue;
  }

  writeFileSync(join(OUT, `${tpl.id}.html`), html, 'utf8');
  const bodyContent = extractBodyContent(html);

  // ===== 静态扫描 =====

  // 1. forge-free-text 块
  const freeTextBlocks = extractBlocksByClass(bodyContent, 'forge-free-text');
  let commentResidue = 0;
  let nonCommentFreeText = 0;
  for (const block of freeTextBlocks) {
    const text = stripTags(block);
    if (/─{3,}/.test(text)) {
      commentResidue++;
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'high', category: 'comment-residue',
        message: 'forge-free-text 兜底块包含分割线注释（应被丢弃）',
        evidence: text.slice(0, 200),
      });
    } else if (text.length > 0) {
      nonCommentFreeText++;
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'medium', category: 'free-text-fallback',
        message: 'forge-free-text 兜底块（这段裸 markdown 没有被任何组件接收）',
        evidence: text.slice(0, 200),
      });
    }
  }

  // 2. forge-orphan 块
  const orphanBlocks = extractBlocksByClass(bodyContent, 'forge-orphan');
  for (const block of orphanBlocks) {
    const labelMatch = block.match(/<span class="forge-orphan-label"[^>]*>([^<]+)<\/span>/);
    const label = labelMatch ? labelMatch[1]!.trim() : '<unknown>';
    const bodyMatch = block.match(/<div class="forge-orphan-body"[^>]*>([\s\S]*?)<\/div>/);
    const evidence = bodyMatch ? stripTags(bodyMatch[1]!).slice(0, 150) : '';
    issues.push({
      templateId: tpl.id, templateName: tpl.name,
      severity: 'high', category: 'orphan-slot',
      message: `孤儿 slot：${label}`,
      evidence,
    });
  }

  // 3. 空组件
  const sections = extractSections(bodyContent);
  let emptyComponents = 0;
  for (const sec of sections) {
    if (DATA_DRIVEN_COMPONENTS.has(sec.componentId)) continue;
    if (/<svg[\s>]/i.test(sec.innerHTML)) continue;
    if (sec.text.length > 0) continue;
    // 判定：全 slot 都为空才算
    const slotMatch = sec.innerHTML.match(/data-slot="[^"]+"/g);
    if (slotMatch && slotMatch.length > 0) {
      emptyComponents++;
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'medium', category: 'empty-component',
        message: `组件 ${sec.componentId}${sec.variant ? `(variant=${sec.variant})` : ''} 所有 slot 为空`,
      });
    }
  }

  // 4. 未解析的 component id
  if (unresolvedComponentIds.length > 0) {
    issues.push({
      templateId: tpl.id, templateName: tpl.name,
      severity: 'medium', category: 'unresolved-component',
      message: `@compose 引用的组件不存在：${unresolvedComponentIds.join(', ')}`,
    });
  }

  // 4.5. @compose 声明了但 HTML 里没出现的组件（multiplexed 兜底实例化的"幽灵组件"）
  //   规则：声明的 id 既不在 sections 里，也不是 footer/layout-* 这种特殊组件
  //   footer 用 `<footer>` 标签直接渲染没有 data-section，跳过
  //   layout-* 是 group 的容器，可能没渲染 data-section
  //   `blank` 模板专用 skeleton 模式，所有 slot 都是占位注释，跳过本检查
  if (tpl.id !== 'blank') {
    const sectionIds = new Set(sections.map(s => s.componentId));
    const footerInBody = /<footer[^>]*data-slot="footer"/.test(bodyContent);
    const composeIds = new Set<string>();
    const composeMatch = tpl.starterMarkdown.match(/<!--\s*@compose:\s*([^-]+?)\s*-->/);
    if (composeMatch) {
      composeMatch[1]!.split(',').map(s => s.trim()).filter(Boolean).forEach(id => composeIds.add(id));
    }
    for (const id of composeIds) {
      if (sectionIds.has(id)) continue;
      if (id === 'footer' && footerInBody) continue;
      if (id.startsWith('layout-')) continue; // group 容器
      if (unresolvedComponentIds.includes(id)) continue;
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'medium', category: 'unused-declaration',
        message: `@compose 声明了 "${id}" 但 HTML 里没渲染（@compose 列表多余 / @use 缺失）`,
      });
    }
  }

  // 5. diagnostics 错误
  for (const d of diagnostics) {
    if (d.severity === 'error') {
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'high', category: 'compile-diagnostic',
        message: `${d.code}: ${d.message}`,
        evidence: d.loc ? `line ${d.loc.line}` : undefined,
      });
    }
  }

  // 6. HTML 标签平衡检查（非自闭合标签的开闭对应）
  {
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
    const skipContentTags = new Set(['pre','code','svg','script','style','iframe']);
    // 标准 HTML5 标签名（不含自定义元素）
    const standardTags = new Set([
      'a','abbr','address','article','aside','audio','b','bdi','bdo','blockquote','body',
      'button','canvas','caption','cite','col','colgroup','data','datalist','dd','del',
      'details','dfn','dialog','div','dl','dt','em','fieldset','figcaption','figure',
      'footer','form','h1','h2','h3','h4','h5','h6','head','header','hgroup','html',
      'i','ins','kbd','label','legend','li','main','map','mark','menu','meter','nav',
      'noscript','object','ol','optgroup','option','output','p','picture','portal',
      'pre','progress','q','rp','rt','ruby','s','samp','section','select','slot',
      'small','span','strong','sub','summary','sup','table','tbody','td','template',
      'textarea','tfoot','th','thead','time','title','tr','u','ul','var','video','wbr',
    ]);
    // 只检查 body 内容，先移除需要跳过的内容块
    let checkHtml = extractBodyContent(html);
    // 移除 <pre>/<code>/<svg>/<script>/<style>/<iframe> 内的内容
    for (const skipTag of skipContentTags) {
      const skipRe = new RegExp(`<${skipTag}[^>]*>[\\s\\S]*?<\\/${skipTag}>`, 'gi');
      checkHtml = checkHtml.replace(skipRe, '');
    }
    const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*\/?>/g;
    const stack: Array<{ tag: string; pos: number }> = [];
    let tm: RegExpExecArray | null;
    while ((tm = tagRe.exec(checkHtml))) {
      const raw = tm[0]!;
      const tagName = tm[1]!.toLowerCase();
      if (voidTags.has(tagName)) continue;
      if (raw.endsWith('/>')) continue; // 自闭合
      // 只检查标准 HTML 标签（跳过自定义元素和含连字符的标签）
      if (!standardTags.has(tagName)) continue;
      if (raw.startsWith('</')) {
        if (stack.length > 0 && stack[stack.length - 1]!.tag === tagName) {
          stack.pop();
        } else {
          issues.push({
            templateId: tpl.id, templateName: tpl.name,
            severity: 'high', category: 'html-tag-balance',
            message: `HTML 标签不平衡：多余的闭合标签 </${tagName}>`,
            evidence: `位置 ${tm.index}`,
          });
        }
      } else {
        stack.push({ tag: tagName, pos: tm.index });
      }
    }
    for (const unclosed of stack) {
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'high', category: 'html-tag-balance',
        message: `HTML 标签不平衡：未闭合的 <${unclosed.tag}>`,
        evidence: `位置 ${unclosed.pos}`,
      });
    }
  }

  // 7. CSS hardcode 颜色检查
  {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
      for (const styleBlock of styleMatch) {
        // 排除注释内的颜色值
        const noComments = styleBlock.replace(/\/\*[\s\S]*?\*\//g, '');
        // 检查 #xxx / #xxxxxx / rgb(...) / rgba(...) 颜色值（排除 CSS 变量声明中的颜色）
        const hexColorRe = /(?:^|[^-a-zA-Z])#([0-9a-fA-F]{3,8})\b/g;
        let hm: RegExpExecArray | null;
        while ((hm = hexColorRe.exec(noComments))) {
          // 跳过 CSS 变量声明（如 --clay: #D97757;）
          const before = noComments.slice(Math.max(0, hm.index - 30), hm.index);
          if (/--[\w-]+\s*:\s*$/.test(before)) continue;
          const color = hm[0]!.trim();
          issues.push({
            templateId: tpl.id, templateName: tpl.name,
            severity: 'low', category: 'css-hardcode-color',
            message: `CSS 中有硬编码颜色值：${color}`,
            evidence: before.slice(-30) + color,
          });
        }
        const rgbColorRe = /\brgba?\s*\(/gi;
        let rm: RegExpExecArray | null;
        while ((rm = rgbColorRe.exec(noComments))) {
          const before = noComments.slice(Math.max(0, rm.index - 30), rm.index);
          if (/--[\w-]+\s*:\s*$/.test(before)) continue;
          issues.push({
            templateId: tpl.id, templateName: tpl.name,
            severity: 'low', category: 'css-hardcode-color',
            message: `CSS 中有硬编码 rgb/rgba 颜色`,
            evidence: noComments.slice(rm.index, rm.index + 40),
          });
        }
      }
    }
  }

  // 8. 字节数 baseline 比较
  {
    const baselinePath = join(OUT, '_baseline.json');
    let baseline: Record<string, number> = {};
    try {
      if (existsSync(baselinePath)) {
        baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
      }
    } catch { /* baseline 解析失败，忽略 */ }
    const prevBytes = baseline[tpl.id];
    if (prevBytes !== undefined) {
      const diff = html.length - prevBytes;
      const pct = prevBytes > 0 ? Math.abs(diff / prevBytes) : 0;
      if (pct > 0.2) {
        issues.push({
          templateId: tpl.id, templateName: tpl.name,
          severity: 'medium', category: 'byte-regression',
          message: `HTML 大小变化 ${diff > 0 ? '+' : ''}${diff} bytes (${(pct * 100).toFixed(1)}%)，疑似回归`,
          evidence: `之前 ${prevBytes} → 现在 ${html.length}`,
        });
      }
    }
    baseline[tpl.id] = html.length;
    try {
      writeFileSync(baselinePath, JSON.stringify(baseline, null, 2), 'utf8');
    } catch { /* 忽略写入失败 */ }
  }

  // 9. Heading 层级检查
  {
    const headingRe = /<h([1-6])\b[^>]*>/gi;
    const headingLevels: number[] = [];
    let hm2: RegExpExecArray | null;
    while ((hm2 = headingRe.exec(bodyContent))) {
      headingLevels.push(parseInt(hm2[1]!, 10));
    }
    const h1Count = headingLevels.filter(l => l === 1).length;
    if (h1Count > 1) {
      issues.push({
        templateId: tpl.id, templateName: tpl.name,
        severity: 'medium', category: 'heading-hierarchy',
        message: `h1 出现 ${h1Count} 次，应只有 1 个`,
      });
    }
    // 检查连续 heading 的跳级（仅检查相邻 heading，跳过非连续的）
    for (let hi = 1; hi < headingLevels.length; hi++) {
      const prev = headingLevels[hi - 1]!;
      const cur = headingLevels[hi]!;
      // 只报告 h1 → h3+ 之外的更严重跳级（如 h1 → h4, h2 → h4 等）
      if (cur > prev + 2) {
        issues.push({
          templateId: tpl.id, templateName: tpl.name,
          severity: 'low', category: 'heading-hierarchy',
          message: `heading 严重跳级：h${prev} → h${cur}`,
        });
      }
    }
  }

  const tplIssues = issues.filter(i => i.templateId === tpl.id);
  summary.push({
    id: tpl.id, name: tpl.name,
    ok: tplIssues.length === 0,
    diagnostics: diagnostics.filter((d: any) => d.severity !== 'info').length,
    orphanCount: orphanBlocks.length,
    freeTextCount: freeTextBlocks.length,
    commentResidue,
    emptyComponents,
    unresolvedComponentIds,
    htmlBytes: html.length,
    componentSections: sections.length,
  });
}

// ===== 输出审查报告 =====
const md: string[] = [];
md.push('# 模板编译审查报告\n');
md.push(`生成时间：${new Date().toISOString()}\n`);
md.push(`总模板数：${summary.length}，通过 ${summary.filter(s => s.ok).length}，问题模板 ${summary.filter(s => !s.ok).length}\n`);

// === 总览表 ===
md.push('## 总览\n');
md.push('| 模板 | 状态 | sections | 注释残留 | free-text | orphan | 空组件 | 未解析 | 字节数 |');
md.push('|---|---|---|---|---|---|---|---|---|');
for (const s of summary) {
  md.push(`| ${s.name} (\`${s.id}\`) | ${s.ok ? '✓' : '✗'} | ${s.componentSections} | ${s.commentResidue} | ${s.freeTextCount} | ${s.orphanCount} | ${s.emptyComponents} | ${s.unresolvedComponentIds.join(',') || '-'} | ${s.htmlBytes} |`);
}

// === 按严重性分类 ===
const high = issues.filter(i => i.severity === 'high');
const medium = issues.filter(i => i.severity === 'medium');
const low = issues.filter(i => i.severity === 'low');

function dumpBy(level: string, arr: AuditIssue[]) {
  md.push(`\n## ${level}（${arr.length}）\n`);
  const byTpl = new Map<string, AuditIssue[]>();
  for (const i of arr) {
    if (!byTpl.has(i.templateId)) byTpl.set(i.templateId, []);
    byTpl.get(i.templateId)!.push(i);
  }
  for (const [tplId, items] of byTpl) {
    const tplName = items[0]!.templateName;
    md.push(`### ${tplName} (\`${tplId}\`)\n`);
    for (const it of items) {
      md.push(`- **[${it.category}]** ${it.message}`);
      if (it.evidence) md.push(`  - 证据：\`${it.evidence.replace(/`/g, '\\`').slice(0, 200)}\``);
    }
    md.push('');
  }
}

dumpBy('🔴 严重问题', high);
dumpBy('🟡 中等问题', medium);
if (low.length > 0) dumpBy('🟢 轻微问题', low);

writeFileSync(join(OUT, '_audit.md'), md.join('\n'), 'utf8');

// ===== 控制台简报 =====
console.log('\n=== 编译完成 ===');
console.log(`输出目录: ${OUT}`);
console.log(`HTML 文件: ${summary.length} 个`);
console.log(`审查报告: ${OUT}/_audit.md`);
console.log(`\n问题统计：`);
console.log(`  🔴 严重: ${high.length}`);
console.log(`  🟡 中等: ${medium.length}`);
console.log(`  🟢 轻微: ${low.length}`);
console.log(`\n通过的模板: ${summary.filter(s => s.ok).length} / ${summary.length}`);
if (!summary.every(s => s.ok)) {
  console.log(`\n失败模板：`);
  summary.filter(s => !s.ok).forEach(s => {
    console.log(`  - ${s.name} (${s.id})  注释残留=${s.commentResidue} freeText=${s.freeTextCount} orphan=${s.orphanCount} empty=${s.emptyComponents}`);
  });
}
