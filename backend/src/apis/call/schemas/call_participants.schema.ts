import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class CallParticipant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Call', required: true })
  call_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  joined_at: Date;

  @Prop({ required: false, default: Date.now })
  left_at: Date;

  @Prop({ required: true, default: 'audio' })
  call_type: 'audio' | 'video' | 'screen_share';
}

export const CallParticipantSchema =
  SchemaFactory.createForClass(CallParticipant);
