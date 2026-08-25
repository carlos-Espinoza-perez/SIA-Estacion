import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../molecules/NotificationItem/NotificationItem';
import { ActivityTimeline, ActivityEvent } from '../../molecules/ActivityTimeline/ActivityTimeline';
import { UserContactItem } from '../../molecules/UserContactItem/UserContactItem';
import { auditoriaService } from '../../../services/auditoriaService';
import { personaService } from '../../../services/personaService';

export interface RightSidebarProps {
  isOpen?: boolean;
}

interface NotificationData {
  id: string;
  iconType: 'shield' | 'user' | 'bug' | 'broadcast';
  title: string;
  time: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen = true }) => {
  const [notificaciones, setNotificaciones] = useState<NotificationData[]>([]);
  const [actividades, setActividades] = useState<ActivityEvent[]>([]);
  const [contactos, setContactos] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    let montado = true;

    auditoriaService.getEventos().then((eventos) => {
      if (montado && eventos && eventos.length > 0) {
        // Formatear eventos de auditoría para Timeline
        const liveActs: ActivityEvent[] = eventos.slice(0, 6).map((e) => {
          // Limpiar GUIDs largos de la descripción si existen
          const cleanDesc = e.descripcion.replace(/#[a-f0-9-]{12,}/i, '').trim();
          const parts = e.fechaHora.split(' ');
          const timeStr = parts.length > 1 ? parts[1].substring(0, 5) : 'Hoy';

          return {
            id: e.id,
            name: e.actor || 'Sistema',
            action: cleanDesc || e.tipo,
            time: timeStr,
          };
        });
        setActividades(liveActs);

        // Notificaciones dinámicas basadas en eventos críticos o recientes
        const liveNotifs: NotificationData[] = eventos.slice(0, 4).map((e) => {
          let icon: 'shield' | 'user' | 'bug' | 'broadcast' = 'shield';
          if (e.tipo === 'Seguridad') {
            icon = 'user';
          } else if (e.tipo === 'Configuración') {
            icon = 'broadcast';
          } else if (e.descripcion.toLowerCase().includes('error') || e.descripcion.toLowerCase().includes('fall')) {
            icon = 'bug';
          }

          const cleanDesc = e.descripcion.replace(/#[a-f0-9-]{12,}/i, '').trim();
          const parts = e.fechaHora.split(' ');
          const timeStr = parts.length > 1 ? parts[1].substring(0, 5) : 'Reciente';

          return {
            id: e.id,
            iconType: icon,
            title: cleanDesc || `${e.tipo} en ${e.estacion}`,
            time: timeStr,
          };
        });
        setNotificaciones(liveNotifs);
      }
    }).catch(() => {});

    personaService.getPersonas().then((result) => {
      if (montado && result.data) {
        const liveCons = result.data.slice(0, 6).map((p: any) => ({
          id: p.id,
          name: p.nombre,
        }));
        setContactos(liveCons);
      }
    }).catch(() => {});

    return () => {
      montado = false;
    };
  }, []);

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

        {notificaciones.length === 0 ? (
          <div
            style={{
              padding: '12px 8px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Sin notificaciones pendientes
          </div>
        ) : (
          notificaciones.map((n) => (
            <NotificationItem
              key={n.id}
              iconType={n.iconType}
              title={n.title}
              time={n.time}
            />
          ))
        )}
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

        {actividades.length === 0 ? (
          <div
            style={{
              padding: '12px 8px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Sin actividad reciente
          </div>
        ) : (
          <ActivityTimeline events={actividades} />
        )}
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
          {contactos.length === 0 ? (
            <div
              style={{
                padding: '12px 8px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              No hay personas registradas
            </div>
          ) : (
            contactos.map((contact) => (
              <UserContactItem key={contact.id} name={contact.name} />
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
