import { useState, useEffect } from 'react';

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

const MOCK_NOTIFICACIONES_INICIALES: Notificacion[] = [
  {
    id: 'n-1',
    titulo: 'Acceso validado en Entrada Principal',
    descripcion: 'Diego Vargas Torres ingresó con verificación NFC correcta.',
    tiempo: 'Hace 2 min',
    tipo: 'acceso',
    leida: false,
    rutaDestino: '/accesos',
  },
  {
    id: 'n-2',
    titulo: 'Solicitud de préstamo pendiente',
    descripcion: 'Carlos Ruiz solicitó Multímetro digital UNI-T (PR-2026-004).',
    tiempo: 'Hace 15 min',
    tipo: 'prestamo',
    leida: false,
    rutaDestino: '/operaciones',
  },
  {
    id: 'n-3',
    titulo: 'Alerta de estación sin conexión',
    descripcion: 'Laboratorio B cambió su estado a Fuera de línea.',
    tiempo: 'Hace 1 h',
    tipo: 'alerta',
    leida: false,
    rutaDestino: '/estaciones',
  },
  {
    id: 'n-4',
    titulo: 'Ítem asignado a mantenimiento',
    descripcion: 'Osciloscopio Digital 100MHz fue retirado temporalmente de inventario.',
    tiempo: 'Hace 3 h',
    tipo: 'sistema',
    leida: true,
    rutaDestino: '/items',
  },
  {
    id: 'n-5',
    titulo: 'Nuevo rol de seguridad registrado',
    descripcion: 'Se agregaron permisos de supervisión al rol Guardia.',
    tiempo: 'Ayer',
    tipo: 'sistema',
    leida: true,
    rutaDestino: '/roles',
  },
];

function notifyNotifChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIF_EVENT));
  }
}

export const notificacionService = {
  getNotificaciones(): Notificacion[] {
    try {
      const data = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(MOCK_NOTIFICACIONES_INICIALES));
        return MOCK_NOTIFICACIONES_INICIALES;
      }
      return JSON.parse(data);
    } catch {
      return MOCK_NOTIFICACIONES_INICIALES;
    }
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
  };
}
