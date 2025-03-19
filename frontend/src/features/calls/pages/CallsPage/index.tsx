import { Tabs } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { CallCard } from "../../../../components/molecules/CallCard";
import { RootState } from "../../../../store";
import { Call } from "../../callsSlice";
import styles from "./CallsPage.module.css";

const { TabPane } = Tabs;

export const CallsPage: React.FC = () => {
  const { calls } = useSelector((state: RootState) => state.calls);
  const { user } = useSelector((state: RootState) => state.auth);

  const missedCalls = calls.filter((call: Call) => call.status === "missed");
  const ringingCalls = calls.filter((call: Call) => call.status === "ringing");
  const completedCalls = calls.filter((call: Call) => call.status === "ended");

  const getCallStatus = (call: Call) => {
    if (call.status === "connected") return "ongoing";
    if (call.status === "rejected") return "missed";
    return call.status;
  };

  const formatDuration = (duration?: number): string | undefined => {
    if (!duration) return undefined;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderCalls = (callList: Call[]) => {
    return callList.map((call: Call) => {
      const otherParticipant =
        call.caller.id === user?.id ? call.receiver : call.caller;
      return (
        <CallCard
          key={call.id}
          username={otherParticipant.username}
          avatar={otherParticipant.avatar}
          type={call.type}
          status={getCallStatus(call)}
          timestamp={
            call.startTime ? new Date(call.startTime).toLocaleString() : ""
          }
          duration={formatDuration(call.duration)}
        />
      );
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cuộc gọi</h2>
      <Tabs defaultActiveKey="all">
        <TabPane tab="Tất cả" key="all">
          {renderCalls(calls)}
        </TabPane>
        <TabPane tab="Cuộc gọi nhỡ" key="missed">
          {renderCalls(missedCalls)}
        </TabPane>
        <TabPane tab="Đang gọi" key="ringing">
          {renderCalls(ringingCalls)}
        </TabPane>
        <TabPane tab="Đã hoàn thành" key="completed">
          {renderCalls(completedCalls)}
        </TabPane>
      </Tabs>
    </div>
  );
};
