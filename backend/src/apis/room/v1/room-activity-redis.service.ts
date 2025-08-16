import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
    roomOnlineUsersKey,
    userPresenceKey,
    userRoomsKey,
    userStatusKey
} from '../../../common/redis/redis.key';

export interface UserPresence {
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: Date;
  room_id: string;
}

export interface RoomActivitySummary {
  total_members: number;
  online_users: number;
  offline_users: number;
  away_users: number;
  busy_users: number;
}

@Injectable()
export class RoomActivityRedisService {
  private readonly logger = new Logger(RoomActivityRedisService.name);
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly PRESENCE_TTL = 1800; // 30 minutes for presence

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Add user to room's online users list
   */
  async addUserToRoom(userId: string, roomId: string, status: 'online' | 'away' | 'busy' = 'online'): Promise<void> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const userKey = userRoomsKey(userId);
      const presenceKey = userPresenceKey(userId);
      
      // Use Redis pipeline for better performance
      const pipeline = this.redis.pipeline();
      
      // Add user to room's online users set
      pipeline.sadd(roomKey, userId);
      
      // Add room to user's rooms set
      pipeline.sadd(userKey, roomId);
      
      // Set user status with TTL
      pipeline.set(userStatusKey(userId), status, 'EX', this.DEFAULT_TTL);
      
      // Set user presence in room
      const presence: UserPresence = {
        status,
        last_seen: new Date(),
        room_id: roomId
      };
      pipeline.setex(presenceKey, this.PRESENCE_TTL, JSON.stringify(presence));
      
      // Execute all commands atomically
      await pipeline.exec();
      
