import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  variant?: 'default' | 'hero' | 'gradientDark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  variant = 'default',
  padding = 'md',
  radius = 'xl',
  className = '',
  style,
  ...props
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '12px';
      case 'lg':
        return '24px';
      case 'xl':
        return '32px';
      case 'md':
      default:
        return '16px';
    }
  };

  const getRadiusStyle = () => {
    switch (radius) {
      case 'md':
        return 'var(--radius-md)';
      case 'lg':
        return 'var(--radius-lg)';
      case '2xl':
        return 'var(--radius-2xl)';
      case 'xl':
      default:
        return 'var(--radius-xl)';
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'hero':
        return {
          background: 'var(--primary-gradient)',
          border: '0.5px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(10, 132, 255, 0.35)',
        };
      case 'gradientDark':
        return {
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%), #17171c',
          border: 'var(--border-figma)',
          boxShadow: 'var(--shadow-figma-sm)',
        };
      case 'default':
      default:
        return {
          backgroundColor: glass ? 'var(--bg-glass-card)' : 'var(--bg-surface)',
          border: 'var(--border-figma)',
          backdropFilter: glass ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: glass ? 'blur(20px)' : 'none',
          boxShadow: 'var(--shadow-figma-sm)',
        };
    }
  };

  return (
    <div
      style={{
        padding: getPaddingStyle(),
        borderRadius: getRadiusStyle(),
        transition: 'all var(--transition-normal)',
        ...getVariantStyles(),
        ...style,
      }}
      className={`sia-card ${glass && variant === 'default' ? 'glass-card' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
