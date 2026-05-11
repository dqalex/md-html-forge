// CommonJS hook：拦截 require('xxx?raw')，返回原始文本作为 default export
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const origResolve = Module._resolveFilename;
const origLoad = Module._load;

const RAW_RE = /\?raw$/;
// 把 'xxx?raw' 处理为 'xxx' 同时打标记，load 时再读文件
const rawPaths = new Set();

Module._resolveFilename = function (request, parent, ...rest) {
  if (RAW_RE.test(request)) {
    const real = request.replace(RAW_RE, '');
    const resolved = origResolve.call(this, real, parent, ...rest);
    rawPaths.add(resolved);
    return resolved;
  }
  return origResolve.call(this, request, parent, ...rest);
};

Module._load = function (request, parent, ...rest) {
  // 解析后的真实路径
  let resolved = request;
  try {
    if (parent) resolved = origResolve.call(Module, request.replace(RAW_RE, ''), parent);
  } catch {}
  if (rawPaths.has(resolved) || RAW_RE.test(request)) {
    const realPath = resolved.replace ? resolved : resolved.toString();
    const text = fs.readFileSync(realPath, 'utf8');
    // 模拟 ESM default 导出
    return { default: text, __esModule: true };
  }
  return origLoad.call(this, request, parent, ...rest);
};
