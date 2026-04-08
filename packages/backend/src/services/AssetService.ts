import path from 'path';
import fs from 'fs/promises';

/**
 * AssetService
 * Handles file upload validation and storage
 */
export class AssetService {
  // Max file sizes (in bytes)
  private static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

  // Allowed MIME types
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  private static readonly ALLOWED_DOCUMENT_TYPES = ['text/plain', 'application/pdf'];

  /**
   * Validate file type and size
   */
  static validateFile(file: {
    mimeType: string;
    size: number;
  }): { valid: boolean; error?: string; assetType?: 'image' | 'video' | 'document' } {
    // Determine asset type from MIME type
    let assetType: 'image' | 'video' | 'document' | null = null;
    let maxSize: number = 0;

    if (this.ALLOWED_IMAGE_TYPES.includes(file.mimeType)) {
      assetType = 'image';
      maxSize = this.MAX_IMAGE_SIZE;
    } else if (this.ALLOWED_VIDEO_TYPES.includes(file.mimeType)) {
      assetType = 'video';
      maxSize = this.MAX_VIDEO_SIZE;
    } else if (this.ALLOWED_DOCUMENT_TYPES.includes(file.mimeType)) {
      assetType = 'document';
      maxSize = this.MAX_DOCUMENT_SIZE;
    } else {
      return {
        valid: false,
        error: 'File type not allowed. Supported: images (jpg, png, gif, webp), videos (mp4, mov, avi), documents (txt, pdf)',
      };
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        valid: false,
        error: `File too large. Maximum size for ${assetType}: ${maxSizeMB}MB`,
      };
    }

    return { valid: true, assetType };
  }

  /**
   * Generate file storage path
   */
  static generateFilePath(profileId: string, originalFileName: string): string {
    const timestamp = Date.now();
    const extension = path.extname(originalFileName);
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
    return path.join('assets', profileId, fileName);
  }

  /**
   * Save file to storage (local filesystem)
   */
  static async saveFile(filePath: string, fileBuffer: Buffer): Promise<void> {
    const fullPath = path.join(process.cwd(), 'data', filePath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, fileBuffer);
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'data', filePath);

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, log but don't fail
      console.warn(`Failed to delete file: ${filePath}`, error);
    }
  }

  /**
   * Get file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
