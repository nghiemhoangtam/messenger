import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../user/schemas';
import { RoomActivity } from '../common/schemas/room_activity.schema';
import { RoomMember } from '../common/schemas/room_members.schema';

@Injectable()
export class RoomActivityService {
  private readonly logger = new Logger(RoomActivityService.name);

  constructor(
    @InjectModel(RoomActivity.name) private roomActivityModel: Model<RoomActivity>,
    @InjectModel(RoomMember.name) private roomMemberModel: Model<RoomMember>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Update user activity status in a room
   */
  async updateUserActivity(
    roomId: string,
    userId: string,
    status: 'online' | 'offline' | 'away' | 'busy',
  ): Promise<void> {
    try {
      // Check if user is a member of the room
      const isMember = await this.roomMemberModel.findOne({
        room_id: new Types.ObjectId(roomId),
        user_id: new Types.ObjectId(userId),
      }).exec();

      if (!isMember) {
        this.logger.warn(`User ${userId} is not a member of room ${roomId}`);
        return;
      }

      const now = new Date();
      const updateData: any = {
        status,
        last_seen: now,
        updated_at: now,
      };

      // If status is online, update joined_at
      if (status === 'online') {
        updateData.joined_at = now;
        updateData.left_at = null;
      } else if (status === 'offline') {
        updateData.left_at = now;
      }

      await this.roomActivityModel.findOneAndUpdate(
        {
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        },
        updateData,
        {
          upsert: true,
          new: true,
        },
      ).exec();

      this.logger.log(`Updated user ${userId} activity in room ${roomId} to ${status}`);
    } catch (error) {
      this.logger.error(`Error updating user activity: ${error.message}`);
    }
  }

  /**
   * Get all active users in a room
   */
  async getRoomActivity(roomId: string): Promise<any[]> {
    try {
      const activities = await this.roomActivityModel
        .find({
          room_id: new Types.ObjectId(roomId),
          status: { $in: ['online', 'away', 'busy'] },
        })
        .populate('user_id', 'display_name avatar email')
        .sort({ last_seen: -1 })
        .exec();

      return activities.map((activity) => ({
        user_id: activity.user_id,
        status: activity.status,
        last_seen: activity.last_seen,
        joined_at: activity.joined_at,
      }));
    } catch (error) {
      this.logger.error(`Error getting room activity: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user activity in all rooms
   */
  async getUserActivity(userId: string): Promise<any[]> {
    try {
      const activities = await this.roomActivityModel
        .find({
          user_id: new Types.ObjectId(userId),
        })
        .populate('room_id', 'name type avatar')
        .sort({ updated_at: -1 })
        .exec();

      return activities.map((activity) => ({
        room_id: activity.room_id,
        status: activity.status,
        last_seen: activity.last_seen,
        joined_at: activity.joined_at,
      }));
    } catch (error) {
      this.logger.error(`Error getting user activity: ${error.message}`);
      return [];
    }
  }

  /**
   * Remove user activity from a room (when user leaves)
   */
  async removeUserActivity(roomId: string, userId: string): Promise<void> {
    try {
      await this.roomActivityModel.findOneAndUpdate(
        {
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        },
        {
          status: 'offline',
          left_at: new Date(),
          updated_at: new Date(),
        },
      ).exec();

      this.logger.log(`Removed user ${userId} activity from room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error removing user activity: ${error.message}`);
    }
  }

  /**
   * Get room activity summary (count of online users)
   */
  async getRoomActivitySummary(roomId: string): Promise<{
    total_members: number;
    online_users: number;
    away_users: number;
    busy_users: number;
    offline_users: number;
  }> {
    try {
      const [totalMembers, onlineCount, awayCount, busyCount, offlineCount] = await Promise.all([
        this.roomMemberModel.countDocuments({ room_id: new Types.ObjectId(roomId) }),
        this.roomActivityModel.countDocuments({
          room_id: new Types.ObjectId(roomId),
          status: 'online',
        }),
        this.roomActivityModel.countDocuments({
          room_id: new Types.ObjectId(roomId),
          status: 'away',
        }),
        this.roomActivityModel.countDocuments({
          room_id: new Types.ObjectId(roomId),
          status: 'busy',
        }),
        this.roomActivityModel.countDocuments({
          room_id: new Types.ObjectId(roomId),
          status: 'offline',
        }),
      ]);

      return {
        total_members: totalMembers,
        online_users: onlineCount,
        away_users: awayCount,
        busy_users: busyCount,
        offline_users: offlineCount,
      };
    } catch (error) {
      this.logger.error(`Error getting room activity summary: ${error.message}`);
      return {
        total_members: 0,
        online_users: 0,
        away_users: 0,
        busy_users: 0,
        offline_users: 0,
      };
    }
  }

  /**
   * Clean up old activity records (older than 30 days)
   */
  async cleanupOldActivity(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.roomActivityModel.deleteMany({
        updated_at: { $lt: thirtyDaysAgo },
        status: 'offline',
      }).exec();

      this.logger.log(`Cleaned up ${result.deletedCount} old activity records`);
    } catch (error) {
      this.logger.error(`Error cleaning up old activity: ${error.message}`);
    }
  }
}
