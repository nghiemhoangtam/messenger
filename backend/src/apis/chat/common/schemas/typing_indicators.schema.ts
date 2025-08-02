import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'typing_indicators' })
export class TypingIndicator extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  started_at: Date;

  @Prop({ required: true })
  expires_at: Date;
}

export const TypingIndicatorSchema = SchemaFactory.createForClass(TypingIndicator); 