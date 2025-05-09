import { Request } from 'express';

export interface IUserRequest extends Request {
  user?: {
    email: string;
    provider: string;
    provider_id: string;
    access_token: string;
    refresh_token: string;
    display_name: string;
    avatar?: string;
  };
}
