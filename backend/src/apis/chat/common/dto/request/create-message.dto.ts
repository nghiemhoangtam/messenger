import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ default: '001' })
  @IsNotEmpty({ message: 'Room ID is required' })
  room_id: string;

  @ApiProperty({ default: 'Hi you, friend' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @ApiProperty({ default: 'text', enum: ['text', 'image', 'file', 'audio', 'video', 'sticker', 'emoji'] })
  @IsOptional()
  @IsIn(['text', 'image', 'file', 'audio', 'video', 'sticker', 'emoji'], { message: 'Invalid message type' })
  type?: string = 'text';

  @ApiProperty({ required: false, description: 'ID of the message being replied to' })
  @IsOptional()
  @IsString({ message: 'Reply to ID must be a string' })
  reply_to_id?: string;
}
