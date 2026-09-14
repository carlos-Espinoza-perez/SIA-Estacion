import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

export interface MonthlyPoint {
  month: string;
  currentYear: number;
  previousYear: number;
}

export type PeriodoDashboard = 'hoy' | 'semana' | 'mes';

export interface DashboardMetrics {
  totalAccesosHoy: number;
  totalOperaciones: number;
  totalPersonas: number;
  totalEstaciones: number;
  periodo: PeriodoDashboard;
  tendenciaAccesosPorcentaje: number | null;
  tendenciaOperacionesPorcentaje: number | null;
  tendenciaPersonasPorcentaje: number | null;
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

export const dashboardService = {
  async getMetricas(periodo: PeriodoDashboard = 'hoy'): Promise<DashboardMetrics> {
    const response = await apiClient.get<RespuestaEnvuelta<DashboardMetrics>>(`/reportes/dashboard?periodo=${periodo}`);
    if (!response.data || !response.data.datos) {
      throw new Error('La API no devolvio datos de metricas.');
    }
    return response.data.datos;
  },
};
