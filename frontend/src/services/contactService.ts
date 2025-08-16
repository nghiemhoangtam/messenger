import { Contact } from "../features/contacts/types";
import { PaginationRequest, cleanPaginationParams } from "../types/pagination-request";
import { PaginationResponse } from "../types/pagination-response";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class ContactService {
  async fetchAcceptedFriends(
    pageRequest: PaginationRequest
  ): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/list-accepted-friends", {
        params: cleanPaginationParams(pageRequest),
      })
    );
  }

  async fetchReceiveFriends(
    pageRequest: PaginationRequest
  ): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/list-received-friends", {
        params: cleanPaginationParams(pageRequest),
      })
    );
  }

  async fetchSentFriends(
    pageRequest: PaginationRequest
  ): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/list-sent-friends", {
        params: cleanPaginationParams(pageRequest),
      })
    );
  }

  async searchAnotherUser(
    pageRequest: PaginationRequest
  ): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/search-another-user", {
        params: cleanPaginationParams(pageRequest),
      })
    );
  }

  async sendFriendRequest(userId: string) {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/send-friend-request", {
        receiver_id: userId,
      })
    );
  }

  async acceptFriendRequest(userId: string) {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/accept-friend-request", {
        sender_id: userId,
      })
    );
  }

  async rejectFriendRequest(userId: string) {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/reject-friend-request", {
        sender_id: userId,
      })
    );
  }

  async removeFriend(userId: string) {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post("/user-relationship/remove-friend-request", {
        friend_id: userId,
      })
    );
  }

  async getAvailableFriends(pageRequest: PaginationRequest): Promise<PaginationResponse<Contact>> {
    return apiRequest<PaginationResponse<Contact>>(() =>
      accessTokenAxiosClient.get("/user-relationship/available-friends", {
        params: cleanPaginationParams(pageRequest),
      })
    );
  }
}

export const contactService = new ContactService();
