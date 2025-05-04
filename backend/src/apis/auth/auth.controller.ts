import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const origin = this.getOrigin(req);
    if (origin) {
      return await this.authService.register(registerDto, origin);
    }
    return { message: 'Origin header not found' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string, @Req() req: Request) {
    const origin = this.getOrigin(req);
    if (origin) {
      return this.authService.resendVerification(email, origin);
    }
    return { message: 'Origin header not found' };
  }

  @Get('verify-token')
  async verifyToken(@Query('token') token: string) {
    return this.authService.verifyToken(token);
  }

  private getOrigin(req: Request): string | undefined {
    const headers: Headers = req.headers;
    if (headers) {
      const origin: string =
        (headers['origin'] as string) || (headers['Origin'] as string);
      if (origin) {
        return origin;
      }
    }
    return undefined;
  }
}
