#!/usr/bin/env npx tsx
/**
 * build-forge-md.ts — 预编译 .forge.md 文件为 .ts 模块
 *
 * 问题：tsup/esbuild 不支持 `?raw` 查询参数导入。
 * 解决：构建前扫描所有 .forge.md 文件，为每个文件生成一个 .ts 模块，
 *       将原始文本作为 `export default` 字符串导出。
 *
 * 同时修改 forge-registry.ts，把 `import xxx from './xxx.forge.md?raw'`
 * 替换为 `import xxx from './xxx.forge.md.generated'`。
 *
 * 用法：node --import tsx scripts/build-forge-md.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// __dirname 等价：tsx 环境下 import.meta.dirname 可能不准确
const SCRIPT_DIR = path.dirname(process.argv[1] ? path.resolve(process.argv[1]) : __filename);
const ROOT = path.resolve(SCRIPT_DIR, '..');
const SRC_DIR = path.join(ROOT, 'src');
const FORGE_REGISTRY_PATH = path.join(SRC_DIR, 'builtin', 'components', 'forge-registry.ts');

// 扫描所有 .forge.md 文件
function findForgeMdFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findForgeMdFiles(full));
    } else if (entry.name.endsWith('.forge.md')) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const files = findForgeMdFiles(SRC_DIR);
  console.log(`[build-forge-md] Found ${files.length} .forge.md files`);

  const generatedFiles: string[] = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(SRC_DIR, filePath);

    // 生成 .ts 文件路径：xxx.forge.md → xxx.forge.md.generated.ts
    const tsPath = filePath + '.generated.ts';

    // 将内容转义为 JS 字符串
    const escaped = content
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    const tsContent = `// Auto-generated from ${relativePath} — DO NOT EDIT\nexport default \`${escaped}\`;\n`;
    fs.writeFileSync(tsPath, tsContent, 'utf-8');

    generatedFiles.push(tsPath);
    console.log(`  Generated: ${path.relative(ROOT, tsPath)}`);
  }

  // 修改 forge-registry.ts 中的导入
  if (fs.existsSync(FORGE_REGISTRY_PATH)) {
    let registryContent = fs.readFileSync(FORGE_REGISTRY_PATH, 'utf-8');

    // 替换 ?raw 导入为 .generated 导入
    // import xxx from './yyy.forge.md?raw' → import xxx from './yyy.forge.md.generated'
    const originalContent = registryContent;
    registryContent = registryContent.replace(
      /from\s+['"](.+\.forge\.md)\?raw['"]/g,
      "from '$1.generated'",
    );

    if (registryContent !== originalContent) {
      fs.writeFileSync(FORGE_REGISTRY_PATH, registryContent, 'utf-8');
      console.log(`  Updated: ${path.relative(ROOT, FORGE_REGISTRY_PATH)} (imports rewritten)`);
    } else {
      console.log(`  No changes needed: ${path.relative(ROOT, FORGE_REGISTRY_PATH)}`);
    }
  }

  // 同样处理其他可能的 .html?raw 导入
  const htmlRawImports: string[] = [];
  function scanForHtmlRaw(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
        scanForHtmlRaw(full);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(full, 'utf-8');
        if (content.includes('.html?raw') || content.includes(".html?raw'")) {
          htmlRawImports.push(full);
        }
      }
    }
  }
  scanForHtmlRaw(SRC_DIR);

  for (const tsFile of htmlRawImports) {
    let content = fs.readFileSync(tsFile, 'utf-8');
    const original = content;

    // 查找所有 .html?raw 导入并生成 .generated.ts
    const importRe = /import\s+(\w+)\s+from\s+['"](.+\.html)\?raw['"]/g;
    let match;
    while ((match = importRe.exec(original)) !== null) {
      const varName = match[1];
      const htmlRelPath = match[2];

      // 计算绝对路径（基于 ts 文件位置）
      const tsDir = path.dirname(tsFile);
      const htmlAbsPath = path.resolve(tsDir, htmlRelPath);

      if (fs.existsSync(htmlAbsPath)) {
        const htmlContent = fs.readFileSync(htmlAbsPath, 'utf-8');
        const genPath = htmlAbsPath + '.generated.ts';
        const escaped = htmlContent
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$/g, '\\$');

        fs.writeFileSync(genPath, `// Auto-generated — DO NOT EDIT\nexport default \`${escaped}\`;\n`, 'utf-8');
        generatedFiles.push(genPath);
        console.log(`  Generated: ${path.relative(ROOT, genPath)}`);
      }
    }

    // 替换导入
    content = content.replace(
      /from\s+['"](.+\.html)\?raw['"]/g,
      "from '$1.generated'",
    );

    if (content !== original) {
      fs.writeFileSync(tsFile, content, 'utf-8');
      console.log(`  Updated: ${path.relative(ROOT, tsFile)} (html imports rewritten)`);
    }
  }

  // 写入清单文件，供清理脚本使用
  const manifestPath = path.join(ROOT, '.forge-md-generated.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generatedFiles: generatedFiles.map(f => path.relative(ROOT, f)),
    timestamp: new Date().toISOString(),
  }, null, 2), 'utf-8');

  console.log(`\n[build-forge-md] Done! Manifest: ${path.relative(ROOT, manifestPath)}`);
}

main();
