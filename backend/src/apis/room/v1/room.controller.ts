import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { CreateRoomDto } from '../common/dtos/create-room.dto';
import { RoomService } from './room.service';

@ApiTags('room')
@Controller({ path: 'room', version: '1' })
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all rooms for a user',
    description: 'Retrieve all chat rooms that the user is a member of',
  })
  @ApiResponse({
    status: 200,
    description: 'List of rooms retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllRooms(@Req() req: IJwtRequest) {
    if (req.user) {
      return this.roomService.findAllByUserId(req.user.id);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('group')
  @ApiOperation({
    summary: 'Create a new group room',
    description:
      'Create a new chat group room with the specified members and name',
  })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Group room created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createGroupRoom(
    @Body() createRoomDto: CreateRoomDto,
    @Req() req: IJwtRequest,
  ) {
    if (req.user) {
      return this.roomService.createGroupRoom(req.user.id, createRoomDto);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('join/:roomId')
  @ApiOperation({
    summary: 'Join a room',
    description: 'Join an existing chat room by its ID',
  })
  @ApiResponse({ status: 200, description: 'Joined room successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'User already in room' })
  async joinRoom(@Req() req: IJwtRequest, @Param('roomId') roomId: string) {
    if (req.user) {
      return this.roomService.joinRoom(req.user.id, roomId);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('leave/:roomId')
  @ApiOperation({
    summary: 'Leave a room',
    description: 'Leave an existing chat room by its ID',
  })
  @ApiResponse({ status: 200, description: 'Left room successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'User not in room' })
  async leaveRoom(@Req() req: IJwtRequest, @Param('roomId') roomId: string) {
    if (req.user) {
      return this.roomService.leaveRoom(req.user.id, roomId);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }

  @Post('private/:memberId')
  @ApiOperation({
    summary: 'Create a new private room',
    description:
      'Create a new chat private room with the specified members and name',
  })
  @ApiBody({ type: String })
  @ApiResponse({
    status: 201,
    description: 'Private room created successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createPrivateRoom(
    @Param('memberId') memberId: string,
    @Req() req: IJwtRequest,
  ) {
    if (req.user) {
      return this.roomService.createPrivateRoom(req.user.id, memberId);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
}
