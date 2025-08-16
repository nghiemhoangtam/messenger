import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'files' })
export class File extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploader_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  message_id: Types.ObjectId;

  @Prop({ required: true })
  file_url: string;

  @Prop({ required: true })
  file_type: string;

  @Prop({ required: true })
  file_size: number;

  @Prop({ required: true, default: Date.now })
  uploaded_at: Date;

  @Prop()
  original_name: string;

  @Prop()
  mime_type: string;

  @Prop()
  thumbnail_url: string;

  @Prop()
  duration: number;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop({ default: false })
  is_processed: boolean;

  @Prop({ default: 'pending' })
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const FileSchema = SchemaFactory.createForClass(File);
