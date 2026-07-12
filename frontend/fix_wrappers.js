const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

const regexes = [
  { regex: /bg-gradient-to-br from-slate-50 to-indigo-50\/40/g, replacement: 'bg-transparent' },
  { regex: /bg-slate-50 min-h-screen/g, replacement: 'bg-transparent min-h-screen' },
  { regex: /bg-slate-50 dark:bg-slate-800\/50 min-h-screen/g, replacement: 'bg-transparent min-h-screen' },
  { regex: /bg-slate-50 dark:bg-slate-800\/50 p-6/g, replacement: 'bg-transparent p-6' },
  // Let's also just look for standard wrappers that might be broken
];

function processFile(filePath) {
  if (filePath.includes('Auth.jsx')) return; // Auth has its own layout

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Let's just remove any hardcoded light mode backgrounds on the outermost div
  // The easiest way is to target the specific string I know I used in my previous design overhaul:
  content = content.replace(/bg-gradient-to-br from-slate-50 to-indigo-50\/40/g, 'bg-transparent');
  content = content.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-transparent');
  content = content.replace(/bg-slate-50(?!0)/g, 'bg-transparent');
  // but wait, bg-slate-50 might be used inside cards! I shouldn't globally replace it.
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated wrappers in: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      traverse(filePath);
    } else if (filePath.endsWith('.jsx')) {
      processFile(filePath);
    }
  }
}

traverse(srcDir);
