import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { WsJwtAuthGuard } from '../../../common/guards/ws-jwt-auth.guard';
import { RedisModule } from '../../../common/redis/redis.module';
import { Token, TokenSchema } from '../../auth/common/schemas';
import { Room, RoomSchema } from '../../room/common/schemas/rooms.schema';
import { RoomModule } from '../../room/v1/room.module';
import { User, UserSchema } from '../../user/schemas';
import { UsersModule } from '../../user/users.module';
import { ChatGateway } from '../chat.gateway';
import { MessageRead, MessageReadSchema } from '../common/schemas/message_reads.schema';
import { Message, MessageSchema } from '../common/schemas/messages.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageRead.name, schema: MessageReadSchema },
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('ACCESS_TOKEN_TTL') },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    RoomModule,
    UsersModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsJwtAuthGuard],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
