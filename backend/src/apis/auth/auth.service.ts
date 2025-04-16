import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
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
    await this.validateInputRegister(registerDto.email);
    await this.deleteUserByEmail(registerDto.email);
    await this.createVerifyEmail(registerDto.email, origin);
    return await this.createNewUser(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(
        this.messageService.getMessage(MessageCode.INVALID_CREDENTIALS),
      );
    }
    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
    });
    return { token };
  }

  async resendVerification(email: string, origin: string) {
    await this.createVerifyEmail(email, origin);
  }

  async verifyToken(token: string): Promise<User> {
    let decoded: { email: string };
    try {
      decoded = this.jwtService.verify<{ email: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          this.messageService.getMessage(MessageCode.TOKEN_EXPIRED),
        );
      } else {
        throw new UnauthorizedException(
          this.messageService.getMessage(MessageCode.INVALID_TOKEN),
        );
      }
    }
    const user = await this.userModel.findOne({ email: decoded.email });
    if (!user) {
      throw new UnauthorizedException(
        this.messageService.getMessage(MessageCode.INVALID_TOKEN),
      );
    }
    user.is_active = true;
    return await user.save();
  }

  private async validateInputRegister(email: string) {
    const existingUser = await this.userModel.findOne({
      email,
      is_active: true,
    });
    if (existingUser) {
      throw new UnauthorizedException(
        this.messageService.getMessage(MessageCode.USER_ALREADY_EXISTS, {
          email,
        }),
      );
    }
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

    await transporter.sendMail({
      to: email,
      subject: this.messageService.getMessage(MessageCode.VERIFY_EMAIL_SUBJECT),
      html: this.messageService.getMessage(MessageCode.VERIFY_EMAIL_TEMPLATE, {
        url,
      }),
    });
  }
}
