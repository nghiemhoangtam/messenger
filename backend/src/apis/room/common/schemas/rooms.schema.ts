import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'rooms' })
export class Room extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: 'private' | 'group';

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: true, default: false })
  is_active: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by_id: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ default: 100 })
  max_members: number;

  @Prop({ default: false })
  is_encrypted: boolean;

  @Prop()
  last_message_at: Date;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  pinned_message_id: Types.ObjectId;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
