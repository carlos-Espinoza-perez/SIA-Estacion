import React from 'react';
import { NotificationItem } from '../../molecules/NotificationItem/NotificationItem';
import { ActivityTimeline, ActivityEvent } from '../../molecules/ActivityTimeline/ActivityTimeline';
import { UserContactItem } from '../../molecules/UserContactItem/UserContactItem';

export interface RightSidebarProps {
  isOpen?: boolean;
}

const sampleActivities: ActivityEvent[] = [
  { id: '1', name: 'Ana Morales', action: 'Operación entregada.', time: 'Ahora' },
  { id: '2', name: 'Luis Herrera', action: 'Ítem marcado en mantenimiento.', time: 'Hace 59 min' },
  { id: '3', name: 'Carlos Ruiz', action: 'Acceso denegado (QR inválido).', time: 'Hace 12 h' },
  { id: '4', name: 'Sofía Méndez', action: 'Rol actualizado: Guardia.', time: 'Hoy, 11:59' },
  { id: '5', name: 'Diego Vargas', action: 'Estación sincronizada.', time: '2 feb 2026' },
];

const sampleContacts = [
  { id: '1', name: 'Ana Morales' },
  { id: '2', name: 'Luis Herrera' },
  { id: '3', name: 'María López' },
  { id: '4', name: 'Carlos Ruiz' },
  { id: '5', name: 'Sofía Méndez' },
  { id: '6', name: 'Diego Vargas' },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen = true }) => {
  return (
    <aside
      style={{
        width: '280px',
        height: '100%',
        backgroundColor: '#333333',
        borderLeft: '0.5px solid rgba(255, 255, 255, 0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        /* Animación de slide derecha */
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        opacity: isOpen ? 1 : 0,
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
      }}
    >
      {/* 1. Sección Notificaciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'Inter, sans-serif',
            padding: '4px 8px',
          }}
        >
          Notificaciones
        </span>

        <NotificationItem
          iconType="shield"
          title="Acceso concedido en Entrada."
          time="Ahora"
        />
        <NotificationItem
          iconType="user"
          title="Nueva persona registrada."
          time="Hace 59 min"
        />
        <NotificationItem
          iconType="bug"
          title="Préstamo pendiente de aprobación."
          time="Hace 12 h"
        />
        <NotificationItem
          iconType="broadcast"
          title="Estación Laboratorio A offline."
          time="Hoy, 11:59"
        />
      </div>

      {/* 2. Sección Actividad */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'Inter, sans-serif',
            padding: '4px 8px',
          }}
        >
          Actividad
        </span>

        <ActivityTimeline events={sampleActivities} />
      </div>

      {/* 3. Sección Personas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'Inter, sans-serif',
            padding: '4px 8px',
          }}
        >
          Personas
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {sampleContacts.map((contact) => (
            <UserContactItem key={contact.id} name={contact.name} />
          ))}
        </div>
      </div>
    </aside>
  );
};
