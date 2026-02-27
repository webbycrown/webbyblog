'use strict';

const fs = require('fs');
const path = require('path');

// Copy seed data file to dist directory
const sourceFile = path.join(__dirname, '../server/src/data/blog-seed-data.json');
const destDir = path.join(__dirname, '../dist/server/data');
const destFile = path.join(destDir, 'blog-seed-data.json');

try {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    console.log('✓ Copied blog seed data to dist directory');
  } else {
    console.warn('⚠️  Source seed data file not found:', sourceFile);
  }

  // Copy components schemas to dist directory (required for dist-only installs)
  const componentsSourceDir = path.join(__dirname, '../server/src/components');
  const componentsDestDir = path.join(__dirname, '../dist/server/components');

  if (fs.existsSync(componentsSourceDir)) {
    if (!fs.existsSync(componentsDestDir)) {
      fs.mkdirSync(componentsDestDir, { recursive: true });
    }

    // Node 16+ has fs.cpSync; use it when available.
    if (typeof fs.cpSync === 'function') {
      fs.cpSync(componentsSourceDir, componentsDestDir, { recursive: true });
    } else {
      // Minimal fallback: copy directory tree manually
      const copyDir = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) copyDir(srcPath, destPath);
          else fs.copyFileSync(srcPath, destPath);
        }
      };
      copyDir(componentsSourceDir, componentsDestDir);
    }

    console.log('✓ Copied component schemas to dist directory');
  } else {
    console.warn('⚠️  Component schemas directory not found:', componentsSourceDir);
  }
} catch (error) {
  console.error('❌ Error copying seed data file:', error.message);
  process.exit(1);
}
