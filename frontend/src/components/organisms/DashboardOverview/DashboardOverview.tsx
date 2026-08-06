import React from 'react';
import { StatCard } from '../../atoms/StatCard/StatCard';
import { AccessChart } from '../../molecules/ChartMotion/AccessChart';
import { StationAccessBreakdown } from '../../molecules/StationBarItem/StationAccessBreakdown';
import { ItemStatusChart } from '../../molecules/ChartMotion/ItemStatusChart';
import { AccesosResultChart } from '../../molecules/ChartMotion/AccesosResultChart';
import { OperacionesMensualesChart } from '../../molecules/ChartMotion/OperacionesMensualesChart';

export const DashboardOverview: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        padding: '16px 28px 28px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header de Resumen */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}
        >
          Resumen
        </h2>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '0.5px solid rgba(255, 255, 255, 0.12)',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
        >
          <span>Hoy</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Tarjetas Estadísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          width: '100%',
        }}
      >
        <StatCard title="Accesos hoy"  value="7,265" trend="+11.01%" isPositive={true}  bgColor="#E6F1FD" />
        <StatCard title="Operaciones"  value="3,671" trend="-0.03%"  isPositive={false} bgColor="#EDEEFC" />
        <StatCard title="Personas"     value="256"   trend="+15.03%" isPositive={true}  bgColor="#E6F1FD" />
        <StatCard title="Estaciones"   value="2,318" trend="+6.08%"  isPositive={true}  bgColor="#EDEEFC" />
      </div>

      {/* Gráfico Accesos y Desglose por Estación */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '16px',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <AccessChart />
        <StationAccessBreakdown />
      </div>

      {/* Distribución de Ítems y Resultados */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <ItemStatusChart />
        <AccesosResultChart />
      </div>

      {/* Operaciones Mensuales */}
      <OperacionesMensualesChart />
    </div>
  );
};
