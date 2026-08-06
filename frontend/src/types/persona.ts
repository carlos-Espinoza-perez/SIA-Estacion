export type TipoPersona = 'Estudiante' | 'Personal';
export type RolPersona = 'Estudiante' | 'Encargado de recurso' | 'Administrador' | 'Guardia';
export type EstadoPersona = 'Activo' | 'Inactivo';

export interface Persona {
  id: string;
  nombre: string;
  carnet: string;
  tipo: TipoPersona;
  rol: RolPersona;
  carreraOArea?: string;
  correo?: string;
  ultimaActividad: string;
  estado: EstadoPersona;
  avatarUrl?: string;
  fechaRegistro?: string;
  tieneFotoReferencia?: boolean;
}

export interface AccesoHistorial {
  id: string;
  fechaHora: string;
  estacion: string;
  direccion: 'Ingreso' | 'Egreso';
  validacion: 'QR + Facial' | 'QR' | 'Facial' | 'Manual';
  resultado: 'Concedido' | 'Denegado' | 'Offline' | 'Pendiente';
}

export interface OperacionItemHistorial {
  id: string;
  folio: string;
  fecha: string;
  item: string;
  estado: 'Pendiente' | 'Devuelta' | 'En curso' | 'Vencida';
}

export interface FichaPersonaDetalle extends Persona {
  fotoReferencia?: {
    url?: string;
    estado: string; // 'Cifrada en reposo'
    fechaCaptura: string;
    fechaActualizacion: string;
    retencion: string; // 'Se elimina al pasar a inactivo'
  };
  historialAccesos: AccesoHistorial[];
  operacionesItems: OperacionItemHistorial[];
}

export interface CrearPersonaFormData {
  nombre: string;
  carnet: string;
  tipo: TipoPersona;
  rol: RolPersona;
  carreraOArea: string;
  correo: string;
  fotoArchivo?: File | null;
  fotoPreviewUrl?: string;
}

export interface FiltrosPersona {
  busqueda: string;
  rol: string;
  tipo: string;
  estado: string;
}
