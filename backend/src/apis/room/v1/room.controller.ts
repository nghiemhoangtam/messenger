import { Controller, ForbiddenException, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IJwtRequest } from 'src/apis/auth/common/interfaces';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MessageCode } from 'src/common/messages/message.enum';
import { RoomService } from './room.service';

@ApiTags('room')
@Controller({ path: 'room', version: '1' })
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  
  @Get()
  async getAllRooms(@Req() req: IJwtRequest) {
    if (req.user) {
      return this.roomService.findAllByUserId(req.user.id);
    } else {
      throw new ForbiddenException(MessageCode.FORBIDDEN);
    }
  }
}
