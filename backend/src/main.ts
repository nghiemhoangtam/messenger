import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT', 3000);
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
