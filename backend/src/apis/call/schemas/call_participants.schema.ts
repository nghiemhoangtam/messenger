import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { Call } from './call.schema';

export class CallParticipant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Call', required: true })
  call: Call;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true, default: Date.now })
  joined_at: Date;

  @Prop({ required: false, default: Date.now })
  left_at: Date;

  @Prop({ required: true, default: 'audio' })
  call_type: 'audio' | 'video' | 'screen_share';
}

export const CallParticipantSchema =
  SchemaFactory.createForClass(CallParticipant);
