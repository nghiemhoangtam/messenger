import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'block_lists' })
export class BlockList extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blocked_user_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const BlockListSchema = SchemaFactory.createForClass(BlockList);
