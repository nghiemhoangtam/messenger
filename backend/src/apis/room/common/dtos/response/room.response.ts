import { Room } from "src/apis/chat/common/schemas";

export class RoomResponse {
  id: string;
  name: string;
  avatar: string;
  created_at: Date;

  constructor(room: Room) {    
    this.id = typeof room._id === 'string' ? room._id : room._id?.toString?.() ?? '';
    this.name = room.name;
    this.avatar = room.avatar;
    this.created_at = room.created_at;
  }
}