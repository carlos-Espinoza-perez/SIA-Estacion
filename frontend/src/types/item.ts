export type EstadoItem = 'Disponible' | 'Prestado' | 'Mantenimiento' | 'Perdido';
export type FlujoTipoItem = 'Requiere aprobación' | 'Retiro directo';

export interface Item {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  tipoItemId?: string;
  estacion: string;
  estacionId?: string;
  estado: EstadoItem;
  unidades?: number;
  observaciones?: string;
}

export interface TipoItem {
  id: string;
  nombre: string;
  descripcion: string;
  itemsRegistrados: number;
  requiereAprobacion: 'Sí' | 'No' | '—';
  estado: 'Activo' | 'Inactivo';
}

export interface CrearItemFormData {
  nombre: string;
  codigo: string;
  tipo: string;
  tipoItemId?: string;
  estacion: string;
  estacionId?: string;
  unidades: number;
  estadoInicial: EstadoItem;
  observaciones: string;
}

export interface CrearTipoItemFormData {
  nombre: string;
  descripcion: string;
  flujoPorDefecto: FlujoTipoItem;
}

export interface FiltrosItem {
  busqueda?: string;
  tipo?: string;
  estacion?: string;
  estado?: string;
}

export interface FiltrosTipoItem {
  busqueda?: string;
  estado?: string;
}
