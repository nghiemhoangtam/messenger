import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailQueueService } from './email-queue.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'email_verification_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [EmailQueueService],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}