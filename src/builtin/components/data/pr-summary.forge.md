---
id: pr-summary
category: data
tags: pr, review, summary, diff, files
trust: builtin
defaultVariant: standard
---

# PR 概览

## Variants

- `standard` — PR 总览：仓库标识 / 标题 / 作者 / 分支 / diff stats
- `keyfiles` — 关键文件路径 + 描述面板

## Slots

```yaml
prRepo:
  label: 仓库标识
  type: text
  placeholder: birchline/web · Pull Request #247
prTitle:
  label: PR 标题
  type: text
  placeholder: Add optimistic updates to task list mutations
  bind: h1
prAuthor:
  label: 作者
  type: text
  placeholder: Mira Okafor
prAuthorSub:
  label: 作者说明（可选）
  type: text
  placeholder: opened 2 days ago
prAuthorInitials:
  label: 头像缩写（可选）
  type: text
  placeholder: MO
prBranch:
  label: 分支方向
  type: text
  placeholder: mo/optimistic-tasks → main
prAdded:
  label: 新增行数
  type: text
  placeholder: +142
prDeleted:
  label: 删除行数
  type: text
  placeholder: −38
prFiles:
  label: 变更文件数（可选）
  type: text
  placeholder: 6 files changed
keyFilesHeading:
  label: 面板标题
  type: text
  placeholder: Key files
  bind: h3
keyFiles:
  label: 文件列表（每条以路径开头）
  type: content
  placeholder: |
    - **src/middleware/auth.ts** — 请求认证的唯一入口
    - **src/lib/sessionStore.ts** — LRU + Postgres 会话查找
```

## HTML

```html
<div class="comp-pr-summary" data-section="pr-summary" data-variant="{{variant}}">
  <!-- variant: standard -->
  <div class="ps-standard">
    <div class="ps-repo" data-slot="prRepo"></div>
    <h1 data-slot="prTitle"></h1>
    <div class="ps-meta">
      <div class="ps-author">
        <div class="ps-avatar" data-slot="prAuthorInitials"></div>
        <div>
          <div class="ps-author-name" data-slot="prAuthor"></div>
          <div class="ps-author-sub" data-slot="prAuthorSub"></div>
        </div>
      </div>
      <div class="ps-branch" data-slot="prBranch"></div>
      <div class="ps-stat">
        <span class="add" data-slot="prAdded"></span>
        <span class="sep">/</span>
        <span class="del" data-slot="prDeleted"></span>
        <span class="files" data-slot="prFiles"></span>
      </div>
    </div>
  </div>

  <!-- variant: keyfiles -->
  <div class="ps-keyfiles">
    <h3 data-slot="keyFilesHeading"></h3>
    <div data-slot="keyFiles" data-slot-type="content"></div>
  </div>
</div>
```

## CSS

```css
.comp-pr-summary {
  background: transparent;
}

/* ===== variant: standard ===== */
.comp-pr-summary[data-variant="standard"] .ps-standard {
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 28px 32px;
  background: var(--white);
  margin-bottom: 36px;
}
.comp-pr-summary[data-variant="standard"] .ps-repo {
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--gray-500);
  letter-spacing: 0.01em;
  margin-bottom: 10px;
}
.comp-pr-summary[data-variant="standard"] h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 30px;
  line-height: 1.25;
  color: var(--slate);
  margin-bottom: 18px;
}
.comp-pr-summary[data-variant="standard"] .ps-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.comp-pr-summary[data-variant="standard"] .ps-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.comp-pr-summary[data-variant="standard"] .ps-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--oat);
  color: var(--slate);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
  border: var(--border);
}
.comp-pr-summary[data-variant="standard"] .ps-author-name {
  font-weight: 500;
  color: var(--slate);
}
.comp-pr-summary[data-variant="standard"] .ps-author-sub {
  font-size: 12px;
  color: var(--gray-500);
}
.comp-pr-summary[data-variant="standard"] .ps-branch {
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--gray-700);
  background: var(--gray-100);
  border: var(--border);
  border-radius: 8px;
  padding: 6px 10px;
}
.comp-pr-summary[data-variant="standard"] .ps-stat {
  font-family: var(--mono);
  font-size: 13px;
}
.comp-pr-summary[data-variant="standard"] .ps-stat .add {
  color: var(--olive);
  font-weight: 600;
}
.comp-pr-summary[data-variant="standard"] .ps-stat .del {
  color: var(--rust);
  font-weight: 600;
}
.comp-pr-summary[data-variant="standard"] .ps-stat .sep {
  color: var(--gray-500);
  margin: 0 6px;
}
.comp-pr-summary[data-variant="standard"] .ps-stat .files {
  color: var(--gray-500);
  margin-left: 10px;
}

/* ===== variant: keyfiles ===== */
.comp-pr-summary[data-variant="keyfiles"] .ps-keyfiles {
  border: var(--border);
  border-radius: var(--radius-panel);
  background: var(--white);
  padding: 18px 20px;
}
.comp-pr-summary[data-variant="keyfiles"] h3 {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gray-500);
  margin-bottom: 12px;
}
.comp-pr-summary[data-variant="keyfiles"] ul {
  list-style: none;
  padding: 0;
}
.comp-pr-summary[data-variant="keyfiles"] li {
  margin-bottom: 12px;
}
.comp-pr-summary[data-variant="keyfiles"] li:last-child {
  margin-bottom: 0;
}
.comp-pr-summary[data-variant="keyfiles"] strong {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--slate);
  display: block;
  margin-bottom: 2px;
  word-break: break-all;
  font-weight: 500;
}
.comp-pr-summary[data-variant="keyfiles"] li p,
.comp-pr-summary[data-variant="keyfiles"] li:not(:has(strong)) {
  font-size: 12.5px;
  color: var(--gray-500);
  line-height: 1.45;
}


```

