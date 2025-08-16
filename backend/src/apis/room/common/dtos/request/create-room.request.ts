import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ default: 'My Room' })
  @IsNotEmpty({ message: 'Room name is required' })
  name: string;

  @ApiProperty({
    type: [String],
    description: 'Array of user IDs to be added to the room',
  })
  @IsNotEmpty({ message: 'Members are required' })
  members: string[]; // Array of user IDs to be added to the room
}
