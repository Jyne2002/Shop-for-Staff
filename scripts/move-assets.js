const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcPublic = path.join(root, 'public', 'logo.png');
const destPublicDir = path.join(root, 'frontend', 'public');
const destPublic = path.join(destPublicDir, 'logo.png');

if (!fs.existsSync(destPublicDir)) fs.mkdirSync(destPublicDir, { recursive: true });

if (fs.existsSync(srcPublic)) {
  fs.copyFileSync(srcPublic, destPublic);
  console.log('Copied public/logo.png -> frontend/public/logo.png');
} else {
  console.log('No public/logo.png found at root to copy.');
}

// copy root styles if present and frontend missing
const srcStyles = path.join(root, 'styles', 'globals.css');
const destStylesDir = path.join(root, 'frontend', 'styles');
const destStyles = path.join(destStylesDir, 'globals.css');
if (!fs.existsSync(destStylesDir)) fs.mkdirSync(destStylesDir, { recursive: true });
if (fs.existsSync(srcStyles) && !fs.existsSync(destStyles)) {
  fs.copyFileSync(srcStyles, destStyles);
  console.log('Copied styles/globals.css -> frontend/styles/globals.css');
} else {
  console.log('No styles/globals.css copied (source missing or destination exists).');
}

console.log('Asset move script finished.');
