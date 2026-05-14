#!/usr/bin/env npx tsx
/**
 * clean-forge-md.ts — 清理 build-forge-md.ts 生成的临时文件
 *
 * 还原 forge-registry.ts 中的 ?raw 导入，删除 .generated.ts 文件。
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const SCRIPT_DIR = path.dirname(process.argv[1] ? path.resolve(process.argv[1]) : __filename);
const ROOT = path.resolve(SCRIPT_DIR, '..');
const MANIFEST_PATH = path.join(ROOT, '.forge-md-generated.json');
const FORGE_REGISTRY_PATH = path.join(ROOT, 'src', 'builtin', 'components', 'forge-registry.ts');

function main() {
  // 读取清单
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log('[clean-forge-md] No manifest found, nothing to clean.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

  // 删除生成的 .ts 文件
  for (const relPath of manifest.generatedFiles) {
    const absPath = path.join(ROOT, relPath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
      console.log(`  Deleted: ${relPath}`);
    }
  }

  // 还原 forge-registry.ts
  if (fs.existsSync(FORGE_REGISTRY_PATH)) {
    let content = fs.readFileSync(FORGE_REGISTRY_PATH, 'utf-8');
    content = content.replace(
      /from\s+['"](.+\.forge\.md)\.generated['"]/g,
      "from '$1?raw'",
    );
    content = content.replace(
      /from\s+['"](.+\.html)\.generated['"]/g,
      "from '$1?raw'",
    );
    fs.writeFileSync(FORGE_REGISTRY_PATH, content, 'utf-8');
    console.log(`  Restored: src/builtin/components/forge-registry.ts`);
  }

  // 同样还原其他文件中的 .html.generated
  const srcDir = path.join(ROOT, 'src');
  function restoreHtmlImports(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
        restoreHtmlImports(full);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        let content = fs.readFileSync(full, 'utf-8');
        const original = content;
        content = content.replace(
          /from\s+['"](.+\.html)\.generated['"]/g,
          "from '$1?raw'",
        );
        if (content !== original) {
          fs.writeFileSync(full, content, 'utf-8');
          console.log(`  Restored: ${path.relative(ROOT, full)}`);
        }
      }
    }
  }
  restoreHtmlImports(srcDir);

  // 删除清单
  fs.unlinkSync(MANIFEST_PATH);
  console.log('\n[clean-forge-md] Done!');
}

main();
