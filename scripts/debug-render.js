#!/usr/bin/env node

console.log('🔍 Render Deployment Debug Information');
console.log('=====================================');

// Check Node version
console.log(`📦 Node Version: ${process.version}`);
console.log(`📦 Platform: ${process.platform}`);

// Check environment variables
console.log('\n🌍 Environment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`- NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`);
console.log(`- NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`- STORAGE_DRIVER: ${process.env.STORAGE_DRIVER || 'NOT SET'}`);
console.log(`- UPLOAD_DIR: ${process.env.UPLOAD_DIR || 'NOT SET'}`);

// Check file structure
const fs = require('fs');
const path = require('path');

console.log('\n📁 File Structure Check:');
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.mjs',
  'prisma/schema.prisma',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check if .next directory exists
const nextExists = fs.existsSync(path.join(process.cwd(), '.next'));
console.log(`\n🏗️  Build Output: ${nextExists ? '✅ .next directory exists' : '❌ .next directory missing'}`);

if (nextExists) {
  try {
    const nextStats = fs.statSync(path.join(process.cwd(), '.next'));
    console.log(`   Created: ${nextStats.birthtime}`);
    console.log(`   Modified: ${nextStats.mtime}`);
  } catch (e) {
    console.log(`   Error reading .next stats: ${e.message}`);
  }
}

// Test basic imports
console.log('\n🧪 Import Tests:');
try {
  require('./package.json');
  console.log('  ✅ package.json can be required');
} catch (e) {
  console.log(`  ❌ package.json error: ${e.message}`);
}

try {
  require('./next.config.js');
  console.log('  ✅ next.config.js can be required');
} catch (e) {
  console.log(`  ❌ next.config.js error: ${e.message}`);
}

console.log('\n🎯 Next Steps:');
console.log('1. Ensure all environment variables are set in Render');
console.log('2. Check that persistent disk is properly mounted');
console.log('3. Verify build command completes successfully');
console.log('4. Check if there are any specific error messages in full logs');

console.log('\n✨ Debug Complete');
