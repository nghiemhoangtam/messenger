import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'user_relationships' })
export class UserRelationship extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'removed'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserRelationshipSchema = SchemaFactory.createForClass(UserRelationship);
