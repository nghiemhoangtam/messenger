import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from 'src/apis/auth/common/schemas';
import { Room, RoomSchema } from 'src/apis/chat/common/schemas';
import { User, UserSchema } from 'src/apis/user/schemas';
import { RedisModule } from 'src/common/redis/redis.module';
import { RoomMember, RoomMemberSchema } from '../common/schemas/room_members.schema';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
    imports: [
      RedisModule,
      MongooseModule.forFeature([
        { name: Room.name, schema: RoomSchema },
        { name: User.name, schema: UserSchema },
        { name: Token.name, schema: TokenSchema },
        { name: RoomMember.name, schema: RoomMemberSchema }, // Import RoomMember schema
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
  
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService], // Export RoomService để có thể sử dụng trong ChatModule
})
export class RoomModule {}
