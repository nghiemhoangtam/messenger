import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';
import { stringify } from 'querystring';
import { FacebookAuthGuard } from 'src/common/guards/facebook-auth.guard';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { MessageService } from 'src/common/messages/message.service';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRequest } from './interfaces/profile-request.interface';
import { SocialLogin } from './interfaces/social-login.interface';
import { UserRequest } from './interfaces/user-request.interface';

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
    const msg = await this.messageService.get(MessageCode.CORS_ORIGIN_MISSING);
    throw new ForbiddenException(msg);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.localLogin(loginDto);
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

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    const origin = this.getOrigin(req);
    if (origin) {
      return this.authService.forgotPassword(email, origin);
    }
    const msg = await this.messageService.get(MessageCode.CORS_ORIGIN_MISSING);
    throw new ForbiddenException(msg);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetDto);
  }

  private getOrigin(req: Request): string | undefined {
    const headers = req.headers;
    if (headers) {
      const origin: string =
        (headers['origin'] as string) || (headers['Origin'] as string);
      if (origin) {
        return origin;
      }
    }
    return undefined;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: UserRequest,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    if (req.user) {
      const {
        email,
        provider,
        provider_id,
        avatar,
        access_token,
        refresh_token,
        display_name,
      } = req.user;
      const user_agent = (req.headers['user-agent'] as string) || undefined;
      const socialLogin: SocialLogin = {
        email,
        provider,
        provider_id,
        user_agent,
        ip_address: ip,
        access_token,
        refresh_token,
        display_name,
        avatar,
      };
      const data = await this.authService.socialLogin(socialLogin);
      const querystring = stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      const redirect = req.query.state
        ? (req.query.state as string)
        : 'http://localhost:3000/auth/callback';
      res.redirect(redirect + '?' + querystring);
    } else {
      const msg = await this.messageService.get(MessageCode.FORBIDDEN);
      throw new ForbiddenException(msg);
    }
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthRedirect(
    @Req() req: UserRequest,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    if (req.user) {
      const {
        email,
        provider,
        provider_id,
        avatar,
        access_token,
        refresh_token,
        display_name,
      } = req.user;
      const user_agent = (req.headers['user-agent'] as string) || undefined;
      const socialLogin: SocialLogin = {
        email,
        provider,
        provider_id,
        user_agent,
        ip_address: ip,
        access_token,
        refresh_token,
        display_name,
        avatar,
      };
      const data = await this.authService.socialLogin(socialLogin);
      const querystring = stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      const redirect = req.query.state
        ? (req.query.state as string)
        : 'http://localhost:3000/auth/callback';
      res.redirect(redirect + '?' + querystring);
    } else {
      const msg = await this.messageService.get(MessageCode.FORBIDDEN);
      throw new ForbiddenException(msg);
    }
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: JwtRequest) {
    if (req.user) {
      return await this.authService.getCurrentUser(req.user.id);
    } else {
      const msg = await this.messageService.get(MessageCode.FORBIDDEN);
      throw new ForbiddenException(msg);
    }
  }
}
