import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { unlink } from 'fs/promises';
import { Model, Types } from 'mongoose';
import { join } from 'path';
import { BaseService } from '../../../common/services/base.service';
import { File } from '../schema/file.schema';

@Injectable()
export class MediaService extends BaseService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async uploadFile(file: Express.Multer.File, userId: string) {
    return await this.handle(async () => {
      const fileType = this.getFileType(file.mimetype);
      
      // Get base URL from config or use default
      const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:8080';
      const fullFileUrl = `${baseUrl}/uploads/${file.filename}`;
      
      const newFile = new this.fileModel({
        uploader_id: new Types.ObjectId(userId),
        file_url: fullFileUrl, // Store full URL instead of relative path
        file_type: fileType,
        file_size: file.size,
        original_name: file.originalname,
        mime_type: file.mimetype,
        uploaded_at: new Date(),
        is_processed: true,
        processing_status: 'completed',
      });

      const savedFile = await newFile.save();

      return {
        id: savedFile._id,
        fileUrl: savedFile.file_url, // This will now be the full URL
        fileName: savedFile.original_name,
        fileSize: savedFile.file_size,
        fileType: savedFile.file_type,
        mimeType: savedFile.mime_type,
      };
    });
  }

  async getFileInfo(fileId: string, baseUrl?: string) {
    return await this.handle(async () => {
      const file = await this.fileModel.findById(fileId).exec();
      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Since we now store full URL, we don't need to construct it
      // But we keep the baseUrl parameter for backward compatibility
      const fullFileUrl = file.file_url; // This is already the full URL

      return {
        id: file._id,
        fileUrl: fullFileUrl,
        fileName: file.original_name,
        fileSize: file.file_size,
        fileType: file.file_type,
        mimeType: file.mime_type,
        uploadedAt: file.uploaded_at,
        uploaderId: file.uploader_id,
      };
    });
  }

  async downloadFile(fileId: string, userId: string, res: Response) {
    return await this.handle(async () => {
      const file = await this.fileModel.findById(fileId).exec();
      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Extract filename from URL
      const urlParts = file.file_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Use uploads directory
      const filePath = join(process.cwd(), 'uploads', filename);
      
      try {
        // Kiểm tra file có tồn tại không
        const stats = statSync(filePath);
        
        // Set headers cho download
        res.setHeader('Content-Type', file.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Length', stats.size);
        
        // Stream file
        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
        
        return { success: true };
      } catch (error) {
        throw new NotFoundException('File not found on disk');
      }
    });
  }

  async deleteFile(fileId: string, userId: string) {
    return await this.handle(async () => {
      const file = await this.fileModel.findById(fileId).exec();
      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Kiểm tra quyền xóa file
      if (file.uploader_id.toString() !== userId) {
        throw new ForbiddenException('You can only delete your own files');
      }

      // Xóa file từ filesystem
      try {
        // Extract relative path from full URL for file system access
        let relativePath = file.file_url;
        if (file.file_url.startsWith('http')) {
          // Remove base URL to get relative path
          const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:8080';
          relativePath = file.file_url.replace(baseUrl, '');
        }
        
        const filePath = join(process.cwd(), relativePath);
        await unlink(filePath);
      } catch (error) {
        // File có thể đã bị xóa hoặc không tồn tại
        console.warn(`File not found on disk: ${file.file_url}`);
      }

      // Xóa record từ database
      await this.fileModel.findByIdAndDelete(fileId).exec();

      return { message: 'File deleted successfully' };
    });
  }

  async getFilesByMessageId(messageId: string) {
    return await this.handle(async () => {
      const files = await this.fileModel
        .find({ message_id: new Types.ObjectId(messageId) })
        .exec();

      return files.map(file => ({
        id: file._id,
        fileUrl: file.file_url, // This will now be the full URL since we store it that way
        fileName: file.original_name,
        fileSize: file.file_size,
        fileType: file.file_type,
        mimeType: file.mime_type,
      }));
    });
  }

  async linkFileToMessage(fileId: string, messageId: string) {
    return await this.handle(async () => {
      const file = await this.fileModel.findById(fileId).exec();
      if (!file) {
        throw new NotFoundException('File not found');
      }

      file.message_id = new Types.ObjectId(messageId);
      await file.save();

      return { message: 'File linked to message successfully' };
    });
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType === 'text/plain') return 'text';
    return 'file';
  }
}
