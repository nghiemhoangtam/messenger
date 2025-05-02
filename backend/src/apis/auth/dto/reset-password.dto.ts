import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
