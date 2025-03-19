import {
  AudioOutlined,
  CloseOutlined,
  FileImageOutlined,
  FileOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Input, Upload, notification } from "antd";
import React, { useState } from "react";
import styles from "./ChatInput.module.css";

const { TextArea } = Input;

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onSendFile: (file: File, type: "image" | "file" | "audio") => void;
  loading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  loading = false,
}) => {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<{
    file: File;
    type: "image" | "file" | "audio";
  } | null>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
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
      await onSendFile(preview.file, preview.type);
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

  return (
    <div className={styles.container}>
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
          placeholder="Nhập tin nhắn..."
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
