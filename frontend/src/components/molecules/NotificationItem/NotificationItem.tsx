import React from 'react';

export interface NotificationItemProps {
  iconType: 'bug' | 'user' | 'broadcast' | 'shield';
  title: string;
  time: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  iconType,
  title,
  time,
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'user':
        return (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '8px',
              backgroundColor: '#E6F1FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17171C" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        );
      case 'broadcast':
        return (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '8px',
              backgroundColor: '#E6F1FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17171C" strokeWidth="2">
              <path d="M4.93 4.93a10 10 0 0 0 0 14.14M7.76 7.76a6 6 0 0 0 0 8.48M12 12h.01" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M16.24 7.76a6 6 0 0 1 0 8.48" />
            </svg>
          </div>
        );
      case 'shield':
      case 'bug':
      default:
        return (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '8px',
              backgroundColor: '#EDEEFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17171C" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '8px',
        borderRadius: '12px',
        transition: 'background-color 0.15s ease',
        cursor: 'default',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {getIcon()}

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'Inter, sans-serif',
            marginTop: '2px',
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
};
