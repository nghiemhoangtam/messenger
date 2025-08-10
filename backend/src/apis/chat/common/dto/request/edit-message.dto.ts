import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({
    description: 'New content of the message',
    example: 'Updated message content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Type of the message',
    example: 'text',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: 'text' | 'image' | 'file' | 'video' | 'voice' | 'sticker' | 'emoji';
}
