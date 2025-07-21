import { Contact } from "../features/contacts/types";
import { PaginationRequest } from "../types/pagination-request";
import { PaginationResponse } from "../types/pagination-response";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class ContactService {
  async fetchAcceptedFriends(
    pageRequest: PaginationRequest
  ): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/list-accepted-friends", {
        params: pageRequest.cleanParams(),
      })
    );
  }

  async fetchReceiveFriends(
    pageRequest: PaginationRequest
  ): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/list-received-friends", {
        params: pageRequest.cleanParams(),
      })
    );
  }
}

export const contactService = new ContactService();
