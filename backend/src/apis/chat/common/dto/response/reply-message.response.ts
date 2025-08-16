import { ContactResponse } from "src/apis/user-relationship/common/dto/contact.response";
import { User } from "src/apis/user/schemas";
import { Message } from "../../schemas";

export class ReplyMessageResponse {
  id: string;
  content: string;
  type: string;
  sender: ContactResponse;
  created_at: Date;

  constructor(message: Message, sender: User) {
    this.id = typeof message._id === 'string' ? message._id : message._id?.toString?.() ?? '';
    this.content = message.content;
    this.type = message.type;
    this.sender = new ContactResponse(sender);
    this.created_at = message.created_at;
  }
}
