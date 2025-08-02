import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'messages' })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender_id: Types.ObjectId;

  @Prop({ required: true })
  type: 'text' | 'image' | 'file' | 'video' | 'voice' | 'sticker' | 'emoji';

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.Map, of: String, default: {} })
  metadata: Map<string, any>;

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ required: true, default: Date.now })
  updated_at: Date;

  @Prop({ required: true, default: false })
  is_deleted: boolean;

  @Prop({ required: true, default: 'sent' })
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  reply_to_id: Types.ObjectId;

  @Prop()
  edited_at: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  edited_by: Types.ObjectId;

  @Prop()
  encryption_key: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
