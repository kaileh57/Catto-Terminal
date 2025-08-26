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
    
    console.log('✅ Assets copied successfully');
    
  } catch (error) {
    console.error('❌ Error copying assets:', error);
    process.exit(1);
  }
}

copyAssets();
