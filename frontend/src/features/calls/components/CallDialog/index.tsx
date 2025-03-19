import { PhoneOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Avatar, Button, Modal } from "antd";
import React from "react";
import { useCall } from "../../hooks/useCall";
import { Call } from "../../types";
import styles from "./CallDialog.module.css";

interface CallDialogProps {
  call: Call;
}

export const CallDialog: React.FC<CallDialogProps> = ({ call }) => {
  const { acceptCall, rejectCall, endCall } = useCall();

  const handleAccept = () => {
    acceptCall(call.id);
  };

  const handleReject = () => {
    rejectCall(call.id);
  };

  const handleEnd = () => {
    endCall(call.id);
  };

  const isIncoming = call.status === "ringing";
  const isOngoing = call.status === "connected";

  return (
    <Modal
      open={true}
      closable={false}
      footer={null}
      centered
      className={styles.modal}
    >
      <div className={styles.container}>
        <Avatar size={96} src={call.caller.avatar} className={styles.avatar}>
          {!call.caller.avatar && call.caller.username[0].toUpperCase()}
        </Avatar>
        <h2 className={styles.name}>{call.caller.username}</h2>
        <p className={styles.status}>
          {isIncoming
            ? "Đang gọi đến..."
            : isOngoing
            ? "Đang gọi"
            : "Kết thúc cuộc gọi"}
        </p>

        <div className={styles.actions}>
          {isIncoming ? (
            <>
              <Button
                type="primary"
                shape="circle"
                icon={<PhoneOutlined />}
                size="large"
                onClick={handleAccept}
                className={styles.acceptButton}
              />
              <Button
                danger
                shape="circle"
                icon={<PhoneOutlined rotate={135} />}
                size="large"
                onClick={handleReject}
                className={styles.rejectButton}
              />
            </>
          ) : (
            <Button
              danger
              shape="circle"
              icon={<PhoneOutlined rotate={135} />}
              size="large"
              onClick={handleEnd}
              className={styles.endButton}
            />
          )}
        </div>

        {isOngoing && (
          <div className={styles.controls}>
            <Button
              type="text"
              shape="circle"
              icon={<VideoCameraOutlined />}
              size="large"
            />
            <Button
              type="text"
              shape="circle"
              icon={<PhoneOutlined />}
              size="large"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
