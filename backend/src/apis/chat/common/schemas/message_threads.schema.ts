import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'message_threads' })
export class MessageThread extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  parent_message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  root_message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MessageThread' })
  thread_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const MessageThreadSchema = SchemaFactory.createForClass(MessageThread); 