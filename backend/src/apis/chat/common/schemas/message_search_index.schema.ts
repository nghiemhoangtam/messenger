import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'message_search_index' })
export class MessageSearchIndex extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId;

  @Prop({ type: String })
  content_vector: string;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const MessageSearchIndexSchema = SchemaFactory.createForClass(MessageSearchIndex); 