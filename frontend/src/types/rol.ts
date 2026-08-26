export interface Privilegio {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  estado: boolean;
}

export interface NivelPermiso {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  estado: boolean;
}

export interface RolPrivilegioDetalle {
  id: string;
  privilegioId: string;
  privilegioCodigo: string;
  privilegioNombre: string;
  nivelPermisoId: string;
  nivelPermisoCodigo: string;
  nivelPermisoNombre: string;
}

export interface AsignacionPrivilegioRequest {
  privilegioId: string;
  nivelPermisoId: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  personasAsignadas: number;
  permisos: string[]; // array de códigos de privilegio
  activo?: boolean;
  esSistema?: boolean;
}

export interface CrearRolFormData {
  nombre: string;
  descripcion: string;
  baseRolId?: string;
  activo: boolean;
  permisos: string[]; // array de ids o codigos de privilegio
  nivelPorDefecto?: string; // id de nivel de permiso
}
