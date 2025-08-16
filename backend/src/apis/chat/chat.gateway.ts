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
import { RoomActivityRedisService } from '../room/v1/room-activity-redis.service';
import { RoomService } from '../room/v1/room.service';
import { ContactResponse } from '../user-relationship/common/dto/contact.response';
import { UsersService } from '../user/users.service';
import { CreateMessageDto } from './common/dto/request/create-message.dto';
import { EditMessageDto } from './common/dto/request/edit-message.dto';
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
    private readonly roomActivityRedisService: RoomActivityRedisService,
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
      
      // Update user activity to offline in all rooms they were in
      this.handleUserDisconnect(user_id);
    }
  }

  private async handleUserDisconnect(userId: string) {
    try {
      // Remove user from all rooms using Redis
      await this.roomActivityRedisService.removeUserFromAllRooms(userId);
      
      // Get all rooms the user was in to notify others
      const userRooms = await this.roomService.getUserRooms(userId);
      
      // Notify other users in each room about the user going offline
      for (const room of userRooms) {
        const onlineCount = await this.roomActivityRedisService.getRoomOnlineCount(room.id);
        
        this.server.to(`room:${room.id}`).emit('user_activity_changed', {
          user_id: userId,
          room_id: room.id,
          status: 'offline',
          timestamp: new Date(),
          online_count: onlineCount,
        });
      }
    } catch (error) {
      this.logger.error(`Error handling user disconnect: ${error.message}`);
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
      rooms.forEach(async (room) => {
        if (room.startsWith('room:')) {
          client.leave(room);
          this.logger.log(`User ${user_id} left room ${room}`);
          
          // Remove user from previous room using Redis
          const previousRoomId = room.replace('room:', '');
          await this.roomActivityRedisService.removeUserFromRoom(user_id, previousRoomId);
        }
      });

      // Join the new room
      client.join(`room:${room_id}`);
      this.logger.log(`User ${user_id} joined room ${room_id}`);

      // Add user to room's online users using Redis with default 'online' status
      await this.roomActivityRedisService.addUserToRoom(user_id, room_id, 'online');

      // Record room activity for green dot
      await this.roomActivityRedisService.recordRoomActivity(room_id, 'join');

      // Get room activity summary using Redis
      const totalMembers = await this.roomService.getRoomMemberCount(room_id);
      const activitySummary = await this.roomActivityRedisService.getRoomActivitySummary(room_id, totalMembers);

      // Notify other users in the room about the new user joining
      client.to(`room:${room_id}`).emit('user_joined', {
        user_id,
        room_id,
        timestamp: new Date(),
        online_count: activitySummary.online_users,
        total_members: activitySummary.total_members,
        away_count: activitySummary.away_users,
        busy_count: activitySummary.busy_users,
      });

      // Send current room activity to the joining user
      client.emit('room_activity', {
        room_id,
        online_count: activitySummary.online_users,
        total_members: activitySummary.total_members,
        away_count: activitySummary.away_users,
        busy_count: activitySummary.busy_users,
        offline_count: activitySummary.offline_users,
      });

      // IMPORTANT: Update room activity for ALL users in the room (including the joining user)
      // This ensures real-time sync of room status across all members
      // Use setTimeout to debounce rapid updates and prevent infinite loops
      setTimeout(() => {
        this.server.to(`room:${room_id}`).emit('room_activity', {
          room_id,
          online_count: activitySummary.online_users,
          total_members: activitySummary.total_members,
          away_count: activitySummary.away_users,
          busy_count: activitySummary.busy_users,
          offline_count: activitySummary.offline_users,
        });
      }, 100); // 100ms debounce

      // Send room online users list
      const onlineUsers = await this.roomActivityRedisService.getRoomOnlineUsers(room_id);
      client.emit('room_online_users', {
        room_id,
        users: onlineUsers,
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

    // Remove user from room's online users using Redis
    await this.roomActivityRedisService.removeUserFromRoom(user_id, room_id);

    // Record room activity for green dot
    await this.roomActivityRedisService.recordRoomActivity(room_id, 'leave');

    // Get updated activity summary
    const totalMembers = await this.roomService.getRoomMemberCount(room_id);
    const activitySummary = await this.roomActivityRedisService.getRoomActivitySummary(room_id, totalMembers);

          // Notify other users in the room about the user leaving
      client.to(`room:${room_id}`).emit('user_left', {
        user_id,
        room_id,
        timestamp: new Date(),
        online_count: activitySummary.online_users,
        total_members: activitySummary.total_members,
        away_count: activitySummary.away_users,
        busy_count: activitySummary.busy_users,
      });

      // IMPORTANT: Update room activity for ALL remaining users in the room
      // This ensures real-time sync of room status when someone leaves
      // Use setTimeout to debounce rapid updates and prevent infinite loops
      setTimeout(() => {
        this.server.to(`room:${room_id}`).emit('room_activity', {
          room_id,
          online_count: activitySummary.online_users,
          total_members: activitySummary.total_members,
          away_count: activitySummary.away_users,
          busy_count: activitySummary.busy_users,
          offline_count: activitySummary.offline_users,
        });
      }, 100); // 100ms debounce
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; content: string; type?: string; reply_to_id?: string; file_id?: string },
  ) {
    const user_id = client.data.user_id;

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
      createMessageDto.reply_to_id = data.reply_to_id;
      createMessageDto.file_id = data.file_id;

      const message = await this.chatService.createMessage(
        user_id,
        createMessageDto,
      );

      this.logger.log(`Message created successfully:`, message);

      // Record room activity for green dot
      await this.roomActivityRedisService.recordRoomActivity(data.room_id, 'message');

      // Broadcast message to all users in the room
      const roomSockets = await this.server
        .in(`room:${data.room_id}`)
        .fetchSockets();
      this.logger.log(
        `Broadcasting message to ${roomSockets.length} users in room ${data.room_id}`,
      );

      this.server.to(`room:${data.room_id}`).emit('new_message', message);
      this.logger.log(`Broadcasted message to room ${data.room_id}`);

      // IMPORTANT: Update room activity for ALL users in the room after sending message
      // This ensures real-time sync of room status when activity occurs
      // Use setTimeout to debounce rapid updates and prevent infinite loops
      setTimeout(async () => {
        const totalMembers = await this.roomService.getRoomMemberCount(data.room_id);
        const activitySummary = await this.roomActivityRedisService.getRoomActivitySummary(data.room_id, totalMembers);
        
        this.server.to(`room:${data.room_id}`).emit('room_activity', {
          room_id: data.room_id,
          online_count: activitySummary.online_users,
          total_members: activitySummary.total_members,
          away_count: activitySummary.away_users,
          busy_count: activitySummary.busy_users,
          offline_count: activitySummary.offline_users,
        });
      }, 100); // 100ms debounce

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

  @SubscribeMessage('update_activity_status')
  async handleUpdateActivityStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; status: 'online' | 'offline' | 'away' | 'busy' },
  ) {
    const user_id = client.data.user_id;

    try {
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        data.room_id,
      );
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // Update user activity status using Redis
      await this.roomActivityRedisService.updateUserStatus(user_id, data.room_id, data.status);

      // Record room activity for green dot
      await this.roomActivityRedisService.recordRoomActivity(data.room_id, 'status_change');

      // Get updated activity summary
      const totalMembers = await this.roomService.getRoomMemberCount(data.room_id);
      const activitySummary = await this.roomActivityRedisService.getRoomActivitySummary(data.room_id, totalMembers);

      // Broadcast activity status change to other users in the room
      client.to(`room:${data.room_id}`).emit('user_activity_changed', {
        user_id,
        room_id: data.room_id,
        status: data.status,
        timestamp: new Date(),
        online_count: activitySummary.online_users,
        total_members: activitySummary.total_members,
        away_count: activitySummary.away_users,
        busy_count: activitySummary.busy_users,
      });

      // IMPORTANT: Update room activity for ALL users in the room
      // This ensures real-time sync of room status when activity changes
      // Use setTimeout to debounce rapid updates and prevent infinite loops
      setTimeout(() => {
        this.server.to(`room:${data.room_id}`).emit('room_activity', {
          room_id: data.room_id,
          online_count: activitySummary.online_users,
          total_members: activitySummary.total_members,
          away_count: activitySummary.away_users,
          busy_count: activitySummary.busy_users,
          offline_count: activitySummary.offline_users,
        });
      }, 100); // 100ms debounce

    } catch (error) {
      this.logger.error(`Error updating activity status: ${error.message}`);
      client.emit('error', { message: 'Failed to update activity status' });
    }
  }

  @SubscribeMessage('get_room_activity')
  async handleGetRoomActivity(
    @ConnectedSocket() client: Socket,
    @MessageBody() room_id: string,
  ) {
    const user_id = client.data.user_id;

    try {
      const isMember = await this.roomService.isUserMemberOfRoom(
        user_id,
        room_id,
      );
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // Get room activity using Redis
      const totalMembers = await this.roomService.getRoomMemberCount(room_id);
      const activitySummary = await this.roomActivityRedisService.getRoomActivitySummary(room_id, totalMembers);
      const onlineUsers = await this.roomActivityRedisService.getRoomOnlineUsers(room_id);

      // Send room activity to the requesting user
      client.emit('room_activity', {
        room_id,
        online_count: activitySummary.online_users,
        total_members: activitySummary.total_members,
        away_count: activitySummary.away_users,
        busy_count: activitySummary.busy_users,
        offline_count: activitySummary.offline_users,
      });

      // Send online users list
      client.emit('room_online_users', {
        room_id,
        users: onlineUsers,
      });

    } catch (error) {
      this.logger.error(`Error getting room activity: ${error.message}`);
      client.emit('error', { message: 'Failed to get room activity' });
    }
  }

  @SubscribeMessage('keep_alive')
  async handleKeepAlive(
    @ConnectedSocket() client: Socket,
    @MessageBody() room_id: string,
  ) {
    const user_id = client.data.user_id;

    try {
      // Extend user's presence TTL to keep them online
      await this.roomActivityRedisService.extendUserPresence(user_id);
      
      // Send acknowledgment
      client.emit('keep_alive_ack', {
        timestamp: new Date(),
        status: 'active'
      });
    } catch (error) {
      this.logger.error(`Error handling keep alive: ${error.message}`);
    }
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message_id: string; content: string; type?: string },
  ) {
    const user_id = client.data.user_id;

    this.logger.log(`Received edit_message from user ${user_id}:`, data);

    try {
      // Create edit message DTO
      const editMessageDto = new EditMessageDto();
      editMessageDto.content = data.content;
      editMessageDto.type = (data.type as any) || 'text';

      // Edit the message
      const updatedMessage = await this.chatService.editMessage(
        user_id,
        data.message_id,
        editMessageDto,
      );

      this.logger.log(`Message edited successfully:`, updatedMessage);

      // Record room activity for green dot
      await this.roomActivityRedisService.recordRoomActivity(updatedMessage.room_id, 'message');

      // Broadcast edited message to all users in the room
      this.server.to(`room:${updatedMessage.room_id}`).emit('message_edited', updatedMessage);
      this.logger.log(`Broadcasted edited message to room ${updatedMessage.room_id}`);

      // Emit confirmation to sender
      client.emit('message_edit_confirmed', {
        message_id: updatedMessage.id,
        room_id: updatedMessage.room_id,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Error editing message: ${error.message}`);
      client.emit('error', { message: 'Failed to edit message' });
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message_id: string },
  ) {
    const user_id = client.data.user_id;

    this.logger.log(`Received delete_message from user ${user_id}:`, data);

    try {
      // Delete the message
      const result = await this.chatService.deleteMessage(user_id, data.message_id);

      this.logger.log(`Message deleted successfully:`, result);

      // Record room activity for green dot
      await this.roomActivityRedisService.recordRoomActivity(result.room_id, 'message');

      // Broadcast deleted message to all users in the room
      this.server.to(`room:${result.room_id}`).emit('message_deleted', { 
        messageId: data.message_id 
      });
      this.logger.log(`Broadcasted deleted message to room ${result.room_id}`);

      // Emit confirmation to sender
      client.emit('message_delete_confirmed', {
        message_id: data.message_id,
        room_id: result.room_id,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      client.emit('error', { message: 'Failed to delete message' });
    }
  }

  // Method to emit message to specific room (used by REST API)
  emitMessageToRoom(room_id: string, message: MessageResponse) {
    this.server.to(`room:${room_id}`).emit('new_message', message);
  }

  // Method to emit edited message to specific room (used by REST API)
  emitMessageEdited(room_id: string, message: MessageResponse) {
    this.server.to(`room:${room_id}`).emit('message_edited', message);
  }

  // Method to emit deleted message to specific room (used by REST API)
  emitMessageDeleted(messageId: string, room_id: string) {
    this.server.to(`room:${room_id}`).emit('message_deleted', { messageId });
  }
} 