import React from 'react';
import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', // primary, secondary, outline
  onClick, 
  fullWidth = false,
  className = '',
  disabled = false
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  const disabledClass = disabled ? 'btn-disabled' : '';

  return (
    <button 
      className={`${baseClass} ${variantClass} ${widthClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
