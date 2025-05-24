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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { stringify } from 'querystring';
import { FacebookAuthGuard } from 'src/common/guards/facebook-auth.guard';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { User } from '../../user/schemas';
import { LoginDto, RegisterDto, ResetPasswordDto } from '../common/dto';
import { IJwtRequest, ISocialLogin, IUserRequest } from '../common/interfaces';
import { LoginInfoResponse } from '../common/response';
import { AuthV1Service } from './auth.v1.service';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthV1Controller {
  constructor(private readonly authService: AuthV1Service) {}

  @Get('welcome')
  @ApiOperation({
    summary: 'Welcome to auth api',
    description: 'Welcome to auth api',
  })
  @ApiResponse({
    status: 200,
    description: 'Test auth api successfully',
  })
  welcome() {
    return 'Welcome to auth v1';
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sends a verification email.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: User,
  })
  @ApiResponse({ status: 403, description: 'Missing CORS origin' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<User> {
    const origin: string | undefined = this.getOrigin(req);
    if (origin) {
      return await this.authService.register(registerDto, origin);
    }
    throw new ForbiddenException(MessageCode.CORS_ORIGIN_MISSING);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginInfoResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<LoginInfoResponse> {
    const user_agent: string | undefined =
      (req.headers['user-agent'] as string) || undefined;
    const token: LoginInfoResponse = await this.authService.localLogin(
      loginDto,
      ip,
      user_agent,
    );
    return token;
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Sends a new verification email to the user.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 403, description: 'Missing CORS origin' })
  async resendVerification(
    @Body('email') email: string,
    @Req() req: Request,
  ): Promise<void> {
    const origin: string | undefined = this.getOrigin(req);
    if (origin) {
      return this.authService.resendVerification(email, origin);
    }
    throw new ForbiddenException(MessageCode.CORS_ORIGIN_MISSING);
  }

  @Get('verify-token')
  @ApiOperation({
    summary: 'Verify email token',
    description:
      'Verifies the email verification token and activates the user account.',
  })
  @ApiQuery({
    name: 'token',
    type: String,
    description: 'Verification token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyToken(@Query('token') token: string): Promise<User> {
    return await this.authService.verifyToken(token);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the user.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 403, description: 'Missing CORS origin' })
  async forgotPassword(
    @Body('email') email: string,
    @Req() req: Request,
  ): Promise<void> {
    const origin: string | undefined = this.getOrigin(req);
    if (origin) {
      return await this.authService.forgotPassword(email, origin);
    }
    throw new ForbiddenException(MessageCode.CORS_ORIGIN_MISSING);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the user password using a reset token.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<void> {
    return await this.authService.resetPassword(resetDto);
  }

  private getOrigin(req: Request): string | undefined {
    const headers: IncomingHttpHeaders = req.headers;
    if (headers) {
      const origin: string =
        (headers['origin'] as string) || (headers['Origin'] as string);
      if (origin) {
        return origin;
      }
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google login',
    description: 'Redirects to Google OAuth login page.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google login' })
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google login callback',
    description: 'Handles Google OAuth callback and redirects with tokens.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect with access and refresh tokens',
  })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  async googleAuthRedirect(
    @Req() req: IUserRequest,
    @Ip() ip: string,
    @Res() res: Response,
  ): Promise<any> {
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
      const user_agent: string | undefined =
        (req.headers['user-agent'] as string) || undefined;
      const socialLogin: ISocialLogin = {
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
      const data: LoginInfoResponse =
        await this.authService.socialLogin(socialLogin);
      const querystring: string = stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      const redirect: string = req.query.state
        ? (req.query.state as string)
        : 'http://localhost:3000/auth/callback';
      res.redirect(redirect + '?' + querystring);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('refresh_token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a refresh token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refresh_token: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: LoginInfoResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body('refresh_token') refresh_token: string,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<LoginInfoResponse> {
    const user_agent: string | undefined =
      (req.headers['user-agent'] as string) || undefined;
    const token: LoginInfoResponse = await this.authService.refreshToken(
      refresh_token,
      ip,
      user_agent,
    );
    return token;
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary: 'Initiate Facebook login',
    description: 'Redirects to Facebook OAuth login page.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook login' })
  facebookLogin(): void {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary: 'Facebook login callback',
    description: 'Handles Facebook OAuth callback and redirects with tokens.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect with access and refresh tokens',
  })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  async facebookAuthRedirect(
    @Req() req: IUserRequest,
    @Ip() ip: string,
    @Res() res: Response,
  ): Promise<any> {
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
      const user_agent: string | undefined =
        (req.headers['user-agent'] as string) || undefined;
      const socialLogin: ISocialLogin = {
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
      const data: LoginInfoResponse =
        await this.authService.socialLogin(socialLogin);
      const querystring: string = stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      const redirect: string = req.query.state
        ? (req.query.state as string)
        : 'http://localhost:3000/auth/callback';
      res.redirect(redirect + '?' + querystring);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  async getProfile(@Req() req: IJwtRequest) {
    if (req.user) {
      return await this.authService.getCurrentUser(req.user.id);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the user by invalidating the access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  async logout(@Req() req: IJwtRequest): Promise<void> {
    if (req.user && req.token) {
      return await this.authService.logout(req.user.id, req.token);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
}
