import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';
import { ResultadoAcceso } from '../components/atoms/ResultadoBadge/ResultadoBadge';

export interface AccesoRow {
  id: string;
  fechaHora: string;
  persona: string;
  carnet: string;
  estacion: string;
  direccion: string;
  validacion: string;
  resultado: ResultadoAcceso;
  fotoUrl?: string;
}

export interface FiltrosAcceso {
  busqueda?: string;
  estacion?: string;
  resultado?: string;
  fecha?: string;
}

interface ReporteAccesoBackendDto {
  fechaHora: string;
  personaNombre: string;
  codigoEstudiantil: string;
  estacionNombre: string;
  direccion: string;
  modoValidacion: string;
  resultado: string;
  esOffline: boolean;
  fotoEvidenciaUrl?: string;
}

function mapResultado(res: string, esOffline: boolean): ResultadoAcceso {
  if (esOffline) return 'Offline';
  switch (res) {
    case 'Concedido':
    case 'Permitido':
      return 'Concedido';
    case 'Denegado':
    case 'Rechazado':
      return 'Denegado';
    case 'Pendiente':
      return 'Pendiente';
    default:
      return 'Concedido';
  }
}

export interface PresenciaActualRow {
  personaId: string;
  nombreCompleto: string;
  fechaHora: string;
  estacion: string;
}

interface PresenciaBackendDto {
  personaId: string;
  nombreCompleto: string;
  ultimoEvento: string;
  fechaHora: string;
  estacion: string;
}

export interface PrestamoVencidoRow {
  operacionId: string;
  itemNombre: string;
  personaNombre: string;
  fechaCompromiso: string;
  diasVencido: number;
}

interface PrestamoVencidoBackendDto {
  operacionId: string;
  itemNombre: string;
  personaNombre: string;
  fechaCompromiso: string;
  diasVencido: number;
}

export const accesoService = {
  async getAccesos(filtros?: FiltrosAcceso): Promise<AccesoRow[]> {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const params = new URLSearchParams({
      desde: hace30Dias.toISOString(),
      hasta: hoy.toISOString(),
    });

    const response = await apiClient.get<RespuestaEnvuelta<ReporteAccesoBackendDto[]>>(
      `/reportes/accesos?${params.toString()}`
    );

    let resultado: AccesoRow[] = (response.data?.datos || []).map((a, idx) => ({
      id: `acc-${idx}-${new Date(a.fechaHora).getTime()}`,
      fechaHora: new Date(a.fechaHora).toLocaleString('es-NI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      persona: a.personaNombre || 'No identificado',
      carnet: a.codigoEstudiantil || '—',
      estacion: a.estacionNombre || 'Entrada principal',
      direccion: a.direccion === 'Ingreso' || a.direccion === 'Entrada' ? 'Ingreso' : 'Egreso',
      validacion: a.modoValidacion || 'QR + Facial',
      resultado: mapResultado(a.resultado, a.esOffline),
      fotoUrl: a.fotoEvidenciaUrl,
    }));

    if (filtros?.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (r) =>
          r.persona.toLowerCase().includes(q) ||
          r.carnet.toLowerCase().includes(q)
      );
    }
    if (filtros?.estacion) {
      resultado = resultado.filter((r) => r.estacion === filtros.estacion);
    }
    if (filtros?.resultado) {
      resultado = resultado.filter((r) => r.resultado === filtros.resultado);
    }

    return resultado;
  },

  async getPresenciaActual(): Promise<PresenciaActualRow[]> {
    const response = await apiClient.get<RespuestaEnvuelta<PresenciaBackendDto[]>>('/reportes/presencia');
    return (response.data?.datos || []).map((p) => ({
      personaId: p.personaId,
      nombreCompleto: p.nombreCompleto,
      fechaHora: new Date(p.fechaHora).toLocaleString('es-NI', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      }),
      estacion: p.estacion,
    }));
  },

  async getPrestamosVencidos(): Promise<PrestamoVencidoRow[]> {
    const response = await apiClient.get<RespuestaEnvuelta<PrestamoVencidoBackendDto[]>>('/reportes/prestamos-vencidos');
    return (response.data?.datos || []).map((p) => ({
      operacionId: p.operacionId,
      itemNombre: p.itemNombre,
      personaNombre: p.personaNombre,
      fechaCompromiso: new Date(p.fechaCompromiso).toLocaleDateString('es-NI'),
      diasVencido: p.diasVencido,
    }));
  },
};
