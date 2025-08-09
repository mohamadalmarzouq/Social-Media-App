export interface StorageProvider {
  save(file: File, path?: string): Promise<{ key: string; url: string }>;
  getUrl(key: string): string;
  delete(key: string): Promise<void>;
}

export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
