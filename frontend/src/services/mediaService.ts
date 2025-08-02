import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class MediaService {
  async uploadFile(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<{ fileUrl: string }>(() =>
      accessTokenAxiosClient.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  }

  async deleteFile(fileId: string): Promise<void> {
    return apiRequest<void>(() =>
      accessTokenAxiosClient.delete(`/media/files/${fileId}`)
    );
  }

  async getFileInfo(fileId: string): Promise<any> {
    return apiRequest<any>(() =>
      accessTokenAxiosClient.get(`/media/files/${fileId}`)
    );
  }
}

export const mediaService = new MediaService(); 