const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

function processFile(filePath) {
  if (filePath.includes('Auth.jsx')) return; // skip Auth

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Let's replace border-slate-300 with a full suite of form classes if it doesn't already have dark:border-slate-700
  // But wait, there are a couple of places that already have "bg-white dark:bg-slate-900" inside the same class string.
  // To avoid massive duplicates, we can just do a simple replace. Tailwind deduplicates mostly, but it looks ugly.
  // Actually, replacing border-slate-300 with just dark:border-slate-700 dark:bg-slate-800 dark:text-white is safe.
  
  content = content.replace(/(?<!dark:)border-slate-300/g, 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white');

  // Let's also fix cases where bg-white dark:bg-slate-900 is duplicated now
  content = content.replace(/bg-white dark:bg-slate-900(.*?)bg-white dark:bg-slate-800/g, '$1 bg-white dark:bg-slate-800');
  content = content.replace(/bg-white dark:bg-slate-800(.*?)bg-white dark:bg-slate-900/g, '$1 bg-white dark:bg-slate-800');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated form elements in: ${filePath}`);
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
