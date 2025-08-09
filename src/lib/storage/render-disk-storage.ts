import { StorageProvider } from './types';
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export class RenderDiskStorage implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || process.env.LOCAL_UPLOAD_DIR || './uploads';
  }

  async save(file: File, customPath?: string): Promise<{ key: string; url: string }> {
    // Ensure upload directory exists
    await this.ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const filename = customPath || `${timestamp}-${randomString}${extension}`;
    
    const filePath = path.join(this.uploadDir, filename);
    
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write file to disk
    await writeFile(filePath, buffer);
    
    return {
      key: filename,
      url: this.getUrl(filename)
    };
  }

  getUrl(key: string): string {
    return `/api/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
      console.warn(`Failed to delete file ${key}:`, error);
    }
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  // Helper method to get file from disk
  async getFile(key: string): Promise<Buffer | null> {
    const filePath = path.join(this.uploadDir, key);
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      return null;
    }
  }

  // Helper method to check if file exists
  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
