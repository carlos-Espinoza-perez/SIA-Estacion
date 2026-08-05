import React from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';

export interface UserContactItemProps {
  name: string;
  avatarSrc?: string;
  role?: string;
}

export const UserContactItem: React.FC<UserContactItemProps> = ({
  name,
  avatarSrc,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Avatar src={avatarSrc} name={name} size={24} />
      <span
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {name}
      </span>
    </div>
  );
};
