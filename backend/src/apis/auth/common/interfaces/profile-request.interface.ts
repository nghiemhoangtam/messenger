import { Request } from 'express';

export interface IJwtRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  token?: string;
}
