// base.service.ts
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { MessageCode } from '../messages/message.enum';

export abstract class BaseService {
  constructor() {}

  protected async handle<T>(
    fn: () => Promise<T>,
    customErrorHandler?: (error: unknown) => Promise<void> | void,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (customErrorHandler) {
        await customErrorHandler(error);
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(MessageCode.INTERNAL_SERVER);
    }
  }
}
