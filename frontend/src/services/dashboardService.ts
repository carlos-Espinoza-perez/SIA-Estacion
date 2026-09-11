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

export const dashboardService = {
  // Deja que el error se propague: la pantalla debe mostrar un estado de error
  // explicito en vez de metricas en cero que parecen datos reales.
  async getMetricas(): Promise<DashboardMetrics> {
    const response = await apiClient.get<RespuestaEnvuelta<DashboardMetrics>>('/reportes/dashboard');
    if (!response.data || !response.data.datos) {
      throw new Error('La API no devolvio datos de metricas.');
    }
    return response.data.datos;
  },
};
