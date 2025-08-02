import { User } from "src/apis/user/schemas";

export class ContactResponse {
  id: string;
  email: string;
  display_name: string;
  avatar: string;
  status: string;
  last_seen: Date;

  constructor(contact: User) {
    this.id = typeof contact._id === 'string' ? contact._id : contact._id?.toString?.() ?? '';
    this.email = contact.email;
    this.display_name = contact.display_name;
    this.avatar = contact.avatar || '';
    this.status = contact.status;
    this.last_seen = contact.last_seen || new Date();
  }
}