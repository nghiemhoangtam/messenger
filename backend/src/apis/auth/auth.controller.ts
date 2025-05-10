import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
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
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const origin = this.getOrigin(req);
    if (origin) {
      return await this.authService.register(registerDto, origin);
    }
    const msg = await this.messageService.get(MessageCode.CORS_ORIGIN_MISSING);
    throw new ForbiddenException(msg);
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
    const msg = await this.messageService.get(MessageCode.CORS_ORIGIN_MISSING);
    throw new ForbiddenException(msg);
  }

  @Get('verify-token')
  async verifyToken(@Query('token') token: string, @I18n() i18n: I18nContext) {
    return this.authService.verifyToken(token, i18n);
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
