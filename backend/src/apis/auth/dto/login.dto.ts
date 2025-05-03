import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'robocon321n@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
  @ApiProperty({ default: '12341234' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
