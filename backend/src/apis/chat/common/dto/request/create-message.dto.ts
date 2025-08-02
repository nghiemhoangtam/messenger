import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ default: '001' })
  @IsNotEmpty({ message: 'Room ID is required' })
  room_id: string;

  @ApiProperty({ default: 'Hi you, friend' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
