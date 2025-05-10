import { Module } from '@nestjs/common';
import { AuthV2Controller } from './auth.v2.controller';
import { AuthV2Service } from './auth.v2.service';

@Module({
  controllers: [AuthV2Controller],
  providers: [AuthV2Service],
})
export class AuthV2Module {}
