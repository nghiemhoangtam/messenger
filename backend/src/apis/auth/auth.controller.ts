import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { MessageCode } from 'src/common/messages/message.enum';
import { MessageService } from 'src/common/messages/message.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const origin = this.getOrigin(req);
    if (origin) {
      return await this.authService.register(registerDto, origin);
    }
    throw new ForbiddenException(
      this.messageService.getMessage(MessageCode.CORS_ORIGIN_MISSING),
    );
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
    throw new ForbiddenException(
      this.messageService.getMessage(MessageCode.CORS_ORIGIN_MISSING),
    );
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
