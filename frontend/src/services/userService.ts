import { Contact } from "../features/contacts/types";
import { PaginationRequest } from "../types/pagination-request";
import { PaginationResponse } from "../types/pagination-response";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class UserService {
  async getAvailableFriends(pageRequest: PaginationRequest): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/available-friends", {
        params: pageRequest.cleanParams(),
      })
    );
  }

  async searchActiveUser(pageRequest: PaginationRequest): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/search-active-user", {
        params: pageRequest.cleanParams(),
      })
    );
  }

  async sendFriendRequest(userId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/send-friend-request", {
        receiver_id: userId,
      })
    );
  }

  async acceptFriendRequest(userId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/accept-friend-request", {
        sender_id: userId,
      })
    );
  }

  async rejectFriendRequest(userId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/reject-friend-request", {
        sender_id: userId,
      })
    );
  }

  async removeFriend(userId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/remove-friend-request", {
        friend_id: userId,
      })
    );
  }
}

export const userService = new UserService(); 