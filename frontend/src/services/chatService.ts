import { Message } from "../features/chat/types";
import { PaginationRequest, cleanPaginationParams } from "../types/pagination-request";
import { PaginationResponse } from "../types/pagination-response";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

const API_PREFIX = "/chat";

class ChatService {
  async getMessages(room_id: string, pageRequest: PaginationRequest): Promise<PaginationResponse<Message>> {
    return apiRequest<PaginationResponse<Message>>(() =>
      accessTokenAxiosClient.get(`${API_PREFIX}/messages/${room_id}`, {
        params: cleanPaginationParams(pageRequest),
      })
    );
  }

  async sendMessage(
    room_id: string,
    content: string,
    type: "text" | "image" | "file" | "audio" = "text",
  ): Promise<Message> {
    return apiRequest<Message>(() =>
      accessTokenAxiosClient.post(`${API_PREFIX}`, {
        room_id,
        content,
        type,
      })
    );
  }

  async markMessagesAsRead(roomId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post(`${API_PREFIX}/mark-as-read/${roomId}`)
    );
  }

  async editMessage(
    messageId: string,
    content: string,
    type: "text" | "image" | "file" | "audio" = "text",
  ): Promise<Message> {
    return apiRequest<Message>(() =>
      accessTokenAxiosClient.put(`${API_PREFIX}/${messageId}`, {
        content,
        type,
      })
    );
  }
}

export const chatService = new ChatService();
