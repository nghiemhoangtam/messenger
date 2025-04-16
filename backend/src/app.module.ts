import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AuthModule } from './apis/auth/auth.module';
import { UsersModule } from './apis/user/users.module';
import { MessageModule } from './common/messages/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().default('your_host'),
        DB_PORT: Joi.number().default(27017),
        DB_NAME: Joi.string().default('your_database'),
        DB_USERNAME: Joi.string().default('your_username'),
        DB_PASSWORD: Joi.string().default('your_password'),
        JWT_SECRET: Joi.string().default('your_jwt_secret'),
        SERVER_PORT: Joi.number().default(3000),
        SERVER_HOST: Joi.string().default('localhost'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('DB_USERNAME')}:${configService.get('DB_PASSWORD')}@${configService.get('DB_HOST')}:${configService.get<number>('DB_PORT')}/${configService.get('DB_NAME')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MessageModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  // controllers: [AppController,UsersController],
  // providers: [AppService],
})
export class AppModule {}
