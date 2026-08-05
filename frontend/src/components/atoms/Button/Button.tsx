import React from 'react';
import { Spinner } from '../Spinner/Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  pill?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  pill = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          border: '0.5px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(10, 132, 255, 0.35)',
        };
      case 'accent':
        return {
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), #0a84ff',
          color: '#ffffff',
          border: '0.5px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 2px 14px rgba(10, 132, 255, 0.4)',
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          border: 'var(--border-figma)',
          boxShadow: 'var(--shadow-figma-sm)',
        };
      case 'subtle':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          color: 'var(--text-secondary)',
          border: 'var(--border-figma)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger)',
          color: '#ffffff',
          border: '0.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 12px rgba(255, 69, 58, 0.3)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '0.5px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    const radius = pill ? 'var(--radius-full)' : 'var(--radius-lg)';
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 500,
          borderRadius: radius,
          height: '32px',
        };
      case 'lg':
        return {
          padding: '12px 24px',
          fontSize: '15px',
          fontWeight: 600,
          borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-xl)',
          height: '46px',
        };
      case 'md':
      default:
        return {
          padding: '8px 18px',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: radius,
          height: '38px',
        };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        outline: 'none',
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '-0.01em',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`sia-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'sm' ? 14 : 18} color="currentColor" />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
