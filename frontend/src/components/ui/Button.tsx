import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  loading, 
  children, 
  className = '', 
  ...props 
}) => {
  const variantClass = variant === 'primary' ? 'sf-submit-btn' : 'btn-secondary';
  
  return (
    <button 
      className={`${variantClass} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};
