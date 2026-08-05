import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral' | 'mint' | 'lavender' | 'sky' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(48, 209, 88, 0.15)', text: '#30d158', dotColor: '#30d158' };
      case 'warning':
        return { bg: 'rgba(255, 159, 10, 0.15)', text: '#ff9f0a', dotColor: '#ff9f0a' };
      case 'danger':
        return { bg: 'rgba(255, 69, 58, 0.15)', text: '#ff453a', dotColor: '#ff453a' };
      case 'mint':
      case 'info':
        return { bg: 'rgba(107, 230, 211, 0.15)', text: '#6be6d3', dotColor: '#6be6d3' };
      case 'lavender':
        return { bg: 'rgba(184, 153, 235, 0.15)', text: '#b899eb', dotColor: '#b899eb' };
      case 'sky':
        return { bg: 'rgba(125, 187, 255, 0.15)', text: '#7dbbff', dotColor: '#7dbbff' };
      case 'purple':
        return { bg: 'rgba(191, 90, 242, 0.15)', text: '#bf5af2', dotColor: '#bf5af2' };
      case 'neutral':
        return { bg: 'rgba(255, 255, 255, 0.08)', text: 'rgba(255, 255, 255, 0.7)', dotColor: 'rgba(255, 255, 255, 0.4)' };
      case 'primary':
      default:
        return { bg: 'rgba(10, 132, 255, 0.15)', text: '#0a84ff', dotColor: '#0a84ff' };
    }
  };

  const colors = getBadgeColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        backgroundColor: colors.bg,
        color: colors.text,
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
        whiteSpace: 'nowrap',
        letterSpacing: '-0.01em',
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};
