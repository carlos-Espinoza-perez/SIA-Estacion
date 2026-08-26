import React from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';

export interface ActivityEvent {
  id: string;
  avatarSrc?: string;
  name: string;
  action: string;
  time: string;
}

export interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Línea conectora vertical */}
      <div
        style={{
          position: 'absolute',
          left: '19px',
          top: '20px',
          bottom: '24px',
          width: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          zIndex: 0,
        }}
      />

      {events.map((event) => (
        <div
          key={event.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '8px',
            borderRadius: '12px',
            position: 'relative',
            zIndex: 1,
            transition: 'background-color 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ backgroundColor: '#333333', borderRadius: '50%', padding: '2px' }}>
            <Avatar src={event.avatarSrc} name={event.name} size={24} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '18px',
              }}
            >
              {event.action}
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
              {event.name} · {event.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
