import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EmailQueueService {
  constructor(@Inject('EMAIL_SERVICE') private readonly client: ClientProxy) {}

  async sendEmail(email: string, subject: string, html: string) {
    const payload = { email, subject, html};

    try {
      await this.client.emit('send_email', payload).toPromise();
      return {
        success: true,
        message: 'Send email queued successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to queue email: ${error.message}`,
      };
    }
  }
}
