---
id: code-block
category: visual
tags: code, diff, walkthrough, review
trust: builtin
defaultVariant: diff
---

# 代码展示

## Variants

- `diff` — 代码差异：深色底 diff 视图，支持 +/- 行和 hunk 标记
- `walkthrough` — 代码走读：编号步骤 + 文件位置 + 正文 + 可折叠代码

## Slots

```yaml
diffContent:
  label: 差异内容
  type: data
  placeholder: '@@ -42,14 +42,17 @@\n  const { data } = useTasks(boardId);\n-  const [pending, setPending] = useState(null);\n+  const { mutate } = useOptimisticTasks(boardId);'
stepNum:
  label: 步骤编号
  type: text
  placeholder: '1'
stepLoc:
  label: 文件位置
  type: text
  placeholder: src/middleware/auth.ts
stepRange:
  label: 行号范围（可选）
  type: text
  placeholder: ':14-31'
stepHot:
  label: 是否高亮（hot/空）
  type: text
  placeholder: ''
stepBody:
  label: 步骤正文
  type: content
  bind: paragraph
  placeholder: 这是信任边界。`verifyToken` 读取签名的 cookie...
stepCode:
  label: 代码片段（可选）
  type: content
  bind: code
  placeholder: '```js\nexport async function verifyToken(req, res, next) {\n  // ...\n}\n```'
```

## HTML

```html
<div class="comp-code-block" data-section="code-block" data-variant="{{variant}}">
  <!-- variant: diff -->
  <div class="cp-diff-wrap" data-no-jump>
    <button type="button" class="cp-copy" data-copy-target="diff" aria-label="复制代码">复制</button>
    <div class="cp-diff" data-slot="diffContent" data-slot-type="data"></div>
  </div>

  <!-- variant: walkthrough -->
  <div class="cp-walkthrough">
    <div class="cp-wt-badge" data-slot="stepNum"></div>
    <div class="cp-wt-body">
      <div class="cp-wt-loc">
        <span data-slot="stepLoc"></span>
        <span class="cp-wt-range" data-slot="stepRange"></span>
      </div>
      <div class="cp-wt-text" data-slot="stepBody" data-slot-type="content"></div>
      <div class="cp-wt-code-wrap" data-no-jump>
        <button type="button" class="cp-copy" data-copy-target="walkthrough" aria-label="复制代码">复制</button>
        <div class="cp-wt-code" data-slot="stepCode" data-slot-type="content"></div>
      </div>
    </div>
  </div>
</div>
```

## CSS

```css
.comp-code-block {
  background: transparent;
}

/* ===== 复制按钮（diff / walkthrough 共用） ===== */
.comp-code-block .cp-diff-wrap,
.comp-code-block .cp-wt-code-wrap {
  position: relative;
}
.comp-code-block .cp-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--ivory) 40%, transparent);
  background: color-mix(in srgb, var(--white) 14%, transparent);
  color: var(--ivory);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.comp-code-block .cp-diff-wrap:hover .cp-copy,
.comp-code-block .cp-wt-code-wrap:hover .cp-copy,
.comp-code-block .cp-copy:focus-visible {
  opacity: 1;
}
.comp-code-block .cp-copy:hover {
  background: color-mix(in srgb, var(--white) 28%, transparent);
}
.comp-code-block .cp-copy.copied {
  background: var(--olive);
  border-color: var(--olive);
  color: var(--white);
  opacity: 1;
}

