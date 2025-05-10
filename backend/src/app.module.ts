import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import Joi from 'joi';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
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
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'i18n'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'l', 'lng']),
        new HeaderResolver(['Accept-Language']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
    }),
    MessageModule,
  ],
  // controllers: [AppController,UsersController],
  // providers: [AppService],
})
export class AppModule {}
