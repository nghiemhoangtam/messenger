import { Injectable } from '@nestjs/common';
import { MessageCode } from './message.enum';
import { MessageTemplates } from './message.template';

@Injectable()
export class MessageService {
  getMessage(code: MessageCode, params?: Record<string, string>): string {
    let template = MessageTemplates[code];

    if (!template) return code;

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }

    return template;
  }
}
