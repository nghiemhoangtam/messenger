import { SmileOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import EmojiPickerReact, { EmojiClickData } from 'emoji-picker-react';
import React, { useState } from 'react';
import styles from './EmojiPicker.module.css';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const emojiPickerContent = (
    <div className={styles.emojiPickerContainer}>
      <EmojiPickerReact
        onEmojiClick={handleEmojiClick}
        autoFocusSearch={false}
        searchPlaceholder="Tìm emoji..."
        width={350}
        height={400}
        lazyLoadEmojis={true}
      />
    </div>
  );

  return (
    <Popover
      content={emojiPickerContent}
      trigger="click"
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement="top"
      overlayClassName={styles.emojiPickerOverlay}
    >
      <Button
        icon={<SmileOutlined />}
        type="text"
        title="Chọn emoji"
        className={styles.emojiButton}
        disabled={disabled}
      />
    </Popover>
  );
};
