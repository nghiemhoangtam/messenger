import { Conversation, CreateGroupRoomRequest } from "../features/chat/types";
import { PaginationRequest } from "../types/pagination-request";
import { PaginationResponse } from "../types/pagination-response";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

const API_PREFIX = "/room";

export const roomService = {
  async getConversations(pageRequest: PaginationRequest): Promise<PaginationResponse<Conversation>> {
    return apiRequest<PaginationResponse<Conversation>>(() =>
      accessTokenAxiosClient.get(`${API_PREFIX}/conversation`, { params: pageRequest })
    );
  },

  async createGroupRoom(request: CreateGroupRoomRequest): Promise<Conversation> {
    console.log(request);
    return apiRequest<Conversation>(() =>
      accessTokenAxiosClient.post(`${API_PREFIX}/group`, request)
    );
  },

  async createPrivateRoom(memberId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post(`${API_PREFIX}/private/${memberId}`)
    );
  },

  async joinRoom(roomId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post(`${API_PREFIX}/join/${roomId}`)
    );
  },

  async leaveRoom(roomId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post(`${API_PREFIX}/leave/${roomId}`)
    );
  },
}; 