import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class Call extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  started_by_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  started_at: Date;

  @Prop({ required: false, default: Date.now })
  ended_at: Date;

  @Prop({ required: true, default: 'audio' })
  call_type: 'audio' | 'video' | 'screen_share';
}

export const CallSchema = SchemaFactory.createForClass(Call);
