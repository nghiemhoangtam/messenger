import { Logger, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from '../../common/guards/ws-jwt-auth.guard';
import { RoomService } from '../room/v1/room.service';
import { CreateMessageDto } from './common/dto/request/create-message.dto';
import { MessageResponse } from './common/dto/response/message.response';
import { ChatService } from './v1/chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
@UseGuards(WsJwtAuthGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.set(userId, client);
      this.logger.log(`Client connected: ${userId}`);
      
      // Join user to their personal room
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = client.data.userId;
    
    try {
      // Check if user is member of the room
      const isMember = await this.roomService.isUserMemberOfRoom(userId, roomId);
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // Leave previous room if any
      const rooms = Array.from(client.rooms);
      rooms.forEach(room => {
        if (room.startsWith('room:')) {
          client.leave(room);
        }
      });

      // Join the new room
      client.join(`room:${roomId}`);
      this.logger.log(`User ${userId} joined room ${roomId}`);

      // Notify other users in the room
      client.to(`room:${roomId}`).emit('user_joined', {
        userId,
        roomId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error joining conversation: ${error.message}`);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = client.data.userId;
    
    client.leave(`room:${roomId}`);
    this.logger.log(`User ${userId} left room ${roomId}`);

    // Notify other users in the room
    client.to(`room:${roomId}`).emit('user_left', {
      userId,
      roomId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: string },
  ) {
    const userId = client.data.userId;
    
    try {
      // Check if user is member of the room
      const isMember = await this.roomService.isUserMemberOfRoom(userId, data.roomId);
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // Create message
      const createMessageDto = new CreateMessageDto();
      createMessageDto.room_id = data.roomId;
      createMessageDto.content = data.content;
      createMessageDto.type = data.type || 'text'; // Sử dụng type từ data

      const message = await this.chatService.createMessage(userId, createMessageDto);

      // Broadcast message to all users in the room
      this.server.to(`room:${data.roomId}`).emit('new_message', message);

      // Emit delivery confirmation to sender
      client.emit('message_delivered', {
        messageId: message.id,
        roomId: data.roomId,
        timestamp: new Date(),
      });

      this.logger.log(`Message sent in room ${data.roomId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    
    try {
      const isMember = await this.roomService.isUserMemberOfRoom(userId, data.roomId);
      if (!isMember) {
        return;
      }

      // Broadcast typing indicator to other users in the room
      client.to(`room:${data.roomId}`).emit('typing_start', {
        userId,
        roomId: data.roomId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error handling typing start: ${error.message}`);
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    
    try {
      const isMember = await this.roomService.isUserMemberOfRoom(userId, data.roomId);
      if (!isMember) {
        return;
      }

      // Broadcast typing stop to other users in the room
      client.to(`room:${data.roomId}`).emit('typing_stop', {
        userId,
        roomId: data.roomId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error handling typing stop: ${error.message}`);
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; messageIds: string[] },
  ) {
    const userId = client.data.userId;
    
    try {
      const isMember = await this.roomService.isUserMemberOfRoom(userId, data.roomId);
      if (!isMember) {
        return;
      }

      // Mark messages as read
      await this.chatService.markMessagesAsRead(userId, data.roomId, data.messageIds);

      // Broadcast read receipt to other users in the room
      client.to(`room:${data.roomId}`).emit('message_read', {
        userId,
        roomId: data.roomId,
        messageIds: data.messageIds,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
    }
  }

  // Method to emit message to specific room (used by REST API)
  emitMessageToRoom(roomId: string, message: MessageResponse) {
    this.server.to(`room:${roomId}`).emit('new_message', message);
  }

  // Method to emit typing indicator
  emitTypingIndicator(roomId: string, userId: string, isTyping: boolean) {
    const event = isTyping ? 'typing_start' : 'typing_stop';
    this.server.to(`room:${roomId}`).emit(event, {
      userId,
      roomId,
      timestamp: new Date(),
    });
  }

  // Method to emit read receipt
  emitReadReceipt(roomId: string, userId: string, messageIds: string[]) {
    this.server.to(`room:${roomId}`).emit('message_read', {
      userId,
      roomId,
      messageIds,
      timestamp: new Date(),
    });
  }
} 