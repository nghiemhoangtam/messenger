import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'rooms' })
export class Room extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: 'private' | 'group';

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true, default: false })
  is_active: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by_id: Types.ObjectId;  
}

export const RoomSchema = SchemaFactory.createForClass(Room);
