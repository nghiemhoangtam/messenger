import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  constructor() {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const redirect =
      req.query.redirect || 'http://localhost:3000/auth/callback';
    return {
      state: redirect,
    };
  }
}
