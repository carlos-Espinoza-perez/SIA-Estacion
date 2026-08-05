import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { PerfilResponse } from '../../../types/auth';

export interface UserMenuProps {
  user: PerfilResponse | null;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolPrincipal = user?.roles?.[0] || 'Administrador';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {user?.nombreCompleto ? user.nombreCompleto.charAt(0).toUpperCase() : <User size={16} />}
        </div>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.nombreCompleto || 'Usuario'}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {rolPrincipal}
          </span>
        </div>

        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div
          className="glass-card animate-fade-in"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            minWidth: '220px',
            zIndex: 100,
            padding: '8px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '6px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.nombreCompleto}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Shield size={14} color="var(--primary)" />
            <span>Roles: {user?.roles?.join(', ') || 'N/A'}</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              textAlign: 'left',
              transition: 'background var(--transition-fast)',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};
