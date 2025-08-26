const fs = require('fs');
const path = require('path');

console.log('📦 Bundling renderer files...');

// Read the compiled JavaScript files
const constantsJs = fs.readFileSync(path.join(__dirname, '../dist/renderer/shared/constants.js'), 'utf8');
const typesJs = fs.readFileSync(path.join(__dirname, '../dist/renderer/shared/types.js'), 'utf8');
const terminalJs = fs.readFileSync(path.join(__dirname, '../dist/renderer/renderer/terminal.js'), 'utf8');
const indexJs = fs.readFileSync(path.join(__dirname, '../dist/renderer/renderer/index.js'), 'utf8');

// Create a bundled file that works in the browser
const bundle = `
// Cat Terminal Bundle - All code in one file
(function() {
  'use strict';
  
  // Remove all module.exports and exports references
  const exports = {};
  const module = { exports: {} };
  
  // Constants
  ${constantsJs.replace(/^"use strict";\r?\n/, '').replace(/Object\.defineProperty\(exports.*?\);?\r?\n/g, '').replace(/exports\./g, 'window.')}
  
  // Terminal Class
  ${terminalJs.replace(/^"use strict";\r?\n/, '').replace(/Object\.defineProperty\(exports.*?\);?\r?\n/g, '').replace(/const \w+_\d+ = require\(.*?\);?\r?\n/g, '').replace(/exports\./g, 'window.')}
  
  // Main App
  ${indexJs.replace(/^"use strict";\r?\n/, '').replace(/Object\.defineProperty\(exports.*?\);?\r?\n/g, '').replace(/const terminal_1 = require\(.*?\);?\r?\n/g, '').replace(/terminal_1\.TerminalSession/g, 'window.TerminalSession')}
  
})();
`;

// Write the bundle
fs.writeFileSync(path.join(__dirname, '../dist/renderer/bundle.js'), bundle);

console.log('✅ Renderer bundled successfully');
