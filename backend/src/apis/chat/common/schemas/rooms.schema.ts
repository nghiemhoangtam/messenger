import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'rooms' })
export class Room extends Document {
  @Prop({ required: true, unique: true })
  room_code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: 'private' | 'group';

  @Prop({ required: true, default: false })
  is_active: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
