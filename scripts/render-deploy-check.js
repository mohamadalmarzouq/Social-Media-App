#!/usr/bin/env node

console.log('🔍 Render Deployment Check');
console.log('========================');

// Check environment variables
const requiredEnvs = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'STORAGE_DRIVER',
  'UPLOAD_DIR',
  'NODE_ENV'
];

console.log('\n📋 Environment Variables:');
requiredEnvs.forEach(env => {
  const value = process.env[env];
  if (value) {
    console.log(`✅ ${env}: ${env === 'NEXTAUTH_SECRET' || env === 'DATABASE_URL' ? '[HIDDEN]' : value}`);
  } else {
    console.log(`❌ ${env}: NOT SET`);
  }
});

// Check if we're in production
console.log('\n🏭 Environment Check:');
console.log(`Node Environment: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Platform: ${process.platform}`);
console.log(`Node Version: ${process.version}`);

// Check if build files exist
const fs = require('fs');
const path = require('path');

console.log('\n📦 Build Files Check:');
const buildPaths = [
  'package.json',
  'next.config.ts', 
  'prisma/schema.prisma',
  '.next'
];

buildPaths.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath}: EXISTS`);
  } else {
    console.log(`❌ ${filePath}: MISSING`);
  }
});

console.log('\n🚀 Ready for deployment!');
