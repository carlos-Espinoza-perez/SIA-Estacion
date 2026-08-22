import { EventoAuditoria, FiltrosAuditoria, TipoEventoAuditoria, OrigenAuditoria } from '../types/auditoria';
import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

interface AuditoriaBackendDto {
  id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  descripcion?: string;
  origen?: string;
  estacionId?: string;
  userId?: string;
  fechaHora: string;
}

class AuditoriaService {
  private eventos: EventoAuditoria[] = [];

  async getEventos(filtros?: FiltrosAuditoria): Promise<EventoAuditoria[]> {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<AuditoriaBackendDto[]>>('/reportes/auditoria');
      if (response.data && Array.isArray(response.data.datos)) {
        let result: EventoAuditoria[] = response.data.datos.map((a) => ({
          id: a.id.substring(0, 8).toUpperCase(),
          fechaHora: new Date(a.fechaHora).toLocaleString(),
          tipo: (a.entidad === 'Item' || a.entidad === 'TipoItem'
            ? 'Ítem'
            : a.entidad === 'Persona' || a.entidad === 'Usuario'
            ? 'Seguridad'
            : a.entidad === 'Estacion'
            ? 'Configuración'
            : 'Acceso') as TipoEventoAuditoria,
          actor: a.userId ? 'Usuario' : 'Sistema',
          descripcion: a.descripcion || `${a.accion} en ${a.entidad}`,
          estacion: a.estacionId ? a.estacionId.substring(0, 8) : '—',
          origen: (a.origen as OrigenAuditoria) || 'Panel',
        }));

        if (filtros?.busqueda) {
          const q = filtros.busqueda.toLowerCase().trim();
          result = result.filter(
            (e) =>
              e.actor.toLowerCase().includes(q) ||
              e.descripcion.toLowerCase().includes(q) ||
              e.estacion.toLowerCase().includes(q) ||
              e.id.toLowerCase().includes(q)
          );
        }

        if (filtros?.tipo && filtros.tipo !== 'Todos') {
          result = result.filter((e) => e.tipo === filtros.tipo);
        }

        if (filtros?.estacion && filtros.estacion !== 'Todas') {
          result = result.filter((e) => e.estacion === filtros.estacion);
        }

        return result;
      }
    } catch {
      // Fallback solo ante error de red
    }

    let result = [...this.eventos];

    if (filtros?.busqueda) {
      const q = filtros.busqueda.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.actor.toLowerCase().includes(q) ||
          e.descripcion.toLowerCase().includes(q) ||
          e.estacion.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }

    if (filtros?.tipo && filtros.tipo !== 'Todos') {
      result = result.filter((e) => e.tipo === filtros.tipo);
    }

    if (filtros?.estacion && filtros.estacion !== 'Todas') {
      result = result.filter((e) => e.estacion === filtros.estacion);
    }

    return result;
  }

  async registrarEvento(
    evento: Omit<EventoAuditoria, 'id' | 'fechaHora'>
  ): Promise<EventoAuditoria> {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nuevo: EventoAuditoria = {
      id: `AUD-${String(this.eventos.length + 1).padStart(3, '0')}`,
      fechaHora: formattedDate,
      ...evento,
    };
    this.eventos.unshift(nuevo);
    return nuevo;
  }

  async exportarCSV(filtros?: FiltrosAuditoria): Promise<string> {
    const data = await this.getEventos(filtros);
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
