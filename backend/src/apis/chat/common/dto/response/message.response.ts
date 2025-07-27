import { ContactResponse } from "src/apis/user-relationship/common/dto/contact.response";

export class MessageResponse {
  id: string;
  room_id: string;
  sender: ContactResponse;
  content: string;
  created_at: Date;
  status: 'sent' | 'delivered' | 'read';
}
