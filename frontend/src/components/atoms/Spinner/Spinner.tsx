import React from 'react';

export interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = 'var(--primary)',
  className = '',
}) => {
  return (
    <div
      className={`sia-spinner ${className}`}
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 8))}px solid rgba(255, 255, 255, 0.15)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'siaSpin 0.7s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{`
        @keyframes siaSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
