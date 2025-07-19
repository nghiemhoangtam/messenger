import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class File extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploader_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  message_id: Types.ObjectId;

  @Prop({ required: true })
  file_url: string;

  @Prop({ required: true, default: 'file' })
  file_type: string;

  @Prop({ required: true, default: 0 })
  file_size: number;

  @Prop({ required: true, default: Date.now })
  uploaded_at: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
