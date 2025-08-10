import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "../../../../components/atoms/Avatar";
import { Message } from "../../types";
import styles from "./EditableMessageBubble.module.css";

const { TextArea } = Input;

interface EditableMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onCancelEdit?: () => void;
}

export const EditableMessageBubble: React.FC<EditableMessageBubbleProps> = ({
  message,
  isOwn,
  onEditMessage,
  onCancelEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      // For Ant Design TextArea, we need to access the native textarea element
      const textareaElement = textAreaRef.current.resizableTextArea?.textArea;
      if (textareaElement) {
        textareaElement.select();
      } else {
        // Fallback: try to select text after a short delay
        setTimeout(() => {
          if (textAreaRef.current?.resizableTextArea?.textArea) {
            textAreaRef.current.resizableTextArea.textArea.select();
          }
        }, 10);
      }
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onEditMessage(message.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
    onCancelEdit?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const getMessageType = () => {
    if (message.content.startsWith("data:image")) return "image";
    if (message.content.startsWith("data:audio")) return "audio";
    if (message.content.startsWith("data:application")) return "file";
    return "text";
  };

  const renderContent = () => {
    const messageType = getMessageType();
    switch (messageType) {
      case "image":
        return <img src={message.content} alt="message" className={styles.image} />;
      case "file":
        return (
          <div className={styles.file}>
            <span>{message.content}</span>
          </div>
        );
      case "audio":
        return <audio src={message.content} controls className={styles.audio} />;
      default:
        return message.content;
    }
  };

  const renderStatus = () => {
    switch (message.status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return "⏳";
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`${styles.container} ${isOwn ? styles.own : ""}`}>
      {!isOwn && (
        <Avatar src={message.sender.avatar} size={32}>
          {message.sender.display_name?.[0].toUpperCase()}
        </Avatar>
      )}
      <div className={styles.bubbleWrapper}>
        {!isOwn && message.sender.display_name && (
          <div className={styles.senderName}>{message.sender.display_name}</div>
        )}
        <div className={`${styles.bubble} ${styles[getMessageType()]}`}>
          {isEditing ? (
            <div className={styles.editContainer}>
              <TextArea
                ref={textAreaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className={styles.editTextArea}
                disabled={isLoading}
              />
              <div className={styles.editActions}>
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={handleSaveEdit}
                  loading={isLoading}
                  size="small"
                  className={styles.saveButton}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  size="small"
                  className={styles.cancelButton}
                />
              </div>
            </div>
          ) : (
            <>
              {renderContent()}
              {message.edited_at && (
                <div className={styles.editedIndicator}>
                  (đã chỉnh sửa)
                </div>
              )}
            </>
          )}
          <div className={styles.metadata}>
            <span className={styles.timestamp}>
              {formatTimestamp(message.created_at)}
            </span>
            {isOwn && <span className={styles.status}>{renderStatus()}</span>}
          </div>
        </div>
        {isOwn && !isEditing && getMessageType() === "text" && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={handleEditClick}
            size="small"
            className={styles.editButton}
          />
        )}
      </div>
    </div>
  );
};
