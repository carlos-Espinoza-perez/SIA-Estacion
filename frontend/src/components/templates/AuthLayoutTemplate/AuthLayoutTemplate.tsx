import React from 'react';

export interface AuthLayoutTemplateProps {
  children: React.ReactNode;
}

export const AuthLayoutTemplate: React.FC<AuthLayoutTemplateProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#333333',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="sia-login-container"
    >
      {/* Efectos de Iluminación Ambiental */}

      {/* 1. Halo Superior Izquierdo (Lavanda / Periwinkle #ADADFB) */}
      <div
        style={{
          position: 'absolute',
          top: '-160px',
          left: '-140px',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          backgroundColor: 'rgba(173, 173, 251, 0.32)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 2. Halo Central (Azul Cielo #7DBBFF) */}
      <div
        style={{
          position: 'absolute',
          top: '320px',
          left: '10%',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          backgroundColor: 'rgba(125, 187, 255, 0.16)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 3. Halo Verde/Menta (#6BE6D3 / #71DD8C) que cruza el centro e ilumina AMBOS lados */}
      <div
        style={{
          position: 'absolute',
          bottom: '-140px',
          left: 'calc(50% - 240px)',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          backgroundColor: 'rgba(107, 230, 211, 0.22)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* COLUMNA IZQUIERDA: Identidad, Misión y Métricas (50% de la pantalla) */}
      <div
        style={{
          flex: '1 1 50%',
          minHeight: '100vh',
          position: 'relative',
          padding: '64px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(124deg, rgba(173, 173, 251, 0.2) 0%, rgba(184, 153, 235, 0.08) 29%, rgba(125, 187, 255, 0.02) 64%, transparent 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.07)',
          boxSizing: 'border-box',
          zIndex: 2,
        }}
        className="sia-login-left-panel"
      >
        {/* Header Superior: Logo SIA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
          <span
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            SIA
          </span>
        </div>

        {/* Sección Central: Título y Lista de Beneficios */}
        <div style={{ margin: '40px 0', maxWidth: '560px' }}>
          <h1
            style={{
              fontSize: '40px',
              fontWeight: 600,
              lineHeight: '50px',
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              marginBottom: '14px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Identificación automática<br />
            para el control de acceso<br />
            y la gestión de ítems.
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              lineHeight: '16px',
              marginBottom: '38px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Universidad Tecnológica La Salle · León, Nicaragua
          </p>

          {/* Puntos destacados con viñetas de colores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#71DD8C',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>
                Validación por código QR y verificación facial
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#7DBBFF',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>
                Operación offline en el punto de acceso
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ADADFB',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>
                Registro trazable de cada operación
              </span>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Línea divisoria y Métricas Estadísticas */}
        <div style={{ maxWidth: '560px' }}>
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              marginBottom: '24px',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                5
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                Estaciones activas
              </div>
            </div>

            <div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                1,284
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                Accesos hoy
              </div>
            </div>

            <div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                256
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                Personas registradas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Formulario de Inicio de Sesión (50% de la pantalla) */}
      <div
        style={{
          flex: '1 1 50%',
          minHeight: '100vh',
          padding: '64px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
        className="sia-login-right-panel"
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
