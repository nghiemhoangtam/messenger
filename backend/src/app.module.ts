import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://admin:secret@localhost:27017/nest_test?authSource=admin'),UsersModule,AuthModule],
  // controllers: [AppController,UsersController],
  // providers: [AppService],
})
export class AppModule {}
