import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { MessageCode } from './message.enum';

@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  async get(code: MessageCode, params?: Record<string, any>): Promise<string> {
    const key = `messages.${code}`;
    return this.i18n.t(key, {
      args: params,
      lang: I18nContext.current()?.lang ?? 'en',
    });
  }
}
