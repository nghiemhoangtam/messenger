import { User } from "../auth/types";

export interface Call {
  id: string;
  caller: User;
  receiver: User;
  type: "audio" | "video";
  status:
    | "ringing"
    | "connected"
    | "ended"
    | "missed"
    | "rejected"
    | "incoming"
    | "outgoing";
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export interface CallsState {
  calls: Call[];
  currentCall: Call | null;
  loading: boolean;
  error: string | null;
}
