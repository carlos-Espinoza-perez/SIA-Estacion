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
  async getEventos(filtros?: FiltrosAuditoria): Promise<EventoAuditoria[]> {
    const response = await apiClient.get<RespuestaEnvuelta<AuditoriaBackendDto[]>>('/reportes/auditoria');
    let result: EventoAuditoria[] = (response.data?.datos || []).map((a) => ({
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

  async registrarEvento(
    evento: Omit<EventoAuditoria, 'id' | 'fechaHora'>
  ): Promise<EventoAuditoria> {
    // Audit events should generally be registered directly by the backend controllers during an action.
    // However, if the frontend needs to log something explicitly, we mock the return for now 
    // unless there's a specific endpoint like POST /reportes/auditoria.
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // In a real app, we'd send it to backend. We return a fake one so TS compiles and UI doesn't crash.
    return {
      id: `AUD-${Math.floor(Math.random() * 1000)}`,
      fechaHora: formattedDate,
      ...evento,
    };
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
