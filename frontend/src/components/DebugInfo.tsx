import { Typography } from 'antd';
import React, { useEffect, useRef } from 'react';

const { Text } = Typography;

export const DebugInfo: React.FC = () => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;

  });

  return (
    <div style={{ 
      position: 'fixed', 
      top: 50, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <Text style={{ color: 'white' }}>
        Renders: {renderCount.current}
      </Text>
    </div>
  );
}; 