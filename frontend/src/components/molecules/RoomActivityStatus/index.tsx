import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import styles from './RoomActivityStatus.module.css';

interface RoomActivityStatusProps {
  roomId: string;
  showDetails?: boolean;
  showActivityDot?: boolean;
}

const RoomActivityStatus: React.FC<RoomActivityStatusProps> = ({ 
  roomId, 
  showDetails = false,
  showActivityDot = true 
}) => {
  const roomActivity = useSelector((state: RootState) => 
    state.chat.roomActivity[roomId]
  );

  if (!roomActivity) {
    // If only showing activity dot, return a loading dot
    if (!showDetails && showActivityDot) {
      return (
        <span 
          className={`${styles.activityDot} ${styles.inactive}`}
          title="Loading room activity..."
        />
      );
    }
    
    return (
      <div className={styles.container}>
        <span className={styles.status}>Loading...</span>
      </div>
    );
  }

  const { online_count, total_members, away_count, busy_count, offline_count, is_active, activity_level } = roomActivity;
  const isActive = is_active !== undefined ? is_active : (online_count > 0 || away_count > 0 || busy_count > 0);

  // If only showing activity dot, return minimal version
  if (!showDetails && showActivityDot) {
    const dotClasses = [
      styles.activityDot,
      isActive ? styles.active : styles.inactive
    ];
    
    // Add activity level class if available
    if (isActive && activity_level) {
      dotClasses.push(styles[activity_level]);
    }
    
    const title = isActive 
      ? `Room is active (${activity_level || 'medium'} activity)` 
      : 'Room is inactive';
    
    return (
      <span 
        className={dotClasses.join(' ')}
        title={title}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        {showActivityDot && (
          <span 
            className={`${styles.activityDot} ${isActive ? styles.active : styles.inactive} ${isActive && activity_level ? styles[activity_level] : ''}`}
            title={isActive ? `Room is active (${activity_level || 'medium'} activity)` : 'Room is inactive'}
          ></span>
        )}
        <span className={styles.onlineCount}>{online_count}</span>
        <span className={styles.separator}>/</span>
        <span className={styles.totalCount}>{total_members}</span>
        <span className={styles.status}>online</span>
      </div>
      
      {showDetails && (
        <div className={styles.details}>
          <div className={styles.statusItem}>
            <span className={styles.statusDot + ' ' + styles.online}></span>
            <span className={styles.statusLabel}>Online: {online_count}</span>
          </div>
          {away_count > 0 && (
            <div className={styles.statusItem}>
              <span className={styles.statusDot + ' ' + styles.away}></span>
              <span className={styles.statusLabel}>Away: {away_count}</span>
            </div>
          )}
          {busy_count > 0 && (
            <div className={styles.statusItem}>
              <span className={styles.statusDot + ' ' + styles.busy}></span>
              <span className={styles.statusLabel}>Busy: {busy_count}</span>
            </div>
          )}
          {offline_count > 0 && (
            <div className={styles.statusItem}>
              <span className={styles.statusDot + ' ' + styles.offline}></span>
              <span className={styles.statusLabel}>Offline: {offline_count}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomActivityStatus;
