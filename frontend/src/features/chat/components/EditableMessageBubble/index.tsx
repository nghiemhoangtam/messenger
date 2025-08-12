import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Input, Popconfirm } from "antd";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "../../../../components/atoms/Avatar";
import { Message } from "../../types";
import styles from "./EditableMessageBubble.module.css";

const { TextArea } = Input;

interface EditableMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReplyClick?: (message: Message) => void;
  onScrollToMessage?: (messageId: string) => void;
  onCancelEdit?: () => void;
}

export const EditableMessageBubble: React.FC<EditableMessageBubbleProps> = ({
  message,
  isOwn,
  onEditMessage,
  onDeleteMessage,
  onReplyClick,
  onScrollToMessage,
  onCancelEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditContent(message.content);
  }, [message.content]);

  const handleSaveEdit = useCallback(async () => {
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
  }, [editContent, message.content, message.id, onEditMessage]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(message.content);
    onCancelEdit?.();
  }, [message.content, onCancelEdit]);

  const handleDeleteClick = useCallback(async () => {
    if (!onDeleteMessage) return;
    
    setIsDeleting(true);
    try {
      await onDeleteMessage(message.id);
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [onDeleteMessage, message.id]);

  const handleReplyClick = useCallback(() => {
    onReplyClick?.(message);
  }, [onReplyClick, message]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!editContent.trim() || editContent === message.content) {
        setIsEditing(false);
        return;
      }
      setIsLoading(true);
      onEditMessage(message.id, editContent).then(() => {
        setIsEditing(false);
        setIsLoading(false);
      }).catch((error) => {
        console.error("Failed to edit message:", error);
        setIsLoading(false);
      });
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
      onCancelEdit?.();
    }
  }, [editContent, message.content, message.id, onEditMessage, onCancelEdit]);

  const getMessageType = useCallback(() => {
    if (message.content.startsWith("data:image")) return "image";
    if (message.content.startsWith("data:audio")) return "audio";
    if (message.content.startsWith("data:application")) return "file";
    return message.type || "text";
  }, [message.content, message.type]);

  const renderContent = useMemo(() => {
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
  }, [message.content, getMessageType]);

  const renderStatus = useMemo(() => {
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
  }, [message.status]);

  const renderReplyPreview = useMemo(() => {
    if (!message.reply_to) return null;

    const renderReplyContent = () => {
      const replyTo = message.reply_to;
      if (!replyTo) return null;
      
      switch (replyTo.type) {
        case "image":
          return <img src={replyTo.content} alt="reply" className={styles.replyImage} />;
        case "file":
          return (
            <div className={styles.replyFile}>
              <span>{replyTo.content}</span>
            </div>
          );
        case "audio":
          return (
            <div className={styles.replyAudio}>
              <span>Audio</span>
            </div>
          );
        default:
          return replyTo.content;
      }
    };

    const handleReplyClick = () => {
      if (message.reply_to) {
        onScrollToMessage?.(message.reply_to.id);
      }
    };

    return (
      <div 
        className={styles.replyPreview}
        onClick={handleReplyClick}
      >
        <div className={styles.replyIcon}>
          <UndoOutlined />
        </div>
        <div className={styles.replyContent}>
          <div className={styles.replySender}>{message.reply_to?.sender.display_name}</div>
          <div className={styles.replyText}>{renderReplyContent()}</div>
        </div>
      </div>
    );
  }, [message.reply_to?.id, message.reply_to?.content, message.reply_to?.type, message.reply_to?.sender?.display_name, onScrollToMessage]);

  const formatTimestamp = useCallback((date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  return (
    <div className={`${styles.container} ${isOwn ? styles.own : ""}`} data-message-id={message.id}>
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
              {renderReplyPreview}
              {renderContent}
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
            {isOwn && <span className={styles.status}>{renderStatus}</span>}
          </div>
        </div>
        {!isEditing && (
          <div className={styles.actionButtons}>
            <Button
              type="text"
              icon={<UndoOutlined />}
              onClick={handleReplyClick}
              size="small"
              className={styles.replyButton}
              title="Trả lời"
            />
            {isOwn && getMessageType() === "text" && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={handleEditClick}
                size="small"
                className={styles.editButton}
                title="Chỉnh sửa"
              />
            )}
            {isOwn && onDeleteMessage && (
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa tin nhắn này không?"
                onConfirm={handleDeleteClick}
                okButtonProps={{ loading: isDeleting }}
                cancelButtonProps={{ loading: isDeleting }}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteClick}
                  size="small"
                  className={styles.deleteButton}
                  loading={isDeleting}
                  title="Xóa"
                />
              </Popconfirm>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
