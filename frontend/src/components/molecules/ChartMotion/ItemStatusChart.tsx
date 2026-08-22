import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const emptyStatusData = [
  { label: 'Disponible', count: 0, color: '#A0BCE8' },
  { label: 'Prestado',   count: 0, color: '#6BE6D3' },
  { label: 'Mant.',      count: 0, color: '#ADADFB' },
  { label: 'Perdido',    count: 0, color: '#7DBBFF' },
  { label: 'Baja',       count: 0, color: '#B899EB' },
];

export interface ItemStatusChartProps {
  data?: Array<{ label: string; count: number; color: string }>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string; color: string } }>;
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
          {d.payload.label}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
          {d.value} ítems
        </div>
      </div>
    );
  }
  return null;
};

export const ItemStatusChart: React.FC<ItemStatusChartProps> = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const chartData = data && data.length > 0 ? data : emptyStatusData;
  const maxCount = Math.max(...chartData.map((d) => d.count), 5);
  const topDomain = Math.ceil(maxCount * 1.25);

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
        Ítems por estado
      </span>

      <div style={{ width: '100%', height: '170px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 4, left: -28, bottom: 0 }}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
              domain={[0, topDomain]}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              maxBarSize={32}
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIdx === null || activeIdx === index ? 1 : 0.45}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
