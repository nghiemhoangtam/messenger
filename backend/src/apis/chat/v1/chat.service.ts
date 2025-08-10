import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { PaginationResponse } from 'src/common/dto/response/pagination.response';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { CreateMessageDto } from '../common/dto/request/create-message.dto';
import { EditMessageDto } from '../common/dto/request/edit-message.dto';
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

  async createMessage(senderId: string, dto: CreateMessageDto): Promise<MessageResponse> {
    return await this.handle(async () => {
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
      
      // Tạo message mới
      const newMessage = new this.messageModel({
        room_id: new Types.ObjectId(dto.room_id),
        sender_id: new Types.ObjectId(senderId),
        content: dto.content,
        type: dto.type || 'text', // Sử dụng type từ dto
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        status: 'sent',
      });
      
      const savedMessage = await newMessage.save();
      
      // Trả về MessageResponse
      const messageReads = await this.messageReadModel.find({ message_id: savedMessage._id }).exec();
      return new MessageResponse(savedMessage, messageReads, sender);
    });
  }

  async getMessages(roomId: string, pageRequest: PaginationRequest): Promise<PaginationResponse<MessageResponse>> {
    return await this.handle(async () => {
      const page = pageRequest.page || 1;
      const limit = pageRequest.limit || 10;
      const skip = (page - 1) * limit;
      
      const messages = await this.messageModel
        .find({ room_id: new Types.ObjectId(roomId) })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
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
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async markMessagesAsRead(userId: string, roomId: string, messageIds: string[]): Promise<void> {
    return await this.handle(async () => {
      const user = await this.userModel.findById(new Types.ObjectId(userId)).exec();
      if (!user) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      // Create read records for each message
      const readPromises = messageIds.map(messageId => {
        return this.messageReadModel.findOneAndUpdate(
          {
            message_id: new Types.ObjectId(messageId),
            reader_id: new Types.ObjectId(userId),
          },
          {
            message_id: new Types.ObjectId(messageId),
            reader_id: new Types.ObjectId(userId),
            read_at: new Date(),
          },
          {
            upsert: true,
            new: true,
          }
        ).exec();
      });

      await Promise.all(readPromises);
    });
  }

  async editMessage(userId: string, messageId: string, dto: EditMessageDto): Promise<MessageResponse> {
    return await this.handle(async () => {
      // Find the message
      const message = await this.messageModel.findById(new Types.ObjectId(messageId)).exec();
      if (!message) {
        throw new NotFoundException([{ code: MessageCode.MESSAGE_NOT_FOUND }]);
      }

      // Check if user is the sender of the message
      if (message.sender_id.toString() !== userId) {
        throw new ForbiddenException([{ code: MessageCode.FORBIDDEN }]);
      }

      // Update the message
      const updatedMessage = await this.messageModel.findByIdAndUpdate(
        new Types.ObjectId(messageId),
        {
          content: dto.content,
          type: dto.type || message.type,
          edited_at: new Date(),
          edited_by: new Types.ObjectId(userId),
          updated_at: new Date(),
        },
        { new: true }
      ).exec();

      if (!updatedMessage) {
        throw new NotFoundException([{ code: MessageCode.MESSAGE_NOT_FOUND }]);
      }

      // Get sender and message reads for response
      const sender = await this.userModel.findById(new Types.ObjectId(userId)).exec();
      if (!sender) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      const messageReads = await this.messageReadModel.find({ message_id: updatedMessage._id }).exec();
      
      return new MessageResponse(updatedMessage, messageReads, sender);
    });
  }
}
