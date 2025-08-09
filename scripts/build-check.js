#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build requirements...');

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.error('❌ .next directory not found - build may have failed');
  process.exit(1);
}

// Check if build manifest exists
const buildManifest = path.join(nextDir, 'build-manifest.json');
if (!fs.existsSync(buildManifest)) {
  console.error('❌ Build manifest not found - build incomplete');
  process.exit(1);
}

// Check if server files exist
const serverDir = path.join(nextDir, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found - build incomplete');
  process.exit(1);
}

console.log('✅ Build verification passed!');
console.log('📦 Build directory contents:');

// List key build files
const buildFiles = fs.readdirSync(nextDir);
buildFiles.forEach(file => {
  console.log(`   - ${file}`);
});

console.log('🚀 Ready to start production server');
