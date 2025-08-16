import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { PaginationResponse } from 'src/common/dto/response/pagination.response';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { MediaService } from '../../media/v1/media.service';
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
    @InjectModel(MessageRead.name) private messageReadModel: Model<MessageRead>,
    private readonly mediaService: MediaService
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

      // Validate reply_to_id if provided
      let replyToMessage: Message | undefined = undefined;
      let replyToSender: User | undefined = undefined;
      if (dto.reply_to_id) {
        const foundReplyMessage = await this.messageModel.findOne({
          _id: new Types.ObjectId(dto.reply_to_id),
          room_id: new Types.ObjectId(dto.room_id),
          is_deleted: false,
        }).exec();
        if (!foundReplyMessage) {
          throw new NotFoundException([{ code: MessageCode.MESSAGE_NOT_FOUND }]);
        }
        replyToMessage = foundReplyMessage;
        
        const foundReplySender = await this.userModel.findById(replyToMessage.sender_id).exec();
        if (!foundReplySender) {
          throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
        }
        replyToSender = foundReplySender;
      }
      
      // Tạo message mới
      const newMessage = new this.messageModel({
        room_id: new Types.ObjectId(dto.room_id),
        sender_id: new Types.ObjectId(senderId),
        content: dto.content,
        type: dto.type || 'text', // Sử dụng type từ dto
        reply_to_id: dto.reply_to_id ? new Types.ObjectId(dto.reply_to_id) : undefined,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        status: 'sent',
      });
      
      const savedMessage = await newMessage.save();

      // Link file to message if file_id is provided
      if (dto.file_id) {
        await this.mediaService.linkFileToMessage(dto.file_id, savedMessage._id?.toString() || '');
      }
      
      // Get files for this message
      let files: any[] = [];
      try {
        files = await this.mediaService.getFilesByMessageId(savedMessage._id?.toString() || '');
      } catch (error) {
        console.warn('Failed to get files for message:', error);
      }
      
      // Trả về MessageResponse
      const messageReads = await this.messageReadModel.find({ message_id: savedMessage._id }).exec();
      return new MessageResponse(savedMessage, messageReads, sender, replyToMessage, replyToSender, this.mediaService, files);
    });
  }

  async getMessages(roomId: string, pageRequest: PaginationRequest): Promise<PaginationResponse<MessageResponse>> {
    return await this.handle(async () => {
      const page = pageRequest.page || 1;
      const limit = pageRequest.limit || 10;
      const skip = (page - 1) * limit;
      
      const messages = await this.messageModel
        .find({ 
          room_id: new Types.ObjectId(roomId),
          is_deleted: false // Filter out deleted messages
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      const total = await this.messageModel.countDocuments({ 
        room_id: new Types.ObjectId(roomId),
        is_deleted: false // Filter out deleted messages
      });
      
      return {
        results: await Promise.all(messages.map(async (message) => {
          const messageReads = await this.messageReadModel.find({ message_id: message._id }).exec();
          const sender = await this.userModel.findById(new Types.ObjectId(message.sender_id)).exec();
          if (!sender) {
            throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
          }
          
          // Get files for this message
          let files: any[] = [];
          try {
            files = await this.mediaService.getFilesByMessageId(message._id?.toString() || '');
          } catch (error) {
            console.warn('Failed to get files for message:', error);
          }
          
          // Get reply message info if exists
          let replyToMessage: Message | undefined = undefined;
          let replyToSender: User | undefined = undefined;
          if (message.reply_to_id) {
            const foundReplyMessage = await this.messageModel.findById(message.reply_to_id).exec();
            if (foundReplyMessage) {
              replyToMessage = foundReplyMessage;
              const foundReplySender = await this.userModel.findById(replyToMessage.sender_id).exec();
              if (foundReplySender) {
                replyToSender = foundReplySender;
              }
            }
          }
          
          return new MessageResponse(message, messageReads, sender, replyToMessage, replyToSender, this.mediaService, files);
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
      
      // Get reply message info if exists
      let replyToMessage: Message | undefined = undefined;
      let replyToSender: User | undefined = undefined;
      if (updatedMessage.reply_to_id) {
        const foundReplyMessage = await this.messageModel.findById(updatedMessage.reply_to_id).exec();
        if (foundReplyMessage) {
          replyToMessage = foundReplyMessage;
          const foundReplySender = await this.userModel.findById(replyToMessage.sender_id).exec();
          if (foundReplySender) {
            replyToSender = foundReplySender;
          }
        }
      }
      
      return new MessageResponse(updatedMessage, messageReads, sender, replyToMessage, replyToSender, this.mediaService);
    });
  }

  async deleteMessage(userId: string, messageId: string): Promise<{ room_id: string }> {
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

      // Soft delete the message by setting is_deleted to true
      await this.messageModel.findByIdAndUpdate(
        new Types.ObjectId(messageId),
        {
          is_deleted: true,
          updated_at: new Date(),
        }
      ).exec();

      // Return room_id for real-time notification
      return { room_id: message.room_id.toString() };
    });
  }

  async getMessageById(messageId: string): Promise<MessageResponse> {
    return await this.handle(async () => {
      const message = await this.messageModel.findById(new Types.ObjectId(messageId)).exec();
      if (!message) {
        throw new NotFoundException([{ code: MessageCode.MESSAGE_NOT_FOUND }]);
      }

      const messageReads = await this.messageReadModel.find({ message_id: message._id }).exec();
      const sender = await this.userModel.findById(message.sender_id).exec();
      if (!sender) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      // Get reply message info if exists
      let replyToMessage: Message | undefined = undefined;
      let replyToSender: User | undefined = undefined;
      if (message.reply_to_id) {
        const foundReplyMessage = await this.messageModel.findById(message.reply_to_id).exec();
        if (foundReplyMessage) {
          replyToMessage = foundReplyMessage;
          const foundReplySender = await this.userModel.findById(replyToMessage.sender_id).exec();
          if (foundReplySender) {
            replyToSender = foundReplySender;
          }
        }
      }

      return new MessageResponse(message, messageReads, sender, replyToMessage, replyToSender, this.mediaService);
    });
  }
}
