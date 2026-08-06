import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificaciones, Notificacion, TipoNotificacion } from '../../../services/notificacionService';

export interface DropdownNotificacionesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DropdownNotificaciones: React.FC<DropdownNotificacionesProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filtro, setFiltro] = useState<'todas' | 'noLeidas'>('todas');
  const {
    notificaciones,
    noLeidasCount,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
  } = useNotificaciones();

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notificacionesFiltradas = notificaciones.filter((n) =>
    filtro === 'noLeidas' ? !n.leida : true
  );

  const handleItemClick = (notif: Notificacion) => {
    marcarComoLeida(notif.id);
    if (notif.rutaDestino) {
      navigate(notif.rutaDestino);
      onClose();
    }
  };

  const handleIrAuditoria = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/auditoria');
    onClose();
  };

  const getTipoIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'acceso':
        return (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        );
      case 'prestamo':
        return (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
        );
      case 'alerta':
        return (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );
      case 'sistema':
      default:
        return (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: '0px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        backgroundColor: '#262626',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
        zIndex: 2000,
        overflow: 'hidden',
        animation: 'dropdownFadeIn 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#2E2E2E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Notificaciones
          </span>
          {noLeidasCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#30D158',
                color: '#1A1A1A',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {noLeidasCount} nuevas
            </span>
          )}
        </div>

        {noLeidasCount > 0 && (
          <button
            onClick={marcarTodasComoLeidas}
            style={{
              background: 'none',
              border: 'none',
              color: '#3B82F6',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Marcar leídas
          </button>
        )}
      </div>

      {/* 2. Filtros */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#262626',
        }}
      >
        <button
          onClick={() => setFiltro('todas')}
          style={{
            background: filtro === 'todas' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            border: 'none',
            color: filtro === 'todas' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
            fontSize: '12px',
            fontWeight: filtro === 'todas' ? 600 : 400,
            padding: '4px 12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s ease',
          }}
        >
          Todas ({notificaciones.length})
        </button>
        <button
          onClick={() => setFiltro('noLeidas')}
          style={{
            background: filtro === 'noLeidas' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            border: 'none',
            color: filtro === 'noLeidas' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
            fontSize: '12px',
            fontWeight: filtro === 'noLeidas' ? 600 : 400,
            padding: '4px 12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s ease',
          }}
        >
          No leídas ({noLeidasCount})
        </button>
      </div>

      {/* 3. Lista de Notificaciones con espaciado */}
      <div
        style={{
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {notificacionesFiltradas.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.35)',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            No tienes notificaciones pendientes
          </div>
        ) : (
          notificacionesFiltradas.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: !notif.leida
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: !notif.leida
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = !notif.leida
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = !notif.leida
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.04)';
              }}
            >
              {getTipoIcon(notif.tipo)}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    marginBottom: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: !notif.leida ? 600 : 500,
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '18px',
                    }}
                  >
                    {notif.titulo}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontFamily: 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {notif.tiempo}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'Inter, sans-serif',
                    margin: '0',
                    lineHeight: '17px',
                  }}
                >
                  {notif.descripcion}
                </p>
              </div>

              {!notif.leida && (
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#30D158',
                    marginTop: '5px',
                    flexShrink: 0,
                    boxShadow: '0 0 6px #30D158',
                  }}
                />
              )}

              {/* Botón eliminar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarNotificacion(notif.id);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
                title="Eliminar notificación"
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.25)';
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* 4. Footer con botón de auditoría */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#202020',
        }}
      >
        <button
          type="button"
          onClick={handleIrAuditoria}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          <span>Ver bitácora completa en Auditoría</span>
          <span style={{ fontSize: '13px' }}>→</span>
        </button>
      </div>

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
