---
id: list-item
category: list
tags: list-item, ship, carryover, focus, action
trust: builtin
defaultVariant: shipped
---

# 列表项

## Variants

- `shipped` — 发布项：圆点标记 + 标题 + 描述 + 引用编号
- `carryover` — 遗留项：状态标签 + 描述 + 负责人
- `focus` — 评审关注点：编号圆圈 + 标题 + 描述
- `action` — 行动项：复选框 + 头像 + 描述 + 截止日期

## Slots

```yaml
shipTitle:
  label: 标题
  type: text
  placeholder: Bulk task import
  bind: h3
shipDesc:
  label: 描述
  type: content
  placeholder: 一段功能说明
shipRef:
  label: 引用编号（可选）
  type: text
  placeholder: '#4211'
carryTag:
  label: 状态标签
  type: text
  placeholder: In review
carryBody:
  label: 描述
  type: text
  placeholder: Workspace export to CSV — waiting on pagination review.
carryOwner:
  label: 负责人
  type: text
  placeholder: Sam Reyes
focusNum:
  label: 编号
  type: text
  placeholder: '1'
focusTitle:
  label: 关注标题
  type: text
  placeholder: The retry / dead-letter boundary
focusDesc:
  label: 关注描述
  type: content
  placeholder: 'worker.ts:31–44. I catch, check retryCount...'
actionDone:
  label: 完成状态（填 done 标记完成）
  type: text
  placeholder: ''
actionOwner:
  label: 负责人缩写
  type: text
  placeholder: DP
actionDesc:
  label: 行动描述
  type: text
  placeholder: Revert cfg-9a12 and restore pool limit
actionDue:
  label: 截止日期
  type: text
  placeholder: Apr 12
```

## HTML

```html
<div class="comp-list-item" data-section="list-item" data-variant="{{variant}}">
  <!-- variant: shipped -->
  <div class="li-shipped">
    <span class="li-dot"></span>
    <div class="li-body">
      <h3 data-slot="shipTitle"></h3>
      <div class="li-desc" data-slot="shipDesc" data-slot-type="content"></div>
    </div>
    <span class="li-ref" data-slot="shipRef"></span>
  </div>

  <!-- variant: carryover -->
  <div class="li-carryover">
    <span class="li-tag" data-slot="carryTag"></span>
    <div class="li-cbody" data-slot="carryBody"></div>
    <span class="li-owner" data-slot="carryOwner"></span>
  </div>

  <!-- variant: focus -->
  <div class="li-focus">
    <div class="li-fnum" data-slot="focusNum"></div>
    <div class="li-fcontent">
      <div class="li-ftitle" data-slot="focusTitle"></div>
      <div class="li-fdesc" data-slot="focusDesc" data-slot-type="content"></div>
    </div>
  </div>

  <!-- variant: action -->
  <div class="li-action">
    <span class="li-check"></span>
    <span class="li-avatar" data-slot="actionOwner"></span>
    <span class="li-adesc" data-slot="actionDesc"></span>
    <span class="li-due" data-slot="actionDue"></span>
  </div>
</div>
```

## CSS

