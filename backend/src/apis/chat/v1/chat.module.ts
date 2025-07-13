import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from 'src/apis/auth/common/schemas';
import { User, UserSchema } from 'src/apis/user/schemas';
import { RedisModule } from 'src/common/redis/redis.module';
import { Message, MessageSchema, Room, RoomSchema } from '../common/schemas';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
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
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
