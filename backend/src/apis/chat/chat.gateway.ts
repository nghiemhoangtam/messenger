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
import { ContactResponse } from '../user-relationship/common/dto/contact.response';
import { UsersService } from '../user/users.service';
import { CreateMessageDto } from './common/dto/request/create-message.dto';
import { MessageResponse } from './common/dto/response/message.response';
import { ChatService } from './v1/chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
@UseGuards(WsJwtAuthGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log('=== CONNECTION ATTEMPT ===');
    this.logger.log('Client ID:', client.id);
    this.logger.log('Client headers:', client.handshake.headers);
    this.logger.log('Client auth object:', client.handshake.auth);
    this.logger.log('Client data:', client.data);

    // Try to manually extract token and verify
    const authObject = client.handshake.auth;
    if (authObject && authObject.token) {
      this.logger.log('Found token in auth object:', authObject.token.substring(0, 20) + '...');
      
      // Manually verify token here
      try {
        const jwtService = new (require('@nestjs/jwt').JwtService)();
        const payload = jwtService.verify(authObject.token.replace('Bearer ', ''), {
          secret: process.env.JWT_SECRET,
        });
        this.logger.log('JWT payload:', payload);
        
        client.data.user = payload;
        client.data.user_id = payload.id;
        this.logger.log('Set user_id in client.data:', client.data.user_id);
        
        this.connectedUsers.set(payload.id, client);
        client.join(`user:${payload.id}`);
      } catch (error) {
        this.logger.error('JWT verification failed:', error.message);
      }
    } else {
      this.logger.log('No token found in auth object');
    }

    const user_id = client.data.user_id;
    this.logger.log('User ID from data:', user_id);
    
    if (user_id) {
      this.connectedUsers.set(user_id, client);
      this.logger.log(`Client connected: ${user_id}`);

      // Join user to their personal room
      client.join(`user:${user_id}`);
    } else {
      this.logger.log('No user_id found in client.data');
    }
  }

  handleDisconnect(client: Socket) {
    const user_id = client.data.user_id;
    if (user_id) {
      this.connectedUsers.delete(user_id);
      this.logger.log(`Client disconnected: ${user_id}`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() room_id: string,
  ) {
    const user_id = client.data.user_id;

    this.logger.log(`User ${user_id} attempting to join room ${room_id}`);

    try {
      // Check if user is member of the room
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        room_id,
      );
      if (!isMember) {
        this.logger.log(`User ${user_id} is not a member of room ${room_id}`);
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // Leave previous room if any
      const rooms = Array.from(client.rooms);
      rooms.forEach((room) => {
        if (room.startsWith('room:')) {
          client.leave(room);
          this.logger.log(`User ${user_id} left room ${room}`);
        }
      });

      // Join the new room
      client.join(`room:${room_id}`);
      this.logger.log(`User ${user_id} joined room ${room_id}`);

      // Notify other users in the room
      client.to(`room:${room_id}`).emit('user_joined', {
        user_id,
        room_id,
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
    @MessageBody() room_id: string,
  ) {
    const user_id = client.data.user_id;

    client.leave(`room:${room_id}`);
    this.logger.log(`User ${user_id} left room ${room_id}`);

    // Notify other users in the room
    client.to(`room:${room_id}`).emit('user_left', {
      user_id,
      room_id,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; content: string; type?: string },
  ) {
    const user_id = client.data.user_id;

    this.logger.log(`Received send_message from user ${user_id}:`, data);

    try {
      // Check if user is member of the room
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        data.room_id,
      );
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // Create message
      const createMessageDto = new CreateMessageDto();
      createMessageDto.room_id = data.room_id;
      createMessageDto.content = data.content;
      createMessageDto.type = data.type || 'text';

      const message = await this.chatService.createMessage(
        user_id,
        createMessageDto,
      );

      this.logger.log(`Message created successfully:`, message);

      // Broadcast message to all users in the room
      const roomSockets = await this.server
        .in(`room:${data.room_id}`)
        .fetchSockets();
      this.logger.log(
        `Broadcasting message to ${roomSockets.length} users in room ${data.room_id}`,
      );

      this.server.to(`room:${data.room_id}`).emit('new_message', message);
      this.logger.log(`Broadcasted message to room ${data.room_id}`);

      // Emit delivery confirmation to sender
      client.emit('message_delivered', {
        message_id: message.id,
        room_id: data.room_id,
        timestamp: new Date(),
      });

      this.logger.log(`Message sent in room ${data.room_id} by user ${user_id}`);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const user_id = client.data.user_id;

    try {
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        data.room_id,
      );
      if (!isMember) {
        return;
      }

      // Get user details for typing indicator
      const user = await this.usersService.getProfile(user_id);
      if (!user) {
        this.logger.error(`User not found: ${user_id}`);
        return;
      }
      const contactResponse = new ContactResponse(user);

      // Broadcast typing indicator to other users in the room
      client.to(`room:${data.room_id}`).emit('typing_start', {
        user: contactResponse,
        room_id: data.room_id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error handling typing start: ${error.message}`);
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const user_id = client.data.user_id;

    try {
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        data.room_id,
      );
      if (!isMember) {
        return;
      }

      // Get user details for typing indicator
      const user = await this.usersService.getProfile(user_id);
      if (!user) {
        this.logger.error(`User not found: ${user_id}`);
        return;
      }
      const contactResponse = new ContactResponse(user);

      // Broadcast typing stop to other users in the room
      client.to(`room:${data.room_id}`).emit('typing_stop', {
        user: contactResponse,
        room_id: data.room_id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error handling typing stop: ${error.message}`);
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; message_ids: string[] },
  ) {
    const user_id = client.data.user_id;

    try {
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        data.room_id,
      );
      if (!isMember) {
        return;
      }

      // Mark messages as read
      await this.chatService.markMessagesAsRead(
        user_id,
        data.room_id,
        data.message_ids,
      );

      // Broadcast read receipt to other users in the room
      client.to(`room:${data.room_id}`).emit('message_read', {
        user_id,
        room_id: data.room_id,
        message_ids: data.message_ids,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
    }
  }

  // Method to emit message to specific room (used by REST API)
  emitMessageToRoom(room_id: string, message: MessageResponse) {
    this.server.to(`room:${room_id}`).emit('new_message', message);
  }

  // Method to emit typing indicator
  async emitTypingIndicator(room_id: string, user_id: string, isTyping: boolean) {
    try {
      const user = await this.usersService.getProfile(user_id);
      if (!user) {
        this.logger.error(`User not found: ${user_id}`);
        return;
      }
      const contactResponse = new ContactResponse(user);
      
      const event = isTyping ? 'typing_start' : 'typing_stop';
      this.server.to(`room:${room_id}`).emit(event, {
        user: contactResponse,
        room_id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error emitting typing indicator: ${error.message}`);
    }
  }

  // Method to emit read receipt
  emitReadReceipt(room_id: string, user_id: string, message_ids: string[]) {
    this.server.to(`room:${room_id}`).emit('message_read', {
      user_id,
      room_id,
      message_ids,
      timestamp: new Date(),
    });
  }
} 