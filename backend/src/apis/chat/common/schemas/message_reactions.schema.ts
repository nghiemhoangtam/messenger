import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class MessageReaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ required: true })
  emoji: string;

  @Prop({ required: true, default: Date.now })
  reacted_at: Date;
}

export const MessageReactionSchema =
  SchemaFactory.createForClass(MessageReaction);
