import { EventoAuditoria, FiltrosAuditoria, TipoEventoAuditoria, OrigenAuditoria } from '../types/auditoria';
import { apiClient } from './apiClient';
import { RespuestaEnvuelta, PaginacionMetadata } from '../types/api';

interface AuditoriaBackendDto {
  id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  descripcion?: string;
  origen?: string;
  estacionId?: string;
  userId?: string;
  nombreUsuario?: string;
  fechaHora: string;
}

const nombresEntidades: Record<string, string> = {
  Persona: 'una persona',
  FotoReferencia: 'una fotografía de referencia',
  Item: 'un ítem',
  TipoItem: 'un tipo de ítem',
  Estacion: 'una estación',
  Usuario: 'un usuario',
  ApplicationRole: 'un rol',
  Empresa: 'la empresa',
  AtributoDefinicion: 'un atributo de ítem',
  EstacionTipoItem: 'la asignación de un tipo de ítem a una estación',
  ItemAtributoValor: 'un valor de atributo de ítem',
  ItemComposicion: 'la composición de un ítem',
  NivelPermiso: 'un nivel de permiso',
  OperacionItem: 'una operación de préstamo',
  OperacionItemDetalle: 'el detalle de una operación',
  Privilegio: 'un privilegio',
  RolPrivilegio: 'la asignación de un privilegio a un rol',
};

const descripcionNatural = (evento: AuditoriaBackendDto): string => {
  const generica = !evento.descripcion || /^(Crear|Actualizar|Inactivar|Activar|Eliminar) de /i.test(evento.descripcion);
  if (!generica) return evento.descripcion!;

  const entidad = nombresEntidades[evento.entidad] || evento.entidad;
  const accion = evento.accion;
  if (evento.entidad === 'FotoReferencia' && accion === 'Crear') return 'Se agregó una fotografía de referencia';
  if (evento.entidad === 'FotoReferencia' && accion === 'Inactivar') return 'Se eliminó una fotografía de referencia';
  const verbos: Record<string, string> = { Crear: 'Se creó', Actualizar: 'Se actualizó', Inactivar: 'Se desactivó', Activar: 'Se activó', Eliminar: 'Se eliminó' };
  return `${verbos[accion] || 'Se modificó'} ${entidad}`;
};

const clasificarTipoEvento = (entidad: string): TipoEventoAuditoria => {
  switch (entidad) {
    case 'Persona':
    case 'Usuario':
    case 'ApplicationRole':
    case 'RolPrivilegio':
    case 'Privilegio':
    case 'NivelPermiso':
    case 'FotoReferencia':
      return 'Seguridad';
    case 'Item':
    case 'TipoItem':
    case 'ItemAtributoValor':
    case 'ItemComposicion':
    case 'AtributoDefinicion':
      return 'Ítem';
    case 'OperacionItem':
    case 'OperacionItemDetalle':
    case 'Prestamo':
      return 'Operación';
    case 'EventoAcceso':
    case 'Acceso':
      return 'Acceso';
    case 'Estacion':
    case 'Empresa':
    case 'EstacionTipoItem':
    default:
      return 'Configuración';
  }
};

class AuditoriaService {
  async getEventos(filtros?: FiltrosAuditoria): Promise<{ data: EventoAuditoria[]; paginacion?: PaginacionMetadata }> {
    let url = '/reportes/auditoria?';
    const params = new URLSearchParams();
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.tipo && filtros.tipo !== 'Todos') {
      params.append('entidad', filtros.tipo);
    }
    if (filtros?.fechaDesde) params.append('desde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append('hasta', filtros.fechaHasta);
    if (filtros?.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros?.limite) params.append('limite', filtros.limite.toString());

    url += params.toString();

    const response = await apiClient.get<RespuestaEnvuelta<AuditoriaBackendDto[]>>(url);
    const rawData = response.data?.datos || [];

    let result: EventoAuditoria[] = rawData.map((a) => ({
      id: a.id.substring(0, 8).toUpperCase(),
      fechaHora: new Date(a.fechaHora).toLocaleString('es-NI', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      }),
      tipo: clasificarTipoEvento(a.entidad),
      actor: a.nombreUsuario || (a.userId ? 'Usuario' : 'Sistema'),
      descripcion: descripcionNatural(a),
      estacion: a.estacionId ? a.estacionId.substring(0, 8) : '—',
      origen: (a.origen as OrigenAuditoria) || 'Panel',
    }));

    if (filtros?.tipo && filtros.tipo !== 'Todos') {
      result = result.filter((e) => e.tipo === filtros.tipo);
    }

    if (filtros?.estacion && filtros.estacion !== 'Todas') {
      result = result.filter((e) => e.estacion === filtros.estacion);
    }

    return {
      data: result,
      paginacion: response.data?.paginacion,
    };
  }

  async registrarEvento(
    evento: Omit<EventoAuditoria, 'id' | 'fechaHora'>
  ): Promise<EventoAuditoria> {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return {
      id: `AUD-${Math.floor(Math.random() * 1000)}`,
      fechaHora: formattedDate,
      ...evento,
    };
  }

  async exportarCSV(filtros?: FiltrosAuditoria): Promise<string> {
    const { data } = await this.getEventos({ ...filtros, pagina: 1, limite: 10000 });
    const headers = ['ID', 'Fecha y hora', 'Tipo', 'Actor', 'Descripción', 'Estación', 'Origen'];
    const rows = data.map((e) => [
      e.id,
      e.fechaHora,
      e.tipo,
      e.actor,
      `"${e.descripcion.replace(/"/g, '""')}"`,
      e.estacion,
      e.origen,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const auditoriaService = new AuditoriaService();
