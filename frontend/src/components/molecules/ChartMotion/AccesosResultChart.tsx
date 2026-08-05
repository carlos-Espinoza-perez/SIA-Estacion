import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const donutData = [
  { name: 'Concedido', value: 52.1, color: '#ADADFB' },
  { name: 'Denegado',  value: 22.8, color: '#7DBBFF' },
  { name: 'Offline',   value: 13.9, color: '#A0BCE8' },
  { name: 'Otro',      value: 11.2, color: '#6BE6D3' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div
        style={{
          backgroundColor: 'rgba(28, 28, 28, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '8px 12px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>
          {d.name}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
          {d.value}%
        </div>
      </div>
    );
  }
  return null;
};

export const AccesosResultChart: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: 1,
        minHeight: '280px',
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
        Resultado de acceso
      </span>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '28px',
          flex: 1,
          padding: '0 8px',
        }}
      >
        {/* Donut Chart */}
        <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
          }}
        >
          {donutData.map((entry) => (
            <div
              key={entry.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {entry.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
