export type TipoEventoAuditoria = 'Acceso' | 'Ítem' | 'Operación' | 'Seguridad' | 'Configuración';

export type OrigenAuditoria = 'Estación' | 'Panel' | 'Sistema';

export interface EventoAuditoria {
  id: string;
  fechaHora: string;
  tipo: TipoEventoAuditoria;
  actor: string;
  descripcion: string;
  estacion: string;
  origen: OrigenAuditoria;
  detallesJson?: string;
}

export interface FiltrosAuditoria {
  busqueda?: string;
  tipo?: TipoEventoAuditoria | 'Todos';
  estacion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  limite?: number;
}
