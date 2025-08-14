import { saveAs } from "file-saver";
import { accessTokenAxiosClient } from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class MediaService {
  async uploadFile(file: File): Promise<{ 
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<{ 
      id: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      mimeType: string;
    }>(() =>
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

  async getFileInfo(fileId: string): Promise<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
    uploadedAt: string;
    uploaderId: string;
  }> {
    return apiRequest<{
      id: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      mimeType: string;
      uploadedAt: string;
      uploaderId: string;
    }>(() =>
      accessTokenAxiosClient.get(`/media/files/${fileId}`)
    );
  }

  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      const response = await accessTokenAxiosClient.get(`/media/download/${fileId}`, {
        responseType: 'blob',
      });
      
      // Sử dụng file-saver để download file
      const blob = response.data;
      
      // Tạo blob với MIME type nếu có
      const contentType = response.headers['content-type'];
      const finalBlob = contentType ? new Blob([blob], { type: contentType }) : blob;
      
      saveAs(finalBlob, fileName);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
}

export const mediaService = new MediaService(); 