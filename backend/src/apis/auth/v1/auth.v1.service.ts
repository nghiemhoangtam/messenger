import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { MessageCode } from 'src/common/messages/message.enum';
import { MessageService } from 'src/common/messages/message.service';
import { BaseService } from 'src/common/services/base.service';
import { plusMinute } from 'src/utils/date.utils';
import { randomString } from 'src/utils/random.utils';
import { sendSimpleMail } from 'src/utils/sendmail.utils';
import { User } from '../../user/schemas';
import { LoginDto, RegisterDto, ResetPasswordDto } from '../common/dto';
import { ISocialLogin } from '../common/interfaces';
import { CurrentUserResponse, LoginInfoResponse } from '../common/response';
import { PasswordResetToken, SocialAccount, Token } from '../common/schemas';
@Injectable()
export class AuthV1Service extends BaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(SocialAccount.name)
    private socialAccountModel: Model<SocialAccount>,
    @InjectModel(PasswordResetToken.name)
    private passwordResetTokenModel: Model<PasswordResetToken>,
    @InjectModel(Token.name)
    private tokenModel: Model<Token>,
    private jwtService: JwtService,
    private messageService: MessageService,
    private configService: ConfigService,
  ) {
    super();
  }

  async register(registerDto: RegisterDto, origin: string): Promise<User> {
    return this.handle(async () => {
      const isExistValidUser: boolean = await this.existsUser(
        registerDto.email,
        true,
      );
      if (isExistValidUser) {
        throw new UnauthorizedException([
          {
            code: MessageCode.USER_ALREADY_EXISTS,
            params: {
              email: registerDto.email,
            },
          },
        ]);
      }
      await this.deleteUserByEmail(registerDto.email);
      await this.createVerifyEmail(registerDto.email, origin);
      return await this.createNewUser(registerDto);
    });
  }

  async localLogin(
    loginDto: LoginDto,
    ip_address: string,
    user_agent?: string,
  ): Promise<LoginInfoResponse> {
    return this.handle(async () => {
      const user = await this.userModel.findOne({ email: loginDto.email });
      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new UnauthorizedException([
          { code: MessageCode.INVALID_CREDENTIALS },
        ]);
      }
      const token = this.createNewToken(user);
      const newToken = new this.tokenModel({
        user: user._id,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        user_agent: user_agent,
        ip_address: ip_address,
      });
      await newToken.save();
      return {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      };
    });
  }

  async socialLogin(socialLogin: ISocialLogin): Promise<LoginInfoResponse> {
    try {
      let user = await this.findUser(socialLogin.email);
      if (!user) {
        user = new this.userModel({
          email: socialLogin.email,
          display_name: socialLogin.display_name,
          avatar: socialLogin.avatar,
          is_active: true,
        });
      } else {
        if (!user.is_active) {
          user.is_active = true;
        }
        user.avatar = socialLogin.avatar;
      }
      await user.save();

      await this.socialAccountModel.deleteMany({
        provider: socialLogin.provider,
        provider_id: socialLogin.provider_id,
      });

      const socialAccount = new this.socialAccountModel({
        user: user._id,
        provider: socialLogin.provider,
        provider_id: socialLogin.provider_id,
        access_token: socialLogin.access_token,
        refresh_token: socialLogin.refresh_token,
      });
      await socialAccount.save();

      const token = this.createNewToken(user);
      const newToken = new this.tokenModel({
        user: user._id,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        user_agent: socialLogin.user_agent,
        ip_address: socialLogin.ip_address,
      });
      await newToken.save();

      return {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MessageCode.INTERNAL_SERVER);
    }
  }

  async resendVerification(email: string, origin: string) {
    return this.handle(async () => {
      const existsValidUser: boolean = await this.existsUser(email);
      if (!existsValidUser) {
        throw new NotFoundException([
          { code: MessageCode.USER_NOT_FOUND, params: email },
        ]);
      }
      await this.createVerifyEmail(email, origin);
    });
  }

  async verifyToken(token: string): Promise<User> {
    return this.handle(
      async () => {
        const decoded = this.jwtService.verify<{ email: string }>(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        const user = await this.userModel.findOne({ email: decoded.email });

        if (!user) {
          throw new UnauthorizedException([
            { code: MessageCode.INVALID_TOKEN },
          ]);
        }

        user.is_active = true;
        return user.save();
      },
      (error: unknown) => {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException([
            { code: MessageCode.TOKEN_EXPIRED },
          ]);
        }
      },
    );
  }

  async forgotPassword(email: string, origin: string) {
    return this.handle(async () => {
      const validUser: User | null = await this.findUser(email, true);
      if (validUser) {
        await this.createTokenResetPassword(validUser, origin);
      } else {
        throw new NotFoundException([
          { code: MessageCode.USER_NOT_FOUND, params: { email } },
        ]);
      }
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.handle(async () => {
      const tokenSearch: PasswordResetToken | null =
        await this.passwordResetTokenModel.findOne({
          token: resetPasswordDto.token,
          is_used: false,
        });
      if (!tokenSearch) {
        throw new BadRequestException({ code: MessageCode.INVALID_TOKEN });
      } else {
        if (tokenSearch.expired_at.getTime() < Date.now()) {
          throw new UnauthorizedException([
            { code: MessageCode.TOKEN_EXPIRED },
          ]);
        } else {
          const hashedPassword = await bcrypt.hash(
            resetPasswordDto.password,
            10,
          );
          await this.passwordResetTokenModel.deleteMany({
            user: tokenSearch._id,
          });
          await this.userModel.updateOne(
            {
              _id: tokenSearch.user,
            },
            {
              $set: {
                password: hashedPassword,
              },
            },
          );
        }
      }
    });
  }

  private async createTokenResetPassword(user: User, origin: string) {
    return this.handle(async () => {
      const token = randomString(10);
      const url = `${origin}/reset-password?token=${token}`;
      await this.passwordResetTokenModel.deleteMany({
        user: user._id,
      });
      const resetPasswordModel = new this.passwordResetTokenModel({
        user: user._id,
        token,
        expired_at: plusMinute(1),
      });

      await resetPasswordModel.save();
      await this.sendResetPasswordEmail(user.email, url);
    });
  }

  private async findUser(
    email: string,
    is_active?: boolean,
  ): Promise<User | null> {
    return this.handle(async () => {
      const filter: Partial<Record<'email' | 'is_active', any>> = { email };
      if (typeof is_active === 'boolean') {
        filter.is_active = is_active;
      }
      return await this.userModel.findOne(filter);
    });
  }

  private async existsUser(
    email: string,
    is_active?: boolean,
  ): Promise<boolean> {
    return this.handle(async () => {
      const existingUser = await this.findUser(email, is_active);
      return existingUser != null;
    });
  }

  private async deleteUserByEmail(email: string) {
    return this.handle(async () => {
      await this.userModel.deleteMany({ email, is_active: false });
    });
  }

  private async createVerifyEmail(email: string, origin: string) {
    return this.handle(async () => {
      const verifyToken: string = this.jwtService.sign(
        {
          email,
        },
        {
          expiresIn: '1m',
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );
      const url = `${origin}/result-verify-token?token=${verifyToken}`;
      await this.sendVerificationEmail(email, url);
    });
  }

  private async createNewUser(registerDto: RegisterDto): Promise<User> {
    return this.handle(async () => {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = new this.userModel({
        email: registerDto.email,
        display_name: registerDto.display_name,
        password: hashedPassword,
      });
      return await user.save();
    });
  }

  private async sendResetPasswordEmail(email: string, url: string) {
    return this.handle(async () => {
      const subject = await this.messageService.get(
        MessageCode.RESET_PASSWORD_SUBJECT,
      );

      const html = await this.messageService.get(
        MessageCode.RESET_EMAIL_TEMPLATE,
        { url },
      );

      await sendSimpleMail(email, subject, html);
    });
  }

  async getUserInfo(access_token: string) {
    return this.handle(
      async () => {
        const payload: { id: string; email: string } = this.jwtService.verify(
          access_token,
          {
            secret: this.configService.get<string>('JWT_SECRET'),
          },
        );
        const user = await this.userModel.findById(payload.id);
        if (!user) {
          throw new ForbiddenException([{ code: MessageCode.FORBIDDEN }]);
        }
        return user;
      },
      (error: unknown) => {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException([
            { code: MessageCode.TOKEN_EXPIRED },
          ]);
        }
      },
    );
  }

  private async sendVerificationEmail(email: string, url: string) {
    return this.handle(async () => {
      const subject = await this.messageService.get(
        MessageCode.VERIFY_EMAIL_SUBJECT,
      );

      const html = await this.messageService.get(
        MessageCode.VERIFY_EMAIL_TEMPLATE,
        { url },
      );
      await sendSimpleMail(email, subject, html);
    });
  }

  private createNewToken(user: User) {
    const access_token = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
      },
      {
        expiresIn: '1h',
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );
    const refresh_token = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
      },
      {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );
    return { access_token, refresh_token };
  }

  async getCurrentUser(userId: string): Promise<CurrentUserResponse> {
    return this.handle(async () => {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException([{ code: MessageCode.FORBIDDEN }]);
      }
      const response: CurrentUserResponse = {
        id: user._id as string,
        email: user.email,
        display_name: user.display_name,
        avatar: user.avatar,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      return response;
    });
  }

  async refreshToken(
    refresh_token: string,
    ip_address: string,
    user_agent?: string,
  ): Promise<LoginInfoResponse> {
    return this.handle(
      async () => {
        const tokenSearched = await this.tokenModel.findOne({
          refresh_token,
          ip_address,
          user_agent,
        });
        if (!tokenSearched) {
          throw new UnauthorizedException([
            { code: MessageCode.INVALID_TOKEN },
          ]);
        }
        this.jwtService.verify(refresh_token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        if (tokenSearched.revoked_at) {
          throw new UnauthorizedException([
            { code: MessageCode.REFRESH_TOKEN_IS_USED },
          ]);
        }
        const user = await this.userModel.findById(tokenSearched.user);
        if (!user) {
          throw new NotFoundException([
            {
              code: MessageCode.USER_NOT_FOUND,
              email: tokenSearched.user.email,
            },
          ]);
        }

        tokenSearched.revoked_at = new Date();
        await tokenSearched.save();

        const token = this.createNewToken(user);
        const newToken = new this.tokenModel({
          user: user._id,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          user_agent: user_agent,
          ip_address,
        });
        await newToken.save();

        return {
          access_token: newToken.access_token,
          refresh_token: newToken.refresh_token,
        };
      },
      (error: unknown) => {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException([
            { code: MessageCode.TOKEN_EXPIRED },
          ]);
        }
      },
    );
  }
}
