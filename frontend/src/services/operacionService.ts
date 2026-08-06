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

export const MOCK_OPERACIONES: OperacionRow[] = [
  { id: '1',  folio: 'OP-1042', fechaHora: '28/07/2026 08:20', solicitante: 'Ana Morales',    carnet: '22-A0200-0056', item: 'Multímetro digital UNI-T',    estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Pendiente' },
  { id: '2',  folio: 'OP-1041', fechaHora: '28/07/2026 08:05', solicitante: 'Luis Herrera',   carnet: '21-A0134-0012', item: 'Kit Arduino UNO R3',          estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Aprobada'  },
  { id: '3',  folio: 'OP-1040', fechaHora: '27/07/2026 16:44', solicitante: 'María López',    carnet: '23-A0311-0087', item: 'Osciloscopio Rigol DS1054Z',  estacion: 'Taller',        flujo: 'Aprobación', estado: 'Entregada' },
  { id: '4',  folio: 'OP-1039', fechaHora: '27/07/2026 15:12', solicitante: 'Carlos Ruiz',    carnet: '22-A0200-0057', item: 'Redes de computadoras',       estacion: 'Biblioteca',    flujo: 'Directo',    estado: 'Entregada' },
  { id: '5',  folio: 'OP-1038', fechaHora: '27/07/2026 14:50', solicitante: 'Sofía Méndez',   carnet: '20-A0098-0104', item: 'Fuente de poder regulable',   estacion: 'Taller',        flujo: 'Aprobación', estado: 'Offline'   },
  { id: '6',  folio: 'OP-1037', fechaHora: '27/07/2026 13:30', solicitante: 'Diego Vargas',   carnet: '23-A0311-0088', item: 'Sensor ultrasónico HC-SR04',  estacion: 'Laboratorio A', flujo: 'Directo',    estado: 'Cancelada' },
  { id: '7',  folio: 'OP-1036', fechaHora: '27/07/2026 11:18', solicitante: 'Ana Morales',    carnet: '22-A0200-0056', item: 'Raspberry Pi 4 Model B',      estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Offline'   },
  { id: '8',  folio: 'OP-1035', fechaHora: '27/07/2026 10:45', solicitante: 'Luis Herrera',   carnet: '21-A0134-0012', item: 'Programación en C++',         estacion: 'Biblioteca',    flujo: 'Directo',    estado: 'Offline'   },
  { id: '9',  folio: 'OP-1034', fechaHora: '27/07/2026 09:22', solicitante: 'María López',    carnet: '23-A0311-0087', item: 'Placa ESP32 DevKit',          estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Entregada' },
  { id: '10', folio: 'OP-1033', fechaHora: '26/07/2026 17:05', solicitante: 'Carlos Ruiz',    carnet: '22-A0200-0057', item: 'Pinzas de punta fina',        estacion: 'Taller',        flujo: 'Directo',    estado: 'Offline'   },
  { id: '11', folio: 'OP-1032', fechaHora: '26/07/2026 16:30', solicitante: 'Sofía Méndez',   carnet: '20-A0098-0104', item: 'Sistemas operativos',         estacion: 'Biblioteca',    flujo: 'Directo',    estado: 'Offline'   },
  { id: '12', folio: 'OP-1031', fechaHora: '26/07/2026 15:00', solicitante: 'Diego Vargas',   carnet: '23-A0311-0088', item: 'Kit resistencias surtidas',   estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Entregada' },
];

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
    try {
      const params = new URLSearchParams();
      if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros?.estado) params.append('estado', filtros.estado);

      const response = await apiClient.get<RespuestaEnvuelta<OperacionBackendDto[]>>(
        `/operaciones?${params.toString()}`
      );

      if (response.data.datos && response.data.datos.length > 0) {
        return response.data.datos.map((o) => ({
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
          estacion: o.estacionNombre || 'Laboratorio A',
          estacionId: o.estacionId,
          flujo: (o.flujo === 'Aprobación' ? 'Aprobación' : 'Directo') as FlujoOperacion,
          estado: mapEstado(o.estadoActual),
          observaciones: o.observaciones,
        }));
      }
    } catch {
      // Fallback a MOCK_OPERACIONES
    }

    let resultado = [...MOCK_OPERACIONES];
    if (filtros?.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (r) =>
          r.item.toLowerCase().includes(q) ||
          r.solicitante.toLowerCase().includes(q) ||
          r.folio.toLowerCase().includes(q)
      );
    }
    if (filtros?.estacion) {
      resultado = resultado.filter((r) => r.estacion === filtros.estacion);
    }
    if (filtros?.estado) {
      resultado = resultado.filter((r) => r.estado === filtros.estado);
    }

    return resultado;
  },

  async crearOperacion(dto: CrearOperacionDto): Promise<OperacionRow> {
    try {
      const response = await apiClient.post<RespuestaEnvuelta<OperacionBackendDto>>(
        '/operaciones',
        dto
      );
      if (response.data.datos) {
        const o = response.data.datos;
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
      }
    } catch {
      // Fallback local
    }

    const nueva: OperacionRow = {
      id: `op-${Date.now()}`,
      folio: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
      fechaHora: new Date().toLocaleString(),
      solicitante: 'Usuario',
      item: 'Ítem',
      estacion: 'Laboratorio A',
      flujo: 'Aprobación',
      estado: 'Pendiente',
    };
    MOCK_OPERACIONES.unshift(nueva);
    return nueva;
  },

  async aprobarOperacion(id: string, observacion?: string): Promise<boolean> {
    try {
      await apiClient.post(`/operaciones/${id}/aprobar`, { observacion });
      return true;
    } catch {
      // Fallback local
      const op = MOCK_OPERACIONES.find((o) => o.id === id || o.folio === id);
      if (op) op.estado = 'Aprobada';
      return true;
    }
  },

  async rechazarOperacion(id: string, observacion?: string): Promise<boolean> {
    try {
      await apiClient.post(`/operaciones/${id}/rechazar`, { observacion });
      return true;
    } catch {
      // Fallback local
      const op = MOCK_OPERACIONES.find((o) => o.id === id || o.folio === id);
      if (op) op.estado = 'Cancelada';
      return true;
    }
  },

  async entregarOperacion(id: string, observacion?: string): Promise<boolean> {
    try {
      await apiClient.post(`/operaciones/${id}/entregar`, { observacion });
      return true;
    } catch {
      const op = MOCK_OPERACIONES.find((o) => o.id === id || o.folio === id);
      if (op) op.estado = 'Entregada';
      return true;
    }
  },

  async devolverOperacion(
    id: string,
    detalles: DevolucionDetalleDto[]
  ): Promise<boolean> {
    try {
      await apiClient.post(`/operaciones/${id}/devolver`, { detalles });
      return true;
    } catch {
      const op = MOCK_OPERACIONES.find((o) => o.id === id || o.folio === id);
      if (op) op.estado = 'Devuelta';
      return true;
    }
  },
};
