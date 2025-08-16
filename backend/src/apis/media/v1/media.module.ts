import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '../../../common/redis/redis.module';
import { Token, TokenSchema } from '../../auth/common/schemas';
import { JwtStrategy } from '../../auth/common/strategies/jwt.strategy';
import { User, UserSchema } from '../../user/schemas';
import { File, FileSchema } from '../schema/file.schema';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    PassportModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, JwtStrategy],
  exports: [MediaService],
})
export class MediaModule {}
