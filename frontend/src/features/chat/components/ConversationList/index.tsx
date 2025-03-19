import { Avatar, Badge, List } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { User } from "../../../auth/types";
import {
  fetchConversationsRequest,
  setCurrentConversation,
} from "../../chatSlice";
import styles from "./ConversationList.module.css";

export const ConversationList: React.FC = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, currentConversation } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchConversationsRequest());
  }, [dispatch]);

  const handleConversationClick = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      dispatch(setCurrentConversation(conversation));
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (participant: User) => participant.id !== user?.id
    );
    return otherParticipant?.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className={styles.conversationList}>
      <List
        dataSource={filteredConversations}
        renderItem={(conversation) => {
          const isActive = currentConversation?.id === conversation.id;
          const otherParticipant = conversation.participants.find(
            (participant: User) => participant.id !== user?.id
          );

          return (
            <List.Item
              className={`${styles.conversationItem} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={conversation.unreadCount}>
                    <Avatar src={otherParticipant?.avatar}>
                      {otherParticipant?.username?.[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                }
                title={otherParticipant?.username || "Nhóm chat"}
                description={
                  <div className={styles.lastMessage}>
                    {conversation.lastMessage?.content}
                  </div>
                }
              />
              {conversation.lastMessage && (
                <div className={styles.messageTime}>
                  {new Date(
                    conversation.lastMessage.createdAt
                  ).toLocaleTimeString()}
                </div>
              )}
            </List.Item>
          );
        }}
      />
    </div>
  );
};
