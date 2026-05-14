import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

/**
 * tsup 构建配置 — md-html-forge 核心库
 *
 * 产物：
 *   dist/index.js / .mjs   — ESM+CJS 主入口（无 React 依赖）
 *   dist/icons.js / .mjs   — 图标渲染子路径（需要 react + lucide-react）
 *   dist/index.d.ts        — 类型声明
 *
 * 核心策略：
 *   - .forge.md 文件在 pre-build 阶段由 scripts/build-forge-md.ts 预编译为 .ts 模块
 *   - React / lucide-react 作为 peerDependency，不打包进产物
 *   - 主入口不含 React 依赖，图标渲染拆至 icons 子路径
 */

export default defineConfig([
  // 主入口 — 无 React 依赖
  {
    entry: {
      index: 'src/lib/index.ts',
    },
    format: ['esm', 'cjs'],
    target: 'es2022',
    platform: 'neutral',
    outDir: 'dist',
    clean: true,
    splitting: false,

    dts: {
      resolve: true,
      compilerOptions: {
        paths: {
          '@/*': ['./src/*'],
        },
        incremental: false,
        composite: false,
      },
    },

    external: [
      'react',
      'react-dom',
      'react-dom/server',
      'lucide-react',
      'next',
      'next/*',
    ],

    define: {
      'process.env.NODE_ENV': '"production"',
    },

    minify: false,
    sourcemap: true,

    esbuildOptions(options) {
      options.banner = {
        js: '// md-html-forge — Markdown → styled HTML rendering engine',
      };
    },
  },

  // 图标子路径 — 需要 React + lucide-react
  {
    entry: {
      icons: 'src/lib/icons.ts',
    },
    format: ['esm', 'cjs'],
    target: 'es2022',
    platform: 'neutral',
    outDir: 'dist',
    splitting: false,

    dts: {
      resolve: true,
      compilerOptions: {
        paths: {
          '@/*': ['./src/*'],
        },
        incremental: false,
        composite: false,
      },
    },

    external: [
      'react',
      'react-dom',
      'react-dom/server',
      'lucide-react',
      'next',
      'next/*',
    ],

    define: {
      'process.env.NODE_ENV': '"production"',
    },

    minify: false,
    sourcemap: true,

    esbuildOptions(options) {
      options.banner = {
        js: '// md-html-forge/icons — Icon rendering (requires react + lucide-react)',
      };
    },

    async onSuccess() {
      // 复制 README 和 LICENSE 到 dist
      const root = process.cwd();
      for (const file of ['README.md', 'LICENSE']) {
        const src = path.join(root, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(root, 'dist', file));
        }
      }
    },
  },
]);
