 import { MessageResponse } from 'src/apis/chat/common/dto/response/message.response';
import { RoomResponse } from './room.response';

export class ConversationResponse {
  room: RoomResponse;
  lastMessage?: MessageResponse;
  unread_count: number;
}