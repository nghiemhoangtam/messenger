import React from 'react';
import styles from './ActivityDot.module.css';

interface ActivityDotProps {
  isActive: boolean;
  activityLevel?: 'high' | 'medium' | 'low' | 'inactive';
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const ActivityDot: React.FC<ActivityDotProps> = ({ 
  isActive, 
  activityLevel = 'medium',
  size = 'medium',
  showTooltip = true 
}) => {
  const dotClasses = [
    styles.activityDot,
    styles[size],
    isActive ? styles.active : styles.inactive
  ];
  
  // Add activity level class if active
  if (isActive && activityLevel) {
    dotClasses.push(styles[activityLevel]);
  }
  
  const tooltipText = isActive 
    ? `Room is active (${activityLevel} activity)` 
    : 'Room is inactive';
  
  const dot = (
    <span 
      className={dotClasses.join(' ')}
      title={showTooltip ? tooltipText : undefined}
    />
  );
  
  return dot;
};

export default ActivityDot;
