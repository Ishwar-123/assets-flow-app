const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

function processFile(filePath) {
  if (filePath.includes('Auth.jsx')) return; // Auth has its own layout

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix hover:bg-white dark:bg-slate-900 -> hover:bg-white dark:hover:bg-slate-900
  content = content.replace(/hover:bg-white dark:bg-slate-900/g, 'hover:bg-white dark:hover:bg-slate-900');
  
  // Fix hover:bg-slate-50 dark:bg-slate-800/50 -> hover:bg-slate-50 dark:hover:bg-slate-800/50
  content = content.replace(/hover:bg-slate-50 dark:bg-slate-800\/50/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');

  // Fix hover:bg-slate-100 dark:bg-slate-800 -> hover:bg-slate-100 dark:hover:bg-slate-800
  content = content.replace(/hover:bg-slate-100 dark:bg-slate-800/g, 'hover:bg-slate-100 dark:hover:bg-slate-800');

  // Fix hover:text-slate-900 dark:text-white -> hover:text-slate-900 dark:hover:text-white
  content = content.replace(/hover:text-slate-900 dark:text-white/g, 'hover:text-slate-900 dark:hover:text-white');

  // Fix hover:border-slate-300 dark:border-slate-700 -> hover:border-slate-300 dark:hover:border-slate-700
  content = content.replace(/hover:border-slate-300 dark:border-slate-700/g, 'hover:border-slate-300 dark:hover:border-slate-700');

  // Fix group-hover:bg-white dark:bg-slate-900 -> group-hover:bg-white dark:group-hover:bg-slate-900
  content = content.replace(/group-hover:bg-white dark:bg-slate-900/g, 'group-hover:bg-white dark:group-hover:bg-slate-900');
  
  // Fix group-hover:bg-slate-50 dark:bg-slate-800/50 -> group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50
  content = content.replace(/group-hover:bg-slate-50 dark:bg-slate-800\/50/g, 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50');
  
  // Any weird /50/50 typos (I saw one in the view_file output!)
  content = content.replace(/\/50\/50/g, '/50');
  content = content.replace(/dark:bg-slate-800\/50\/50/g, 'dark:bg-slate-800/50');

  // Also we need to check if there are standalone hover:bg-slate-50 that don't have dark:hover:bg-slate-800
  // e.g., hover:bg-slate-50 without dark:hover:bg-slate-800/50
  content = content.replace(/hover:bg-slate-50(?!\s+dark:hover:bg-slate-800\/50)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-100(?!\s+dark:hover:bg-slate-800)/g, 'hover:bg-slate-100 dark:hover:bg-slate-800');

  // Wait, the regex with negative lookahead for spaces doesn't work well in JS (it will just fail if it's not immediately followed).
  // A safer approach:
  // We can just replace hover:bg-slate-50 completely, then de-duplicate.
  content = content.replace(/hover:bg-slate-50/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-100/g, 'hover:bg-slate-100 dark:hover:bg-slate-800');
  
  // De-duplicate
  content = content.replace(/(dark:hover:bg-slate-800\/50\s*)+/g, 'dark:hover:bg-slate-800/50 ');
  content = content.replace(/(dark:hover:bg-slate-800\s*)+/g, 'dark:hover:bg-slate-800 ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated hover classes in: ${filePath}`);
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
