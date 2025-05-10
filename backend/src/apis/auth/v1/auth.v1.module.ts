import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'src/common/redis/redis.module';
import { User, UserSchema } from '../../user/schemas';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
  SocialAccount,
  SocialAccountSchema,
} from '../common/schemas';
import { Token, TokenSchema } from '../common/schemas/tokens.schema';
import { FacebookStrategy } from '../common/strategies/facebook.strategy';
import { GoogleStrategy } from '../common/strategies/google.strategy';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { AuthV1Controller } from './auth.v1.controller';
import { AuthV1Service } from './auth.v1.service';

@Module({
  imports: [
    RedisModule,
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
  controllers: [AuthV1Controller],
  providers: [JwtStrategy, GoogleStrategy, FacebookStrategy, AuthV1Service],
  exports: [JwtModule],
})
export class AuthV1Module {}
