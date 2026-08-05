import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive?: boolean;
  bgColor?: '#E6F1FD' | '#EDEEFC' | string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  isPositive = true,
  bgColor = '#E6F1FD',
}) => {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: '1 1 200px',
        minWidth: '180px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: 'default',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Título de la tarjeta */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#000000',
          fontFamily: 'Inter, sans-serif',
          lineHeight: '20px',
        }}
      >
        {title}
      </span>

      {/* Fila: Valor principal + Porcentaje de tendencia */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '4px',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#000000',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>

        {/* Badge de tendencia con icono SVG */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 400,
            color: '#000000',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span>{trend}</span>
          {isPositive ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.5 4.5L4.5 11.5M11.5 4.5H6M11.5 4.5V10"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.5 11.5L4.5 4.5M11.5 11.5H6M11.5 11.5V6"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
