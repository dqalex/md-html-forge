/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许把 .html / .forge.md 模板作为原始文本通过 import 读取
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    });
    config.module.rules.push({
      test: /\.forge\.md$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    });
    return config;
  },
  // Turbopack 对 *.html?raw 与 *.forge.md?raw 的等价规则
  turbopack: {
    rules: {
      '*.html': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.forge.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
