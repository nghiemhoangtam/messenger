import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { CreateMessageDto } from '../common/dto/create-message.dto';
import { Message, Room } from '../common/schemas';

@Injectable()
export class ChatService extends BaseService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>, //
    @InjectModel(Room.name) private roomModel: Model<Room>, //
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    super();
  }

  async createMessage(senderId: string, dto: CreateMessageDto): Promise<void> {
    this.handle(async () => {
      // check exist roomId
      const room = await this.roomModel.findOne({
        room_code: dto.roomCode
      });
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.INVALID_ROOM_CODE }]);
      }
      const sender = await this.userModel.findOne({
        _id: senderId,
      });
      if (!sender) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      new this.messageModel({
        room,
        sender,
        content: dto.content,
        type: 'text',
      }).save();
    });
  }
}
