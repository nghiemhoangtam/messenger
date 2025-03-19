import axios from 'axios';
import { API_URL } from '../config';

const friendService = {
    getFriends: async () => {
        const response = await axios.get(`${API_URL}/friends`);
        return response;
    },

    getPendingRequests: async () => {
        const response = await axios.get(`${API_URL}/friends/pending`);
        return response;
    },

    sendFriendRequest: async (userId: string) => {
        const response = await axios.post(`${API_URL}/friends/request`, { userId });
        return response;
    },

    acceptFriendRequest: async (requestId: string) => {
        const response = await axios.put(`${API_URL}/friends/request/${requestId}/accept`);
        return response;
    },

    rejectFriendRequest: async (requestId: string) => {
        const response = await axios.put(`${API_URL}/friends/request/${requestId}/reject`);
        return response;
    },

    removeFriend: async (friendId: string) => {
        const response = await axios.delete(`${API_URL}/friends/${friendId}`);
        return response;
    },

    blockUser: async (userId: string) => {
        const response = await axios.put(`${API_URL}/friends/${userId}/block`);
        return response;
    },

    unblockUser: async (userId: string) => {
        const response = await axios.put(`${API_URL}/friends/${userId}/unblock`);
        return response;
    }
};

export default friendService; 