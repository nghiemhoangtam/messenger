import {
  BadRequestException,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as passport from 'passport';
import { join } from 'path';
import { AuthV1Module } from './apis/auth/v1/auth.v1.module';
import { AuthV2Module } from './apis/auth/v2/auth.v2.module';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableVersioning({ type: VersioningType.URI });

  const configV1 = new DocumentBuilder()
    .setTitle('Messenger API')
    .setDescription('Messenger clone with NestJS')
    .setVersion('1.0')
    .addBearerAuth() // If you use JWT auth
    .build();
  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [AuthV1Module],
  });
  SwaggerModule.setup('swagger/v1', app, documentV1);

  const configV2 = new DocumentBuilder()
    .setTitle('Messenger API')
    .setDescription('Messenger clone with NestJS')
    .setVersion('2.0')
    .addBearerAuth() // If you use JWT auth
    .build();
  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [AuthV2Module],
  });
  SwaggerModule.setup('swagger/v2', app, documentV2);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.entries(error.constraints || {}).map(([code, message]) => ({
            field: error.property,
            code,
            message,
          })),
        );

        return new BadRequestException(messages);
      },
    }),
  );
  app.use(passport.initialize());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT', 3000);
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app
    .listen(port)
    .then(() => {
      logger.log(`Application is running on: http://localhost:${port}`);
    })
    .catch((err: Error) => {
      logger.error(`Error starting the server: ${err.message}`);
    });
}
void bootstrap();
