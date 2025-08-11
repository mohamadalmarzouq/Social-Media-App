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
      console.log('Storage: Attempting to create upload directory:', this.uploadDir);
      await mkdir(this.uploadDir, { recursive: true });
      console.log('Storage: Upload directory created/verified successfully');
      
      // Test write permissions
      const testFile = path.join(this.uploadDir, '.test');
      await writeFile(testFile, 'test');
      await fs.promises.unlink(testFile);
      console.log('Storage: Write permissions verified');
    } catch (error) {
      console.error('Storage: Error creating upload directory:', error);
      
      // Try fallback directory
      const fallbackDir = './uploads';
      console.log('Storage: Trying fallback directory:', fallbackDir);
      
      try {
        this.uploadDir = fallbackDir;
        await mkdir(fallbackDir, { recursive: true });
        console.log('Storage: Fallback directory created successfully');
      } catch (fallbackError) {
        console.error('Storage: Fallback directory also failed:', fallbackError);
        throw new Error(`Failed to create upload directory. Tried: ${this.uploadDir} and ${fallbackDir}`);
      }
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

  // Helper method to save file from buffer
  async saveFile(filename: string, buffer: Buffer): Promise<void> {
    try {
      console.log('Storage: Ensuring upload directory exists...');
      await this.ensureUploadDir();
      
      const filePath = path.join(this.uploadDir, filename);
      console.log('Storage: Saving file to path:', filePath);
      console.log('Storage: Upload directory:', this.uploadDir);
      console.log('Storage: Buffer size:', buffer.length);
      
      await writeFile(filePath, buffer);
      console.log('Storage: File written successfully');
      
      // Verify file was written
      const stats = await fs.promises.stat(filePath);
      console.log('Storage: File stats after write:', {
        size: stats.size,
        exists: true
      });
    } catch (error) {
      console.error('Storage: Error saving file:', error);
      throw error;
    }
  }
}
