import {
  Estacion,
  CrearEstacionFormData,
  FiltrosEstacion,
} from '../types/estacion';

export const MOCK_ESTACIONES: Estacion[] = [
  {
    id: 'est-1',
    nombre: 'Entrada principal',
    ubicacion: 'Portón norte',
    tipoRecurso: 'Control de acceso',
    flujo: '—',
    ultimaSincronizacion: '28/07/2026 09:58',
    estado: 'En línea',
    encargado: 'Martha Sánchez',
    identificadorDispositivo: 'EST-ACC-N-01',
    modoOffline: true,
    firmware: 'v1.0.3',
    accesosHoy: 312,
    operacionesHoy: 0,
    latenciaQrPromedio: '0.8 s',
    latenciaFacialPromedio: '2.1 s',
    actividadReciente: [
      {
        id: 'act-1',
        fechaHora: '28/07/2026 09:58',
        persona: 'Ana Morales',
        operacion: 'Acceso de ingreso',
        validacion: 'QR + Facial',
        resultado: 'Concedido',
      },
      {
        id: 'act-2',
        fechaHora: '28/07/2026 09:50',
        persona: 'Luis Herrera',
        operacion: 'Acceso de ingreso',
        validacion: 'QR + Facial',
        resultado: 'Concedido',
      },
    ],
  },
  {
    id: 'est-2',
    nombre: 'Salida norte',
    ubicacion: 'Portón norte',
    tipoRecurso: 'Control de acceso',
    flujo: '—',
    ultimaSincronizacion: '28/07/2026 09:57',
    estado: 'En línea',
    encargado: 'Martha Sánchez',
    identificadorDispositivo: 'EST-ACC-N-02',
    modoOffline: true,
    firmware: 'v1.0.3',
    accesosHoy: 280,
    operacionesHoy: 0,
    latenciaQrPromedio: '0.9 s',
    latenciaFacialPromedio: '2.3 s',
    actividadReciente: [],
  },
  {
    id: 'est-3',
    nombre: 'Laboratorio A',
    ubicacion: 'Pabellón B, 2º piso',
    tipoRecurso: 'Componentes electrónicos',
    flujo: 'Aprobación',
    ultimaSincronizacion: '28/07/2026 09:56',
    estado: 'En línea',
    encargado: 'Weslin Rodríguez',
    identificadorDispositivo: 'EST-LAB-A-01',
    modoOffline: true,
    firmware: 'v1.0.3',
    accesosHoy: 148,
    operacionesHoy: 12,
    latenciaQrPromedio: '1.2 s',
    latenciaFacialPromedio: '3.4 s',
    actividadReciente: [
      {
        id: 'act-101',
        fechaHora: '28/07/2026 09:56',
        persona: 'Ana Morales',
        operacion: 'Préstamo: Multímetro UNI-T',
        validacion: 'QR + Facial',
        resultado: 'Pendiente',
      },
      {
        id: 'act-102',
        fechaHora: '28/07/2026 09:41',
        persona: 'Luis Herrera',
        operacion: 'Acceso de ingreso',
        validacion: 'QR + Facial',
        resultado: 'Concedido',
      },
      {
        id: 'act-103',
        fechaHora: '28/07/2026 09:20',
        persona: 'María López',
        operacion: 'Devolución: Protoboard 830',
        validacion: 'QR',
        resultado: 'Entregada',
      },
      {
        id: 'act-104',
        fechaHora: '28/07/2026 08:58',
        persona: 'Carlos Ruiz',
        operacion: 'Acceso de ingreso',
        validacion: 'QR',
        resultado: 'Denegado',
      },
    ],
  },
  {
    id: 'est-4',
    nombre: 'Laboratorio B',
    ubicacion: 'Pabellón B, 2º piso',
    tipoRecurso: 'Componentes electrónicos',
    flujo: 'Aprobación',
    ultimaSincronizacion: '27/07/2026 18:20',
    estado: 'Offline',
    encargado: 'Weslin Rodríguez',
    identificadorDispositivo: 'EST-LAB-B-01',
    modoOffline: true,
    firmware: 'v1.0.2',
    accesosHoy: 0,
    operacionesHoy: 0,
    latenciaQrPromedio: '—',
    latenciaFacialPromedio: '—',
    actividadReciente: [],
  },
  {
    id: 'est-5',
    nombre: 'Taller',
    ubicacion: 'Pabellón C, planta baja',
    tipoRecurso: 'Equipo de laboratorio',
    flujo: 'Aprobación',
    ultimaSincronizacion: '28/07/2026 09:55',
    estado: 'En línea',
    encargado: 'Josué Argeñal',
    identificadorDispositivo: 'EST-TAL-01',
    modoOffline: false,
    firmware: 'v1.0.3',
    accesosHoy: 89,
    operacionesHoy: 8,
    latenciaQrPromedio: '1.1 s',
    latenciaFacialPromedio: '2.8 s',
    actividadReciente: [],
  },
  {
    id: 'est-6',
    nombre: 'Biblioteca',
    ubicacion: 'Edificio central',
    tipoRecurso: 'Material bibliográfico',
    flujo: 'Directo',
    ultimaSincronizacion: '28/07/2026 09:58',
    estado: 'En línea',
    encargado: 'Heberto Espinoza',
    identificadorDispositivo: 'EST-BIB-01',
    modoOffline: true,
    firmware: 'v1.0.3',
    accesosHoy: 215,
    operacionesHoy: 26,
    latenciaQrPromedio: '0.9 s',
    latenciaFacialPromedio: '2.2 s',
    actividadReciente: [],
  },
  {
    id: 'est-7',
    nombre: 'Cafetería',
    ubicacion: 'Edificio central',
    tipoRecurso: 'Control de acceso',
    flujo: '—',
    ultimaSincronizacion: '28/07/2026 08:12',
    estado: 'Offline',
    encargado: 'Martha Sánchez',
    identificadorDispositivo: 'EST-CAF-01',
    modoOffline: false,
    firmware: 'v1.0.1',
    accesosHoy: 45,
    operacionesHoy: 0,
    latenciaQrPromedio: '—',
    latenciaFacialPromedio: '—',
    actividadReciente: [],
  },
  {
    id: 'est-8',
    nombre: 'Auditorio',
    ubicacion: 'Edificio central',
    tipoRecurso: 'Control de acceso',
    flujo: '—',
    ultimaSincronizacion: '26/07/2026 17:40',
    estado: 'Mantenimiento',
    encargado: 'Josué Argeñal',
    identificadorDispositivo: 'EST-AUD-01',
    modoOffline: false,
    firmware: 'v1.0.0',
    accesosHoy: 0,
    operacionesHoy: 0,
    latenciaQrPromedio: '—',
    latenciaFacialPromedio: '—',
    actividadReciente: [],
  },
];

