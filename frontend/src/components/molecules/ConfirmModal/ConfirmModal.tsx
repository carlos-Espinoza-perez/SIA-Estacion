import React from 'react';
import { Modal } from '../../organisms/Modal/Modal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
}) => {
  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          backgroundColor: 'transparent',
          color: '#FFFFFF',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {cancelText}
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isDestructive ? '#EF4444' : '#FFFFFF',
          color: isDestructive ? '#FFFFFF' : '#1C1C1C',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          boxShadow: isDestructive ? '0 2px 10px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = isDestructive ? '#DC2626' : 'rgba(255, 255, 255, 0.9)';
          }
        }}
        onMouseOut={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = isDestructive ? '#EF4444' : '#FFFFFF';
          }
        }}
      >
        {isLoading ? 'Procesando...' : confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      width={440}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '8px 0' }}>
        {isDestructive && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        )}
        <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.5' }}>
          {message}
        </div>
      </div>
    </Modal>
  );
};
