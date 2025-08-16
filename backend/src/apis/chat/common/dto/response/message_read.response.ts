import { ContactResponse } from "src/apis/user-relationship/common/dto/contact.response";
import { User } from "src/apis/user/schemas";
import { MessageRead } from "../../schemas";

export class MessageReadResponse {
  contact: ContactResponse;
  read_at: Date;

  constructor(messageRead: MessageRead, user: User) {
    this.contact = new ContactResponse(user);
    this.read_at = messageRead.read_at || new Date();
  }
}