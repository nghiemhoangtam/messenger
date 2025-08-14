import {
    BadRequestException,
    Controller,
    Delete,
    FileTypeValidator,
    ForbiddenException,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Request,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MessageCode } from '../../../common/messages/message.enum';
import { MediaService } from './media.service';

// Response DTOs for Swagger documentation
class FileUploadResponseDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
}

class FileInfoResponseDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  uploadedAt: Date;
  uploaderId: string;
}

class FileDeleteResponseDto {
  message: string;
}

class ErrorResponseDto {
  statusCode: number;
  message: string;
  error: string;
}

@ApiTags('Media Management')
@Controller({ path: 'media', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file',
    description: 'Upload various types of files including images, videos, audio, documents, and other supported formats. The file will be stored on the server and metadata will be saved to the database.',
    tags: ['Media Management']
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10MB). Supported formats: images (JPEG, PNG, GIF, WebP), documents (PDF, DOC, DOCX, XLS, XLSX, TXT), audio (MP3, WAV, OGG), video (MP4, WebM, OGG)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fileUrl: { type: 'string', example: '/uploads/abc123-def456-ghi789.jpg' },
            fileName: { type: 'string', example: 'profile-photo.jpg' },
            fileSize: { type: 'number', example: 1024000 },
            fileType: { type: 'string', example: 'image' },
            mimeType: { type: 'string', example: 'image/jpeg' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type or file size exceeds limit',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'File type not allowed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to upload files',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'FORBIDDEN' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during file upload',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Kiểm tra loại file được phép
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'video/mp4',
          'video/webm',
          'video/ogg',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('File type not allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType:
              '.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|mp3|wav|ogg|mp4|webm)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
  ) {
    if (req.user) {
      const userId = req.user.id;
      return await this.mediaService.uploadFile(file, userId);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('files/:fileId')
  @ApiOperation({
    summary: 'Get file information',
    description: 'Retrieve detailed information about a specific file including metadata, file URL, and upload details.',
    tags: ['Media Management']
  })
  @ApiParam({
    name: 'fileId',
    description: 'Unique identifier of the file',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fileUrl: { type: 'string', example: 'http://localhost:3000/uploads/abc123-def456-ghi789.jpg' },
            fileName: { type: 'string', example: 'profile-photo.jpg' },
            fileSize: { type: 'number', example: 1024000 },
            fileType: { type: 'string', example: 'image' },
            mimeType: { type: 'string', example: 'image/jpeg' },
            uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            uploaderId: { type: 'string', example: '507f1f77bcf86cd799439012' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid file ID' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to access file information',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'FORBIDDEN' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'File not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getFileInfo(@Param('fileId') fileId: string, @Request() req) {
    if (req.user) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return await this.mediaService.getFileInfo(fileId, baseUrl);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('download/:fileId')
  @ApiOperation({
    summary: 'Download a file',
    description: 'Download a file by its ID. The file will be streamed to the client with appropriate headers for download.',
    tags: ['Media Management']
  })
  @ApiParam({
    name: 'fileId',
    description: 'Unique identifier of the file to download',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'File download started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid file ID' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to download files',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'FORBIDDEN' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'File not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async downloadFile(@Param('fileId') fileId: string, @Request() req, @Res() res: Response) {
    if (req.user) {
      return await this.mediaService.downloadFile(fileId, req.user.id, res);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Delete('files/:fileId')
  @ApiOperation({
    summary: 'Delete a file',
    description: 'Delete a file from both the database and filesystem. Users can only delete their own uploaded files.',
    tags: ['Media Management']
  })
  @ApiParam({
    name: 'fileId',
    description: 'Unique identifier of the file to delete',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'File deleted successfully' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid file ID' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to delete this file',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only delete your own files' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'File not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async deleteFile(@Param('fileId') fileId: string, @Request() req) {
    if (req.user) {
      const userId = req.user.id;
      return await this.mediaService.deleteFile(fileId, userId);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
}
