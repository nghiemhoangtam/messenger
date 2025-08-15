import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Image, Upload, message } from 'antd';
import React, { useState } from 'react';
import { mediaService } from '../../../services/mediaService';

interface UploadedFile {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
}

export const ImageUploadTest: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await mediaService.uploadFile(file);
      setUploadedFiles(prev => [...prev, result]);
      message.success('Upload thành công!');
    } catch (error) {
      message.error('Upload thất bại!');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      await mediaService.downloadFile(file.id, file.fileName);
      message.success('Download thành công!');
    } catch (error) {
      message.error('Download thất bại!');
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await mediaService.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      message.success('Xóa file thành công!');
    } catch (error) {
      message.error('Xóa file thất bại!');
      console.error('Delete error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Upload Hình Ảnh</h1>
      
      <Card title="Upload File" style={{ marginBottom: '20px' }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file);
            return false; // Prevent default upload
          }}
        >
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={uploading}
            type="primary"
          >
            {uploading ? 'Đang upload...' : 'Chọn hình ảnh'}
          </Button>
        </Upload>
      </Card>

      <Card title="Files đã upload">
        {uploadedFiles.length === 0 ? (
          <p>Chưa có file nào được upload</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {uploadedFiles.map((file) => (
              <Card 
                key={file.id} 
                size="small" 
                style={{ border: '1px solid #d9d9d9' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {file.fileType === 'image' && (
                    <Image
                      src={file.fileUrl}
                      alt={file.fileName}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{file.fileName}</h4>
                    <p style={{ margin: '4px 0', color: '#666' }}>
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p style={{ margin: '4px 0', color: '#999', fontSize: '12px' }}>
                      Type: {file.fileType} | MIME: {file.mimeType}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      size="small" 
                      onClick={() => handleDownload(file)}
                    >
                      Download
                    </Button>
                    <Button 
                      size="small" 
                      danger
                      onClick={() => handleDelete(file.id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};


