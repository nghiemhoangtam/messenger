import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { CreateMessageDto } from '../common/dto/create-message.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller({ path: 'chat', version: '1' })
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  @ApiOperation({ summary: 'Send a message', description: 'Send a message to a chat room' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendMessage(@Body() dto: CreateMessageDto, @Req() req: IJwtRequest) {
    if (req.user) {
      await this.chatService.createMessage(req.user.id, dto);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
}
