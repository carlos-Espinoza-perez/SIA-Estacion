import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  bgColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'SIA',
  size = 24,
  bgColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  const [falloImagen, setFalloImagen] = useState(false);

  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: '0.5px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      {src && !falloImagen ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            setFalloImagen(true);
          }}
        />
      ) : (
        <span
          style={{
            fontSize: `${Math.max(10, Math.floor(size * 0.42))}px`,
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