/* ===== variant: diff ===== */
.comp-code-block .cp-diff {
  background: var(--slate);
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  overflow-x: auto;
  border-radius: 0 0 var(--radius-panel) var(--radius-panel);
}
.comp-code-block .cp-diff .db-row {
  display: grid;
  grid-template-columns: 48px 18px 1fr;
  align-items: baseline;
  padding: 0 14px 0 0;
  white-space: pre;
}
.comp-code-block .cp-diff .db-row .ln {
  text-align: right;
  padding-right: 14px;
  color: var(--gray-500);
  user-select: none;
}
.comp-code-block .cp-diff .db-row .mark {
  text-align: center;
  color: var(--gray-500);
}
.comp-code-block .cp-diff .db-row .code {
  color: var(--gray-100);
}
.comp-code-block .cp-diff .db-row.ctx .code {
  color: var(--gray-500);
}
.comp-code-block .cp-diff .db-row.add {
  background: color-mix(in srgb, var(--olive) 15%, transparent);
}
.comp-code-block .cp-diff .db-row.add .mark {
  color: var(--olive);
}
.comp-code-block .cp-diff .db-row.del {
  background: color-mix(in srgb, var(--rust) 15%, transparent);
}
.comp-code-block .cp-diff .db-row.del .mark {
  color: var(--rust);
}
.comp-code-block .cp-diff .db-row.hunk {
  background: color-mix(in srgb, var(--white) 4%, transparent);
  color: var(--gray-500);
}
.comp-code-block .cp-diff .db-row.hunk .code {
  color: var(--gray-500);
}

