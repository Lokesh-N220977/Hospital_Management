import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="sf-field">
      <label>{label}</label>
      <div className="sf-input-wrap">
        {icon && <span className="sf-icon">{icon}</span>}
        <input 
          className={`${error ? 'input-error' : ''} ${className}`} 
          style={error ? { borderColor: '#ef4444' } : {}}
          {...props} 
        />
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};
