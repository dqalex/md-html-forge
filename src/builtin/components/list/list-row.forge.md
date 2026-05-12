---
id: list-row
category: list
tags: list-row, pr, file, diff, entry
trust: builtin
defaultVariant: pr
---

# 列表行

## Variants

- `pr` — PR 表格行：编号 + 标题 + 作者 + 风险等级
- `file` — 变更文件行：路径 + 风险标签 + 增删统计
- `entry` — 可折叠文件条目：路径 + 徽章 + diff 统计 + 变更原因 + 代码

## Slots

```yaml
shippedPr:
  label: PR 编号
  type: text
  placeholder: '#4871'
shippedTitle:
  label: PR 标题
  type: text
  placeholder: 'Bulk edit toolbar: selection model'
shippedAuthor:
  label: 作者
  type: text
  placeholder: Mira Okafor
shippedRisk:
  label: 风险等级
  type: text
  placeholder: Low
filePath:
  label: 文件路径
  type: text
  placeholder: src/hooks/useOptimisticTasks.ts
fileRisk:
  label: 风险等级
  type: text
  placeholder: attention
fileRiskLabel:
  label: 风险标签文字（可选）
  type: text
  placeholder: needs attention
fileAdded:
  label: 新增行数
  type: text
  placeholder: '+58'
fileDeleted:
  label: 删除行数
  type: text
  placeholder: '−0'
entryPath:
  label: 文件路径
  type: text
  placeholder: packages/notify/src/worker.ts
entryBadge:
  label: 变更类型（new/mod/del）
  type: text
  placeholder: new
entryStats:
  label: Diff 统计
  type: text
  placeholder: '+126'
entryWhy:
  label: 变更原因
  type: content
  placeholder: The heart of the PR. A pg-boss subscriber...
entryCode:
  label: 代码片段
  type: content
  placeholder: boss.work(...)
```

## HTML

```html
<div class="comp-list-row" data-section="list-row" data-variant="{{variant}}">
  <!-- variant: pr -->
  <div class="lr-pr">
    <span class="lr-prnum" data-slot="shippedPr"></span>
    <span class="lr-prtitle" data-slot="shippedTitle"></span>
    <span class="lr-prauthor" data-slot="shippedAuthor"></span>
    <span class="lr-prrisk" data-slot="shippedRisk"></span>
  </div>

  <!-- variant: file -->
  <div class="lr-file">
    <span class="lr-fpath" data-slot="filePath"></span>
    <div class="lr-fright">
      <span class="lr-frisk" data-slot="fileRisk"></span>
      <span data-slot="fileRiskLabel" hidden></span>
      <span class="lr-fdelta" data-slot="fileAdded"></span>
      <span class="lr-fdeleted" data-slot="fileDeleted" hidden></span>
    </div>
  </div>

  <!-- variant: entry -->
  <details class="lr-entry">
    <summary>
      <span class="lr-epath" data-slot="entryPath"></span>
      <span class="lr-ebadge" data-slot="entryBadge"></span>
      <span class="lr-estats" data-slot="entryStats"></span>
    </summary>
    <div class="lr-ebody">
      <div class="lr-ewhy" data-slot="entryWhy" data-slot-type="content"></div>
      <div data-slot="entryCode" data-slot-type="content"></div>
    </div>
  </details>
</div>
```

## CSS

