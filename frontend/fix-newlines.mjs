import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, 'src', 'app');

const files = [];
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name === 'page.tsx') files.push(f);
  }
}
walk(root);

function fix(content) {
  const orig = content;

  // Fix return( -> return (
  content = content.replace(/return\(/g, 'return (');

  // return followed by declaration/keyword (early return with collapsed body)
  content = content.replace(/\breturn\s+const\b/g, 'return\nconst');
  content = content.replace(/\breturn\s+let\b/g, 'return\nlet');
  content = content.replace(/\breturn\s+var\b/g, 'return\nvar');
  content = content.replace(/\breturn\s+try\b/g, 'return\ntry');
  content = content.replace(/\breturn\s+if\b/g, 'return\nif');
  content = content.replace(/\breturn\s+for\b/g, 'return\nfor');
  content = content.replace(/\breturn\s+while\b/g, 'return\nwhile');

  // else without newline/semicolon before it
  content = content.replace(/\)\s+else\b/g, ')\nelse');
  content = content.replace(/\}\s+else\b/g, '}\nelse');
  content = content.replace(/;\s+else\b/g, ';\nelse');

  // Newline after { before statement keywords
  const stmtKw = ['const', 'let', 'var', 'function', 'if', 'for', 'while', 'switch', 'try', 'return', 'async'];
  for (const kw of stmtKw) {
    content = content.replace(new RegExp('\\{\\s+' + kw + '\\b', 'g'), '{\n' + kw);
  }

  // Newline after } before statement keywords
  for (const kw of stmtKw) {
    content = content.replace(new RegExp('\\}\\s+' + kw + '\\b', 'g'), '}\n' + kw);
  }

  // Newline after ) before statement keywords
  for (const kw of stmtKw) {
    content = content.replace(new RegExp('\\)\\s+' + kw + '\\b', 'g'), ')\n' + kw);
  }

  // Newline after ) before function calls (any word followed by ()
  content = content.replace(/\)\s+([a-zA-Z]\w*)\s*\(/g, ')\n$1(');

  // Newline after } before function calls
  content = content.replace(/\}\s+([a-zA-Z]\w*)\s*\(/g, '}\n$1(');

  // Newline after ; before statements
  for (const kw of stmtKw) {
    content = content.replace(new RegExp(';\\s+' + kw + '\\b', 'g'), ';\n' + kw);
  }
  content = content.replace(/;\s+([a-zA-Z]\w*)\s*\(/g, ';\n$1(');
  content = content.replace(/;\s+([a-zA-Z]\w*)\s*\.\s*(\w+)\s*=/g, ';\n$1.$2 =');

  // Newline after ) or ] followed by }
  content = content.replace(/\)\s+}/g, ')\n}');
  content = content.replace(/\]\s+}/g, ']\n}');

  // Newline before catch
  content = content.replace(/\}\s+catch/g, '}\ncatch');

  // Newline after ] before statements
  for (const kw of stmtKw) {
    content = content.replace(new RegExp('\\]\\s+' + kw + '\\b', 'g'), ']\n' + kw);
  }
  content = content.replace(/\]\s+([a-zA-Z]\w*)\s*\(/g, ']\n$1(');

  // Newline before const/let/var when preceded by statement value end
  // e.g. `Star const base = ...` in .map() callbacks
  content = content.replace(/([a-zA-Z0-9_)\]}'"])\s+(const|let|var)\s+\w+\s*=/g, '$1\n$2');

  // Newline before return/try/if when preceded by statement value end
  // e.g. `Star return (` in .map() callbacks
  content = content.replace(/([a-zA-Z0-9_)\]}'"])\s+(return|try|if)\b/g, '$1\n$2');

  // Clean up empty lines
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

let changed = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const fixed = fix(content);
  if (fixed !== content) {
    writeFileSync(file, fixed, 'utf-8');
    changed++;
    console.log(`Fixed: ${file.replace(root, '').replace(/\\/g, '/')}`);
  }
}
console.log(`\nChanged ${changed} files`);
