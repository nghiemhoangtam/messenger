import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ default: 1, description: 'Page number for pagination' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ default: 10, description: 'Number of items per page' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ default: 'createdAt', description: 'Field to sort by' })
  sortBy?: string; // ví dụ: "name,-createdAt"

  @IsOptional()
  @IsString()  
  @ApiProperty({ default: '', description: 'Search term for filtering results' })
  search?: string; // dùng cho text search toàn cục

  @IsOptional()
  @ApiProperty({ required: false, description: 'Filter criteria' })
  filter?: Record<string, any>; // ví dụ: { status: 'active' }
}
