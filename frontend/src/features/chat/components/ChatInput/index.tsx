import {
    AudioOutlined,
    CloseOutlined,
    FileImageOutlined,
    FileOutlined,
    SendOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import { Button, Input, Upload, notification } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { socketService } from "../../../../services/socketService";
import { ReplyMessage } from "../../types";
import styles from "./ChatInput.module.css";

const { TextArea } = Input;

interface ChatInputProps {
  onSendMessage: (content: string, replyToId?: string) => void;
  onSendFile: (file: File, type: "image" | "file" | "audio", replyToId?: string) => void;
  loading?: boolean;
  room_id?: string;
  replyToMessage?: ReplyMessage | null;
  onCancelReply?: () => void;
  onScrollToMessage?: (messageId: string) => void;
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
  const [preview, setPreview] = useState<{
    file: File;
    type: "image" | "file" | "audio";
  } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
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
  }, [message, room_id]); // Remove isTyping from dependencies to avoid infinite loop

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Stop typing when sending message
    if (room_id) {
      setIsTyping(false);
      socketService.stopTyping(room_id);
    }
    
    onSendMessage(message, replyToMessage?.id);
    setMessage("");
  };

  const handleFileUpload = async (
    file: File,
    type: "image" | "file" | "audio"
  ) => {
    setPreview({ file, type });
    return false;
  };

  const handleRemovePreview = () => {
    setPreview(null);
  };

  const handleSendFile = async () => {
    if (!preview) return;
    try {
      await onSendFile(preview.file, preview.type, replyToMessage?.id);
      setPreview(null);
      notification.success({
        message: "Thành công",
        description: "Gửi file thành công",
      });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Gửi file thất bại",
      });
    }
  };

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
        default:
          return replyToMessage.content;
      }
    };

    return (
      <div className={styles.replyPreview}>
        <div className={styles.replyIcon}>
          <UndoOutlined />
        </div>
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
    <div className={styles.container}>
      {replyToMessage && renderReplyPreview()}
      
      {preview && (
        <div className={styles.preview}>
          {preview.type === "image" && (
            <img src={URL.createObjectURL(preview.file)} alt="Preview" />
          )}
          {preview.type === "file" && (
            <div className={styles.filePreview}>
              <FileOutlined />
              <span>{preview.file.name}</span>
            </div>
          )}
          {preview.type === "audio" && (
            <div className={styles.filePreview}>
              <AudioOutlined />
              <span>Audio file</span>
            </div>
          )}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleRemovePreview}
            className={styles.removePreview}
          />
          <Button type="primary" onClick={handleSendFile}>
            Gửi
          </Button>
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.actions}>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => handleFileUpload(file, "image")}
          >
            <Button icon={<FileImageOutlined />} type="text" />
          </Upload>

          <Upload
            showUploadList={false}
            beforeUpload={(file) => handleFileUpload(file, "file")}
          >
            <Button icon={<FileOutlined />} type="text" />
          </Upload>

          <Button
            icon={<AudioOutlined />}
            type="text"
            onClick={() => handleFileUpload(new File([], "audio"), "audio")}
          />
        </div>

        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={replyToMessage ? "Nhập tin nhắn trả lời..." : "Nhập tin nhắn..."}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className={styles.textArea}
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!message.trim() || loading}
          className={styles.sendButton}
        />
      </div>
    </div>
  );
};
