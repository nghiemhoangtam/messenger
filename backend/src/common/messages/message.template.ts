import { MessageCode } from './message.enum';

export const MessageTemplates: Record<MessageCode, string> = {
  [MessageCode.INVALID_CREDENTIALS]: 'Username or password is incorrect.',
  [MessageCode.TOKEN_EXPIRED]: 'Token expired.',
  [MessageCode.INVALID_TOKEN]: 'Invalid token.',
  [MessageCode.USER_ALREADY_EXISTS]: 'Email {{email}} already exists',
  [MessageCode.VERIFY_EMAIL_SUBJECT]: 'Verify Your Email',
  [MessageCode.VERIFY_EMAIL_TEMPLATE]:
    '<p>Click <a href="{{url}}">here</a> to verify your email.</p>',
  [MessageCode.CORS_ORIGIN_MISSING]:
    'Origin header is missing. Possible CORS violation or non-browser request.',
};
