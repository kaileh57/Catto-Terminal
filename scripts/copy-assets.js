const fs = require('fs');
const path = require('path');

function copyFileSync(source, target) {
  const targetFile = path.dirname(target);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(targetFile)) {
    fs.mkdirSync(targetFile, { recursive: true });
  }
  
  fs.copyFileSync(source, target);
}

function copyAssets() {
  console.log('📦 Copying renderer assets...');
  
  try {
    // Ensure dist/renderer directory exists
    const rendererDir = path.join(__dirname, '../dist/renderer');
    if (!fs.existsSync(rendererDir)) {
      fs.mkdirSync(rendererDir, { recursive: true });
    }
    
    // Copy HTML file
    copyFileSync(
      path.join(__dirname, '../src/renderer/index.html'),
      path.join(__dirname, '../dist/renderer/index.html')
    );
    
    // Copy CSS file
    copyFileSync(
      path.join(__dirname, '../src/renderer/styles.css'),
      path.join(__dirname, '../dist/renderer/styles.css')
    );
    
    // Copy xterm CSS
    copyFileSync(
      path.join(__dirname, '../node_modules/@xterm/xterm/css/xterm.css'),
      path.join(__dirname, '../dist/renderer/xterm.css')
    );
    
    // Copy app.js if it exists
    const appJsPath = path.join(__dirname, '../src/renderer/app.js');
    if (fs.existsSync(appJsPath)) {
      copyFileSync(
        appJsPath,
        path.join(__dirname, '../dist/renderer/app.js')
      );
    }
    
    // Copy cat-overlay.js if it exists
    const catOverlayPath = path.join(__dirname, '../src/renderer/cat-overlay.js');
    if (fs.existsSync(catOverlayPath)) {
      copyFileSync(
        catOverlayPath,
        path.join(__dirname, '../dist/renderer/cat-overlay.js')
      );
    }
    
    // Copy command-interceptor.js if it exists
    const commandInterceptorPath = path.join(__dirname, '../src/renderer/command-interceptor.js');
    if (fs.existsSync(commandInterceptorPath)) {
      copyFileSync(
        commandInterceptorPath,
        path.join(__dirname, '../dist/renderer/command-interceptor.js')
      );
    }
    
    // Copy autocomplete.js if it exists
    const autocompletePath = path.join(__dirname, '../src/renderer/autocomplete.js');
    if (fs.existsSync(autocompletePath)) {
      copyFileSync(
        autocompletePath,
        path.join(__dirname, '../dist/renderer/autocomplete.js')
      );
    }
    
    // Copy markdown-renderer.js if it exists
    const markdownRendererPath = path.join(__dirname, '../src/renderer/markdown-renderer.js');
    if (fs.existsSync(markdownRendererPath)) {
      copyFileSync(
        markdownRendererPath,
        path.join(__dirname, '../dist/renderer/markdown-renderer.js')
      );
    }
    
    console.log('✅ Assets copied successfully');
    
  } catch (error) {
    console.error('❌ Error copying assets:', error);
    process.exit(1);
  }
}

copyAssets();
