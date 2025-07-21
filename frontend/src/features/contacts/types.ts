import { ErrorState } from "../../types/error";
import { PaginationResponse } from "../../types/pagination-response";
import { RequestStatus } from "../../types/request";

export interface ContactsState {
  acceptedFriendPagination: PaginationResponse<Contact>;
  receivedFriendPagination: PaginationResponse<Contact>;
  sentFriendPagination: PaginationResponse<Contact>;
  status: RequestStatus;
  error: ErrorState;
}

export interface Contact {
  id: string;
  email: string;
  display_name: string;
  avatar?: string | null;
  status: "online" | "offline" | "away";
  last_seen?: string;
}
