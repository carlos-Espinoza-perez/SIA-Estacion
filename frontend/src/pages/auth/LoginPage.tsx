import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayoutTemplate } from '../../components/templates/AuthLayoutTemplate/AuthLayoutTemplate';
import { LoginForm } from '../../components/organisms/LoginForm/LoginForm';
import { useAppSelector } from '../../store/hooks';

export const LoginPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Si el usuario ya está autenticado, redirigir al Dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayoutTemplate>
      <LoginForm />
    </AuthLayoutTemplate>
  );
};
