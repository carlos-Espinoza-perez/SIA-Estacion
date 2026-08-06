export type EstadoEstacion = 'En línea' | 'Offline' | 'Mantenimiento';
export type FlujoEstacion = 'Aprobación' | 'Directo' | '—';

export interface ActividadEstacion {
  id: string;
  fechaHora: string;
  persona: string;
  operacion: string;
  validacion: string;
  resultado: 'Concedido' | 'Denegado' | 'Pendiente' | 'Entregada';
}

export interface Estacion {
  id: string;
  nombre: string;
  ubicacion: string;
  tipoRecurso: string;
  flujo: FlujoEstacion;
  ultimaSincronizacion: string;
  estado: EstadoEstacion;
  encargado?: string;
  identificadorDispositivo?: string;
  modoOffline?: boolean;
  firmware?: string;
  accesosHoy?: number;
  operacionesHoy?: number;
  latenciaQrPromedio?: string;
  latenciaFacialPromedio?: string;
  actividadReciente?: ActividadEstacion[];
}

export interface CrearEstacionFormData {
  nombre: string;
  ubicacion: string;
  tipoRecurso: string;
  flujo: FlujoEstacion;
  encargado: string;
  identificadorDispositivo: string;
  modoOffline: boolean;
}

export interface FiltrosEstacion {
  busqueda: string;
  tipoRecurso: string;
  estado: string;
}
