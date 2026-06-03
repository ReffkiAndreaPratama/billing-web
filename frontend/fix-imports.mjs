import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, 'src', 'app');

function findPageFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findPageFiles(full));
    else if (entry.name === 'page.tsx') results.push(full);
  }
  return results;
}

function getCorrectModule(file) {
  const name = file.replace(/\\/g, '/');
  if (name.endsWith('/src/app/page.tsx')) return 'next/navigation';
  if (name.includes('/agents/page.tsx') || name.includes('/inventory/page.tsx') || name.includes('/shifts/page.tsx')) return '@/lib/utils';
  return 'lucide-react';
}

const files = findPageFiles(root);
let fixed = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const orig = content;
  const mod = getCorrectModule(file);

  // Remove orphaned "export '" lines (broken regex artifact)
  content = content.replace(/^export '\n?/gm, '');

  // Fix pattern: from 'from ''  (corrupted module name "from " with orphaned trailing quote)
  content = content.replace(/from 'from ''/g, `from '${mod}'`);

  // Fix pattern: from ''  (empty module name, no orphaned quote)
  content = content.replace(/from ''/g, `from '${mod}'`);

  if (content !== orig) {
    writeFileSync(file, content, 'utf-8');
    console.log(`Fixed: ${file.replace(root, '').replace(/\\/g, '/')} => ${mod}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files`);
