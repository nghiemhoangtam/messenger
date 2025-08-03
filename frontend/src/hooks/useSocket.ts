import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketService } from '../services/socketService';
import { RootState } from '../store';

// Singleton pattern to prevent multiple socket connections
let socketInitialized = false;

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const hasInitialized = useRef(false);

  // Poll connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
    };

    // Check immediately
    checkConnection();

    // Poll every 2 seconds
    const interval = setInterval(checkConnection, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && user.id && !hasInitialized.current && !socketInitialized) {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('🔌 Initializing socket connection...');
        socketService.initialize(dispatch);
        socketService.connect(user.id, token);
        hasInitialized.current = true;
        socketInitialized = true;
      }
    }

    return () => {
      // Only cleanup if this is the component that initialized the socket
      if (hasInitialized.current) {
        console.log('🔌 Cleaning up socket connection...');
        socketService.disconnect();
        hasInitialized.current = false;
        socketInitialized = false;
      }
    };
  }, [dispatch, user]);

  return {
    socketService,
    isConnected,
    sendMessage: socketService.sendMessage.bind(socketService),
    joinConversation: socketService.joinConversation.bind(socketService),
    leaveConversation: socketService.leaveConversation.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    markAsRead: socketService.markAsRead.bind(socketService),
    startCall: socketService.startCall.bind(socketService),
    answerCall: socketService.answerCall.bind(socketService),
    rejectCall: socketService.rejectCall.bind(socketService),
    endCall: socketService.endCall.bind(socketService),
  };
}; 