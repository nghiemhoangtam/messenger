import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'message_reads' })
export class MessageRead extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reader_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  read_at: Date;
}

export const MessageReadSchema = SchemaFactory.createForClass(MessageRead); 