import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ default: '91834klsdaf' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
  @ApiProperty({ default: '12341234' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
