import React from 'react';

interface StationMetric {
  name: string;
  percentage: number;
}

const stations: StationMetric[] = [
  { name: 'Entrada principal', percentage: 88 },
  { name: 'Laboratorio A',     percentage: 62 },
  { name: 'Biblioteca',        percentage: 74 },
  { name: 'Taller',            percentage: 46 },
  { name: 'Cafetería',         percentage: 92 },
  { name: 'Salida norte',      percentage: 58 },
];

const getBarColor = (pct: number): string => {
  if (pct >= 80) return '#ADADFB';
  if (pct >= 60) return '#7DBBFF';
  return '#A0BCE8';
};

export const StationAccessBreakdown: React.FC = () => {
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
        {stations.map((st) => (
          <div key={st.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'Inter, sans-serif',
                minWidth: '108px',
                flexShrink: 0,
              }}
            >
              {st.name}
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
                  width: `${st.percentage}%`,
                  height: '100%',
                  backgroundColor: getBarColor(st.percentage),
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
              {st.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
