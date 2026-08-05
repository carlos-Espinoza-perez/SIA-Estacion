export interface ErrorDto {
  codigo: string;
  mensaje: string;
}

export interface PaginacionMetadata {
  paginaActual: number;
  tamanoPagina: number;
  totalElementos: number;
  totalPaginas: number;
  tienePaginaAnterior: boolean;
  tienePaginaSiguiente: boolean;
}

export interface RespuestaEnvuelta<T> {
  datos?: T;
  errores?: ErrorDto[];
  paginacion?: PaginacionMetadata;
}
