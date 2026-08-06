export type CategoriaPermiso = 'ACCESOS' | 'ÍTEMS' | 'CATÁLOGOS' | 'ADMINISTRACIÓN' | 'AUDITORÍA';

export interface PermisoDef {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaPermiso;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  personasAsignadas: number;
  permisos: string[]; // array de códigos de permiso
  activo?: boolean;
  esSistema?: boolean;
}

export interface CrearRolFormData {
  nombre: string;
  descripcion: string;
  baseRolId?: string;
  activo: boolean;
  permisos: string[];
}