/* ===== variant: walkthrough ===== */
.comp-code-block .cp-walkthrough {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1.5px solid var(--gray-100);
}
.comp-code-block .cp-walkthrough:last-child {
  border-bottom: none;
}
.comp-code-block .cp-wt-badge {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--oat);
  border: 1.5px solid var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-weight: 600;
  color: var(--slate);
  font-size: 14px;
}
.comp-code-block .cp-walkthrough.hot .cp-wt-badge {
  background: var(--oat);
  border-color: var(--clay);
  color: var(--clay);
}
.comp-code-block .cp-wt-loc {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--slate);
  margin-bottom: 6px;
}
.comp-code-block .cp-wt-range {
  color: var(--gray-500);
}
.comp-code-block .cp-wt-text p {
  margin-bottom: 10px;
}
.comp-code-block .cp-wt-code {
  margin-top: 8px;
}
.comp-code-block .cp-wt-code pre {
  background: var(--slate);
  color: var(--ivory);
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
}
.comp-code-block .cp-wt-code pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
}
```

## JS

```js
export function mount(el, api) {
  const variant = el.getAttribute('data-variant');

  if (variant === 'diff') {
    const diffEl = el.querySelector('[data-slot="diffContent"]');
    if (diffEl && diffEl.textContent) {
      const lines = diffEl.textContent.split('\n');
      const rows = [];
      for (const line of lines) {
        const trimmed = line.trimStart();
        let type = 'ctx';
        let mark = ' ';
        let content = trimmed;
        let lnHtml = '';

        if (trimmed.startsWith('@@')) {
          type = 'hunk';
          mark = ' ';
          content = trimmed;
          lnHtml = '<span class="ln"></span><span class="mark"></span>';
        } else if (trimmed.startsWith('+')) {
          type = 'add';
          mark = '+';
          content = trimmed.slice(1);
        } else if (trimmed.startsWith('-')) {
          type = 'del';
          mark = '-';
          content = trimmed.slice(1);
        } else if (trimmed.startsWith(' ')) {
          type = 'ctx';
          mark = ' ';
          content = trimmed.slice(1);
        }

        if (type !== 'hunk') {
          lnHtml = `<span class="ln"></span><span class="mark">${mark}</span>`;
        }

        const escaped = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        rows.push(`<div class="db-row ${type}">${lnHtml}<span class="code">${escaped}</span></div>`);
      }
      diffEl.innerHTML = rows.join('\n');
    }
  }

  if (variant === 'walkthrough') {
    const hotEl = el.querySelector('[data-slot="stepHot"]');
    if (hotEl) {
      const isHot = /^hot|true|1|yes$/i.test((hotEl.textContent || '').trim());
      if (isHot) {
        const wtEl = el.querySelector('.cp-walkthrough');
        if (wtEl) wtEl.classList.add('hot');
      }
    }
    // 点击 badge 折叠/展开代码块（持久化）
    const wtEl = el.querySelector('.cp-walkthrough');
    const badge = el.querySelector('.cp-wt-badge');
    const codeWrap = el.querySelector('.cp-wt-code-wrap');
    if (wtEl && badge && codeWrap) {
      badge.style.cursor = 'pointer';
      badge.setAttribute('role', 'button');
      badge.setAttribute('aria-label', '折叠/展开代码');
      const apply = (collapsed) => {
        codeWrap.style.display = collapsed ? 'none' : '';
        wtEl.classList.toggle('collapsed', collapsed);
      };
      apply(api.state.get('collapsed', false) === true);
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = !(api.state.get('collapsed', false) === true);
        api.state.set('collapsed', next);
        apply(next);
      });
    }
  }

  // ===== 复制按钮（diff / walkthrough 共用） =====
  // 取 diff slot / stepCode slot 的纯文本作为复制源；优先用 forge.runtime.copy，
  // 失败时回退 execCommand。点击后 200ms 内显示"已复制"反馈。
  const copyBtns = el.querySelectorAll('.cp-copy');
  copyBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      const target = btn.getAttribute('data-copy-target');
      let text = '';
      if (target === 'diff') {
        // 取原始 diff 文本：用 slot 的 textContent（mount 已把 innerHTML 替换为 db-row 结构，
        // 此时 textContent 仍能拼出可读形式，但首选回到 slot 原文 → 在 mount 时缓存一份）
        text = btn.__forgeRaw || (el.querySelector('[data-slot="diffContent"]')?.textContent || '');
      } else if (target === 'walkthrough') {
        const codeEl = el.querySelector('[data-slot="stepCode"]');
        // 优先 <code> 内容（去掉 fence），否则整段
        const codeBlock = codeEl && codeEl.querySelector('code');
        text = (codeBlock ? codeBlock.textContent : codeEl ? codeEl.textContent : '') || '';
      }
      if (!text) return;
      const finish = function () {
        const old = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = '已复制';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.textContent = old || '复制';
        }, 1200);
      };
      const rt = (window.forge && window.forge.runtime) || null;
      if (rt && rt.copy) {
        Promise.resolve(rt.copy(text)).then(finish, finish);
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(finish, finish);
      } else {
        finish();
      }
    });
  });

  // 缓存 diff 原文：mount 把 diffContent 转成 db-row 结构后，原始 textContent 不再是 diff 文本
  // 这里在 mount 头部就快照一次（diff 分支已先 set innerHTML，所以提前在变量取）
  if (variant === 'diff') {
    const btn = el.querySelector('.cp-copy[data-copy-target="diff"]');
    const diffEl = el.querySelector('[data-slot="diffContent"]');
    if (btn && diffEl) {
      // mount 已经替换 innerHTML 了；从 db-row 反推
      const rows = diffEl.querySelectorAll('.db-row');
      if (rows.length) {
        const lines = [];
        rows.forEach(function (r) {
          const mark = (r.querySelector('.mark')?.textContent || '').trim();
          const code = r.querySelector('.code')?.textContent || '';
          if (r.classList.contains('hunk')) lines.push(code);
          else lines.push((mark || ' ') + code);
        });
        btn.__forgeRaw = lines.join('\n');
      }
    }
  }
}
```

## Sample

```markdown
<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ -42,14 +42,17 @@
  const { data } = useTasks(boardId);
-  const [pending, setPending] = useState(null);
+  const { mutate } = useOptimisticTasks(boardId);
  const [pending, setPending] = useState(null);
<!-- @/slot -->

---

<!-- @use code-block variant=walkthrough -->

<!-- @slot:stepNum -->3<!-- @/slot -->
<!-- @slot:stepLoc -->src/middleware/auth.ts<!-- @/slot -->
<!-- @slot:stepRange -->:14-31<!-- @/slot -->
<!-- @slot:stepHot -->hot<!-- @/slot -->

<!-- @slot:stepBody -->
这是 **信任边界**。`verifyToken` 读取签名的 `fw_sid` cookie，请求 `SessionStore` 解析，要么填充 `req.ctx.session`，要么响应 401。
<!-- @/slot -->

<!-- @slot:stepCode -->
```typescript
export async function verifyToken(req, res, next) {
  const raw = req.signedCookies['fw_sid'];
  if (!raw) return res.status(401).end();
}
```
<!-- @/slot -->
```
