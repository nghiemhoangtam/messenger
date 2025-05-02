import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from '../user/schemas';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
  SocialAccount,
  SocialAccountSchema,
} from './schemas';
import { Token, TokenSchema } from './schemas/tokens.schema';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: SocialAccount.name, schema: SocialAccountSchema }, // Assuming SocialAccount uses the same schema as User
      { name: Token.name, schema: TokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, GoogleStrategy, FacebookStrategy, AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
