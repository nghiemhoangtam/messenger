import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { UsersController } from './user.controllers';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
// import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService,JwtService],
  exports: [UsersService],
})
export class UsersModule {}
