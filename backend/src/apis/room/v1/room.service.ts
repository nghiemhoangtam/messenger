import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Room } from 'src/apis/chat/common/schemas';
import { User } from 'src/apis/user/schemas';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { CreateRoomDto } from '../common/dtos/create-room.dto';
import { RoomMember } from '../common/schemas/room_members.schema';

@Injectable()
export class RoomService extends BaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>, //
    @InjectModel(Room.name) private roomModel: Model<Room>, //
    @InjectModel(RoomMember.name) private roomMemberModel: Model<RoomMember>,
  ) {
    super();
  }

  async findAllByUserId(userId: string): Promise<Room[]> {
    return this.handle(async () => {
      const roomMembers = await this.roomMemberModel
        .find({ user_id: new Types.ObjectId(userId), is_active: true })
        .populate('room_id')
        .exec();
      if (!roomMembers || roomMembers.length === 0) {
        return [];
      }
      const roomIds = roomMembers.map(member => member.room_id);
      return this.roomModel
        .find({ _id: { $in: roomIds }, is_active: true })
        .populate('created_by_id')
        .exec();
    });
  }

  async createGroupRoom(userId: string, roomDto: CreateRoomDto): Promise<void> {
    var savedRoom: Room;
    var savedRoomMembers: RoomMember[] = [];

    return this.handle(async () => {
      const newRoom = new this.roomModel({
        name: roomDto.name,
        type: 'group', // Assuming all created rooms are groups
        created_by_id: new Types.ObjectId(userId), // Set the creator of the room
        is_active: true, // Assuming the creator is active
        created_at: new Date(),
      });
      savedRoom = await newRoom.save();
      const newRoomMember = new this.roomMemberModel({
        room_id: savedRoom._id,
        user_id: userId,
        joined_at: new Date(),
        role: 'admin', // Assuming the creator is an admin
      });

      savedRoomMembers.push(await newRoomMember.save());
      
      const members = this.cleanRoomMembers(roomDto.members, userId);

      for (const memberId of members) {
        if (isValidObjectId(memberId) === false) {
          throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
        }
        const user = await this.userModel
          .findOne({_id: new Types.ObjectId(memberId), is_active: true })
          .exec();
        if (!user) {
          throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
        }
        const roomMember = new this.roomMemberModel({
          room_id: savedRoom._id,
          user_id: user._id,
          joined_at: new Date(),
          role: 'member', // Default role for other members
        });
        savedRoomMembers.push(await roomMember.save());
      }
    }, async (error) => {
        console.error('Rollback data');
        await this.roomModel.deleteOne({ _id: savedRoom._id }).exec();
        await Promise.all(savedRoomMembers.map(member => this.roomMemberModel.deleteOne({ _id: member._id }).exec()));
        throw error;
    })
  }

  private cleanRoomMembers (members: string[], adminId: string): string[] {
    const uniqueMembers = [...new Set(members)];
    return uniqueMembers.filter(id => id != adminId);
  }

  async joinRoom(userId: string, roomId: string): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(roomId)) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      const room = await this.roomModel.findById(roomId).exec();
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      const existingMember = await this.roomMemberModel
        .findOne({
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        })
        .exec();
      if (existingMember) {
        throw new NotFoundException([{ code: MessageCode.USER_ALREADY_IN_ROOM }]);
      }
      const newRoomMember = new this.roomMemberModel({
        room_id: room._id,
        user_id: new Types.ObjectId(userId),
        joined_at: new Date(),
        role: 'member', // Default role for joining members
      });
      await newRoomMember.save();
    });
  }   

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(roomId)) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      const room = await this.roomModel.findById(roomId).exec();
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      const member = await this.roomMemberModel
        .findOne({
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        })
        .exec();
      if (!member) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_IN_ROOM_MEMBER }]);
      }
      await this.roomMemberModel.deleteOne({ _id: member._id }).exec();
    });
  }

  async createPrivateRoom(
    userId: string,
    memberId: string,
  ): Promise<void> { 
    return this.handle(async () => {
      if (!isValidObjectId(memberId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      if (userId === memberId) {
        throw new NotFoundException([{ code: MessageCode.USER_CANNOT_CREATE_PRIVATE_ROOM_WITH_SELF }]);
      }

      const member = await this.userModel.findById(memberId).exec();
      if (!member) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      // lookup room by type and members by aggregation
      const existingRoom = await this.roomModel
        .aggregate([
          {
            $match: {
              type: 'private',
              is_active: true,
              $or: [
                { created_by_id: new Types.ObjectId(userId) },
                { created_by_id: new Types.ObjectId(memberId) },
              ],
            },
          },
          {
            $lookup: {
              from: 'room_members',
              localField: '_id',
              foreignField: 'room_id',
              as: 'members',
            },
          },
          {
            $match: {
              members: {
                $all: [
                  { $elemMatch: { user_id: new Types.ObjectId(userId) } },
                  { $elemMatch: { user_id: new Types.ObjectId(memberId) } },
                ],
              },
            },
          },
        ])
        .exec();

      if (existingRoom && existingRoom.length > 0) {
        throw new NotFoundException([{ code: MessageCode.PRIVATE_ROOM_ALREADY_EXISTS }]);
      }

      const newRoom = new this.roomModel({
        name: `ABCXYZ private room`,
        type: 'private',
        created_by_id: new Types.ObjectId(userId),
        is_active: true,
        created_at: new Date(),
      });
      const savedRoom = await newRoom.save();
      const roomMembers = [
        new this.roomMemberModel({
          room_id: savedRoom._id,
          user_id: new Types.ObjectId(userId),
          joined_at: new Date(),
          role: 'admin',
        }),
        new this.roomMemberModel({
          room_id: savedRoom._id,
          user_id: member._id,
          joined_at: new Date(),
          role: 'member',
        }),
      ];
      await Promise.all(roomMembers.map(member => member.save()));
    });
  }
}
