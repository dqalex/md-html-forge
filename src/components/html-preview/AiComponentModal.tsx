'use client';

/**
 * AiComponentModal —— "AI 造组件"流程
 *
 * 方案 C（无后端）：
 *   1. 用户填写需求（自然语言描述）+ 必要 slot 示例
 *   2. 我们生成一段精心准备的 prompt（包含 forge.md 规范摘要 + 用户需求）
 *   3. 用户一键复制 → 粘到任意 AI（Claude / ChatGPT / Gemini）
 *   4. AI 输出 `.forge.md` 全文 → 用户粘回我们
 *   5. 前端 parseForgeMd 解析 → 显示校验结果（成功 / 失败 / 缺字段）
 *   6. 通过校验后入库（localStorage forge:user-components），并 register 到引擎
 *   7. 立即可在 @use 中使用
 */

import { useMemo, useState } from 'react';
import { XIcon, CopyIcon, CheckIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react';

import { parseForgeMd, forgeToComponentDef, getForgeJs } from '@/builtin/components/forge-loader';
import { forgeRegistry } from '@/builtin/compiler/registry';
import { registerForgeRuntimeScript } from '@/builtin/components/forge-registry';
import { upsertUserComponent } from './userComponents';

const FORGE_SPEC_SUMMARY = `# Forge 组件包格式（.forge.md）

每个组件 = 一个 markdown 文件，包含 5 个固定区段。结构如下：

\`\`\`markdown
# <ComponentDisplayName>

id: <kebab-case-id>
category: <header | summary | content | card | list | data | visual | footer | special>
tags: <逗号分隔的标签，至少含一个变体名>
trust: user
defaultVariant: <第一个变体 id>

## Variants

- \`<variant-id-a>\` — 描述
- \`<variant-id-b>\` — 描述（最多 4 个变体）

## Slots

\`\`\`yaml
slotName1:
  label: <UI 显示名>
  type: text | content | data
  placeholder: <示例值>
  bind: h1 | h2 | h3 | paragraph | ul | ol | code | table  # 可选，自动从原生 MD 吸收
slotName2:
  ...
\`\`\`

## HTML

\`\`\`html
<div class="comp-<id>" data-section="<id>" data-variant="{{variant}}">
  <!-- variant: <variant-id-a> -->
  <div class="...">
    <h3 data-slot="slotName1"></h3>
    <div data-slot="slotName2" data-slot-type="content"></div>
  </div>

  <!-- variant: <variant-id-b> -->
  <div class="...">...</div>
</div>
\`\`\`

## CSS

\`\`\`css
.comp-<id> { ... }
.comp-<id>[data-variant="<variant-id-a>"] .xxx { ... }
\`\`\`

## JS（可选，省略表示无交互）

\`\`\`js
export function mount(el, api) {
  // 通过 el.querySelector('[data-slot="x"]') 读 slot 值
  // api.emit('eventName', payload) 与宿主双向通信
}
\`\`\`

## Sample

\`\`\`markdown
<!-- @use <id> variant=<variant-id-a> -->
<!-- @slot:slotName1 -->示例内容<!-- @/slot -->
\`\`\`

# 关键约束

- **id 唯一且 kebab-case**：不能与已有内置组件冲突（如 card / list-item / callout / panel / table 等已被占用）
- **trust 必须是 user**（用户组件）
- **变体最多 4 个**：每个 variant 在 HTML 段用 \`<!-- variant: xxx -->\` 显式分块
- **CSS 必须命名空间**：所有选择器以 \`.comp-<id>\` 开头，绝不写裸全局选择器（如 \`a\` / \`p\` / \`.chip\`）
- **不允许硬编码颜色**：用 \`var(--clay)\` / \`var(--slate)\` / \`var(--ivory)\` 等 token；也可用 \`color-mix(in srgb, var(--clay) 10%, transparent)\`
- **JS 中 innerHTML 拼接必须 escape**：\`String(s).replace(/[&<>"']/g, ...)\`，否则 XSS 风险
- **slot 完整覆盖**：YAML 声明的每个 slot 必须在 HTML 某个 \`data-slot="name"\` 出现（hidden 节点也可）
- **直接输出原文**：你的回复必须 ONLY 是 \`.forge.md\` 文件全文，不要任何前缀/后缀解释`;

export interface AiComponentModalProps {
  onClose: () => void;
}

export function AiComponentModal({ onClose }: AiComponentModalProps) {
  const [step, setStep] = useState<'request' | 'paste' | 'done'>('request');
  const [request, setRequest] = useState('');
  const [pasted, setPasted] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const finalPrompt = useMemo(() => {
    if (!request.trim()) return '';
    return `${FORGE_SPEC_SUMMARY}\n\n# 用户需求\n\n${request.trim()}\n\n# 任务\n\n按上面的规范输出一个 .forge.md 文件全文。直接输出 markdown 源码，不要 \`\`\` 包裹整个文件，也不要解释。`;
  }, [request]);

  const handleCopy = async () => {
    if (!finalPrompt) return;
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 退化方案
      const ta = document.createElement('textarea');
      ta.value = finalPrompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleParseAndSave = () => {
    setParseError(null);
    if (!pasted.trim()) {
      setParseError('请粘贴 AI 输出的 .forge.md 全文');
      return;
    }

    let forge;
    try {
      forge = parseForgeMd(pasted);
    } catch (e) {
      setParseError(`解析失败：${(e as Error).message}`);
      return;
    }

    // 校验
    const errors: string[] = [];
    if (!forge.meta.id) errors.push('缺少 id 字段');
    if (!forge.meta.category) errors.push('缺少 category 字段');
    if (!forge.variants.length) errors.push('Variants 段为空');
    if (forge.variants.length > 4) errors.push('变体数超过 4 个上限');
    if (Object.keys(forge.slots).length === 0) errors.push('Slots 段为空');
    if (!forge.htmlTemplate) errors.push('HTML 段为空');

    // 检查 id 是否冲突
    if (forge.meta.id && forgeRegistry.getComponent(forge.meta.id)) {
      errors.push(`id "${forge.meta.id}" 已存在（与内置或其它用户组件冲突）`);
    }

    // 检查所有 slot 是否在 HTML 中有出口
    const usedSlots = new Set(
      [...forge.htmlTemplate.matchAll(/data-slot="([\w-]+)"/g)].map((m) => m[1]),
    );
    for (const slotName of Object.keys(forge.slots)) {
      if (!usedSlots.has(slotName)) {
        errors.push(`slot "${slotName}" 在 HTML 中没有 data-slot 出口`);
      }
    }

    // 检查 CSS 命名空间
    const cssLines = forge.css.split('\n').filter((l) => /^\s*[a-z]/.test(l) && !l.includes('}'));
    for (const line of cssLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('.comp-') && !trimmed.startsWith('@')) {
        errors.push(`CSS 选择器未以 .comp- 开头: ${trimmed.slice(0, 60)}`);
        break;
      }
    }

    if (errors.length) {
      setParseError(errors.join('；'));
      return;
    }

    // 强制 trust=user
    forge.meta.trust = 'user';

    try {
      const def = forgeToComponentDef(forge);
      forgeRegistry.registerComponent(def);
      const js = getForgeJs(forge);
      if (js) registerForgeRuntimeScript({ ...js, trust: 'user' });
      upsertUserComponent({
        source: pasted,
        id: forge.meta.id,
        createdAt: Date.now(),
      });
      setSavedId(forge.meta.id);
      setStep('done');
    } catch (e) {
      setParseError(`注册失败：${(e as Error).message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20, 20, 19, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--surface,#FAF9F5)] rounded-xl shadow-2xl w-[760px] max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-[color:var(--accent)]" />
            <h2 className="font-serif text-[17px] font-medium text-[color:var(--text-primary)]">
              AI 造组件
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="h-7 w-7 rounded-md hover:bg-[color:var(--surface-hover)] text-[color:var(--text-secondary)] flex items-center justify-center"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-[11px] shrink-0">
          {(['request', 'paste', 'done'] as const).map((s, i) => (
            <span
              key={s}
              className={`flex items-center gap-1 ${
                step === s ? 'text-[color:var(--accent-strong)] font-medium' : 'text-[color:var(--text-tertiary)]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-mono ${
                  step === s
                    ? 'bg-[color:var(--accent)] text-white'
                    : 'bg-[color:var(--surface)] border border-[color:var(--border-subtle)]'
                }`}
              >
                {i + 1}
              </span>
              {s === 'request' ? '描述需求' : s === 'paste' ? '粘贴 AI 输出' : '完成'}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'request' && (
            <>
              <p className="text-[12px] text-[color:var(--text-secondary)] mb-2">
                用一段话描述你想要的组件——做什么用、长什么样、有哪些字段。越具体越好。
              </p>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-md text-[13px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] resize-none"
                placeholder={`例：一个"客户引言"组件，左侧是大引号 + 客户的话（衬线大字），右侧是头像 + 姓名 + 公司 + 职位（小字）；提供 standard / compact 两个变体；compact 变体只显示引言，不显示头像。`}
              />

              {request.trim() && (
                <>
                  <div className="mt-4 mb-2 flex items-center justify-between">
                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--text-tertiary)]">
                      生成的 Prompt
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 text-[11px] rounded-md bg-[color:var(--accent)] text-white hover:opacity-90 flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-3 w-3" /> 已复制
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3 w-3" /> 复制
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono leading-relaxed bg-[color:var(--surface-sunken)] border border-[color:var(--border-subtle)] rounded-md p-3 max-h-64 overflow-auto text-[color:var(--text-secondary)]">
                    {finalPrompt}
                  </pre>
                  <p className="text-[11px] text-[color:var(--text-tertiary)] mt-2">
                    把 prompt 粘贴给 Claude / ChatGPT / 任意 AI。让它输出 <code className="font-mono text-[color:var(--accent-strong)]">.forge.md</code> 文件全文，然后回到这里点「下一步」粘贴。
                  </p>
                </>
              )}
            </>
          )}

          {step === 'paste' && (
            <>
              <p className="text-[12px] text-[color:var(--text-secondary)] mb-2">
                把 AI 生成的 <code className="font-mono">.forge.md</code> 全文粘到这里：
              </p>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                rows={18}
                className="w-full px-3 py-2 rounded-md text-[12px] font-mono border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] resize-none"
                placeholder={'# 组件名\n\nid: my-comp\ncategory: visual\n...'}
              />
              {parseError && (
                <div className="mt-2 px-3 py-2 rounded-md bg-[color:var(--rust,#B04A3F)]/10 border border-[color:var(--rust,#B04A3F)]/30 text-[11px] text-[color:var(--rust,#B04A3F)] flex items-start gap-2">
                  <AlertCircleIcon className="h-3.5 w-3.5 mt-0.5 flex-none" />
                  <span>{parseError}</span>
                </div>
              )}
            </>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 rounded-full bg-[color:var(--olive,#788C5D)]/15 flex items-center justify-center mb-3">
                <CheckIcon className="h-6 w-6 text-[color:var(--olive,#788C5D)]" />
              </div>
              <h3 className="text-[15px] font-medium text-[color:var(--text-primary)]">
                组件已注册
              </h3>
              <p className="text-[12px] text-[color:var(--text-tertiary)] mt-1">
                现在可以在 MD 中用 <code className="font-mono text-[color:var(--accent-strong)]">@use {savedId}</code> 引用
              </p>
              <p className="text-[11px] text-[color:var(--text-quaternary)] mt-3 text-center max-w-md">
                组件保存在浏览器本地（localStorage）。
                <br />
                去「品牌包」打包它，可在不同设备/同事间分享。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] shrink-0">
          <div className="text-[11px] text-[color:var(--text-tertiary)]">
            生成的组件 trust 标记为 <code className="font-mono">user</code>，未来在沙箱 iframe 中运行
          </div>
          <div className="flex gap-2">
            {step === 'request' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-[12px] rounded-md text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => setStep('paste')}
                  disabled={!request.trim()}
                  className="px-4 py-1.5 text-[12px] rounded-md font-medium bg-[color:var(--accent)] text-white hover:opacity-90 disabled:opacity-50"
                >
                  下一步：粘贴
                </button>
              </>
            )}
            {step === 'paste' && (
              <>
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="px-3 py-1.5 text-[12px] rounded-md text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={handleParseAndSave}
                  disabled={!pasted.trim()}
                  className="px-4 py-1.5 text-[12px] rounded-md font-medium bg-[color:var(--accent)] text-white hover:opacity-90 disabled:opacity-50"
                >
                  解析并保存
                </button>
              </>
            )}
            {step === 'done' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-[12px] rounded-md font-medium bg-[color:var(--accent)] text-white hover:opacity-90"
              >
                完成
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
