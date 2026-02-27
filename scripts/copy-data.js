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
} catch (error) {
  console.error('❌ Error copying seed data file:', error.message);
  process.exit(1);
}
