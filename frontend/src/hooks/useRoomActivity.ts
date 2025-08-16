import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketService } from '../services/socketService';
import { RootState } from '../store';

interface UseRoomActivityProps {
  roomId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useRoomActivity = ({ 
  roomId, 
  autoRefresh = true, 
  refreshInterval = 5000 
}: UseRoomActivityProps) => {
  const dispatch = useDispatch();
  
  const roomActivity = useSelector((state: RootState) => 
    state.chat.roomActivity[roomId]
  );
  
  const onlineUsers = useSelector((state: RootState) => 
    state.chat.roomOnlineUsers[roomId] || []
  );

  // Get room activity from server
  const refreshActivity = useCallback(() => {
    if (roomId) {
      socketService.getRoomActivity(roomId);
    }
  }, [roomId]);

  // Update user status
  const updateUserStatus = useCallback((status: 'online' | 'offline' | 'away' | 'busy') => {
    if (roomId) {
      socketService.updateActivityStatus(roomId, status);
    }
  }, [roomId]);

  // Start keep alive for this room
  const startKeepAlive = useCallback(() => {
    if (roomId) {
      socketService.startKeepAlive(roomId, refreshInterval);
    }
  }, [roomId, refreshInterval]);

  // Stop keep alive for this room
  const stopKeepAlive = useCallback(() => {
    if (roomId) {
      socketService.stopKeepAlive(roomId);
    }
  }, [roomId]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && roomId) {
      // Initial load
      refreshActivity();
      
      // Automatically set user status to 'online' when joining a room
      updateUserStatus('online');
      
      // Set up interval for fallback (in case real-time events fail)
      // Use longer interval since we now have real-time updates
      const interval = setInterval(refreshActivity, Math.max(refreshInterval, 5000));
      
      // Start keep alive
      startKeepAlive();
      
      return () => {
        clearInterval(interval);
        stopKeepAlive();
      };
    }
  }, [roomId, autoRefresh, refreshInterval, refreshActivity, startKeepAlive, stopKeepAlive, updateUserStatus]);

  // Effect to refresh activity when roomId changes (user switches to different room)
  useEffect(() => {
    if (roomId) {
      // Refresh activity immediately when switching rooms
      refreshActivity();
    }
  }, [roomId, refreshActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomId) {
        // Set user status to offline when leaving room
        updateUserStatus('offline');
        stopKeepAlive();
      }
    };
  }, [roomId, stopKeepAlive, updateUserStatus]);

  return {
    roomActivity,
    onlineUsers,
    refreshActivity,
    updateUserStatus,
    startKeepAlive,
    stopKeepAlive,
    isLoading: !roomActivity,
    hasOnlineUsers: onlineUsers.length > 0,
    onlineCount: roomActivity?.online_count || 0,
    totalMembers: roomActivity?.total_members || 0,
    awayCount: roomActivity?.away_count || 0,
    busyCount: roomActivity?.busy_count || 0,
    offlineCount: roomActivity?.offline_count || 0,
    isActive: roomActivity?.is_active || false,
    activityLevel: roomActivity?.activity_level || 'inactive',
  };
};
