import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ default: '001' })
  @IsNotEmpty({ message: 'Room code is required' })
  roomCode: string;
  @ApiProperty({ default: 'Hi you, friend' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
