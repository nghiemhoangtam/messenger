import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { PaginationResponse } from 'src/common/dto/response/pagination.response';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { CreateMessageDto } from '../common/dto/request/create-message.dto';
import { MessageResponse } from '../common/dto/response/message.response';
import { Message, MessageRead, Room } from '../common/schemas';

@Injectable()
export class ChatService extends BaseService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>, //
    @InjectModel(Room.name) private roomModel: Model<Room>, //
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(MessageRead.name) private messageReadModel: Model<MessageRead>
  ) {
    super();
  }

  async createMessage(senderId: string, dto: CreateMessageDto): Promise<void> {
    this.handle(async () => {
      // check exist roomId
      const room = await this.roomModel.findOne({
        _id: new Types.ObjectId(dto.room_id),
      });
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.INVALID_ROOM_CODE }]);
      }
      const sender = await this.userModel.findOne({
        _id: new Types.ObjectId(senderId),
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

  async getMessages(roomId: string, pageRequest: PaginationRequest): Promise<PaginationResponse<MessageResponse>> {
    return await this.handle(async () => {
      const messages = await this.messageModel.find({ room_id: new Types.ObjectId(roomId) }).sort({ created_at: -1 }).skip((pageRequest.page || 1) * (pageRequest.limit || 10)).limit(pageRequest.limit || 10).exec();
      const total = await this.messageModel.countDocuments({ room_id: new Types.ObjectId(roomId) });
      return {
        results: await Promise.all(messages.map(async (message) => {
          const messageReads = await this.messageReadModel.find({ message_id: message._id }).exec();
          const sender = await this.userModel.findById(new Types.ObjectId(message.sender_id)).exec();
          if (!sender) {
            throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
          }
          return new MessageResponse(message, messageReads, sender);
        })),
        meta: {
          total,
          page: pageRequest.page || 1,
          limit: pageRequest.limit || 10,
          totalPages: Math.ceil(total / (pageRequest.limit || 10)),
        },
      };
    });
  } 
}
