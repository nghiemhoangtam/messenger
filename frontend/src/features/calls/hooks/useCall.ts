import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { User } from "../../auth/types";
import {
  answerCallRequest,
  endCallRequest,
  startCallRequest,
} from "../callsSlice";

export const useCall = () => {
  const dispatch = useDispatch();
  const { currentCall, loading, error } = useSelector(
    (state: RootState) => state.calls,
  );

  const startCall = useCallback(
    (participant: User, type: "audio" | "video") => {
      dispatch(startCallRequest({ participant, type }));
    },
    [dispatch],
  );

  const acceptCall = useCallback(
    (callId: string) => {
      dispatch(answerCallRequest());
    },
    [dispatch],
  );

  const rejectCall = useCallback(
    (callId: string) => {
      dispatch(endCallRequest());
    },
    [dispatch],
  );

  const endCall = useCallback(
    (callId: string) => {
      dispatch(endCallRequest());
    },
    [dispatch],
  );

  return {
    currentCall,
    loading,
    error,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};
