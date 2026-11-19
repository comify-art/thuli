import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

function resolveSpecifier(fileDir, spec) {
  if (!spec.startsWith('.')) return spec;
  if (spec.endsWith('.js') || spec.endsWith('.css') || spec.endsWith('.json')) return spec;
  const target = path.resolve(fileDir, spec);
  if (fs.existsSync(`${target}.js`)) return `${spec}.js`;
  if (fs.existsSync(path.join(target, 'index.js'))) return `${spec}/index.js`;
  return spec;
}

for (const file of walk(distDir)) {
  const fileDir = path.dirname(file);
  const src = fs.readFileSync(file, 'utf8');
  const next = src.replace(
    /(\b(?:import|export)\b[\s\S]*?\bfrom\s*['"])(\.[^'"]+)(['"])/g,
    (_, prefix, spec, suffix) => `${prefix}${resolveSpecifier(fileDir, spec)}${suffix}`
  ).replace(
    /(\bimport\s*\(\s*['"])(\.[^'"]+)(['"]\s*\))/g,
    (_, prefix, spec, suffix) => `${prefix}${resolveSpecifier(fileDir, spec)}${suffix}`
  );
  if (next !== src) {
    fs.writeFileSync(file, next, 'utf8');
  }
}
