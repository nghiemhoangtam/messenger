import { Contact } from "../features/contacts/types";
import { PaginationRequest } from "../types/pagination-request";
import { PaginationResponse } from "../types/pagination-response";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

export const userService = {
  async searchActiveUser(pageRequest: PaginationRequest): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/search-active-user", {
        params: pageRequest.cleanParams(),
      })
    );
  },
}; 