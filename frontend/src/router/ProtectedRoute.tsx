import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile, clearAuth } from '../store/slices/authSlice';
import { usePermissions, NivelRequerido } from '../hooks/usePermissions';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { Button } from '../components/atoms/Button/Button';

export interface ProtectedRouteProps {
  requiredPrivilege?: {
    codigo: string;
    nivel?: NivelRequerido;
  };
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPrivilege,
  requiredRole,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, token } = useAppSelector((state) => state.auth);
  const { hasPrivilege, hasRole, isAdmin } = usePermissions();

  useEffect(() => {
    // Si tenemos token pero no se ha cargado el perfil, cargarlo
    if (token && !user) {
      dispatch(fetchUserProfile());
    }

    // Escuchar evento de logout disparado por Axios en caso de expiración irreversible
    const handleLogoutEvent = () => {
      dispatch(clearAuth());
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [token, user, dispatch]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // Si está cargando el perfil por primera vez
  if (token && !user && isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'var(--bg-main)',
        }}
      >
        <Spinner size={40} color="var(--primary)" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Cargando perfil de usuario...
        </span>
      </div>
    );
  }

  // Si el perfil ya cargó, validar requerimientos
  if (user && !isAdmin) {
    if (requiredRole && !hasRole(requiredRole)) {
      return <AccesoDenegado mensaje={`Requiere el rol ${requiredRole}`} onVolver={() => navigate('/')} />;
    }

    if (requiredPrivilege && !hasPrivilege(requiredPrivilege.codigo, requiredPrivilege.nivel || 'L')) {
      return (
        <AccesoDenegado
          mensaje={`No cuentas con los permisos suficientes (${requiredPrivilege.codigo}:${requiredPrivilege.nivel || 'L'}) para acceder a esta sección.`}
          onVolver={() => navigate('/')}
        />
      );
    }
  }

  return <Outlet />;
};

interface AccesoDenegadoProps {
  mensaje?: string;
  onVolver: () => void;
}

const AccesoDenegado: React.FC<AccesoDenegadoProps> = ({ mensaje, onVolver }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E1E1E',
        color: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Acceso Restringido</h1>
      <p
        style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          maxWidth: '440px',
          lineHeight: '1.5',
          marginBottom: '24px',
        }}
      >
        {mensaje || 'No tienes permisos suficientes para acceder a este módulo del sistema. Contacta a un Administrador si requieres acceso.'}
      </p>

      <Button variant="primary" size="md" onClick={onVolver}>
        Volver al Panel Principal
      </Button>
    </div>
  );
};

