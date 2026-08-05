import React from 'react';

export type ResultadoAcceso = 'Concedido' | 'Denegado' | 'Offline' | 'Pendiente';

const COLOR_MAP: Record<ResultadoAcceso, string> = {
  Concedido: '#71DD8C',
  Denegado:  '#B899EB',
  Offline:   '#7DBBFF',
  Pendiente: 'rgba(255,255,255,0.4)',
};

export interface ResultadoBadgeProps {
  value: ResultadoAcceso;
}

export const ResultadoBadge: React.FC<ResultadoBadgeProps> = ({ value }) => {
  const color = COLOR_MAP[value] ?? 'rgba(255,255,255,0.4)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
};
