import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from 'src/apis/chat/common/schemas';
import { BaseService } from 'src/common/services/base.service';
import { RoomMember } from '../common/schemas/room_members.schema';

@Injectable()
export class RoomService extends BaseService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>, //
    @InjectModel(RoomMember.name) private roomMemberModel: Model<RoomMember>,
  ) {
    super();
  }

  async findAllByUserId(userId: string): Promise<Room[]> {
    const roomMembers = await this.roomMemberModel
      .find({ user: userId })
      .populate('room')
      .exec();
    if (!roomMembers || roomMembers.length === 0) {
      return [];
    }
    return roomMembers.map((member) => member.room);
  }
}
