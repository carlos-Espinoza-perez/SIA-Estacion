import React from 'react';

const getBarColor = (pct: number): string => {
  if (pct >= 80) return '#ADADFB';
  if (pct >= 60) return '#7DBBFF';
  return '#A0BCE8';
};

export interface StationAccessBreakdownProps {
  data?: Array<{ nombre: string; porcentaje: number }>;
}

export const StationAccessBreakdown: React.FC<StationAccessBreakdownProps> = ({ data }) => {
  const stationList = data || [];

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Accesos por estación
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
        {stationList.length === 0 ? (
          <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            No hay actividad de accesos en estaciones hoy
          </div>
        ) : (
          stationList.map((st) => (
            <div key={st.nombre} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontFamily: 'Inter, sans-serif',
                  minWidth: '108px',
                  flexShrink: 0,
                }}
              >
                {st.nombre}
              </span>

              {/* Progress bar */}
              <div
                style={{
                  flex: 1,
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '80px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${st.porcentaje}%`,
                    height: '100%',
                    backgroundColor: getBarColor(st.porcentaje),
                    borderRadius: '80px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontFamily: 'Inter, sans-serif',
                  minWidth: '30px',
                  textAlign: 'right',
                }}
              >
                {st.porcentaje}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
