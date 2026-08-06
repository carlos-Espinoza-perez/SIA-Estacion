import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'dot' | 'pill' | 'outline';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'pill' }) => {
  const normalize = status.toLowerCase();

  let bg = 'rgba(255, 255, 255, 0.08)';
  let color = '#FFFFFF';
  let dotColor = '#FFFFFF';

  if (['activo', 'disponible', 'en línea', 'online', 'concedido', 'aprobada'].includes(normalize)) {
    bg = 'rgba(34, 197, 94, 0.12)';
    color = '#4ADE80';
    dotColor = '#22C55E';
  } else if (['inactivo', 'denegado', 'rechazada', 'sin conexión', 'offline', 'baja'].includes(normalize)) {
    bg = 'rgba(239, 68, 68, 0.12)';
    color = '#F87171';
    dotColor = '#EF4444';
  } else if (['prestado', 'entregado', 'en reparación', 'degradado'].includes(normalize)) {
    bg = 'rgba(234, 179, 8, 0.12)';
    color = '#FBBF24';
    dotColor = '#EAB308';
  } else if (['pendiente', 'solicitado'].includes(normalize)) {
    bg = 'rgba(59, 130, 246, 0.12)';
    color = '#60A5FA';
    dotColor = '#3B82F6';
  } else if (['devuelto', 'completado'].includes(normalize)) {
    bg = 'rgba(168, 85, 247, 0.12)';
    color = '#C084FC';
    dotColor = '#A855F7';
  }

  if (variant === 'dot') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color }}>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
        {status}
      </div>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '12px',
        backgroundColor: bg,
        color,
        fontSize: '11.5px',
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
      {status}
    </span>
  );
};
