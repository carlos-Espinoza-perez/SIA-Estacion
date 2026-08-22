import { personaService } from './personaService';
import { estacionService } from './estacionService';
import { itemService } from './itemService';
import { operacionService } from './operacionService';
import { accesoService } from './accesoService';

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

export const dashboardService = {
  async getMetricas(): Promise<DashboardMetrics> {
    try {
      const [personas, estaciones, items, operaciones, accesos] = await Promise.all([
        personaService.getPersonas(),
        estacionService.getEstaciones(),
        itemService.getItems(),
        operacionService.getOperaciones(),
        accesoService.getAccesos(),
      ]);

      // 1. Contadores principales
      const totalPersonas = personas.length;
      const totalEstaciones = estaciones.length;
      const totalOperaciones = operaciones.length;
      const totalAccesosHoy = accesos.length;

      // 2. Conteo de ítems por estado
      const estadoMap: Record<string, number> = {
        Disponible: 0,
        Prestado: 0,
        Mantenimiento: 0,
        Perdido: 0,
        Baja: 0,
      };

      items.forEach((item) => {
        const est = item.estado || 'Disponible';
        if (estadoMap[est] !== undefined) {
          estadoMap[est]++;
        } else {
          estadoMap[est] = (estadoMap[est] || 0) + 1;
        }
      });

      const itemsPorEstado = [
        { label: 'Disponible', count: estadoMap['Disponible'], color: '#A0BCE8' },
        { label: 'Prestado',   count: estadoMap['Prestado'], color: '#6BE6D3' },
        { label: 'Mant.',      count: estadoMap['Mantenimiento'], color: '#ADADFB' },
        { label: 'Perdido',    count: estadoMap['Perdido'], color: '#7DBBFF' },
        { label: 'Baja',       count: estadoMap['Baja'], color: '#B899EB' },
      ];

      // 3. Accesos por estación
      const accesosPorEstacionMap: Record<string, number> = {};
      accesos.forEach((acc) => {
        const est = acc.estacion || 'General';
        accesosPorEstacionMap[est] = (accesosPorEstacionMap[est] || 0) + 1;
      });

      const totalAcc = accesos.length;
      const accesosPorEstacion = estaciones.slice(0, 6).map((e) => {
        const cant = accesosPorEstacionMap[e.nombre] || (e.accesosHoy ?? 0);
        const porcentaje = totalAcc > 0 ? Math.round((cant / totalAcc) * 100) : 0;
        return {
          nombre: e.nombre,
          porcentaje,
        };
      });

      // 4. Resultados de accesos
      let concedido = 0;
      let denegado = 0;
      let offline = 0;
      let otro = 0;

      accesos.forEach((a) => {
        if (a.resultado === 'Concedido') concedido++;
        else if (a.resultado === 'Denegado') denegado++;
        else if (a.resultado === 'Offline') offline++;
        else otro++;
      });

      const totalResultados = accesos.length;
      const pctConcedido = totalResultados > 0 ? Math.round((concedido / totalResultados) * 100) : 0;
      const pctDenegado = totalResultados > 0 ? Math.round((denegado / totalResultados) * 100) : 0;
      const pctOffline = totalResultados > 0 ? Math.round((offline / totalResultados) * 100) : 0;
      const pctOtro = totalResultados > 0 ? Math.round((otro / totalResultados) * 100) : 0;

      // 5. Tendencia mensual
      const currentMonthIdx = new Date().getMonth();
      const tendenciaAccesos: MonthlyPoint[] = MESES.map((m, idx) => ({
        month: m,
        currentYear: idx === currentMonthIdx ? totalAccesosHoy : 0,
        previousYear: 0,
      }));

      const tendenciaOperaciones: MonthlyPoint[] = MESES.map((m, idx) => ({
        month: m,
        currentYear: idx === currentMonthIdx ? totalOperaciones : 0,
        previousYear: 0,
      }));

      const tendenciaEstaciones: MonthlyPoint[] = MESES.map((m, idx) => ({
        month: m,
        currentYear: idx === currentMonthIdx ? totalEstaciones : 0,
        previousYear: 0,
      }));

      const paletaColores = ['#A0BCE8', '#7DBBFF', '#ADADFB', '#6BE6D3'];
      const operacionesMensuales = MESES.map((m, idx) => ({
        month: m,
        value: idx === currentMonthIdx ? totalOperaciones : 0,
        color: paletaColores[idx % paletaColores.length],
      }));

      return {
        totalAccesosHoy,
        totalOperaciones,
        totalPersonas,
        totalEstaciones,
        itemsPorEstado,
        accesosPorEstacion,
        resultadosAcceso: {
          concedido: pctConcedido,
          denegado: pctDenegado,
          offline: pctOffline,
          otro: pctOtro,
        },
        tendenciaAccesos,
        tendenciaOperaciones,
        tendenciaEstaciones,
        operacionesMensuales,
      };
    } catch {
      return {
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
    }
  },
};
