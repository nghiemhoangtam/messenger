import { Badge, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = useSocket();

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      zIndex: 1000,
      background: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #d9d9d9'
    }}>
      <Badge 
        status={isConnected ? 'success' : 'error'} 
        text={
          <Text strong style={{ color: isConnected ? '#52c41a' : '#ff4d4f' }}>
            Socket: {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        } 
      />
    </div>
  );
}; 