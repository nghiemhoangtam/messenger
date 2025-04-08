import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Room } from 'src/apis/chat/schemas/rooms.schema';
import { User } from 'src/apis/user/schemas';

@Schema({ timestamps: true })
export class Call extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Room;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  starter: User;

  @Prop({ required: true, default: Date.now })
  started_at: Date;

  @Prop({ required: false, default: Date.now })
  ended_at: Date;

  @Prop({ required: true, default: 'audio' })
  call_type: 'audio' | 'video' | 'screen_share';
}

export const CallSchema = SchemaFactory.createForClass(Call);
