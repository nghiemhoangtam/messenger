import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Room } from 'src/apis/chat/common/schemas';
import { User } from 'src/apis/user/schemas';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { randomString } from 'src/utils/random.utils';
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
        .find({ user: userId })
        .populate('room')
        .exec();
      if (!roomMembers || roomMembers.length === 0) {
        return [];
      }
      return roomMembers.map((member) => member.room);
    });
  }

  async createRoom(userId: string, roomDto: CreateRoomDto): Promise<void> {
    var savedRoom: Room;
    var savedRoomMembers: RoomMember[] = [];

    return this.handle(async () => {
      const newRoom = new this.roomModel({
        room_code: randomString(10), // Generate a random room code
        name: roomDto.name,
        type: 'group', // Assuming all created rooms are groups
        created_by: userId, // Set the creator of the room
        is_active: true, // Assuming the creator is active
        created_at: new Date(),
      });
      savedRoom = await newRoom.save();
      const newRoomMember = new this.roomMemberModel({
        room: savedRoom._id,
        user: userId,
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
          .findById(new Types.ObjectId(memberId))
          .exec();
        if (!user) {
          throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
        }
        const roomMember = new this.roomMemberModel({
          room: savedRoom._id,
          user,
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
}
