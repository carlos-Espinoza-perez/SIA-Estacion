import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertBannerProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  message,
  onClose,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'rgba(255, 69, 58, 0.12)',
          border: 'rgba(255, 69, 58, 0.3)',
          text: '#ff8580',
          icon: <AlertCircle size={17} color="#ff453a" />,
        };
      case 'success':
        return {
          bg: 'rgba(48, 209, 88, 0.12)',
          border: 'rgba(48, 209, 88, 0.3)',
          text: '#86efac',
          icon: <CheckCircle2 size={17} color="#30d158" />,
        };
      case 'warning':
        return {
          bg: 'rgba(255, 159, 10, 0.12)',
          border: 'rgba(255, 159, 10, 0.3)',
          text: '#ffd07a',
          icon: <AlertTriangle size={17} color="#ff9f0a" />,
        };
      case 'info':
      default:
        return {
          bg: 'rgba(10, 132, 255, 0.12)',
          border: 'rgba(10, 132, 255, 0.3)',
          text: '#99caff',
          icon: <Info size={17} color="#0a84ff" />,
        };
    }
  };

  const config = getConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: config.bg,
        border: `0.5px solid ${config.border}`,
        color: config.text,
        fontSize: '13px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {config.icon}
        <span>{message}</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: config.text,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
