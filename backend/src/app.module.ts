import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';
import * as Joi from 'joi';
import * as mongoose from 'mongoose';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { AuthV1Module } from './apis/auth/v1/auth.v1.module';
import { AuthV2Module } from './apis/auth/v2/auth.v2.module';
import { ChatModule } from './apis/chat/v1/chat.module';
import { UsersModule } from './apis/user/users.module';
import { AppController } from './app.controller';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { MessageModule } from './common/messages/message.module';
import { RedisModule } from './common/redis/redis.module';

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
        ACCESS_TOKEN_TTL: Joi.number().default(3600), // 1 hour
        REFRESH_TOKEN_TTL: Joi.number().default(604800), // 7 days
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_USERNAME: Joi.string().default(''),
        REDIS_PASSWORD: Joi.string().default(''),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL') ?? 60,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 100,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            username: configService.get<string>('REDIS_USERNAME'),
            password: configService.get<string>('REDIS_PASSWORD'),
          }),
        ),
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
    AuthV1Module,
    AuthV2Module,
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'i18n'),
        watch: false,
      },
      resolvers: [
        new QueryResolver(['lang', 'l', 'lng']),
        new HeaderResolver(['Accept-Language']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
    }),
    RedisModule,
    MessageModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    mongoose.set('debug', function (collectionName, method, query, doc) {
      console.log(
        `[MongoDB] ${collectionName}.${method}`,
        JSON.stringify(query),
        doc || '',
      );
    });
  }
}
