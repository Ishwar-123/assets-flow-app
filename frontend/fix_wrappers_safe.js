const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

function processFile(filePath) {
  if (filePath.includes('Auth.jsx')) return; // Auth has its own layout

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace the hardcoded light mode wrapper gradient with transparent
  content = content.replace(/bg-gradient-to-br from-slate-50 to-indigo-50\/40/g, 'bg-transparent');
  content = content.replace(/bg-slate-50 min-h-screen/g, 'bg-transparent min-h-screen');
  
  // Let's also check for AssetDirectory where the return might have been different
  // It has <div className="p-8 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 to-indigo-50/40 min-h-screen"> too, it just wasn't caught by the naive script because of the useMemo/useEffect return.
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated wrapper in: ${filePath}`);
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
