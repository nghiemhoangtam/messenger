import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Room } from 'src/apis/chat/common/schemas';
import { User } from 'src/apis/user/schemas';

@Schema({ collection: 'room_members' })
export class RoomMember extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Room;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;
  
  @Prop({ required: true, default: Date.now })
  joined_at: Date;

  @Prop({ required: true, default: 'member' })
  role: 'admin' | 'member';
}

export const RoomMemberSchema = SchemaFactory.createForClass(RoomMember);
