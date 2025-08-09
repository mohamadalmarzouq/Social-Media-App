import { StorageProvider } from './types';
import { RenderDiskStorage } from './render-disk-storage';
import { S3Storage } from './s3-storage';

export * from './types';

// Storage factory function
export function createStorageProvider(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER || 'render-disk';
  
  switch (driver) {
    case 'aws-s3':
      return new S3Storage();
    case 'render-disk':
    default:
      return new RenderDiskStorage();
  }
}

// Default storage instance
export const storage = createStorageProvider();
