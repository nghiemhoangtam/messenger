import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'message_mentions' })
export class MessageMention extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  mentioned_user_id: Types.ObjectId;

  @Prop({ required: true })
  mention_type: 'user' | 'role' | 'all';

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const MessageMentionSchema = SchemaFactory.createForClass(MessageMention); 