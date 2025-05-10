import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageService } from 'src/common/messages/message.service';

@ApiTags('auth')
@Controller({ path: 'auth', version: '2' })
export class AuthV2Controller {
  constructor(private readonly messageService: MessageService) {}

  @Get('welcome')
  @ApiOperation({
    summary: 'Welcome to auth api',
    description: 'Welcome to auth api',
  })
  @ApiResponse({
    status: 200,
    description: 'Test auth api successfully',
  })
  welcome() {
    return 'Welcome to auth v2';
  }
}
