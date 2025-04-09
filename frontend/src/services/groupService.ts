import axios from "axios";
import { API_URL } from "../config";

const groupService = {
  getGroups: async () => {
    const response = await axios.get(`${API_URL}/groups`);
    return response;
  },

  createGroup: async (data: { name: string; description?: string }) => {
    const response = await axios.post(`${API_URL}/groups`, data);
    return response;
  },

  updateGroup: async (
    groupId: string,
    data: { name?: string; description?: string },
  ) => {
    const response = await axios.put(`${API_URL}/groups/${groupId}`, data);
    return response;
  },

  deleteGroup: async (groupId: string) => {
    const response = await axios.delete(`${API_URL}/groups/${groupId}`);
    return response;
  },

  addMember: async (groupId: string, userId: string) => {
    const response = await axios.post(`${API_URL}/groups/${groupId}/members`, {
      userId,
    });
    return response;
  },

  removeMember: async (groupId: string, userId: string) => {
    const response = await axios.delete(
      `${API_URL}/groups/${groupId}/members/${userId}`,
    );
    return response;
  },

  updateMemberRole: async (groupId: string, userId: string, role: string) => {
    const response = await axios.put(
      `${API_URL}/groups/${groupId}/members/${userId}/role`,
      { role },
    );
    return response;
  },
};

export default groupService;
