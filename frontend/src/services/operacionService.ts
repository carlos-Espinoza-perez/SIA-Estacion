import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

export type EstadoOperacion =
  | 'Pendiente'
  | 'Aprobada'
  | 'Entregada'
  | 'Devuelta'
  | 'Cancelada'
  | 'Offline';

export type FlujoOperacion = 'Aprobación' | 'Directo';

export interface OperacionRow {
  id: string;
  folio: string;
  fechaHora: string;
  solicitante: string;
  carnet?: string;
  item: string;
  itemId?: string;
  estacion: string;
  estacionId?: string;
  flujo: FlujoOperacion;
  estado: EstadoOperacion;
  observaciones?: string;
}

export interface FiltrosOperacion {
  busqueda?: string;
  estacion?: string;
  estado?: string;
  fecha?: string;
}

export interface CrearOperacionDto {
  itemEscaneadoId: string;
  personaId: string;
  estacionId: string;
  observaciones?: string;
  fechaCompromisoDevolucion?: string;
}

export interface DevolucionDetalleDto {
  detalleId: string;
  condicionDevolucion: 'Bueno' | 'Danado' | 'NoDevuelto';
  observacion?: string;
}

interface OperacionBackendDto {
  id: string;
  folio: string;
  itemEscaneadoId: string;
  itemNombre: string;
  personaId: string;
  personaNombre: string;
  codigoEstudiantil: string;
  estacionId?: string;
  estacionNombre: string;
  tipoOperacion: string;
  estadoActual: string;
  flujo: string;
  observaciones?: string;
  fechaSolicitud: string;
  fechaCompromisoDevolucion?: string;
  fechaDevolucion?: string;
}

function mapEstado(backendEstado: string): EstadoOperacion {
  switch (backendEstado) {
    case 'Solicitado':
    case 'Pendiente':
      return 'Pendiente';
    case 'Aprobado':
    case 'Aprobada':
      return 'Aprobada';
    case 'Entregado':
    case 'Entregada':
      return 'Entregada';
    case 'Devuelto':
    case 'DevueltoParcial':
    case 'Devuelta':
      return 'Devuelta';
    case 'Rechazado':
    case 'Cancelado':
    case 'Cancelada':
      return 'Cancelada';
    default:
      return 'Pendiente';
  }
}

export const operacionService = {
  async getOperaciones(filtros?: FiltrosOperacion): Promise<OperacionRow[]> {
    const params = new URLSearchParams();
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.estado) params.append('estado', filtros.estado);

    const response = await apiClient.get<RespuestaEnvuelta<OperacionBackendDto[]>>(
      `/operaciones?${params.toString()}`
    );

    let resultado: OperacionRow[] = (response.data?.datos || []).map((o) => ({
      id: o.id,
      folio: o.folio,
      fechaHora: new Date(o.fechaSolicitud).toLocaleString('es-NI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      solicitante: o.personaNombre || 'Sin nombre',
      carnet: o.codigoEstudiantil,
      item: o.itemNombre,
      itemId: o.itemEscaneadoId,
      estacion: o.estacionNombre || 'General',
      estacionId: o.estacionId,
      flujo: (o.flujo === 'Aprobación' ? 'Aprobación' : 'Directo') as FlujoOperacion,
      estado: mapEstado(o.estadoActual),
      observaciones: o.observaciones,
    }));

    if (filtros?.estacion) {
      resultado = resultado.filter((r) => r.estacion === filtros.estacion);
    }
    if (filtros?.estado) {
      resultado = resultado.filter((r) => r.estado === filtros.estado);
    }

    return resultado;
  },

  async crearOperacion(dto: CrearOperacionDto): Promise<OperacionRow> {
    const response = await apiClient.post<RespuestaEnvuelta<OperacionBackendDto>>(
      '/operaciones',
      dto
    );
    const o = response.data.datos!;
    return {
      id: o.id,
      folio: o.folio,
      fechaHora: new Date(o.fechaSolicitud).toLocaleString(),
      solicitante: o.personaNombre,
      carnet: o.codigoEstudiantil,
      item: o.itemNombre,
      itemId: o.itemEscaneadoId,
      estacion: o.estacionNombre,
      estacionId: o.estacionId,
      flujo: (o.flujo === 'Aprobación' ? 'Aprobación' : 'Directo') as FlujoOperacion,
      estado: mapEstado(o.estadoActual),
      observaciones: o.observaciones,
    };
  },

  async aprobarOperacion(id: string, observacion?: string): Promise<boolean> {
    await apiClient.post(`/operaciones/${id}/aprobar`, { observacion });
    return true;
  },

  async rechazarOperacion(id: string, observacion?: string): Promise<boolean> {
    await apiClient.post(`/operaciones/${id}/rechazar`, { observacion });
    return true;
  },

  async entregarOperacion(id: string, observacion?: string): Promise<boolean> {
    await apiClient.post(`/operaciones/${id}/entregar`, { observacion });
    return true;
  },

  async devolverOperacion(
    id: string,
    detalles: DevolucionDetalleDto[]
  ): Promise<boolean> {
    await apiClient.post(`/operaciones/${id}/devolver`, { detalles });
    return true;
  },
};