import { auditoriaService } from './auditoriaService';
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
    try {
      const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto[]>>('/estaciones');
      if (response.data && Array.isArray(response.data.datos)) {
        let lista: Estacion[] = response.data.datos.map((e) => ({
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
      }
    } catch {
      // Fallback solo ante error de red
    }

    let lista = [...MOCK_ESTACIONES];

    if (filtros) {
      const q = filtros.busqueda.trim().toLowerCase();
      if (q) {
        lista = lista.filter(
          (e) =>
            e.nombre.toLowerCase().includes(q) ||
            e.ubicacion.toLowerCase().includes(q) ||
            (e.identificadorDispositivo && e.identificadorDispositivo.toLowerCase().includes(q))
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
    try {
      const response = await apiClient.get<RespuestaEnvuelta<EstacionBackendDto>>(`/estaciones/${id}`);
      if (response.data.datos) {
        const e = response.data.datos;
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
      }
    } catch {
      // Fallback
    }

    return MOCK_ESTACIONES.find((e) => e.id === id);
  },

  crearEstacion: async (data: CrearEstacionFormData): Promise<Estacion> => {
    try {
      const response = await apiClient.post<RespuestaEnvuelta<EstacionBackendDto>>('/estaciones', {
        nombre: data.nombre,
        ubicacion: data.ubicacion,
        requiereIdentificacion: true,
        requiereAprobacion: data.flujo === 'Aprobación',
      });

      if (response.data.datos) {
        const eb = response.data.datos;
        const nueva: Estacion = {
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
        MOCK_ESTACIONES.unshift(nueva);
        return nueva;
      }
    } catch {
      // Fallback
    }

    const nueva: Estacion = {
      id: `est-${Date.now()}`,
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      tipoRecurso: data.tipoRecurso,
      flujo: data.flujo,
      ultimaSincronizacion: 'Ahora',
      estado: 'En línea',
      encargado: data.encargado,
      identificadorDispositivo: data.identificadorDispositivo,
      modoOffline: data.modoOffline,
      firmware: 'v1.0.3',
      accesosHoy: 0,
      operacionesHoy: 0,
      latenciaQrPromedio: '—',
      latenciaFacialPromedio: '—',
      actividadReciente: [],
    };
    MOCK_ESTACIONES.unshift(nueva);

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Creación de estación ${nueva.nombre} (${nueva.identificadorDispositivo})`,
      estacion: nueva.nombre,
      origen: 'Panel',
    });

    return nueva;
  },

  actualizarEstacion: async (id: string, data: Partial<Estacion>): Promise<Estacion> => {
    try {
      if (data.nombre || data.ubicacion) {
        await apiClient.put(`/estaciones/${id}`, {
          nombre: data.nombre,
          ubicacion: data.ubicacion,
          requiereAprobacion: data.flujo === 'Aprobación',
          estado: data.estado === 'En línea',
        });
      }
    } catch {
      // Fallback
    }

    const index = MOCK_ESTACIONES.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estación no encontrada');

    MOCK_ESTACIONES[index] = { ...MOCK_ESTACIONES[index], ...data };

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Actualización de estación ${MOCK_ESTACIONES[index].nombre}`,
      estacion: MOCK_ESTACIONES[index].nombre,
      origen: 'Panel',
    });

    return MOCK_ESTACIONES[index];
  },

  toggleEstadoEstacion: async (id: string): Promise<Estacion> => {
    const index = MOCK_ESTACIONES.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estación no encontrada');

    const nuevoEstado = MOCK_ESTACIONES[index].estado === 'En línea' ? 'Offline' : 'En línea';
    MOCK_ESTACIONES[index].estado = nuevoEstado;

    try {
      await apiClient.put(`/estaciones/${id}`, {
        nombre: MOCK_ESTACIONES[index].nombre,
        ubicacion: MOCK_ESTACIONES[index].ubicacion,
        estado: nuevoEstado === 'En línea',
      });
    } catch {
      // Fallback
    }

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Estado de estación ${MOCK_ESTACIONES[index].nombre} cambiado a ${nuevoEstado}`,
      estacion: MOCK_ESTACIONES[index].nombre,
      origen: 'Panel',
    });

    return MOCK_ESTACIONES[index];
  },

  eliminarEstacion: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/estaciones/${id}`);
    } catch {
      // Fallback
    }

    const index = MOCK_ESTACIONES.findIndex((e) => e.id === id);
    if (index === -1) return false;

    const [eliminada] = MOCK_ESTACIONES.splice(index, 1);

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Eliminación de estación ${eliminada.nombre}`,
      estacion: eliminada.nombre,
      origen: 'Panel',
    });

    return true;
  },
};