```css
.comp-list-row {
  background: transparent;
}

/* ===== variant: pr ===== */
.comp-list-row .lr-pr {
  display: grid;
  grid-template-columns: 80px 1fr 140px 100px;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--gray-100);
}
.comp-list-row:last-child .lr-pr {
  border-bottom: none;
}
.comp-list-row .lr-prnum {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--clay);
}
.comp-list-row .lr-prnum a {
  color: var(--clay);
  text-decoration: none;
  border-bottom: 1px dotted transparent;
}
.comp-list-row .lr-prnum a:hover {
  border-bottom-color: var(--clay);
}
.comp-list-row .lr-prtitle {
  font-size: 14px;
  color: var(--slate);
}
.comp-list-row .lr-prauthor {
  color: var(--gray-700);
  font-size: 13px;
}
.comp-list-row .lr-prrisk {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--gray-500);
}
.comp-list-row .lr-prrisk::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.comp-list-row .lr-prrisk.low::before { background: var(--olive); }
.comp-list-row .lr-prrisk.med::before { background: var(--clay); }
.comp-list-row .lr-prrisk.high::before { background: var(--rust); }

/* ===== variant: file ===== */
.comp-list-row[data-variant="file"] .lr-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1.5px solid var(--gray-100);
}
.comp-list-row .lr-fpath {
  font-family: var(--mono);
  font-size: 13.5px;
  color: var(--slate);
}
.comp-list-row .lr-fright {
  display: flex;
  align-items: center;
  gap: 12px;
}
.comp-list-row .lr-frisk {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.comp-list-row .lr-frisk.safe {
  background: color-mix(in srgb, var(--olive) 15%, transparent);
  color: var(--olive);
}
.comp-list-row .lr-frisk.medium {
  background: var(--oat);
  color: var(--gray-700);
}
.comp-list-row .lr-frisk.attention {
  background: color-mix(in srgb, var(--clay) 15%, transparent);
  color: var(--clay);
}
.comp-list-row .lr-fdelta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
}

/* ===== variant: entry ===== */
.comp-list-row[data-variant="entry"] .lr-entry {
  display: block;
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-panel);
  background: var(--white);
  overflow: hidden;
  margin: 0;
}
.comp-list-row .lr-entry summary {
  list-style: none;
  cursor: pointer;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--gray-100);
  border-bottom: 1.5px solid var(--gray-300);
}
.comp-list-row .lr-entry:not([open]) summary {
  border-bottom: none;
}
.comp-list-row .lr-entry summary::-webkit-details-marker {
  display: none;
}
.comp-list-row .lr-entry summary::before {
  content: "\25B8";
  color: var(--gray-500);
  font-size: 12px;
  transition: transform 120ms;
  flex-shrink: 0;
}
.comp-list-row .lr-entry[open] > summary::before {
  transform: rotate(90deg);
}
.comp-list-row .lr-epath {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--slate);
  flex: 1;
}
.comp-list-row .lr-ebadge {
  font-family: var(--mono);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.comp-list-row .lr-ebadge.new {
  background: var(--gray-100);
  color: var(--olive);
}
.comp-list-row .lr-ebadge.mod {
  background: var(--oat);
  color: var(--slate);
}
.comp-list-row .lr-ebadge.del {
  background: var(--gray-100);
  color: var(--clay);
}
.comp-list-row .lr-estats {
  font-family: var(--mono);
  font-size: 12px;
}
.comp-list-row .lr-ebody {
  padding: 18px 20px 22px;
}
.comp-list-row .lr-ewhy {
  font-size: 14.5px;
  margin-bottom: 14px;
  max-width: 680px;
}
.comp-list-row .lr-ewhy strong {
  color: var(--slate);
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-list-row').forEach(function(el) {
  var variant = el.getAttribute('data-variant');
  var esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  if (variant === 'pr') {
    var riskEl = el.querySelector('[data-slot="shippedRisk"]');
    if (riskEl) {
      var risk = (riskEl.textContent || '').trim().toLowerCase();
      var riskClass = risk === 'high' ? 'high' : risk === 'med' ? 'med' : 'low';
      riskEl.classList.add(riskClass);
    }

    var prEl = el.querySelector('[data-slot="shippedPr"]');
    if (prEl) {
      var num = (prEl.textContent || '').trim();
      if (num) {
        prEl.innerHTML = `<a href="#">${esc(num)}</a>`;
      }
    }
  }

  if (variant === 'file') {
    var riskEl = el.querySelector('[data-slot="fileRisk"]');
    var riskLabelEl = el.querySelector('[data-slot="fileRiskLabel"]');
    if (riskEl) {
      var risk = (riskEl.textContent || '').trim().toLowerCase();
      var valid = ['safe', 'medium', 'attention'];
      if (valid.includes(risk)) {
        riskEl.classList.add(risk);
      }
      if (riskLabelEl && riskLabelEl.textContent && riskLabelEl.textContent.trim()) {
        riskEl.textContent = riskLabelEl.textContent.trim();
        riskLabelEl.style.display = 'none';
      }
    }

    var addedEl = el.querySelector('[data-slot="fileAdded"]');
    var deletedEl = el.querySelector('[data-slot="fileDeleted"]');
    var addedTxt = ((addedEl && addedEl.textContent) || '').trim();
    var deletedTxt = ((deletedEl && deletedEl.textContent) || '').trim();
    if (addedTxt || deletedTxt) {
      var html = '';
      if (addedTxt) html += `<span class="add">${esc(addedTxt)}</span>`;
      if (addedTxt && deletedTxt) html += ' ';
      if (deletedTxt) html += `<span class="del">${esc(deletedTxt)}</span>`;
      var deltaEl = el.querySelector('.lr-fdelta');
      if (deltaEl) deltaEl.innerHTML = html;
    }
  }

  if (variant === 'entry') {
    var badgeEl = el.querySelector('[data-slot="entryBadge"]');
    if (badgeEl) {
      var badge = (badgeEl.textContent || '').trim().toLowerCase();
      var cls = badge === 'new' ? 'new' : badge === 'del' ? 'del' : 'mod';
      badgeEl.classList.add(cls);
    }
  }
  });
})();
```

## Sample

```markdown
<!-- @use list-row variant=pr -->

<!-- @slot:shippedPr -->#4871<!-- @/slot -->
<!-- @slot:shippedTitle -->Bulk edit toolbar: selection model + keyboard shortcuts<!-- @/slot -->
<!-- @slot:shippedAuthor -->Mira Okafor<!-- @/slot -->
<!-- @slot:shippedRisk -->Med<!-- @/slot -->

---

<!-- @use list-row variant=file -->

<!-- @slot:filePath -->src/hooks/useOptimisticTasks.ts<!-- @/slot -->
<!-- @slot:fileRisk -->attention<!-- @/slot -->
<!-- @slot:fileRiskLabel -->needs attention<!-- @/slot -->
<!-- @slot:fileAdded -->+58<!-- @/slot -->
<!-- @slot:fileDeleted -->−0<!-- @/slot -->

---

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->packages/notify/src/worker.ts<!-- @/slot -->
<!-- @slot:entryBadge -->new<!-- @/slot -->
<!-- @slot:entryStats -->+126<!-- @/slot -->

<!-- @slot:entryWhy -->
**The heart of the PR.** A `pg-boss` subscriber that pulls `notify.deliver` jobs.
<!-- @/slot -->

<!-- @slot:entryCode -->
<pre>boss.work('notify.deliver', { batchSize: 20 }, async (jobs) => { ... });</pre>
<!-- @/slot -->
```
