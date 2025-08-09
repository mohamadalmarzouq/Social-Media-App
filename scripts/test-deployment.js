// Test script for deployment verification
// Run this after deployment to verify everything is working

const tests = [
  {
    name: 'Database Connection',
    test: async () => {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$connect();
        await prisma.$disconnect();
        return { success: true, message: 'Database connection successful' };
      } catch (error) {
        return { success: false, message: `Database error: ${error.message}` };
      }
    }
  },
  {
    name: 'Environment Variables',
    test: async () => {
      const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
      const missing = required.filter(env => !process.env[env]);
      
      if (missing.length > 0) {
        return { success: false, message: `Missing env vars: ${missing.join(', ')}` };
      }
      
      return { success: true, message: 'All required environment variables are set' };
    }
  },
  {
    name: 'Storage Directory',
    test: async () => {
      const fs = require('fs');
      const uploadDir = process.env.UPLOAD_DIR || process.env.LOCAL_UPLOAD_DIR || './uploads';
      
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Test write permission
        const testFile = `${uploadDir}/test-${Date.now()}.txt`;
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        return { success: true, message: `Storage directory accessible: ${uploadDir}` };
      } catch (error) {
        return { success: false, message: `Storage error: ${error.message}` };
      }
    }
  }
];

async function runTests() {
  console.log('🚀 Running deployment tests...\n');
  
  let allPassed = true;
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${name}: ${result.message}`);
      
      if (!result.success) {
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log(`\n${allPassed ? '🎉' : '⚠️'} ${allPassed ? 'All tests passed!' : 'Some tests failed'}`);
  
  if (allPassed) {
    console.log('\n✨ Your deployment looks good! Try creating an account and testing the app.');
  } else {
    console.log('\n🔧 Please fix the issues above and try again.');
  }
}

runTests().catch(console.error);
