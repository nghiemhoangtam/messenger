import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, PipelineStage, Types } from 'mongoose';
import { MessageResponse } from 'src/apis/chat/common/dto/response/message.response';
import { Room } from 'src/apis/chat/common/schemas';
import { ContactResponse } from 'src/apis/user-relationship/common/dto/contact.response';
import { User } from 'src/apis/user/schemas';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { PaginationResponse } from 'src/common/dto/response/pagination.response';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { CreateRoomDto } from '../common/dtos/request/create-room.request';
import { ConversationResponse } from '../common/dtos/response/conversation.response';
import { RoomResponse } from '../common/dtos/response/room.response';
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

  async findAllByUserId(
    userId: string,
    pageRequest: PaginationRequest,
  ): Promise<PaginationResponse<ConversationResponse>> {
    return this.handle(async () => {
      if (!isValidObjectId(userId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      const { page = 1, limit = 10 } = pageRequest;
      const skip = (page - 1) * limit;

      // if room is private, then get the other member's display name
      // if room is group, then get the group name
      const pipeline: PipelineStage[] = [
        { $match: { user_id: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'rooms',
            localField: 'room_id',
            foreignField: '_id',
            pipeline: [
              { $match: { is_active: true } }
            ],
            as: 'room',
          },
        },
        // Filter out records where room doesn't exist or is not active
        {
          $match: {
            'room': { $ne: [], $exists: true }
          }
        },
        // Lấy thông tin thành viên phòng
        {
          $lookup: {
            from: 'room_members',
            localField: 'room_id',
            foreignField: 'room_id',
            as: 'members',
          },
        },
        // Lấy thông tin user cho từng member
        {
          $lookup: {
            from: 'users',
            localField: 'members.user_id',
            foreignField: '_id',
            as: 'memberUsers',
          },
        },
        {
          $lookup: {
            from: 'messages',
            let: { roomId: '$room_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$room_id', '$$roomId'] } } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'sender_id',
                  foreignField: '_id',
                  as: 'sender',
                },
              },
              { $sort: { created_at: -1 } },
              { $limit: 1 },
            ],
            as: 'lastMessage',
          },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'room_id',
            foreignField: 'room_id',
            as: 'allMessages',
          },
        },
        {
          $lookup: {
            from: 'message_reads',
            let: { messageIds: '$allMessages._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$message_id', '$$messageIds'] },
                      { $eq: ['$reader_id', new Types.ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: 'reads',
          },
        },
        {
          $addFields: {
            unread_count: {
              $subtract: [{ $size: '$allMessages' }, { $size: '$reads' }],
            },
            // Nếu room là private, lấy display_name của thành viên còn lại, nếu group thì lấy name
            displayName: {
              $cond: [
                { $eq: [{ $arrayElemAt: ['$room.type', 0] }, 'private'] },
                {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$memberUsers',
                            as: 'member',
                            cond: { $ne: ['$$member._id', new Types.ObjectId(userId)] },
                          },
                        },
                        as: 'other',
                        in: '$$other.display_name',
                      },
                    },
                    0,
                  ],
                },
                { $arrayElemAt: ['$room.name', 0] },
              ],
            },
            // Nếu room là private, lấy avatar của thành viên còn lại, nếu group thì lấy avatar của room
            displayAvatar: {
              $cond: [
                { $eq: [{ $arrayElemAt: ['$room.type', 0] }, 'private'] },
                {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$memberUsers',
                            as: 'member',
                            cond: { $ne: ['$$member._id', new Types.ObjectId(userId)] },
                          },
                        },
                        as: 'other',
                        in: '$$other.avatar',
                      },
                    },
                    0,
                  ],
                },
                { $arrayElemAt: ['$room.avatar', 0] },
              ],
            },
          },
        },
        {
          $addFields: {
            lastMessageCreatedAt: '$lastMessage.created_at',
          },
        },
        {
          $sort: { lastMessageCreatedAt: -1 },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const result = await this.roomMemberModel.aggregate(pipeline).exec();
      const data = result[0].data || [];
      const total = result[0].totalCount[0]?.count || 0;

      // Map to ConversationResponse
      const records: ConversationResponse[] = data
        .map((item) => {
          // Check if room exists and is not empty array
          if (
            !item.room ||
            !Array.isArray(item.room) ||
            item.room.length === 0
          ) {
            return null; // Skip this item
          }

          const roomData = item.room[0]; // Get the first (and should be only) room
          const room: RoomResponse = {
            id: roomData._id.toString(),
            name: item.displayName,
            avatar: item.displayAvatar,
            created_at: roomData.created_at,
          };

          let lastMessage: MessageResponse | undefined;
          if (
            item.lastMessage &&
            Array.isArray(item.lastMessage) &&
            item.lastMessage.length > 0
          ) {
            const lastMessageData = item.lastMessage[0]; // Get the first (and should be only) message
            let sender: ContactResponse | undefined;
            if (lastMessageData.sender && lastMessageData.sender.length > 0) {
              const senderData = lastMessageData.sender[0];
              sender = {
                id: senderData._id.toString(),
                email: senderData.email,
                display_name: senderData.display_name,
                avatar: senderData.avatar,
                status: senderData.status,
                last_seen: senderData.last_seen,
              };
            } else {
              sender = {
                id: '',
                email: '',
                display_name: '',
                avatar: '',
                status: '',
                last_seen: new Date(),
              };
            }

            lastMessage = {
              id: lastMessageData._id.toString(),
              room_id: lastMessageData.room_id.toString(),
              sender: sender as ContactResponse,
              content: lastMessageData.content,
              created_at: lastMessageData.created_at,
              status: lastMessageData.status,
              message_reads: [],
              type: lastMessageData.type,
            };
          }

          const conversation: ConversationResponse = {
            room,
            lastMessage,
            unread_count: item.unread_count ?? 0,
          };
          return conversation;
        })
        .filter((record) => record !== null); // Filter out null records
      
      // Ensure we return the correct number of records
      const finalRecords = records.slice(0, limit);
      
      return new PaginationResponse(finalRecords, total, page, limit);
    });
  }

  async createGroupRoom(
    userId: string,
    roomDto: CreateRoomDto,
  ): Promise<ConversationResponse> {
    var savedRoom: Room;
    var savedRoomMembers: RoomMember[] = [];

    return this.handle(
      async () => {
        // Check if user exists and is active
        const creator = await this.userModel.findOne({ _id: new Types.ObjectId(userId), is_active: true }).exec();
        if (!creator) {
          throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
        }
        
        const newRoom = new this.roomModel({
          name: roomDto.name,
          type: 'group', // Assuming all created rooms are groups
          created_by_id: new Types.ObjectId(userId), // Set the creator of the room
          is_active: true, // Assuming the creator is active
          avatar: 'TEMP',
          created_at: new Date(),
        });
        savedRoom = await newRoom.save();
        const newRoomMember = new this.roomMemberModel({
          room_id: savedRoom._id,
          user_id: new Types.ObjectId(userId),
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
            .findOne({ _id: new Types.ObjectId(memberId), is_active: true })
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

        const result = new ConversationResponse();
        result.room = new RoomResponse(savedRoom);
        result.unread_count = 0;

        return result;
      },
      async (error) => {
        console.error('Rollback data');
        await this.roomModel.deleteOne({ _id: savedRoom._id }).exec();
        await Promise.all(
          savedRoomMembers.map((member) =>
            this.roomMemberModel.deleteOne({ _id: member._id }).exec(),
          ),
        );
        throw error;
      },
    );
  }

  private cleanRoomMembers(members: string[], adminId: string): string[] {
    const uniqueMembers = [...new Set(members)];
    return uniqueMembers.filter((id) => id != adminId);
  }

  async joinRoom(
    userId: string,
    roomId: string,
  ): Promise<ConversationResponse> {
    return this.handle(async () => {
      if (!isValidObjectId(roomId)) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      
      // Check if user exists and is active
      const user = await this.userModel.findOne({ _id: new Types.ObjectId(userId), is_active: true }).exec();
      if (!user) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      
      const room = await this.roomModel.findById(roomId).exec();
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      if (!room.is_active) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }

      // Only allow joining group rooms, not private rooms
      if (room.type !== 'group') {
        throw new BadRequestException([
          { code: MessageCode.INVALID_ROOM_TYPE_FOR_JOIN },
        ]);
      }

      // Check if room has reached max members
      const currentMemberCount = await this.roomMemberModel.countDocuments({
        room_id: new Types.ObjectId(roomId),
      }).exec();
      
      if (currentMemberCount >= room.max_members) {
        throw new BadRequestException([
          { code: MessageCode.ROOM_FULL },
        ]);
      }

      const existingMember = await this.roomMemberModel
        .findOne({
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        })
        .exec();
      if (existingMember) {
        throw new NotFoundException([
          { code: MessageCode.USER_ALREADY_IN_ROOM },
        ]);
      }

      const newRoomMember = new this.roomMemberModel({
        room_id: room._id,
        user_id: new Types.ObjectId(userId),
        joined_at: new Date(),
        role: 'member', // Default role for joining members
      });
      await newRoomMember.save();

      const result = new ConversationResponse();
      result.room = new RoomResponse(room);
      result.unread_count = 0;

      return result;
    });
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(roomId)) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      
      // Check if user exists and is active
      const user = await this.userModel.findOne({ _id: new Types.ObjectId(userId), is_active: true }).exec();
      if (!user) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      
      const room = await this.roomModel.findById(roomId).exec();
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      if (!room.is_active) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      const member = await this.roomMemberModel
        .findOne({
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        })
        .exec();
      if (!member) {
        throw new NotFoundException([
          { code: MessageCode.USER_NOT_IN_ROOM_MEMBER },
        ]);
      }
      await this.roomMemberModel.deleteOne({ _id: member._id }).exec();
    });
  }

  async createPrivateRoom(
    userId: string,
    memberId: string,
  ): Promise<ConversationResponse> {
    return this.handle(async () => {
      if (!isValidObjectId(memberId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      if (userId === memberId) {
        throw new NotFoundException([
          { code: MessageCode.USER_CANNOT_CREATE_PRIVATE_ROOM_WITH_SELF },
        ]);
      }

      // Check if both users exist and are active
      const [creator, member] = await Promise.all([
        this.userModel.findOne({ _id: new Types.ObjectId(userId), is_active: true }).exec(),
        this.userModel.findOne({ _id: new Types.ObjectId(memberId), is_active: true }).exec(),
      ]);
      
      if (!creator) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      
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
        throw new BadRequestException([
          { code: MessageCode.PRIVATE_ROOM_ALREADY_EXISTS },
        ]);
      }

      const newRoom = new this.roomModel({
        name: `${member.display_name}`,
        type: 'private',
        created_by_id: new Types.ObjectId(userId),
        is_active: true,
        avatar: member.avatar || 'TEMP',
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
      await Promise.all(roomMembers.map((member) => member.save()));

      const result = new ConversationResponse()
      result.room = new RoomResponse(savedRoom);
      result.unread_count = 0;

      return result;
    });
  }

  async getRoomInfo(userId: string, roomId: string): Promise<any> {
    return this.handle(async () => {
      if (!isValidObjectId(roomId)) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }

      const room = await this.roomModel.findById(roomId).exec();
      if (!room) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }
      if (!room.is_active) {
        throw new NotFoundException([{ code: MessageCode.ROOM_NOT_FOUND }]);
      }

      // Get member count
      const memberCount = await this.roomMemberModel.countDocuments({
        room_id: new Types.ObjectId(roomId),
      }).exec();

      // Check if user is already a member
      const isMember = await this.roomMemberModel
        .findOne({
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        })
        .exec();

      // Get creator info
      const creator = await this.userModel.findById(room.created_by_id).exec();

      return {
        id: room._id,
        name: room.name,
        type: room.type,
        description: room.description,
        avatar: room.avatar,
        max_members: room.max_members,
        current_members: memberCount,
        is_encrypted: room.is_encrypted,
        created_at: room.created_at,
        creator: creator ? {
          id: creator._id,
          display_name: creator.display_name,
          avatar: creator.avatar,
        } : null,
        is_member: !!isMember,
        can_join: room.type === 'group' && !isMember && memberCount < room.max_members,
      };
    });
  }

  async isUserMemberOfRoom(userId: string, roomId: string): Promise<boolean> {
    return this.handle(async () => {
      if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
        return false;
      }

      const member = await this.roomMemberModel
        .findOne({
          room_id: new Types.ObjectId(roomId),
          user_id: new Types.ObjectId(userId),
        })
        .exec();

      return !!member;
    });
  }
}
