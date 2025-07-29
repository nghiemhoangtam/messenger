import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { PaginationResponse } from 'src/common/dto/response/pagination.response';
import { MessageCode } from 'src/common/messages/message.enum';
import { BaseService } from 'src/common/services/base.service';
import { ContactResponse } from '../common/dto/contact.response';
import { BlockList } from '../common/schemas/block_lists';
import { UserRelationship } from '../common/schemas/user_relationships';

@Injectable()
export class UserRelationshipService extends BaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserRelationship.name) private userRelationshipModel: Model<UserRelationship>,
    @InjectModel(BlockList.name) private blockListModel: Model<BlockList>
  ) {
    super();
  }

  async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      const sender = await this.userModel.findOne({
        _id: new Types.ObjectId(senderId),
        is_active: true,
      });
      const receiver = await this.userModel.findOne({
        _id: new Types.ObjectId(receiverId),
        is_active: true,
      });
      if (!sender || !receiver) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      if (senderId === receiverId) {
        throw new NotFoundException([{ code: MessageCode.SELF_REQUEST }]);
      }
      const existingRelationship = await this.userRelationshipModel.findOne({
        sender_id: sender._id,
        receiver_id: receiver._id,
      });

      if (existingRelationship) {
        throw new ConflictException([
          { code: MessageCode.DUPLICATE_FRIEND_REQUEST },
        ]);
      }

      const newRelationship = new this.userRelationshipModel({
        sender_id: sender._id,
        receiver_id: receiver._id,
        status: 'pending',
        createdAt: new Date(),
      });
      await newRelationship.save();
    });
  }

  async acceptFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    return this.updateFriendRequestStatus(senderId, receiverId, 'accepted');
  }

  async rejectFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    return this.updateFriendRequestStatus(senderId, receiverId, 'rejected');
  }

  async removeFriend(senderId: string, receiverId: string): Promise<void> {
    return this.updateFriendRequestStatus(senderId, receiverId, 'removed');
  }

  private async updateFriendRequestStatus(
    senderId: string,
    receiverId: string,
    newStatus: 'accepted' | 'rejected' | 'removed' | 'pending',
  ): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      if (senderId === receiverId) {
        throw new ConflictException([{ code: MessageCode.SELF_REQUEST }]);
      }

      const [sender, receiver] = await Promise.all([
        this.userModel.findOne({ _id: senderId, is_active: true }),
        this.userModel.findOne({ _id: receiverId, is_active: true }),
      ]);

      if (!sender || !receiver) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      const relationship = await this.userRelationshipModel.findOne({
        sender_id: sender._id,
        receiver_id: receiver._id,
      });

      const currentStatus = relationship?.status;

      // Centralized validation rules
      const validations: Record<string, () => void> = {
        pending: () => {
          if (relationship && currentStatus) {
            throw new ConflictException([
              { code: MessageCode.DUPLICATE_FRIEND_REQUEST },
            ]);
          }
          if (!relationship) {
            throw new NotFoundException([
              { code: MessageCode.FRIEND_REQUEST_NOT_FOUND },
            ]);
          }
        },
        accepted: () => {
          if (!relationship) {
            throw new NotFoundException([
              { code: MessageCode.FRIEND_REQUEST_NOT_FOUND },
            ]);
          }
          if (currentStatus !== 'pending') {
            throw new ConflictException([
              { code: MessageCode.DUPLICATE_FRIEND_REQUEST },
            ]);
          }
        },
        rejected: () => {
          if (!relationship) {
            throw new NotFoundException([
              { code: MessageCode.FRIEND_REQUEST_NOT_FOUND },
            ]);
          }
          if (currentStatus !== 'pending') {
            throw new ConflictException([
              { code: MessageCode.DUPLICATE_FRIEND_REQUEST },
            ]);
          }
        },
        removed: () => {
          if (!relationship) {
            throw new NotFoundException([
              { code: MessageCode.FRIEND_REQUEST_NOT_FOUND },
            ]);
          }
        },
      };

      validations[newStatus](); // Run validation logic for this status

      if (!relationship) {
        throw new NotFoundException([
          { code: MessageCode.FRIEND_REQUEST_NOT_FOUND },
        ]);
      }

      if(newStatus === 'removed') {
        await this.userRelationshipModel.deleteOne({ _id: relationship._id });
      } else {
        relationship.status = newStatus;
        await relationship.save();        
      }
    });
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(userId) || !isValidObjectId(blockedUserId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      const user = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
        is_active: true,
      });
      const blockedUser = await this.userModel.findOne({
        _id: new Types.ObjectId(blockedUserId),
        is_active: true,
      });
      if (!user || !blockedUser) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      if (userId === blockedUserId) {
        throw new ConflictException([{ code: MessageCode.SELF_REQUEST }]);
      }

      const existingBlock = await this.blockListModel.findOne({
        sender_id: user._id,
        blocked_user_id: blockedUser._id,
      });

      if (existingBlock) {
        throw new ConflictException([
          { code: MessageCode.DUPLICATE_FRIEND_REQUEST },
        ]);
      }

      const newBlock = new this.blockListModel({
        sender_id: user._id,
        blocked_user_id: blockedUser._id,
        created_at: new Date(),
      });
      await newBlock.save();
    });
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    return this.handle(async () => {
      if (!isValidObjectId(userId) || !isValidObjectId(blockedUserId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      const user = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
        is_active: true,
      });
      const blockedUser = await this.userModel.findOne({
        _id: new Types.ObjectId(blockedUserId),
        is_active: true,
      });
      if (!user || !blockedUser) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      if (userId === blockedUserId) {
        throw new ConflictException([{ code: MessageCode.SELF_REQUEST }]);
      }
      const block = await this.blockListModel.findOne({
        sender_id: user._id,
        blocked_user_id: blockedUser._id,
      });

      if (!block) {
        throw new NotFoundException([
          { code: MessageCode.BLOCK_REQUEST_NOT_FOUND },
        ]);
      }

      await this.blockListModel.deleteOne({ _id: block._id });
    });
  }

  async listAcceptedFriends(userId: string, query: PaginationRequest) {
    return this.paginateFriends(userId, ['accepted'], null, query);
  }

  async listAcceptedFriendsWithoutRoom(userId: string, query: PaginationRequest): Promise<PaginationResponse<ContactResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const userIdObj = new Types.ObjectId(userId);

    const pipeline: any[] = [
      {
        $match: {
          status: 'accepted',
          $or: [
            { sender_id: userIdObj },
            { receiver_id: userIdObj }
          ]
        }
      },
      {
        $addFields: {
          friendId: {
            $cond: [
              { $eq: ['$sender_id', userIdObj] },
              '$receiver_id',
              '$sender_id'
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'friendId',
          foreignField: '_id',
          as: 'friend'
        }
      },
      { $unwind: '$friend' },
      {
        $lookup: {
          from: 'room_members',
          let: { friendId: '$friendId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$user_id', userIdObj] },
                    { $eq: ['$user_id', '$$friendId'] }
                  ]
                }
              }
            }
          ],
          as: 'memberships'
        }
      },
      {
        $addFields: {
          roomIds: '$memberships.room_id'
        }
      },
      {
        $unwind: {
          path: '$roomIds',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            friendId: '$friendId',
            friend: '$friend'
          },
          roomIds: { $addToSet: '$roomIds' }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          let: { roomIds: '$roomIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$_id', '$$roomIds'] },
                    { $eq: ['$type', 'private'] },
                    { $eq: ['$is_active', true] }
                  ]
                }
              }
            }
          ],
          as: 'privateRooms'
        }
      },
      {
        $match: {
          'privateRooms': { $size: 0 }
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          friend: '$_id.friend'
        }
      }
    ];

    const results = await this.userRelationshipModel.aggregate(pipeline);

    // Đếm tổng số bạn bè chưa có room (cho meta.total)
    const countPipeline = pipeline.filter(stage => !('$skip' in stage) && !('$limit' in stage)).concat({ $count: 'total' });
    const countResult = await this.userRelationshipModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Map về ContactResponse
    const friendsWithoutRoom: ContactResponse[] = results.map(r => r.friend);

    return new PaginationResponse(
      friendsWithoutRoom,
      total,
      page,
      limit
    );
  }

  async listIncomingFriends(userId: string, query: PaginationRequest) {
    const extraMatch = { receiver_id: new Types.ObjectId(userId) };
    return this.paginateFriends(userId, ['pending'], extraMatch, query);
  }

  async listSentFriends(userId: string, query: PaginationRequest) {
    const extraMatch = { sender_id: new Types.ObjectId(userId) };
    return this.paginateFriends(userId, ['pending'], extraMatch, query);
  }

  async searchAnotherUser(userId: string, query: PaginationRequest) {
    // TODO: find user without friendship with current user
    return this.handle(async () => {
      if (!isValidObjectId(userId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      const { page = 1, limit = 10, search, sortBy } = query;
      const skip = (page - 1) * limit;

      const user = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
        is_active: true,
      });

      if (!user) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      const relationships = await this.userRelationshipModel.find({
        $or: [
          { sender_id: user._id },
          { receiver_id: user._id },
        ],
      }).select('receiver_id');

      const friendIds = relationships.map((friend) => friend.receiver_id);

      const matchStage: any = {
        $match: {
          $and: [
            {
              _id: { $nin: friendIds },
            },
          ],
        },
      };

      const addFriendInfoStage = [
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'friendInfo',
          },
        },
        {
          $project: {
            _id: 0,
            friend: {
              $arrayElemAt: ['$friendInfo', 0],
            },
          },
        },
        {
          $replaceRoot: { newRoot: '$friend' },
        },
        { $unset: 'friend.password' },
      ];

      const searchStage = search
        ? [
            {
              $match: {
                'display_name': { $regex: search, $options: 'i' },
              },
            },
          ]
        : [];

      const sortStage = (() => {
        const sortObj: any = {};
        if (sortBy) {
          for (const key of sortBy.split(',')) {
            const field = key.replace(/^-/, '');
            const direction = key.startsWith('-') ? -1 : 1;
            sortObj[`${field}`] = direction;
          }
        } else {
          sortObj['display_name'] = 1;
        }
        return [{ $sort: sortObj }];
      })();

      const facetStage = [
        {
          $facet: {
            data: [...sortStage, { $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const pipeline = [
        matchStage,
        ...addFriendInfoStage,
        ...searchStage,
        ...facetStage,
      ];

      const result = await this.userModel.aggregate(pipeline).exec();

      const friends = result[0].data || [];
      const records: ContactResponse[] = friends.map((friend) => ({
        id: friend._id.toString(),
        email: friend.email,
        display_name: friend.display_name,
        avatar: friend.avatar || null,
        status: friend.status,
        last_seen: friend.last_seen || null
      }));
      const total: number = result[0].totalCount[0]?.count || 0;

      return new PaginationResponse(records, total, page, limit);
    });
  }

  async searchActiveUser(query: PaginationRequest): Promise<PaginationResponse<ContactResponse>> {
    return this.handle(async () => {
    const { page = 1, limit = 10, search, sortBy } = query;
    const skip = (page - 1) * limit;
    const filter: any = { is_active: true };
    if (search) {
      filter.$or = [
        { display_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const sort: any = {};
    if (sortBy) {
      for (const key of sortBy.split(',')) {
        const field = key.replace(/^-/, '');
        const direction = key.startsWith('-') ? -1 : 1;
        sort[field] = direction;
      }
    } else {
      sort['display_name'] = 1;
    }
    const [users, total] = await Promise.all([
      this.userModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.userModel.countDocuments(filter),
    ]);
    const records: ContactResponse[] = users.map((user) => ({
      id: String(user._id),
      email: user.email,
      display_name: user.display_name,
      avatar: user.avatar ? String(user.avatar) : '',
      status: user.status,
      last_seen: user.last_seen || null,
    }));
    return new PaginationResponse(records, total, page, limit);
    });
  }

  private async paginateFriends(
    userId: string,
    status: ('accepted' | 'pending' | 'rejected' | 'removed')[],
    extraMatch: any,
    query: PaginationRequest,
  ): Promise<PaginationResponse<ContactResponse>> {
    return this.handle(async () => {
      if (!isValidObjectId(userId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }
      const { page = 1, limit = 10, search, sortBy } = query;
      const skip = (page - 1) * limit;

      const matchStage: any = {
        $match: {
          $and: [
            {
              status: { $in: status },
            },
            {
              $or: [
                { sender_id: new Types.ObjectId(userId) },
                { receiver_id: new Types.ObjectId(userId) },
              ],
            },
            ...(extraMatch ? [extraMatch] : []),
          ],
        },
      };

      const addFriendInfoStage = [
        {
          $lookup: {
            from: 'users',
            localField: 'receiver_id',
            foreignField: '_id',
            as: 'receiverInfo',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'sender_id',
            foreignField: '_id',
            as: 'senderInfo',
          },
        },
        {
          $project: {
            _id: 0,
            friend: {
              $cond: [
                { $eq: ['$sender_id', new Types.ObjectId(userId)] },
                { $arrayElemAt: ['$receiverInfo', 0] },
                { $arrayElemAt: ['$senderInfo', 0] },
              ],
            },
          },
        },
        // { $unset: 'friend.password' },
        {
          $replaceRoot: { newRoot: '$friend' },
        },
      ];

      const searchStage = search
        ? [
            {
              $match: {
                'display_name': { $regex: search, $options: 'i' },
              },
            },
          ]
        : [];

      const sortStage = (() => {
        const sortObj: any = {};
        if (sortBy) {
          for (const key of sortBy.split(',')) {
            const field = key.replace(/^-/, '');
            const direction = key.startsWith('-') ? -1 : 1;
            sortObj[`${field}`] = direction;
          }
        } else {
          sortObj['display_name'] = 1;
        }
        return [{ $sort: sortObj }];
      })();

      const facetStage = [
        {
          $facet: {
            data: [...sortStage, { $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const pipeline = [
        matchStage,
        ...addFriendInfoStage,
        ...searchStage,
        ...facetStage,
      ];

      const result = await this.userRelationshipModel
        .aggregate(pipeline)
        .exec();

      const friends = result[0].data || [];
      const records: ContactResponse[] = friends.map((friend) => ({
        id: friend._id.toString(),
        email: friend.email,
        display_name: friend.display_name,
        avatar: friend.avatar || null,
        status: friend.status,
        last_seen: friend.last_seen || null
      }));
      const total: number = result[0].totalCount[0]?.count || 0;

      return new PaginationResponse(records, total, page, limit);
    });
  }

  async checkFriendshipStatus(
    userId: string,
    friendId: string,
  ): Promise<string> {
    return this.handle(async () => {
      if (!isValidObjectId(userId) || !isValidObjectId(friendId)) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      const user = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
        is_active: true,
      });

      const friend = await this.userModel.findOne({
        _id: new Types.ObjectId(friendId),
        is_active: true,
      });

      if (!user || !friend) {
        throw new NotFoundException([{ code: MessageCode.USER_NOT_FOUND }]);
      }

      const relationship = await this.userRelationshipModel.findOne({
        $or: [
          { sender_id: user._id, receiver_id: friend._id },
          { sender_id: friend._id, receiver_id: user._id },
        ],
      });

      if (!relationship) {
        return 'none_relationship';
      }

      return relationship.status;
    });
  }
}
