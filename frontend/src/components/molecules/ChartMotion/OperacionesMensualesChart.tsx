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

const monthlyData = [
  { month: 'Ene', value: 42, color: '#A0BCE8' },
  { month: 'Feb', value: 58, color: '#7DBBFF' },
  { month: 'Mar', value: 71, color: '#ADADFB' },
  { month: 'Abr', value: 85, color: '#ADADFB' },
  { month: 'May', value: 63, color: '#7DBBFF' },
  { month: 'Jun', value: 92, color: '#ADADFB' },
  { month: 'Jul', value: 78, color: '#7DBBFF' },
  { month: 'Ago', value: 95, color: '#6BE6D3' },
  { month: 'Sep', value: 69, color: '#A0BCE8' },
  { month: 'Oct', value: 88, color: '#ADADFB' },
  { month: 'Nov', value: 74, color: '#7DBBFF' },
  { month: 'Dic', value: 101, color: '#6BE6D3' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { month: string } }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
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
          {payload[0].payload.month}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
          {payload[0].value} ops.
        </div>
      </div>
    );
  }
  return null;
};

export const OperacionesMensualesChart: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '280px',
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
        Operaciones mensuales
      </span>

      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              domain={[0, 120]}
              ticks={[0, 30, 60, 90, 120]}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              maxBarSize={44}
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
            >
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIdx === null || activeIdx === index ? 1 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
