import React from "react";
import { useSelector } from "react-redux";
import { Avatar } from "../../../../components/atoms/Avatar";
import { RootState } from "../../../../store";
import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
  room_id: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ room_id }) => {
  const { typingIndicators } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Filter typing indicators for current room and exclude current user  
  const currentRoomTyping = typingIndicators.filter(
    ti => ti.room_id === room_id && ti.user.id !== user?.id
  );

  if (currentRoomTyping.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (currentRoomTyping.length === 1) {
      return `${currentRoomTyping[0].user.display_name} is typing...`;
    } else if (currentRoomTyping.length === 2) {
      return `${currentRoomTyping[0].user.display_name} and ${currentRoomTyping[1].user.display_name} are typing...`;
    } else {
      return `${currentRoomTyping[0].user.display_name} and ${currentRoomTyping.length - 1} others are typing...`;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.avatarsContainer}>
        {currentRoomTyping.slice(0, 3).map((ti, index) => (
          <Avatar
            key={ti.user.id}
            src={ti.user.avatar}
            size={24}
            className={styles.avatar}
            style={{ 
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: 3 - index 
            }}
          >
            {ti.user.display_name?.charAt(0)?.toUpperCase()}
          </Avatar>
        ))}
      </div>
      <div className={styles.typingDots}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
      <span className={styles.text}>{getTypingText()}</span>
    </div>
  );
}; 