## JS

```js
export function mount(el, api) {
  const variant = el.getAttribute('data-variant');

  // 判断 slot 是否真正有用户填充值（占位元素永远在 DOM 里，textContent 才是真相）
  const has = (slotEl) => !!(slotEl && (slotEl.textContent || '').trim());

  if (variant === 'standard') {
    const authorEl = el.querySelector('[data-slot="prAuthor"]');
    const authorSubEl = el.querySelector('[data-slot="prAuthorSub"]');
    const avatarEl = el.querySelector('[data-slot="prAuthorInitials"]');
    const authorWrap = el.querySelector('.ps-author');

    if (!has(authorEl) && !has(authorSubEl) && !has(avatarEl)) {
      authorWrap?.remove();
    } else if (!has(avatarEl)) {
      avatarEl?.remove();
    }

    const branchEl = el.querySelector('[data-slot="prBranch"]');
    if (!has(branchEl)) {
      el.querySelector('.ps-branch')?.remove();
    }

    const addedEl = el.querySelector('[data-slot="prAdded"]');
    const deletedEl = el.querySelector('[data-slot="prDeleted"]');
    const filesEl = el.querySelector('[data-slot="prFiles"]');
    const statWrap = el.querySelector('.ps-stat');

    if (!has(addedEl) && !has(deletedEl) && !has(filesEl)) {
      statWrap?.remove();
    } else {
      const sep = statWrap?.querySelector('.sep');
      if (!has(addedEl) || !has(deletedEl)) {
        sep?.remove();
      }
      if (!has(addedEl)) addedEl?.remove();
      if (!has(deletedEl)) deletedEl?.remove();
      if (!has(filesEl)) filesEl?.remove();
    }
  }
}
```

## Sample

```markdown
<!-- @use pr-summary variant=standard -->

<!-- @slot:prRepo -->birchline/web · Pull Request #247<!-- @/slot -->
<!-- @slot:prTitle -->Add optimistic updates to task list mutations<!-- @/slot -->
<!-- @slot:prAuthor -->Mira Okafor<!-- @/slot -->
<!-- @slot:prAuthorSub -->opened 2 days ago<!-- @/slot -->
<!-- @slot:prAuthorInitials -->MO<!-- @/slot -->
<!-- @slot:prBranch -->mo/optimistic-tasks → main<!-- @/slot -->
<!-- @slot:prAdded -->+142<!-- @/slot -->
<!-- @slot:prDeleted -->−38<!-- @/slot -->
<!-- @slot:prFiles -->6 files changed<!-- @/slot -->

---

<!-- @use pr-summary variant=keyfiles -->

<!-- @slot:keyFilesHeading -->Key files<!-- @/slot -->

<!-- @slot:keyFiles -->
- **src/middleware/auth.ts** — 请求认证的唯一入口
- **src/lib/sessionStore.ts** — LRU + Postgres 会话查找
- **src/server/routes/session.ts** — 返回当前 session 给客户端
- **src/app/providers/AuthProvider.tsx** — 客户端镜像服务端 session 的上下文
<!-- @/slot -->
```
