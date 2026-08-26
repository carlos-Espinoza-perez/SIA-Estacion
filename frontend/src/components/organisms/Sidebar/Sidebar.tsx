import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { useNavStorage } from '../../../services/navigationStorageService';
import { usePermissions } from '../../../hooks/usePermissions';

export interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessRoute } = usePermissions();
  const [activeTab, setActiveTab] = useState<'favoritos' | 'recientes'>('favoritos');
  const { favorites, recents, removeFavorite } = useNavStorage();

  const rawMainNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
    {
      id: 'accesos',
      label: 'Accesos',
      path: '/accesos',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <line x1="15" y1="8" x2="17" y2="8" />
          <line x1="15" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      ),
    },
    {
      id: 'operaciones',
      label: 'Operaciones',
      path: '/operaciones',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
      ),
    },
  ];

  const rawAdminNavItems = [
    {
      id: 'personas',
      label: 'Personas',
      path: '/personas',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'items',
      label: 'Ítems',
      path: '/items',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'estaciones',
      label: 'Estaciones',
      path: '/estaciones',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4.93 4.93a10 10 0 0 0 0 14.14M7.76 7.76a6 6 0 0 0 0 8.48M12 12h.01" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M16.24 7.76a6 6 0 0 1 0 8.48" />
        </svg>
      ),
    },
    {
      id: 'roles',
      label: 'Roles y permisos',
      path: '/roles',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      id: 'auditoria',
      label: 'Auditoría',
      path: '/auditoria',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      ),
    },
  ];

  const mainNavItems = rawMainNavItems.filter((item) => canAccessRoute(item.path));
  const adminNavItems = rawAdminNavItems.filter((item) => canAccessRoute(item.path));

  return (
    <aside
      style={{
        width: '212px',
        height: '100%',
        backgroundColor: '#333333',
        borderRight: '0.5px solid rgba(255, 255, 255, 0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        /* Animación de slide izquierda */
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        opacity: isOpen ? 1 : 0,
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
      }}
    >
      {/* 1. Header con Avatar y Nombre SIA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
        <Avatar name="SIA" size={24} bgColor="rgba(255, 255, 255, 0.15)" />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          SIA
        </span>
      </div>

      {/* 2. Pestañas Favoritos / Recientes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('favoritos')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: activeTab === 'favoritos' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            padding: '2px 0',
            fontWeight: activeTab === 'favoritos' ? 500 : 400,
          }}
        >
          Favoritos
        </button>
        <button
          onClick={() => setActiveTab('recientes')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: activeTab === 'recientes' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            padding: '2px 0',
            fontWeight: activeTab === 'recientes' ? 500 : 400,
          }}
        >
          Recientes
        </button>
      </div>

      {/* Bullets de acceso rápido (Favoritos / Recientes) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '48px' }}>
        {activeTab === 'favoritos' ? (
          favorites.length === 0 ? (
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.3)',
                padding: '6px 8px',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic',
              }}
            >
              Sin favoritos guardados
            </div>
          ) : (
            favorites.map((fav) => {
              const isActive = location.pathname === fav.path;
              return (
                <div
                  key={fav.path}
                  onClick={() => navigate(fav.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#F59E0B' : 'rgba(255, 255, 255, 0.4)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                        fontFamily: 'Inter, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fav.label}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.path);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.25)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Quitar de favoritos"
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
              );
            })
          )
        ) : recents.length === 0 ? (
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.3)',
              padding: '6px 8px',
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'italic',
            }}
          >
            Sin historial reciente
          </div>
        ) : (
          recents.map((rec) => {
            const isActive = location.pathname === rec.path;
            return (
              <div
                key={rec.path}
                onClick={() => navigate(rec.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.4)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'Inter, sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rec.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Sección Principal */}
      {mainNavItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'Inter, sans-serif',
              padding: '4px 8px',
            }}
          >
            Principal
          </span>

          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Sección Administración */}
      {adminNavItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'Inter, sans-serif',
              padding: '4px 8px',
            }}
          >
            Administración
          </span>

          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer / Logo SnowUI */}
      <div
        style={{
          marginTop: 'auto',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
        </svg>
        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Inter, sans-serif' }}>
          SIA Cloud System
        </span>
      </div>
    </aside>
  );
};
