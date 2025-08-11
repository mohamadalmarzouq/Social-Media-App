import { NextResponse } from 'next/server';
import { RenderDiskStorage } from '@/lib/storage/render-disk-storage';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const storage = new RenderDiskStorage();
    
    // Test file system access
    let fileSystemStatus = 'unknown';
    let uploadDir = 'unknown';
    
    try {
      uploadDir = process.env.UPLOAD_DIR || process.env.LOCAL_UPLOAD_DIR || './uploads';
      await fs.access(uploadDir);
      fileSystemStatus = 'accessible';
    } catch (error) {
      fileSystemStatus = 'not accessible';
    }
    
    // Test write permissions
    let writePermission = 'unknown';
    try {
      const testFile = path.join(uploadDir, '.health-test');
      await fs.writeFile(testFile, 'health test');
      await fs.unlink(testFile);
      writePermission = 'writable';
    } catch (error) {
      writePermission = 'not writable';
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      fileSystem: {
        uploadDir,
        status: fileSystemStatus,
        writePermission
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
