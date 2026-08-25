import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../atoms/Button/Button';

export interface ModalProps {
  /** Controla visibilidad */
  isOpen: boolean;
  /** Callback al cerrar (X, backdrop, Escape) */
  onClose: () => void;
  /** Título del modal */
  title: string;
  /** Subtítulo / descripción debajo del título */
  subtitle?: string;
  /** Ancho del modal en px (default 640) */
  width?: number;
  /** Contenido interno del modal */
  children: React.ReactNode;
  /** Footer (botones de acción) */
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  width = 640,
  children,
  footer,
}) => {
  /* Cerrar con Escape */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* ── Scrim / Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.62)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'modalFadeIn 0.18s ease',
        }}
      />

      {/* ── Panel del Modal ── */}
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#333333',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          boxShadow: '0px 24px 60px 0px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '28px 28px 24px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                id="modal-title"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                  lineHeight: '20px',
                }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: 'Inter, sans-serif',
                    margin: '4px 0 0',
                    lineHeight: '16px',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Botón X */}
            <Button
              onClick={onClose}
              aria-label="Cerrar"
              variant="ghost"
              size="sm"
              style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, padding: '2px 6px', height: 'auto', minHeight: '28px' }}
            >
              ✕
            </Button>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              marginTop: '20px',
            }}
          />
        </div>

        {/* ── Body (scrollable) ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 28px 24px',
          }}
        >
          {children}
        </div>

        {/* ── Footer ── */}
        {footer && (
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                margin: '0 28px',
              }}
            />
            <div
              style={{
                padding: '20px 28px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              {footer}
            </div>
          </div>
        )}
      </div>

      {/* ── Keyframes via style tag ── */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
};