      this.logger.log(`User ${userId} added to room ${roomId} with status ${status}`);
    } catch (error) {
      this.logger.error(`Error adding user to room: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove user from room's online users list
   */
  async removeUserFromRoom(userId: string, roomId: string): Promise<void> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const userKey = userRoomsKey(userId);
      const presenceKey = userPresenceKey(userId);
      
      const pipeline = this.redis.pipeline();
      
      // Remove user from room's online users set
      pipeline.srem(roomKey, userId);
      
      // Remove room from user's rooms set
      pipeline.srem(userKey, roomId);
      
      // Delete user presence in this room
      pipeline.del(presenceKey);
      
      await pipeline.exec();
      
      this.logger.log(`User ${userId} removed from room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error removing user from room: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user status in a room
   */
  async updateUserStatus(userId: string, roomId: string, status: 'online' | 'offline' | 'away' | 'busy'): Promise<void> {
    try {
      if (status === 'offline') {
        await this.removeUserFromRoom(userId, roomId);
        return;
      }

      const presenceKey = userPresenceKey(userId);
      const userKey = userRoomsKey(userId);
      
      // Update presence
      const presence: UserPresence = {
        status,
        last_seen: new Date(),
        room_id: roomId
      };
      
      await this.redis.setex(presenceKey, this.PRESENCE_TTL, JSON.stringify(presence));
      
      // Update user status
      await this.redis.setex(userStatusKey(userId), this.DEFAULT_TTL, status);
      
      this.logger.log(`User ${userId} status updated to ${status} in room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error updating user status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get online users count for a room
   */
  async getRoomOnlineCount(roomId: string): Promise<number> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const count = await this.redis.scard(roomKey);
      return count;
    } catch (error) {
      this.logger.error(`Error getting room online count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get detailed room activity summary
   */
  async getRoomActivitySummary(roomId: string, totalMembers: number): Promise<RoomActivitySummary> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      
      // Get all online users in room
      const onlineUsers = await this.redis.smembers(roomKey);
      
      // Count different statuses
      let awayCount = 0;
      let busyCount = 0;
      let onlineCount = 0;
      
      // Check status of each online user
      for (const userId of onlineUsers) {
        const presenceKey = userPresenceKey(userId);
        const presenceData = await this.redis.get(presenceKey);
        
        if (presenceData) {
          const presence: UserPresence = JSON.parse(presenceData);
          if (presence.room_id === roomId) {
            switch (presence.status) {
              case 'online':
                onlineCount++;
                break;
              case 'away':
                awayCount++;
                break;
              case 'busy':
                busyCount++;
                break;
            }
          }
        }
      }
      
      const offlineCount = totalMembers - onlineCount - awayCount - busyCount;
      
      return {
        total_members: totalMembers,
        online_users: onlineCount,
        away_users: awayCount,
        busy_users: busyCount,
        offline_users: Math.max(0, offlineCount),
      };
    } catch (error) {
      this.logger.error(`Error getting room activity summary: ${error.message}`);
      return {
        total_members: totalMembers,
        online_users: 0,
        away_users: 0,
        busy_users: 0,
        offline_users: totalMembers,
      };
    }
  }

  /**
   * Get all online users in a room with their details
   */
  async getRoomOnlineUsers(roomId: string): Promise<string[]> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const users = await this.redis.smembers(roomKey);
      return users;
    } catch (error) {
      this.logger.error(`Error getting room online users: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if user is online in a room
   */
  async isUserOnlineInRoom(userId: string, roomId: string): Promise<boolean> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const isMember = await this.redis.sismember(roomKey, userId);
      return isMember === 1;
    } catch (error) {
      this.logger.error(`Error checking user online status: ${error.message}`);
      return false;
    }
  }

  /**
   * Get user's current status across all rooms
   */
  async getUserPresence(userId: string): Promise<UserPresence | null> {
    try {
      const presenceKey = userPresenceKey(userId);
      const presenceData = await this.redis.get(presenceKey);
      
      if (presenceData) {
        return JSON.parse(presenceData);
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error getting user presence: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all rooms where user is online
   */
  async getUserOnlineRooms(userId: string): Promise<string[]> {
    try {
      const userKey = userRoomsKey(userId);
      const rooms = await this.redis.smembers(userKey);
      return rooms;
    } catch (error) {
      this.logger.error(`Error getting user online rooms: ${error.message}`);
      return [];
    }
  }

  /**
   * Remove user from all rooms when they disconnect
   */
  async removeUserFromAllRooms(userId: string): Promise<void> {
    try {
      const userKey = userRoomsKey(userId);
      const rooms = await this.redis.smembers(userKey);
      
      if (rooms.length === 0) {
        return;
      }
      
      const pipeline = this.redis.pipeline();
      
      // Remove user from all rooms
      for (const roomId of rooms) {
        const roomKey = roomOnlineUsersKey(roomId);
        pipeline.srem(roomKey, userId);
      }
      
      // Delete user's room list
      pipeline.del(userKey);
      
      // Delete user status
      pipeline.del(userStatusKey(userId));
      
      // Delete user presence
      pipeline.del(userPresenceKey(userId));
      
      await pipeline.exec();
      
      this.logger.log(`User ${userId} removed from ${rooms.length} rooms`);
    } catch (error) {
      this.logger.error(`Error removing user from all rooms: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user count by status in a room
   */
  async getRoomStatusCounts(roomId: string): Promise<{ [key: string]: number }> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const onlineUsers = await this.redis.smembers(roomKey);
      
      const statusCounts: { [key: string]: number } = {
        online: 0,
        away: 0,
        busy: 0,
        offline: 0
      };
      
      for (const userId of onlineUsers) {
        const presence = await this.getUserPresence(userId);
        if (presence && presence.room_id === roomId) {
          statusCounts[presence.status]++;
        }
      }
      
      return statusCounts;
    } catch (error) {
      this.logger.error(`Error getting room status counts: ${error.message}`);
      return { online: 0, away: 0, busy: 0, offline: 0 };
    }
  }

  /**
   * Extend user's presence TTL (keep alive)
   */
  async extendUserPresence(userId: string): Promise<void> {
    try {
      const presenceKey = userPresenceKey(userId);
      const userKey = userRoomsKey(userId);
      
      // Extend TTL for both presence and status
      await this.redis.expire(presenceKey, this.PRESENCE_TTL);
      await this.redis.expire(userKey, this.DEFAULT_TTL);
      
      // this.logger.debug(`Extended presence TTL for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error extending user presence: ${error.message}`);
    }
  }

  /**
   * Clean up expired data and get statistics
   */
  async cleanupAndGetStats(): Promise<{ total_rooms: number; total_users: number; memory_usage: string }> {
    try {
      // Get all room keys
      const roomKeys = await this.redis.keys('room:online:*');
      const userKeys = await this.redis.keys('user:rooms:*');
      
      let totalUsers = 0;
      for (const roomKey of roomKeys) {
        const count = await this.redis.scard(roomKey);
        totalUsers += count;
      }
      
      // Get Redis memory info
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
      
      const stats = {
        total_rooms: roomKeys.length,
        total_users: totalUsers,
        memory_usage: memoryUsage
      };
      
      this.logger.log(`Cleanup completed. Stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      this.logger.error(`Error during cleanup: ${error.message}`);
      return { total_rooms: 0, total_users: 0, memory_usage: 'Unknown' };
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if room is currently active based on multiple criteria
   */
  async isRoomActive(roomId: string): Promise<boolean> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      
      // Get online users count
      const onlineCount = await this.redis.scard(roomKey);
      
      // If there are online users, room is definitely active
      if (onlineCount > 0) {
        return true;
      }
      
      // Check recent activity (last 5 minutes)
      const recentActivityKey = `room:recent_activity:${roomId}`;
      const recentActivity = await this.redis.get(recentActivityKey);
      
      if (recentActivity) {
        const lastActivity = new Date(parseInt(recentActivity));
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (lastActivity > fiveMinutesAgo) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error checking room activity: ${error.message}`);
      return false;
    }
  }

  /**
   * Record recent activity in room (messages, joins, etc.)
   */
  async recordRoomActivity(roomId: string, activityType: 'message' | 'join' | 'leave' | 'status_change'): Promise<void> {
    try {
      const recentActivityKey = `room:recent_activity:${roomId}`;
      const now = Date.now();
      
      // Set recent activity timestamp with 5 minutes TTL
      await this.redis.setex(recentActivityKey, 300, now.toString());
      
      this.logger.debug(`Recorded ${activityType} activity for room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error recording room activity: ${error.message}`);
    }
  }

  /**
   * Get room activity level (high, medium, low, inactive)
   */
  async getRoomActivityLevel(roomId: string): Promise<'high' | 'medium' | 'low' | 'inactive'> {
    try {
      const roomKey = roomOnlineUsersKey(roomId);
      const onlineCount = await this.redis.scard(roomKey);
      
      if (onlineCount >= 3) {
        return 'high';
      } else if (onlineCount >= 1) {
        return 'medium';
      } else {
        // Check recent activity
        const recentActivityKey = `room:recent_activity:${roomId}`;
        const recentActivity = await this.redis.get(recentActivityKey);
        
        if (recentActivity) {
          const lastActivity = new Date(parseInt(recentActivity));
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          
          if (lastActivity > fiveMinutesAgo) {
            return 'low';
          }
        }
        
        return 'inactive';
      }
    } catch (error) {
      this.logger.error(`Error getting room activity level: ${error.message}`);
      return 'inactive';
    }
  }
}
