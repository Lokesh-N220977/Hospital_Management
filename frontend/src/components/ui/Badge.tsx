import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'info' }) => {
  const colors = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: `${colors[type]}22`,
      color: colors[type],
      border: `1px solid ${colors[type]}44`,
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};
