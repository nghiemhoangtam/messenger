import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as passport from 'passport';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // chỉ giữ lại các field có trong DTO
      forbidNonWhitelisted: true, // ❌ báo lỗi nếu có field lạ
      transform: true, // tự động convert types (VD: string -> number)
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
