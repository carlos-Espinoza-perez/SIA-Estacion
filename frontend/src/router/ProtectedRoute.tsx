import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile, clearAuth } from '../store/slices/authSlice';
import { Spinner } from '../components/atoms/Spinner/Spinner';

export const ProtectedRoute: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, token } = useAppSelector((state) => state.auth);

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

  return <Outlet />;
};
