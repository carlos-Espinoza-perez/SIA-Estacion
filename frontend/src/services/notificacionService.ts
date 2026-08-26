import { useState, useEffect } from 'react';
import { auditoriaService } from './auditoriaService';

export type TipoNotificacion = 'acceso' | 'prestamo' | 'sistema' | 'alerta';

export interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  tipo: TipoNotificacion;
  leida: boolean;
  rutaDestino?: string;
}

const NOTIF_STORAGE_KEY = 'sia_notificaciones';
const NOTIF_EVENT = 'sia_notif_change';

function notifyNotifChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIF_EVENT));
  }
}

// Limpiar residuos obsoletos con IDs estáticos antiguos si existieran en localStorage
function limpiarNotificacionesObsoletas(notificaciones: Notificacion[]): Notificacion[] {
  return notificaciones.filter((n) => !/^n-[1-5]$/.test(n.id));
}

export const notificacionService = {
  getNotificaciones(): Notificacion[] {
    try {
      const data = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed: Notificacion[] = JSON.parse(data);
      const limpias = limpiarNotificacionesObsoletas(parsed);
      if (limpias.length !== parsed.length) {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(limpias));
      }
      return limpias;
    } catch {
      return [];
    }
  },

  async sincronizarEventosRecientes(): Promise<Notificacion[]> {
    try {
      const res = await auditoriaService.getEventos({ limite: 5 });
      if (res.data && res.data.length > 0) {
        const list = this.getNotificaciones();
        const existentesIds = new Set(list.map((n) => n.id));
        const nuevas: Notificacion[] = [];

        for (const ev of res.data) {
          const id = `ev-${ev.id}`;
          if (!existentesIds.has(id)) {
            let tipo: TipoNotificacion = 'sistema';
            let rutaDestino = '/auditoria';
            if (ev.tipo === 'Acceso') {
              tipo = 'acceso';
              rutaDestino = '/accesos';
            } else if (ev.tipo === 'Operación') {
              tipo = 'prestamo';
              rutaDestino = '/operaciones';
            } else if (ev.tipo === 'Seguridad') {
              tipo = 'alerta';
              rutaDestino = '/roles';
            }

            nuevas.push({
              id,
              titulo: `${ev.tipo}: ${ev.descripcion}`,
              descripcion: `Registrado por ${ev.actor} · Estación: ${ev.estacion}`,
              tiempo: ev.fechaHora.split(', ')[1] || 'Reciente',
              tipo,
              leida: false,
              rutaDestino,
            });
          }
        }

        if (nuevas.length > 0) {
          const actualizadas = [...nuevas, ...list].slice(0, 20);
          localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(actualizadas));
          notifyNotifChange();
          return actualizadas;
        }
      }
    } catch (e) {
      console.error('Error sincronizando notificaciones:', e);
    }
    return this.getNotificaciones();
  },

  marcarComoLeida(id: string): void {
    const list = this.getNotificaciones();
    const updated = list.map((n) => (n.id === id ? { ...n, leida: true } : n));
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    notifyNotifChange();
  },

  marcarTodasComoLeidas(): void {
    const list = this.getNotificaciones();
    const updated = list.map((n) => ({ ...n, leida: true }));
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    notifyNotifChange();
  },

  eliminarNotificacion(id: string): void {
    const list = this.getNotificaciones();
    const updated = list.filter((n) => n.id !== id);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    notifyNotifChange();
  },

  agregarNotificacion(notif: Omit<Notificacion, 'id' | 'tiempo' | 'leida'>): void {
    const list = this.getNotificaciones();
    const nueva: Notificacion = {
      ...notif,
      id: `n-${Date.now()}`,
      tiempo: 'Ahora',
      leida: false,
    };
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify([nueva, ...list]));
    notifyNotifChange();
  },
};

/**
 * Hook reactivo para consumir notificaciones en tiempo real
 */
export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() =>
    notificacionService.getNotificaciones()
  );

  useEffect(() => {
    // Sincronizar con eventos reales del backend
    notificacionService.sincronizarEventosRecientes().then(setNotificaciones).catch(() => {});

    const handleUpdate = () => {
      setNotificaciones(notificacionService.getNotificaciones());
    };

    window.addEventListener(NOTIF_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(NOTIF_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  return {
    notificaciones,
    noLeidasCount,
    marcarComoLeida: notificacionService.marcarComoLeida.bind(notificacionService),
    marcarTodasComoLeidas: notificacionService.marcarTodasComoLeidas.bind(notificacionService),
    eliminarNotificacion: notificacionService.eliminarNotificacion.bind(notificacionService),
    agregarNotificacion: notificacionService.agregarNotificacion.bind(notificacionService),
    sincronizarEventosRecientes: notificacionService.sincronizarEventosRecientes.bind(notificacionService),
  };
}
