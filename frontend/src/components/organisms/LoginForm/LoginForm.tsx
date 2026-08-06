import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { AlertBanner } from '../../molecules/AlertBanner/AlertBanner';
import { Spinner } from '../../atoms/Spinner/Spinner';

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('carlos.espinoza.04@est.ulsa.edu.ni');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    if (!email.trim()) {
      setValidationError('Por favor ingresa tu correo institucional.');
      return;
    }

    if (!password.trim()) {
      setValidationError('Por favor ingresa tu contraseña.');
      return;
    }

    dispatch(
      loginUser({
        email: email.trim(),
        password: password.trim(),
      })
    );
  };

  const handleGoogleLogin = () => {
    // Redirigir al endpoint de OAuth o mostrar aviso del dominio institucional
    window.location.href = '/api/auth/google';
  };

  const errorMessage = validationError || error;

  return (
    <div style={{ width: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Encabezado */}
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          marginBottom: '6px',
        }}
      >
        Iniciar sesión
      </h2>

      <p
        style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.4)',
          lineHeight: '16px',
          marginBottom: '28px',
        }}
      >
        Ingresa con tu correo institucional.
      </p>

      {/* Banner de Error */}
      {errorMessage && (
        <div style={{ marginBottom: '16px' }}>
          <AlertBanner
            type="error"
            message={errorMessage}
            onClose={() => {
              setValidationError(null);
              dispatch(clearError());
            }}
          />
        </div>
      )}

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Campo 1: Correo institucional */}
        <div>
          <label
            htmlFor="login-email"
            style={{
              display: 'block',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '6px',
            }}
          >
            Correo institucional
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos.espinoza.04@est.ulsa.edu.ni"
            required
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0 16px',
              fontSize: '14px',
              color: '#FFFFFF',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ADADFB';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(173, 173, 251, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Campo 2: Contraseña */}
        <div>
          <label
            htmlFor="login-password"
            style={{
              display: 'block',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '6px',
            }}
          >
            Contraseña
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 64px 0 16px',
                fontSize: '14px',
                color: '#FFFFFF',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ADADFB';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(173, 173, 251, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                padding: '4px',
              }}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {/* Fila: Mantener sesión iniciada & ¿Olvidaste tu contraseña? */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              onClick={() => setRememberMe(!rememberMe)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#71DD8C',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              {rememberMe ? '✓' : ''}
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Mantener sesión iniciada
            </span>
          </label>

          <a
            href="#recuperar"
            onClick={(e) => {
              e.preventDefault();
              alert('Por favor contacte al administrador de TI para restablecer sus credenciales.');
            }}
            style={{
              fontSize: '12px',
              color: '#ADADFB',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease',
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón Principal: Entrar (#ADADFB) */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: '48px',
            width: '100%',
            borderRadius: '10px',
            backgroundColor: '#ADADFB',
            color: '#17171C',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
            transition: 'background-color 0.15s ease, transform 0.15s ease',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = '#BEBEFF';
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = '#ADADFB';
          }}
        >
          {isLoading ? (
            <>
              <Spinner size={16} color="#17171C" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      {/* Separador "o" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0 16px',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
        <span
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          o
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
      </div>

      {/* Botón: Continuar con Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        style={{
          height: '48px',
          width: '100%',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.07)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 400,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.11)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
        }}
      >
        {/* Logo de Google SVG Oficial */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continuar con Google</span>
      </button>

      {/* Nota sobre dominio ulsa.edu.ni */}
      <p
        style={{
          fontSize: '12px',
          lineHeight: '16px',
          color: 'rgba(255, 255, 255, 0.4)',
          margin: '12px 0 24px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Solo se admiten cuentas del dominio institucional ulsa.edu.ni. El acceso se otorga si el correo coincide con una persona activa registrada en el sistema.
      </p>

      {/* Línea Divisoria */}
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          marginBottom: '20px',
        }}
      />

      {/* Nota Informativa al pie del formulario */}
      <p
        style={{
          fontSize: '12px',
          lineHeight: '18px',
          color: 'rgba(255, 255, 255, 0.4)',
          margin: 0,
        }}
      >
        Las Estaciones no usan este formulario. Se autentican por client credentials, con un identificador y un secreto propios de cada dispositivo grabados en su memoria flash.
      </p>
    </div>
  );
};
