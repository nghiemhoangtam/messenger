import React from 'react';
import ActivityDot from './index';

const ActivityDotDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3>Activity Dot Demo</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>High Activity:</span>
        <ActivityDot isActive={true} activityLevel="high" size="large" />
        <ActivityDot isActive={true} activityLevel="high" size="medium" />
        <ActivityDot isActive={true} activityLevel="high" size="small" />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>Medium Activity:</span>
        <ActivityDot isActive={true} activityLevel="medium" size="large" />
        <ActivityDot isActive={true} activityLevel="medium" size="medium" />
        <ActivityDot isActive={true} activityLevel="medium" size="small" />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>Low Activity:</span>
        <ActivityDot isActive={true} activityLevel="low" size="large" />
        <ActivityDot isActive={true} activityLevel="low" size="medium" />
        <ActivityDot isActive={true} activityLevel="low" size="small" />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>Inactive:</span>
        <ActivityDot isActive={false} size="large" />
        <ActivityDot isActive={false} size="medium" />
        <ActivityDot isActive={false} size="small" />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>Default (Medium):</span>
        <ActivityDot isActive={true} size="large" />
        <ActivityDot isActive={true} size="medium" />
        <ActivityDot isActive={true} size="small" />
      </div>
    </div>
  );
};

export default ActivityDotDemo;
