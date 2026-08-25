import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

export interface MonthlyPoint {
  month: string;
  currentYear: number;
  previousYear: number;
}

export interface DashboardMetrics {
  totalAccesosHoy: number;
  totalOperaciones: number;
  totalPersonas: number;
  totalEstaciones: number;
  itemsPorEstado: Array<{ label: string; count: number; color: string }>;
  accesosPorEstacion: Array<{ nombre: string; porcentaje: number }>;
  resultadosAcceso: {
    concedido: number;
    denegado: number;
    offline: number;
    otro: number;
  };
  tendenciaAccesos: MonthlyPoint[];
  tendenciaOperaciones: MonthlyPoint[];
  tendenciaEstaciones: MonthlyPoint[];
  operacionesMensuales: Array<{ month: string; value: number; color: string }>;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const FALLBACK_METRICS: DashboardMetrics = {
  totalAccesosHoy: 0,
  totalOperaciones: 0,
  totalPersonas: 0,
  totalEstaciones: 0,
  itemsPorEstado: [
    { label: 'Disponible', count: 0, color: '#A0BCE8' },
    { label: 'Prestado', count: 0, color: '#6BE6D3' },
    { label: 'Mant.', count: 0, color: '#ADADFB' },
    { label: 'Perdido', count: 0, color: '#7DBBFF' },
    { label: 'Baja', count: 0, color: '#B899EB' },
  ],
  accesosPorEstacion: [],
  resultadosAcceso: {
    concedido: 0,
    denegado: 0,
    offline: 0,
    otro: 0,
  },
  tendenciaAccesos: MESES.map((m) => ({ month: m, currentYear: 0, previousYear: 0 })),
  tendenciaOperaciones: MESES.map((m) => ({ month: m, currentYear: 0, previousYear: 0 })),
  tendenciaEstaciones: MESES.map((m) => ({ month: m, currentYear: 0, previousYear: 0 })),
  operacionesMensuales: MESES.map((m) => ({ month: m, value: 0, color: '#A0BCE8' })),
};

export const dashboardService = {
  async getMetricas(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<DashboardMetrics>>('/reportes/dashboard');
      if (response.data && response.data.datos) {
        return response.data.datos;
      }
    } catch {
      // Return empty stats if API is down
    }
    return FALLBACK_METRICS;
  },
};
