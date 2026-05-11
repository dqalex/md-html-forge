# 技术债文档中心

> 本目录记录项目中已知的、暂时不解决但需要持续追踪的技术问题。

## 文档清单

| 文件 | 说明 |
|---|---|
| [`unimplemented-components.md`](./unimplemented-components.md) | 模板中引用但尚未实现的组件清单 |
| [`compiler-known-limitations.md`](./compiler-known-limitations.md) | 编译器已知限制（@item / 跨段绑定等） |

## 处理原则

1. **永不丢失**：所有进过技术债清单的项必须标注"为什么不修"和"什么场景需要修"
2. **明确兜底**：暂时不修的能力，必须给用户一条可走的替代路径（用 MD/已有组件兜底）
3. **回归验证**：清单中任何一项被修复后，必须从此文件移除条目，并更新 `docs/engine/syntax.md` 中对应的"暂不支持"标注
