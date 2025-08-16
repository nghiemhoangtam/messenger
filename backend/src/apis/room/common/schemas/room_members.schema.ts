import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'room_members' })
export class RoomMember extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  joined_at: Date;

  @Prop({ required: true, default: 'member' })
  role: 'admin' | 'member';

  @Prop()
  nickname: string;

  @Prop({ default: false })
  is_muted: boolean;

  @Prop()
  last_read_at: Date;

  @Prop()
  typing_until: Date;
}

export const RoomMemberSchema = SchemaFactory.createForClass(RoomMember);
