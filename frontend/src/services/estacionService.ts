import {
  Estacion,
  EstadoEstacion,
  CrearEstacionFormData,
  FiltrosEstacion,
} from '../types/estacion';

import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

interface EstacionBackendDto {
  id: string;
  nombre: string;
  ubicacion: string;
  encargadoId?: string;
  encargadoNombre?: string;
  firmwareVersion?: string;
  direccionIp?: string;
  clientId: string;
  requiereIdentificacion: boolean;
  requiereAprobacion: boolean;
  estado: boolean;
  estaVinculada?: boolean;
  macAddress?: string;
  codigoVinculacion?: string;
  fechaVinculacion?: string;
  ultimaSincronizacion?: string;
  isOnline?: boolean;
}

const HEARTBEAT_TIMEOUT_SECONDS = 90; // Tolerancia de 3 latidos (30s cada uno)

export function mapBackendDtoToEstacion(e: EstacionBackendDto): Estacion {
  let estadoCalculado: EstadoEstacion = 'Offline';

  if (!e.estado) {
    estadoCalculado = 'Mantenimiento';
  } else if (!e.estaVinculada) {
    estadoCalculado = 'Offline';
  } else if (e.isOnline !== undefined) {
    estadoCalculado = e.isOnline ? 'En línea' : 'Offline';
  } else if (e.ultimaSincronizacion) {
    const syncTime = new Date(e.ultimaSincronizacion).getTime();
    if (!isNaN(syncTime)) {
      const diffSegundos = (Date.now() - syncTime) / 1000;
      estadoCalculado = diffSegundos <= HEARTBEAT_TIMEOUT_SECONDS ? 'En línea' : 'Offline';
    }
  }

  return {
    id: e.id,
    nombre: e.nombre,
    ubicacion: e.ubicacion,
    tipoRecurso: 'Control de acceso',
    flujo: e.requiereAprobacion ? 'Aprobación' : 'Directo',
    ultimaSincronizacion: e.ultimaSincronizacion
      ? new Date(e.ultimaSincronizacion).toLocaleString()
      : '—',
    estado: estadoCalculado,
    encargadoId: e.encargadoId,
    encargado: e.encargadoNombre || 'Sin asignar',
    estaVinculada: e.estaVinculada ?? false,
    macAddress: e.macAddress,
    codigoVinculacion: e.codigoVinculacion,
    fechaVinculacion: e.fechaVinculacion ? new Date(e.fechaVinculacion).toLocaleString() : undefined,
    identificadorDispositivo: e.clientId,
    modoOffline: true,
    firmware: e.firmwareVersion || 'v1.0.3',
    accesosHoy: 0,
    operacionesHoy: 0,
    latenciaQrPromedio: '—',
    latenciaFacialPromedio: '—',
    actividadReciente: [],
  };
}

export const estacionService = {
  getEstaciones: async (filtros?: FiltrosEstacion): Promise<Estacion[]> => {
    const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto[]>>('/estaciones');
    let lista: Estacion[] = (response.data?.datos || []).map(mapBackendDtoToEstacion);

    if (filtros) {
      const q = filtros.busqueda?.trim().toLowerCase() || '';
      if (q) {
        lista = lista.filter(
          (e) =>
            e.nombre.toLowerCase().includes(q) ||
            e.ubicacion.toLowerCase().includes(q) ||
            (e.macAddress && e.macAddress.toLowerCase().includes(q)) ||
            (e.identificadorDispositivo &&
              e.identificadorDispositivo.toLowerCase().includes(q))
        );
      }
      if (filtros.tipoRecurso) {
        lista = lista.filter((e) => e.tipoRecurso === filtros.tipoRecurso);
      }
      if (filtros.estado) {
        lista = lista.filter((e) => e.estado === filtros.estado);
      }
    }
    return lista;
  },

  getEstacionById: async (id: string): Promise<Estacion | undefined> => {
    const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}`);
    const e = response.data?.datos;
    if (!e) return undefined;
    return mapBackendDtoToEstacion(e);
  },

  crearEstacion: async (data: CrearEstacionFormData): Promise<Estacion> => {
    const response = await apiClient.post<RespuestaEnvuelta<EstacionBackendDto>>('/estaciones', {
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      encargadoId: data.encargadoId || null,
      requiereIdentificacion: true,
      requiereAprobacion: data.flujo === 'Aprobación',
    });

    const eb = response.data.datos!;
    return mapBackendDtoToEstacion(eb);
  },

  actualizarEstacion: async (id: string, data: Partial<Estacion>): Promise<Estacion> => {
    await apiClient.put(`/estaciones/${id}`, {
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      encargadoId: data.encargadoId || null,
      requiereAprobacion: data.flujo === 'Aprobación',
    });

    const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}`);
    const e = response.data.datos!;
    return mapBackendDtoToEstacion(e);
  },

  vincularEstacion: async (id: string, codigoVinculacionOMac: string): Promise<Estacion> => {
    let cleanCode = codigoVinculacionOMac.trim();
    if (cleanCode.toLowerCase().includes('mac=')) {
      const match = cleanCode.match(/mac=([a-fA-F0-9:]{12,17})/i);
      if (match && match[1]) {
        cleanCode = match[1];
      }
    }
    if (!cleanCode.toUpperCase().startsWith('PAIR-')) {
      cleanCode = cleanCode.replace(/[:\-\s]/g, '').toUpperCase();
    }

    const response = await apiClient.post<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}/vincular`, {
      codigoVinculacionOMac: cleanCode,
    });
    const e = response.data.datos!;
    return mapBackendDtoToEstacion(e);
  },

  desvincularEstacion: async (id: string): Promise<boolean> => {
    await apiClient.post(`/estaciones/${id}/desvincular`);
    return true;
  },

  toggleEstadoEstacion: async (id: string): Promise<Estacion> => {
    const responseGet = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}`);
    const actual = responseGet.data.datos!;
    const nuevoEstado = !actual.estado;

    await apiClient.put(`/estaciones/${id}`, {
      nombre: actual.nombre,
      ubicacion: actual.ubicacion,
      estado: nuevoEstado,
    });

    const responseNuevo = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}`);
    const e = responseNuevo.data.datos!;
    return mapBackendDtoToEstacion(e);
  },

  eliminarEstacion: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/estaciones/${id}`);
    return true;
  },
};
