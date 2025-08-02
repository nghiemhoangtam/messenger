import { ContactResponse } from "src/apis/user-relationship/common/dto/contact.response";
import { User } from "src/apis/user/schemas";
import { Message, MessageRead } from "../../schemas";
import { MessageReadResponse } from "./message_read.response";

export class MessageResponse {
  id: string;
  room_id: string;
  sender: ContactResponse;
  content: string;
  created_at: Date;
  status: string;
  message_reads: MessageReadResponse[];
  type: string;

  constructor(message: Message, messageReads: MessageRead[], sender: User) {
    this.id = typeof message._id === 'string' ? message._id : message._id?.toString?.() ?? '';
    this.room_id = typeof message.room_id === 'string' ? message.room_id : message.room_id?.toString?.() ?? '';
    this.sender = new ContactResponse(sender);
    this.content = message.content;
    this.created_at = message.created_at;
    this.type = message.type as 'text' | 'image' | 'audio' | 'video' | 'file';
    this.message_reads = messageReads.map((messageRead) => new MessageReadResponse(messageRead, sender));
  }
}
