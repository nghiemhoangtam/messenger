import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { ChatGateway } from '../chat.gateway';
import { CreateMessageDto } from '../common/dto/request/create-message.dto';
import { EditMessageDto } from '../common/dto/request/edit-message.dto';
import { MessageResponse } from '../common/dto/response/message.response';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller({ path: 'chat', version: '1' })
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}
  
  @Post()
  @ApiOperation({ summary: 'Send a message', description: 'Send a message to a chat room' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: MessageResponse })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendMessage(@Body() dto: CreateMessageDto, @Req() req: IJwtRequest): Promise<MessageResponse> {
    if (req.user) {
      const message = await this.chatService.createMessage(req.user.id, dto);
      
      // Emit real-time event to all users in the room
      this.chatGateway.emitMessageToRoom(dto.room_id, message);
      
      return message;
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('messages/:roomId')
  @ApiOperation({
    summary: 'Get messages by room ID',
    description: 'Retrieve messages by room ID',
  })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Messages not found' })
  async getMessages(@Param('roomId') roomId: string, @Req() req: IJwtRequest, @Query() pageRequest: PaginationRequest) {
    if (req.user) {
      return this.chatService.getMessages(roomId, pageRequest);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('mark-as-read/:roomId')
  @ApiOperation({
    summary: 'Mark all messages in a room as read',
    description: 'Mark all unread messages in a specific room as read for the current user',
  })
  @ApiResponse({ status: 200, description: 'Messages marked as read successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async markMessagesAsRead(@Req() req: IJwtRequest, @Param('roomId') roomId: string) {
    if (req.user) {
      // Get all message IDs in the room and mark them as read
      const messages = await this.chatService.getMessages(roomId, { page: 1, limit: 1000 });
      const messageIds = messages.results.map(msg => msg.id);
      
      if (messageIds.length > 0) {
        await this.chatService.markMessagesAsRead(req.user.id, roomId, messageIds);
      }
      
      return { success: true, message: 'Messages marked as read successfully' };
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Put(':messageId')
  @ApiOperation({ 
    summary: 'Edit a message', 
    description: 'Edit an existing message by message ID' 
  })
  @ApiBody({ type: EditMessageDto })
  @ApiResponse({ status: 200, description: 'Message edited successfully', type: MessageResponse })
  @ApiResponse({ status: 403, description: 'Forbidden - User can only edit their own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
    @Req() req: IJwtRequest
  ): Promise<MessageResponse> {
    if (req.user) {
      const message = await this.chatService.editMessage(req.user.id, messageId, dto);
      
      // Emit real-time event to all users in the room
      this.chatGateway.emitMessageEdited(message.room_id, message);
      
      return message;
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Delete(':messageId')
  @ApiOperation({ 
    summary: 'Delete a message', 
    description: 'Delete an existing message by message ID (soft delete)' 
  })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - User can only delete their own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Req() req: IJwtRequest
  ): Promise<{ success: boolean; message: string }> {
    if (req.user) {
      await this.chatService.deleteMessage(req.user.id, messageId);
      
      // Emit real-time event to all users in the room
      this.chatGateway.emitMessageDeleted(messageId);
      
      return { success: true, message: 'Message deleted successfully' };
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
}
