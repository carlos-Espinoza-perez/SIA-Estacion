import {
  Estacion,
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
  ultimaSincronizacion?: string;
}

export const estacionService = {
  getEstaciones: async (filtros?: FiltrosEstacion): Promise<Estacion[]> => {
    const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto[]>>('/estaciones');
    let lista: Estacion[] = (response.data?.datos || []).map((e) => ({
      id: e.id,
      nombre: e.nombre,
      ubicacion: e.ubicacion,
      tipoRecurso: 'Control de acceso',
      flujo: e.requiereAprobacion ? 'Aprobación' : 'Directo',
      ultimaSincronizacion: e.ultimaSincronizacion
        ? new Date(e.ultimaSincronizacion).toLocaleString()
        : '—',
      estado: e.estado ? 'En línea' : 'Offline',
      encargado: e.encargadoNombre || 'Sin asignar',
      identificadorDispositivo: e.clientId,
      modoOffline: true,
      firmware: e.firmwareVersion || 'v1.0.3',
      accesosHoy: 0,
      operacionesHoy: 0,
      latenciaQrPromedio: '—',
      latenciaFacialPromedio: '—',
      actividadReciente: [],
    }));

    if (filtros) {
      const q = filtros.busqueda?.trim().toLowerCase() || '';
      if (q) {
        lista = lista.filter(
          (e) =>
            e.nombre.toLowerCase().includes(q) ||
            e.ubicacion.toLowerCase().includes(q) ||
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

    return {
      id: e.id,
      nombre: e.nombre,
      ubicacion: e.ubicacion,
      tipoRecurso: 'Control de acceso',
      flujo: e.requiereAprobacion ? 'Aprobación' : 'Directo',
      ultimaSincronizacion: e.ultimaSincronizacion
        ? new Date(e.ultimaSincronizacion).toLocaleString()
        : '—',
      estado: e.estado ? 'En línea' : 'Offline',
      encargado: e.encargadoNombre || 'Sin asignar',
      identificadorDispositivo: e.clientId,
      modoOffline: true,
      firmware: e.firmwareVersion || 'v1.0.3',
      accesosHoy: 0,
      operacionesHoy: 0,
      latenciaQrPromedio: '—',
      latenciaFacialPromedio: '—',
      actividadReciente: [],
    };
  },

  crearEstacion: async (data: CrearEstacionFormData): Promise<Estacion> => {
    const response = await apiClient.post<RespuestaEnvuelta<EstacionBackendDto>>('/estaciones', {
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      requiereIdentificacion: true,
      requiereAprobacion: data.flujo === 'Aprobación',
    });

    const eb = response.data.datos!;
    return {
      id: eb.id,
      nombre: eb.nombre,
      ubicacion: eb.ubicacion,
      tipoRecurso: data.tipoRecurso,
      flujo: eb.requiereAprobacion ? 'Aprobación' : 'Directo',
      ultimaSincronizacion: 'Ahora',
      estado: 'En línea',
      encargado: data.encargado,
      identificadorDispositivo: eb.clientId || data.identificadorDispositivo,
      modoOffline: data.modoOffline,
      firmware: 'v1.0.3',
      accesosHoy: 0,
      operacionesHoy: 0,
      latenciaQrPromedio: '—',
      latenciaFacialPromedio: '—',
      actividadReciente: [],
    };
  },

  actualizarEstacion: async (id: string, data: Partial<Estacion>): Promise<Estacion> => {
    if (data.nombre || data.ubicacion) {
      await apiClient.put(`/estaciones/${id}`, {
        nombre: data.nombre,
        ubicacion: data.ubicacion,
        requiereAprobacion: data.flujo === 'Aprobación',
        estado: data.estado === 'En línea',
      });
    }

    const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}`);
    const e = response.data.datos!;
    return {
      id: e.id,
      nombre: e.nombre,
      ubicacion: e.ubicacion,
      tipoRecurso: 'Control de acceso',
      flujo: e.requiereAprobacion ? 'Aprobación' : 'Directo',
      ultimaSincronizacion: e.ultimaSincronizacion
        ? new Date(e.ultimaSincronizacion).toLocaleString()
        : '—',
      estado: e.estado ? 'En línea' : 'Offline',
      encargado: e.encargadoNombre || 'Sin asignar',
      identificadorDispositivo: e.clientId,
      modoOffline: true,
      firmware: e.firmwareVersion || 'v1.0.3',
      accesosHoy: 0,
      operacionesHoy: 0,
      latenciaQrPromedio: '—',
      latenciaFacialPromedio: '—',
      actividadReciente: [],
    };
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
    
    return {
      id: e.id,
      nombre: e.nombre,
      ubicacion: e.ubicacion,
      tipoRecurso: 'Control de acceso',
      flujo: e.requiereAprobacion ? 'Aprobación' : 'Directo',
      ultimaSincronizacion: e.ultimaSincronizacion
        ? new Date(e.ultimaSincronizacion).toLocaleString()
        : '—',
      estado: e.estado ? 'En línea' : 'Offline',
      encargado: e.encargadoNombre || 'Sin asignar',
      identificadorDispositivo: e.clientId,
      modoOffline: true,
      firmware: e.firmwareVersion || 'v1.0.3',
      accesosHoy: 0,
      operacionesHoy: 0,
      latenciaQrPromedio: '—',
      latenciaFacialPromedio: '—',
      actividadReciente: [],
    };
  },

  eliminarEstacion: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/estaciones/${id}`);
    return true;
  },
};
