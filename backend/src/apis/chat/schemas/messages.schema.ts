import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';
import { Room } from './rooms.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Room;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender: User;

  @Prop({ required: true })
  type: 'text' | 'image' | 'file' | 'video' | 'voice' | 'sticker' | 'emoji';

  @Prop({ required: true })
  content: string;

  @Prop()
  metadata: {
    [key: string]: any;
  };

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ required: true, default: Date.now })
  updated_at: Date;

  @Prop({ required: true, default: false })
  is_deleted: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
