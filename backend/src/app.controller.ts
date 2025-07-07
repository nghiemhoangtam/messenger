import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // This controller can be used to define global routes or health checks
  // For example, you can add a simple health check endpoint here
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
