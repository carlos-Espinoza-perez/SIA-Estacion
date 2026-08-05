import React from 'react';

export interface KbdProps {
  children: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = ({ children }) => {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '18px',
        padding: '0 4px',
        borderRadius: '6px',
        border: '0.5px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        fontSize: '11px',
        fontFamily: 'Inter, monospace',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.4)',
        lineHeight: 1,
      }}
    >
      {children}
    </kbd>
  );
};
