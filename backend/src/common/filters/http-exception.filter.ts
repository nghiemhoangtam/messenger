import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'Internal Server Error';
    let stack = '';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      status = exception.getStatus();
      if (typeof res === 'object' && res !== null) {
        const errRes = res as { message?: string | string[]; error?: string };
        message = Array.isArray(errRes.message)
          ? errRes.message.join(', ')
          : (errRes.message ?? exception.message);
        errorType = errRes.error ?? exception.name;
        stack = exception.stack ?? '';
      } else {
        message = exception.message;
        errorType = exception.name;
        stack = exception.stack ?? '';
      }
    }

    const fileInfo = this.extractFileLine(stack);
    this.logger.error(
      `[${errorType}] ${message}\nAt: ${fileInfo}\nRequest: ${request.method} ${request.url}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractFileLine(stack: string): string {
    const lines = stack.split('\n');
    const relevantLine = lines.find(
      (line) => line.includes('.ts') || line.includes('.js'),
    );
    if (!relevantLine) return 'unknown';

    const match = relevantLine.match(/\((.*):(\d+):(\d+)\)/);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`;
    }

    const inlineMatch = relevantLine.match(/at (.*):(\d+):(\d+)/);
    if (inlineMatch) {
      return `${inlineMatch[1]}:${inlineMatch[2]}:${inlineMatch[3]}`;
    }

    return 'unknown';
  }
}
