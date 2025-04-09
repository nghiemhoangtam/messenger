import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { Message } from './messages.schema';

@Schema({ timestamps: true })
export class MessageReaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  message: Message;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ required: true })
  emoji: string;

  @Prop({ required: true, default: Date.now })
  reacted_at: Date;
}

export const MessageReactionSchema =
  SchemaFactory.createForClass(MessageReaction);
