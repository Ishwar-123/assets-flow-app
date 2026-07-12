const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)bg-slate-50(?!0)/g, replacement: 'bg-slate-50 dark:bg-slate-800/50' },
  { regex: /(?<!dark:)bg-slate-100/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-slate-200/g, replacement: 'bg-slate-200 dark:bg-slate-700' },
  { regex: /(?<!dark:)border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700' },
  { regex: /(?<!dark:)border-white/g, replacement: 'border-white dark:border-slate-800' },
  { regex: /(?<!dark:)divide-slate-200/g, replacement: 'divide-slate-200 dark:divide-slate-700' },
  { regex: /(?<!dark:)divide-slate-100/g, replacement: 'divide-slate-100 dark:divide-slate-800' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      traverse(filePath);
    } else if (filePath.endsWith('.jsx') && !filePath.includes('Sidebar.jsx') && !filePath.includes('Header.jsx')) {
      processFile(filePath);
    }
  }
}

traverse(srcDir);
console.log('Dark mode classes injected.');
