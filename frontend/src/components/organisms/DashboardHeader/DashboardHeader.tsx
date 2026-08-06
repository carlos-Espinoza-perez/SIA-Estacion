import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { toggleSidebar, toggleRightSidebar } from '../../../store/slices/uiSlice';
import { useNavStorage } from '../../../services/navigationStorageService';
import { useNotificaciones } from '../../../services/notificacionService';
import { useToast } from '../../../context/ToastContext';
import { ModalBusquedaGlobal } from '../ModalBusquedaGlobal/ModalBusquedaGlobal';
import { DropdownNotificaciones } from '../DropdownNotificaciones/DropdownNotificaciones';
import { Kbd } from '../../atoms/Kbd/Kbd';

export interface DashboardHeaderProps {
  breadcrumbTitle?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accesos': 'Accesos',
  '/operaciones': 'Operaciones',
  '/personas': 'Personas',
  '/items': 'Ítems',
  '/estaciones': 'Estaciones',
  '/roles': 'Roles y permisos',
  '/auditoria': 'Auditoría',
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  breadcrumbTitle = 'Dashboard',
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite, addRecent } = useNavStorage();
  const { noLeidasCount } = useNotificaciones();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [starAnimating, setStarAnimating] = useState(false);

  const currentPath = location.pathname;
  const currentLabel = ROUTE_LABELS[currentPath] || breadcrumbTitle;
  const isCurrentFavorite = isFavorite(currentPath);

  // Registrar automáticamente en vistas recientes
  useEffect(() => {
    if (currentPath && currentPath !== '/' && currentPath !== '/login') {
      addRecent({ path: currentPath, label: currentLabel });
    }
  }, [currentPath, currentLabel, addRecent]);

  // Atajo global para abrir buscador con tecla '/' o 'Ctrl+K' / 'Cmd+K'
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input, textarea o select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isInput) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleToggleFavorite = () => {
    setStarAnimating(true);
    const added = toggleFavorite({ path: currentPath, label: currentLabel });
    if (added) {
      showToast(`"${currentLabel}" agregada a Favoritos`, 'success');
    } else {
      showToast(`"${currentLabel}" eliminada de Favoritos`, 'info');
    }
    setTimeout(() => setStarAnimating(false), 300);
  };

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.15)',
          backgroundColor: '#333333',
          width: '100%',
          minHeight: '64px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* 1. Lado Izquierdo: Iconos y Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Toggle Sidebar Izquierdo */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.94)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Alternar Menú Lateral"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>

          {/* Botón Favorito (Star) */}
          <button
            onClick={handleToggleFavorite}
            style={{
              background: 'none',
              border: 'none',
              color: isCurrentFavorite ? '#F59E0B' : 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
              transition: 'color 0.2s ease, background-color 0.15s ease, transform 0.2s ease',
              transform: starAnimating ? 'scale(1.25)' : 'scale(1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              if (!isCurrentFavorite) e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              if (!isCurrentFavorite) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
            }}
            title={isCurrentFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isCurrentFavorite ? '#F59E0B' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Panel
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.15)' }}>/</span>
            <span
              style={{
                fontSize: '12px',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              {breadcrumbTitle}
            </span>
          </div>
        </div>

        {/* 2. Lado Derecho: Buscador Global con Kbd + Botones de Acción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Buscador Interactivo (Abre ModalBusquedaGlobal) */}
          <div
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '4px 10px',
              width: '170px',
              height: '32px',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
            title="Búsqueda global (/ o Ctrl+K)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  userSelect: 'none',
                }}
              >
                Buscar...
              </span>
            </div>
            <Kbd>/</Kbd>
          </div>

          {/* Grupo de Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Modo Luz / Sol */}
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.65)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
              }}
              title="Tema"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>

            {/* Recargar Vista */}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.65)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
              }}
              onMouseDown={(e) => {
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.animation = 'none';
              }}
              onMouseUp={(e) => {
                const svg = e.currentTarget.querySelector('svg');
                if (svg) {
                  svg.style.animation = 'spinReload 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                }
              }}
              title="Recargar vista actual"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>

            {/* Notificaciones (Bell) con Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                style={{
                  background: isNotifOpen ? 'rgba(255, 255, 255, 0.12)' : 'none',
                  border: 'none',
                  color: isNotifOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '8px',
                  position: 'relative',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseOut={(e) => {
                  if (!isNotifOpen) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                  }
                }}
                title="Notificaciones del sistema"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {noLeidasCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#30D158',
                      boxShadow: '0 0 6px #30D158',
                    }}
                  />
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              <DropdownNotificaciones
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
              />
            </div>

            {/* Toggle Panel Lateral Derecho */}
            <button
              onClick={() => dispatch(toggleRightSidebar())}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.65)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
              }}
              title="Alternar Panel Lateral Derecho"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Búsqueda Global */}
      <ModalBusquedaGlobal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <style>{`
        @keyframes spinReload {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </>
  );
};
