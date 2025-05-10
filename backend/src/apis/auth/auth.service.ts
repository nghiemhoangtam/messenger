import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import * as nodemailer from 'nodemailer';
import { MessageCode } from 'src/common/messages/message.enum';
import { MessageService } from 'src/common/messages/message.service';
import { User } from '../user/schemas';
import { LoginDto, RegisterDto } from './dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private messageService: MessageService,
  ) {}

  async register(registerDto: RegisterDto, origin: string): Promise<User> {
    const isExistValidUser: boolean = await this.existsUser(
      registerDto.email,
      true,
    );
    if (isExistValidUser) {
      const msg = await this.messageService.get(
        MessageCode.USER_ALREADY_EXISTS,
        {
          email: registerDto.email,
        },
      );
      throw new UnauthorizedException(msg);
    }
    await this.deleteUserByEmail(registerDto.email);
    await this.createVerifyEmail(registerDto.email, origin);
    return await this.createNewUser(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      const msg = await this.messageService.get(
        MessageCode.INVALID_CREDENTIALS,
      );
      throw new UnauthorizedException(msg);
    }
    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
    });
    return { token };
  }

  async resendVerification(email: string, origin: string) {
    const existsValidUser: boolean = await this.existsUser(email);
    if (!existsValidUser) {
      const msg = await this.messageService.get(MessageCode.USER_NOT_FOUND, {
        email,
      });
      throw new NotFoundException(msg);
    }
    await this.createVerifyEmail(email, origin);
  }

  async verifyToken(token: string, i18n: I18nContext): Promise<User> {
    let decoded: { email: string };
    try {
      decoded = this.jwtService.verify<{ email: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        const msg = await this.messageService.get(
          MessageCode.TOKEN_EXPIRED,
          i18n,
        );
        throw new UnauthorizedException(msg);
      } else {
        const msg = await this.messageService.get(
          MessageCode.INVALID_TOKEN,
          i18n,
        );
        throw new UnauthorizedException(msg);
      }
    }
    const user = await this.userModel.findOne({ email: decoded.email });
    if (!user) {
      const msg = await this.messageService.get(
        MessageCode.INVALID_TOKEN,
        i18n,
      );
      throw new UnauthorizedException(msg);
    }
    user.is_active = true;
    return await user.save();
  }

  private async findUser(
    email: string,
    is_active?: boolean,
  ): Promise<User | null> {
    const filter: Partial<Record<'email' | 'is_active', any>> = { email };
    if (typeof is_active === 'boolean') {
      filter.is_active = is_active;
    }
    return await this.userModel.findOne(filter);
  }

  private async existsUser(
    email: string,
    is_active?: boolean,
  ): Promise<boolean> {
    const existingUser = await this.findUser(email, is_active);
    return existingUser != null;
  }

  private async deleteUserByEmail(email: string) {
    await this.userModel.deleteMany({ email, is_active: false });
  }

  private async createVerifyEmail(email: string, origin: string) {
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
  }

  private async createNewUser(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = new this.userModel({
      email: registerDto.email,
      display_name: registerDto.display_name,
      password: hashedPassword,
    });

    return await user.save();
  }

  private async sendVerificationEmail(email: string, url: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or SMTP config
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const subject = await this.messageService.get(
      MessageCode.VERIFY_EMAIL_SUBJECT,
    );

    const html = await this.messageService.get(
      MessageCode.VERIFY_EMAIL_TEMPLATE,
      { url },
    );

    await transporter.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
