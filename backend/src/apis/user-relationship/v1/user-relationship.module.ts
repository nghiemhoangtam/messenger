import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'src/common/redis/redis.module';
import { Token, TokenSchema } from '../../auth/common/schemas';
import { User, UserSchema } from '../../user/schemas';
import { BlockList, BlockListSchema } from '../common/schemas/block_lists';
import { UserRelationship, UserRelationshipSchema } from '../common/schemas/user_relationships';
import { UserRelationshipController } from './user-relationship.controller';
import { UserRelationshipService } from './user-relationship.service';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
      { name: UserRelationship.name, schema: UserRelationshipSchema }, // Assuming UserRelationshipSchema is defined in the same file
      { name: BlockList.name, schema: BlockListSchema }, // Assuming BlockListSchema is defined in the same file
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
  controllers: [UserRelationshipController],
  providers: [UserRelationshipService],
})
export class UserRelationshipModule {}
