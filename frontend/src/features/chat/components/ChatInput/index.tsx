import { AudioOutlined, CloseOutlined, FileOutlined, PaperClipOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Input, Upload, message as messageApi } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { socketService } from "../../../../services/socketService";
import { ReplyMessage } from "../../types";
import { EmojiPicker } from "../EmojiPicker";
import styles from "./ChatInput.module.css";

const { TextArea } = Input;

interface ChatInputProps {
  onSendMessage: (content: string, type?: string, replyToId?: string) => void;
  onSendFile: (file: File, type: "image" | "file" | "audio", replyToId?: string) => void;
  loading?: boolean;
  room_id?: string;
  replyToMessage?: ReplyMessage | null;
  onCancelReply?: () => void;
  onScrollToMessage?: (messageId: string) => void;
}

interface FilePreview {
  file: File;
  type: "image" | "file" | "audio";
  preview?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  loading = false,
  room_id,
  replyToMessage,
  onCancelReply,
  onScrollToMessage,
}) => {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageApiInstance, contextHolder] = messageApi.useMessage();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typing indicator
  useEffect(() => {
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim() && room_id) {
      // Start typing if not already typing
      if (!isTyping) {
        setIsTyping(true);
        socketService.startTyping(room_id);
      }
      
      // Set timeout to stop typing after 2 seconds
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(room_id);
      }, 2000);
      
      typingTimeoutRef.current = timeout;
    } else if (isTyping && room_id) {
      // Stop typing if message is empty
      setIsTyping(false);
      socketService.stopTyping(room_id);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, room_id, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !preview) return;
    
    // Stop typing when sending message
    if (room_id) {
      setIsTyping(false);
      socketService.stopTyping(room_id);
    }
    
    if (preview) {
      await handleSendFile();
    } else {
      await onSendMessage(message, "text", replyToMessage?.id);
      setMessage("");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onSendMessage(emoji, "emoji", replyToMessage?.id);
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];

    if (file.size > maxSize) {
      messageApiInstance.error("File quá lớn. Kích thước tối đa là 10MB.");
      return false;
    }

    const isImage = allowedImageTypes.includes(file.type);
    const isAllowedFile = allowedFileTypes.includes(file.type);

    if (!isImage && !isAllowedFile) {
      messageApiInstance.error("Loại file không được hỗ trợ.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
      ? "audio"
      : "file";

    const filePreview: FilePreview = {
      file,
      type: fileType,
    };

    // Tạo preview cho hình ảnh
    if (fileType === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreview.preview = e.target?.result as string;
        setPreview(filePreview);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(filePreview);
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
  };

  const handleSendFile = async () => {
    if (!preview) return;
    
    setUploading(true);
    try {
      await onSendFile(preview.file, preview.type, replyToMessage?.id);
      setPreview(null);
      messageApiInstance.success("Gửi file thành công!");
    } catch (error) {
      messageApiInstance.error("Gửi file thất bại");
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0]; // Chỉ xử lý file đầu tiên
      handleFileSelect(file);
    }
  }, []);

  // Setup drag & drop listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('dragover', handleDragOver as any);
      dropZone.addEventListener('dragleave', handleDragLeave as any);
      dropZone.addEventListener('drop', handleDrop as any);

      return () => {
        dropZone.removeEventListener('dragover', handleDragOver as any);
        dropZone.removeEventListener('dragleave', handleDragLeave as any);
        dropZone.removeEventListener('drop', handleDrop as any);
      };
    }
  }, [handleDragOver, handleDragLeave, handleDrop]);

  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    const renderReplyContent = () => {
      switch (replyToMessage.type) {
        case "image":
          return <img src={replyToMessage.content} alt="reply" className={styles.replyImage} />;
        case "file":
          return (
            <div className={styles.replyFile}>
              <FileOutlined />
              <span>{replyToMessage.content}</span>
            </div>
          );
        case "audio":
          return (
            <div className={styles.replyAudio}>
              <AudioOutlined />
              <span>Audio</span>
            </div>
          );
        case "emoji":
          return (
            <div className={styles.replyEmoji}>
              <span>{replyToMessage.content}</span>
            </div>
          );
        default:
          return replyToMessage.content;
      }
    };

    return (
      <div className={styles.replyPreview}>
        <div
          className={styles.replyContent}
          onClick={() => onScrollToMessage?.(replyToMessage.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.replySender}>Trả lời {replyToMessage.sender.display_name}</div>
          <div className={styles.replyText}>{renderReplyContent()}</div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onCancelReply}
          className={styles.cancelReply}
          size="small"
        />
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      <div 
        ref={dropZoneRef}
        className={`${styles.container} ${isDragOver ? styles.dragOver : ''}`}
      >
        {isDragOver && (
          <div className={styles.dragOverlay}>
            <div className={styles.dragMessage}>
              <PaperClipOutlined />
              <span>Thả file vào đây để gửi</span>
            </div>
          </div>
        )}
        
        {replyToMessage && renderReplyPreview()}
        
        {preview && (
          <div className={styles.preview}>
            {preview.type === "image" && preview.preview && (
              <div className={styles.imagePreview}>
                <img src={preview.preview} alt="Preview" className={styles.previewImage} />
                <div className={styles.previewInfo}>
                  <span className={styles.fileName}>{preview.file.name}</span>
                  <span className={styles.fileSize}>
                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
            {preview.type === "file" && (
              <div className={styles.filePreview}>
                <FileOutlined className={styles.fileIcon} />
                <div className={styles.previewInfo}>
                  <span className={styles.fileName}>{preview.file.name}</span>
                  <span className={styles.fileSize}>
                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
            {preview.type === "audio" && (
              <div className={styles.audioPreview}>
                <AudioOutlined className={styles.audioIcon} />
                <div className={styles.previewInfo}>
                  <span className={styles.fileName}>{preview.file.name}</span>
                  <span className={styles.fileSize}>
                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
            <div className={styles.previewActions}>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleRemovePreview}
                className={styles.removePreview}
                title="Xóa file"
              />
              <Button 
                type="primary" 
                onClick={handleSendFile}
                loading={uploading}
                disabled={uploading}
              >
                {uploading ? "Đang gửi..." : "Gửi"}
              </Button>
            </div>
          </div>
        )}

        <div className={styles.inputArea}>
          <div className={styles.actions}>
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              disabled={uploading}
            />

            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileSelect(file);
                return false; // Prevent default upload
              }}
            >
              <Button 
                icon={<PaperClipOutlined />} 
                type="text" 
                title="Gửi hình ảnh"
                className={styles.actionButton}
              />
            </Upload>

            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileSelect(file);
                return false; // Prevent default upload
              }}
            >
              <Button 
                icon={<FileOutlined />} 
                type="text" 
                title="Gửi file"
                className={styles.actionButton}
              />
            </Upload>

            <Button
              icon={<AudioOutlined />}
              type="text"
              title="Gửi audio"
              className={styles.actionButton}
              onClick={() => {
                // Tạo input file ẩn cho audio
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileSelect(file);
                };
                input.click();
              }}
            />
          </div>

          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={replyToMessage ? "Nhập tin nhắn trả lời..." : "Nhập tin nhắn hoặc kéo thả file vào đây..."}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={handleKeyPress}
            className={styles.textArea}
            disabled={uploading}
          />

          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={(!message.trim() && !preview) || loading || uploading}
            loading={loading || uploading}
            className={styles.sendButton}
            title="Gửi tin nhắn"
          />
        </div>
      </div>
    </>
  );
};
