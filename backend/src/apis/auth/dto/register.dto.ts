import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Display name is required' })
  display_name: string;
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
