import { EventoAuditoria, FiltrosAuditoria } from '../types/auditoria';

export const MOCK_EVENTOS_AUDITORIA: EventoAuditoria[] = [
  {
    id: 'AUD-001',
    fechaHora: '28/07/2026 09:58',
    tipo: 'Acceso',
    actor: 'Ana Morales',
    descripcion: 'Egreso concedido por QR + Facial',
    estacion: 'Entrada principal',
    origen: 'Estación',
  },
  {
    id: 'AUD-002',
    fechaHora: '28/07/2026 09:56',
    tipo: 'Ítem',
    actor: 'Ana Morales',
    descripcion: 'Solicitud de préstamo OP-1042',
    estacion: 'Laboratorio A',
    origen: 'Estación',
  },
  {
    id: 'AUD-003',
    fechaHora: '28/07/2026 09:41',
    tipo: 'Ítem',
    actor: 'Weslin Rodríguez',
    descripcion: 'Aprobación de OP-1041',
    estacion: 'Laboratorio A',
    origen: 'Panel',
  },
  {
    id: 'AUD-004',
    fechaHora: '28/07/2026 09:33',
    tipo: 'Acceso',
    actor: 'María López',
    descripcion: 'Ingreso validado en modo offline',
    estacion: 'Cafetería',
    origen: 'Estación',
  },
  {
    id: 'AUD-005',
    fechaHora: '28/07/2026 09:15',
    tipo: 'Seguridad',
    actor: 'No identificado',
    descripcion: 'Carnet sin persona activa asociada',
    estacion: 'Salida norte',
    origen: 'Estación',
  },
  {
    id: 'AUD-006',
    fechaHora: '28/07/2026 08:58',
    tipo: 'Configuración',
    actor: 'Jorge Munguía',
    descripcion: 'Flujo de Laboratorio A cambiado a Aprobación',
    estacion: 'Laboratorio A',
    origen: 'Panel',
  },
  {
    id: 'AUD-007',
    fechaHora: '28/07/2026 08:47',
    tipo: 'Acceso',
    actor: 'Diego Vargas',
    descripcion: 'Ingreso concedido por QR + Facial',
    estacion: 'Taller',
    origen: 'Estación',
  },
  {
    id: 'AUD-008',
    fechaHora: '28/07/2026 08:23',
    tipo: 'Seguridad',
    actor: 'Carlos Ruiz',
    descripcion: 'Rostro no coincide con fotografía de referencia',
    estacion: 'Entrada principal',
    origen: 'Estación',
  },
  {
    id: 'AUD-009',
    fechaHora: '28/07/2026 08:12',
    tipo: 'Acceso',
    actor: 'Ana Morales',
    descripcion: 'Ingreso concedido por QR + Facial',
    estacion: 'Entrada principal',
    origen: 'Estación',
  },
  {
    id: 'AUD-010',
    fechaHora: '27/07/2026 18:20',
    tipo: 'Configuración',
    actor: 'Sistema',
    descripcion: 'Estación marcada sin conexión',
    estacion: 'Laboratorio B',
    origen: 'Panel',
  },
  {
    id: 'AUD-011',
    fechaHora: '27/07/2026 16:44',
    tipo: 'Ítem',
    actor: 'Weslin Rodríguez',
    descripcion: 'Entrega de OP-1040',
    estacion: 'Taller',
    origen: 'Panel',
  },
  {
    id: 'AUD-012',
    fechaHora: '27/07/2026 11:30',
    tipo: 'Ítem',
    actor: 'Weslin Rodríguez',
    descripcion: 'Rechazo de OP-1037',
    estacion: 'Taller',
    origen: 'Panel',
  },
  {
    id: 'AUD-013',
    fechaHora: '26/07/2026 17:40',
    tipo: 'Configuración',
    actor: 'Jorge Munguía',
    descripcion: 'Rol Guardia: se agregó auditoria.consultar',
    estacion: '—',
    origen: 'Panel',
  },
];

class AuditoriaService {
  private eventos: EventoAuditoria[] = [...MOCK_EVENTOS_AUDITORIA];

  async getEventos(filtros?: FiltrosAuditoria): Promise<EventoAuditoria[]> {
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
