export interface ErrorDto {
  codigo: string;
  mensaje: string;
}

export interface PaginacionMetadata {
  paginaActual: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  tieneAnterior: boolean;
  tieneSiguiente: boolean;
}

export interface RespuestaEnvuelta<T> {
  datos?: T;
  errores?: ErrorDto[];
  paginacion?: PaginacionMetadata;
}
