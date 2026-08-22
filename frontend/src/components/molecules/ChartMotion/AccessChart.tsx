import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DataPoint {
  month: string;
  currentYear: number;
  previousYear: number;
}

const emptyTrend: DataPoint[] = [
  { month: 'Ene', currentYear: 0, previousYear: 0 },
  { month: 'Feb', currentYear: 0, previousYear: 0 },
  { month: 'Mar', currentYear: 0, previousYear: 0 },
  { month: 'Abr', currentYear: 0, previousYear: 0 },
  { month: 'May', currentYear: 0, previousYear: 0 },
  { month: 'Jun', currentYear: 0, previousYear: 0 },
  { month: 'Jul', currentYear: 0, previousYear: 0 },
  { month: 'Ago', currentYear: 0, previousYear: 0 },
  { month: 'Sep', currentYear: 0, previousYear: 0 },
  { month: 'Oct', currentYear: 0, previousYear: 0 },
  { month: 'Nov', currentYear: 0, previousYear: 0 },
  { month: 'Dic', currentYear: 0, previousYear: 0 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(28, 28, 28, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: '3px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                }}
              />
              <span>{entry.name}:</span>
            </div>
            <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export interface AccessChartProps {
  tendenciaAccesos?: DataPoint[];
  tendenciaOperaciones?: DataPoint[];
  tendenciaEstaciones?: DataPoint[];
}

export const AccessChart: React.FC<AccessChartProps> = ({
  tendenciaAccesos,
  tendenciaOperaciones,
  tendenciaEstaciones,
}) => {
  const [activeTab, setActiveTab] = useState<'Accesos' | 'Operaciones' | 'Estaciones'>('Accesos');

  const getData = () => {
    switch (activeTab) {
      case 'Operaciones':
        return tendenciaOperaciones && tendenciaOperaciones.length > 0 ? tendenciaOperaciones : emptyTrend;
      case 'Estaciones':
        return tendenciaEstaciones && tendenciaEstaciones.length > 0 ? tendenciaEstaciones : emptyTrend;
      default:
        return tendenciaAccesos && tendenciaAccesos.length > 0 ? tendenciaAccesos : emptyTrend;
    }
  };

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
        minHeight: '330px',
      }}
    >
      {/* Header del Gráfico con Tabs y Leyendas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Tabs Principales */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {(['Accesos', 'Operaciones', 'Estaciones'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  padding: '2px 0',
                  position: 'relative',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'color 0.15s ease',
                }}
              >
                {tab}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#ADADFB',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </button>
            );
          })}

          <span style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '14px' }}>|</span>

          {/* Tags de Leyenda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ADADFB' }} />
              <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                Este año
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7DBBFF' }} />
              <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                Año anterior
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div style={{ width: '100%', height: '220px', marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrentYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ADADFB" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ADADFB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPrevYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7DBBFF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7DBBFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.06)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              tickFormatter={(v) => `${v}`}
              domain={[0, 'auto']}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="previousYear"
              name="Año anterior"
              stroke="#7DBBFF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrevYear)"
              dot={false}
              activeDot={{ r: 4, fill: '#7DBBFF', stroke: '#FFFFFF', strokeWidth: 1.5 }}
            />
            <Area
              type="monotone"
              dataKey="currentYear"
              name="Este año"
              stroke="#ADADFB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCurrentYear)"
              dot={false}
              activeDot={{ r: 5, fill: '#ADADFB', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
