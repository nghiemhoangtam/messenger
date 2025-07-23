import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { PaginationRequest } from 'src/common/dto/request/pagination.request';
import { PaginationResponse } from 'src/common/dto/response/pagination.response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { MyFriendResponse } from '../common/dto/my-friend.response';
import { UserRelationshipService } from './user-relationship.service';

@ApiTags('user-relationship')
@Controller({ path: 'user-relationship', version: '1' })
@UseGuards(JwtAuthGuard)
export class UserRelationshipController {
  constructor(
    private readonly userRelationshipService: UserRelationshipService,
  ) {}

  @Post('send-friend-request')
  @ApiOperation({
    summary: 'Send a friend request',
    description: 'Allows a user to send a friend request to another user',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or self-request',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate friend request',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendFriendRequest(
    @Req() req: IJwtRequest,
    @Body('receiver_id') receiver_id: string,
  ): Promise<void> {
    if (req.user) {
      return this.userRelationshipService.sendFriendRequest(
        req.user.id,
        receiver_id,
      );
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('accept-friend-request')
  @ApiOperation({
    summary: 'Accept a friend request',
    description: 'Allows a user to accept a friend request from another user',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request accepted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or friend request does not exist',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async acceptFriendRequest(
    @Req() req: IJwtRequest,
    @Body('sender_id') sender_id: string,
  ): Promise<void> {
    if (req.user) {
      return this.userRelationshipService.acceptFriendRequest(
        sender_id,
        req.user.id,
      );
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('search-another-user')
  @ApiOperation({
    summary: 'Search another user',
    description: 'Allows a user to search another user',
  })
  @ApiResponse({
    status: 200,
    description: 'User searched successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async searchAnotherUser(
    @Req() req: IJwtRequest,
    @Query() query: PaginationRequest,
  ): Promise<PaginationResponse<MyFriendResponse>> {
    if (req.user) {
      return this.userRelationshipService.searchAnotherUser(req.user.id, query);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('reject-friend-request')
  @ApiOperation({
    summary: 'Reject a friend request',
    description: 'Allows a user to reject a friend request from another user',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or friend request does not exist',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async rejectFriendRequest(
    @Req() req: IJwtRequest,
    @Body('sender_id') sender_id: string,
  ): Promise<void> {
    if (req.user) {
      return this.userRelationshipService.rejectFriendRequest(
        sender_id,
        req.user.id,
      );
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('remove-friend-request')
  @ApiOperation({
    summary: 'Remove a friend',
    description: 'Allows a user to remove a friend from their friend list',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or friend does not exist',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeFriend(
    @Req() req: IJwtRequest,
    @Body('friend_id') friend_id: string,
  ): Promise<void> {
    if (req.user) {
      return this.userRelationshipService.removeFriend(req.user.id, friend_id);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('block-user-request')
  @ApiOperation({
    summary: 'Block a user',
    description: 'Allows a user to block another user',
  })
  @ApiResponse({
    status: 200,
    description: 'User blocked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or already blocked',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async blockUser(
    @Req() req: IJwtRequest,
    @Body('block_user_id') block_user_id: string,
  ): Promise<void> {
    if (req.user) {
      return this.userRelationshipService.blockUser(req.user.id, block_user_id);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('unblock-user-request')
  @ApiOperation({
    summary: 'Unblock a user',
    description: 'Allows a user to unblock another user',
  })
  @ApiResponse({
    status: 200,
    description: 'User unblocked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or not blocked',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unblockUser(
    @Req() req: IJwtRequest,
    @Body('block_user_id') block_user_id: string,
  ): Promise<void> {
    if (req.user) {
      return this.userRelationshipService.unblockUser(
        req.user.id,
        block_user_id,
      );
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('list-accepted-friends')
  @ApiOperation({
    summary: 'List friends',
    description: 'Retrieve a list of friends for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of friends retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listAcceptedFriends(
    @Req() req: IJwtRequest,
    @Query() query: PaginationRequest,
  ): Promise<PaginationResponse<MyFriendResponse>> {
    if (req.user) {
      const response = await this.userRelationshipService.listAcceptedFriends(
        req.user.id,
        query,
      );
      return response;
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Get('list-received-friends')
  @ApiOperation({
    summary: 'List received friend requests',
    description:
      'Retrieve a list of received friend requests for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of received friend requests retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listReceivedFriends(
    @Req() req: IJwtRequest,
    @Query() query: PaginationRequest,
  ): Promise<PaginationResponse<MyFriendResponse>> {
    if (req.user) {
      return this.userRelationshipService.listIncomingFriends(
        req.user.id,
        query,
      );
    }
    throw new ForbiddenException(MessageCode.FORBIDDEN);
  }

  @Get('list-sent-friends')
  @ApiOperation({
    summary: 'List sent friend requests',
    description:
      'Retrieve a list of sent friend requests for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sent friend requests retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listSentFriends(
    @Req() req: IJwtRequest,
    @Query() query: PaginationRequest,
  ): Promise<PaginationResponse<MyFriendResponse>> {
    if (req.user) {
      const response = this.userRelationshipService.listSentFriends(
        req.user.id,
        query,
      );
      return response;
    }
    throw new ForbiddenException(MessageCode.FORBIDDEN);
  }
}