```css
.comp-list-item {
  background: transparent;
}

/* shipped */
.comp-list-item .li-shipped {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  column-gap: 20px;
  align-items: baseline;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--gray-100);
}
.comp-list-item:last-child .li-shipped {
  border-bottom: none;
}
.comp-list-item .li-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--olive);
  margin-top: 8px;
  align-self: start;
}
.comp-list-item .li-body {
  min-width: 0;
}
.comp-list-item .li-shipped h3 {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--slate);
}
.comp-list-item .li-desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--gray-700);
}
.comp-list-item .li-ref {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  white-space: nowrap;
  padding-top: 4px;
}

/* ===== variant: carryover ===== */
.comp-list-item[data-variant="carryover"] .li-carryover {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 8px 0;
}
.comp-list-item .li-tag {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-700);
  background: var(--ivory);
  border-radius: 4px;
  padding: 3px 7px;
  flex-shrink: 0;
}
.comp-list-item .li-cbody {
  font-size: 14px;
  color: var(--gray-700);
}
.comp-list-item .li-owner {
  color: var(--gray-500);
  font-size: 12px;
}

/* ===== variant: focus ===== */
.comp-list-item[data-variant="focus"] {
  background: var(--white);
  border: 1.5px solid var(--gray-300);
  border-radius: 10px;
  padding: 16px 20px;
}
.comp-list-item[data-variant="focus"] .li-focus {
  display: flex;
  gap: 16px;
}
.comp-list-item .li-fnum {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--white);
  background: var(--clay);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.comp-list-item .li-ftitle {
  font-weight: 600;
  color: var(--slate);
  font-size: 15px;
  margin-bottom: 2px;
}
.comp-list-item .li-fdesc {
  font-size: 13.5px;
  color: var(--gray-500);
}

/* ===== variant: action ===== */
.comp-list-item[data-variant="action"] {
  background: var(--white);
  border: 1.5px solid var(--gray-300);
  border-radius: 10px;
  padding: 14px 18px;
}
.comp-list-item[data-variant="action"] .li-action {
  display: grid;
  grid-template-columns: 36px 36px 1fr 96px;
  align-items: center;
  gap: 14px;
}
.comp-list-item .li-check {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--gray-300);
  border-radius: 5px;
  background: var(--white);
  position: relative;
}
.comp-list-item .li-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--oat);
  color: var(--gray-700);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.02em;
}
.comp-list-item .li-adesc {
  font-size: 14px;
  color: var(--slate);
}
.comp-list-item .li-due {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
  text-align: right;
}

/* action done state */
.comp-list-item.done .li-check {
  background: var(--olive);
  border-color: var(--olive);
}
.comp-list-item.done .li-check::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid var(--white);
  border-width: 0 2px 2px 0;
  transform: rotate(40deg);
}
.comp-list-item.done .li-adesc {
  color: var(--gray-500);
  text-decoration: line-through;
  text-decoration-color: var(--gray-300);
}
```

## JS

```js
export function mount(el, api) {
  const variant = el.getAttribute('data-variant');

  if (variant === 'action') {
    const doneSlot = el.querySelector('[data-slot="actionDone"]');
    const isDone = doneSlot && (doneSlot.textContent || '').trim().toLowerCase() === 'done';
    if (isDone) {
      el.classList.add('done');
    }
  }

  if (variant === 'carryover') {
    // Move owner into body with prefix
    const bodyEl = el.querySelector('[data-slot="carryBody"]');
    const ownerEl = el.querySelector('[data-slot="carryOwner"]');
    if (bodyEl && ownerEl && ownerEl.textContent && ownerEl.textContent.trim()) {
      bodyEl.innerHTML = bodyEl.textContent + ' <span class="li-owner">· ' + ownerEl.textContent.trim() + '</span>';
      ownerEl.style.display = 'none';
    }
  }
}
```

## Sample

```markdown
<!-- @use list-item variant=shipped -->

### Bulk task import

CSV and JSON uploads now land straight into a board with column mapping.

<!-- @slot:shipRef -->#4211<!-- @/slot -->

---

<!-- @use list-item variant=carryover -->

<!-- @slot:carryTag -->In review<!-- @/slot -->
<!-- @slot:carryBody -->Workspace export to CSV — waiting on pagination review.<!-- @/slot -->
<!-- @slot:carryOwner -->Sam Reyes<!-- @/slot -->

---

<!-- @use list-item variant=focus -->

<!-- @slot:focusNum -->1<!-- @/slot -->
<!-- @slot:focusTitle -->The retry / dead-letter boundary<!-- @/slot -->
<!-- @slot:focusDesc --><code>worker.ts:31–44</code>. I catch, check <code>retryCount</code>, and either park or rethrow.<!-- @/slot -->

---

<!-- @use list-item variant=action -->

<!-- @slot:actionDone -->done<!-- @/slot -->
<!-- @slot:actionOwner -->DP<!-- @/slot -->
<!-- @slot:actionDesc -->Revert cfg-9a12 and restore pool limit to 64<!-- @/slot -->
<!-- @slot:actionDue -->Apr 12<!-- @/slot -->
```
