import React, { useState, useEffect } from 'react';
import { StatCard } from '../../atoms/StatCard/StatCard';
import { AccessChart } from '../../molecules/ChartMotion/AccessChart';
import { StationAccessBreakdown } from '../../molecules/StationBarItem/StationAccessBreakdown';
import { ItemStatusChart } from '../../molecules/ChartMotion/ItemStatusChart';
import { AccesosResultChart } from '../../molecules/ChartMotion/AccesosResultChart';
import { OperacionesMensualesChart } from '../../molecules/ChartMotion/OperacionesMensualesChart';
import { dashboardService, DashboardMetrics } from '../../../services/dashboardService';

export const DashboardOverview: React.FC = () => {
  const [metricas, setMetricas] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState(false);

  const cargarMetricas = () => {
    let montado = true;
    setError(false);
    dashboardService
      .getMetricas()
      .then((data) => {
        if (montado) setMetricas(data);
      })
      .catch((err) => {
        console.error('No se pudieron cargar las metricas del dashboard', err);
        if (montado) setError(true);
      });
    return () => {
      montado = false;
    };
  };

  useEffect(() => {
    return cargarMetricas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '60px 28px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
          No se pudieron cargar las métricas del dashboard
        </span>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
          Revisa tu conexión o intenta de nuevo en unos segundos.
        </span>
        <button
          onClick={cargarMetricas}
          style={{
            marginTop: '4px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

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
        <StatCard
          title="Accesos hoy"
          value={metricas ? metricas.totalAccesosHoy.toLocaleString() : '—'}
          trend={metricas ? (metricas.totalAccesosHoy > 0 ? '+100%' : '0%') : '—'}
          isPositive={true}
          bgColor="#E6F1FD"
        />
        <StatCard
          title="Operaciones"
          value={metricas ? metricas.totalOperaciones.toLocaleString() : '—'}
          trend={metricas ? (metricas.totalOperaciones > 0 ? '+100%' : '0%') : '—'}
          isPositive={true}
          bgColor="#EDEEFC"
        />
        <StatCard
          title="Personas"
          value={metricas ? metricas.totalPersonas.toLocaleString() : '—'}
          trend={metricas ? (metricas.totalPersonas > 0 ? '+100%' : '0%') : '—'}
          isPositive={true}
          bgColor="#E6F1FD"
        />
        <StatCard
          title="Estaciones"
          value={metricas ? metricas.totalEstaciones.toLocaleString() : '—'}
          trend={metricas ? (metricas.totalEstaciones > 0 ? '+100%' : '0%') : '—'}
          isPositive={true}
          bgColor="#EDEEFC"
        />
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
        <AccessChart
          tendenciaAccesos={metricas?.tendenciaAccesos}
          tendenciaOperaciones={metricas?.tendenciaOperaciones}
          tendenciaEstaciones={metricas?.tendenciaEstaciones}
        />
        <StationAccessBreakdown data={metricas?.accesosPorEstacion} />
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
        <ItemStatusChart data={metricas?.itemsPorEstado} />
        <AccesosResultChart data={metricas?.resultadosAcceso} />
      </div>

      {/* Operaciones Mensuales */}
      <OperacionesMensualesChart data={metricas?.operacionesMensuales} />
    </div>
  );
};
