import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
const VALIDATION_ERROR = 'VALIDATION_ERROR';
const BUSINESS_ERROR = 'BUSINESS_ERROR';
const NOT_FOUND_ERROR = 'NOT_FOUND';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorType = '';
    let stack = '';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const status = exception.getStatus();

      if (typeof res === 'object' && res !== null) {
        const errRes = res as {
          message: any[];
          error?: string;
        };
        errorType = errRes.error ?? exception.name;
        stack = exception.stack ?? '';
        let errorCode: string;
        let message: {
          code: string;
          params: any;
        }[] = [];

        if ((status as HttpStatus) === HttpStatus.BAD_REQUEST) {
          errorCode = VALIDATION_ERROR;
          message = errRes.message.map(
            (item: { code: string; field: string }) => {
              let code: string = 'UNDEFINED';
              const params: string | null = item.field;

              switch (item.code) {
                case 'isNotEmpty':
                  code = 'REQUIRED';
                  break;
                case 'isEmail':
                  code = 'INVALID_EMAIL';
                  break;
                case 'isNumber':
                  code = 'INVALID_NUMBER';
                  break;
                case 'isInt':
                  code = 'INVALID_INTEGER';
                  break;
                case 'minLength':
                  code = 'TOO_SHORT';
                  break;
                case 'maxLength':
                  code = 'TOO_LONG';
                  break;
                case 'min':
                  code = 'TOO_SMALL';
                  break;
                case 'max':
                  code = 'TOO_LARGE';
                  break;
                default:
                  code = 'INVALID';
                  break;
              }
              return {
                code,
                params,
              };
            },
          );
        } else if ((status as HttpStatus) === HttpStatus.NOT_FOUND) {
          errorCode = NOT_FOUND_ERROR;
          message = errRes.message as { code: string; params: any }[];
        } else if (
          (status as HttpStatus) === HttpStatus.INTERNAL_SERVER_ERROR
        ) {
          errorCode = INTERNAL_SERVER_ERROR;
        } else {
          errorCode = BUSINESS_ERROR;
          message = errRes.message as { code: string; params: any }[];
        }
        response.status(status).json({
          statusCode: status,
          code: errorCode,
          messages: message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }

    const fileInfo = this.extractFileLine(stack);
    this.logger.warn(
      `[${errorType}] \nAt: ${fileInfo}\nRequest: ${request.method} ${request.url}`,
    );
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
