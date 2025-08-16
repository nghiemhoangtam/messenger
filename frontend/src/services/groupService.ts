import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class GroupService {
  async getGroups(): Promise<any> {
    return apiRequest<any>(() =>
      accessTokenAxiosClient.get("/groups")
    );
  }

  async createGroup(data: { name: string; description?: string }): Promise<any> {
    return apiRequest<any>(() =>
      accessTokenAxiosClient.post("/groups", data)
    );
  }

  async updateGroup(
    groupId: string,
    data: { name?: string; description?: string },
  ): Promise<any> {
    return apiRequest<any>(() =>
      accessTokenAxiosClient.put(`/groups/${groupId}`, data)
    );
  }

  async deleteGroup(groupId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.delete(`/groups/${groupId}`)
    );
  }

  async addMember(groupId: string, userId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.post(`/groups/${groupId}/members`, {
        userId,
      })
    );
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.delete(`/groups/${groupId}/members/${userId}`)
    );
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.put(`/groups/${groupId}/members/${userId}/role`, { role })
    );
  }
}

export const groupService = new GroupService();
