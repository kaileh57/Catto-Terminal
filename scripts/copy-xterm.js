const fs = require('fs');
const path = require('path');

console.log('📦 Copying xterm files...');

const distDir = path.join(__dirname, '../dist/renderer/lib');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy xterm files
try {
  fs.copyFileSync(
    path.join(__dirname, '../node_modules/@xterm/xterm/lib/xterm.js'),
    path.join(distDir, 'xterm.js')
  );
  
  fs.copyFileSync(
    path.join(__dirname, '../node_modules/@xterm/addon-fit/lib/addon-fit.js'),
    path.join(distDir, 'addon-fit.js')
  );
  
  fs.copyFileSync(
    path.join(__dirname, '../node_modules/@xterm/xterm/css/xterm.css'),
    path.join(__dirname, '../dist/renderer/xterm.css')
  );
  
  console.log('✅ xterm files copied successfully');
} catch (error) {
  console.error('❌ Error copying xterm files:', error);
  process.exit(1);
}
