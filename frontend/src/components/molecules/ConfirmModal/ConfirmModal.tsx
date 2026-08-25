import React from 'react';
import { Modal } from '../../organisms/Modal/Modal';
import { Button } from '../../atoms/Button/Button';

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
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </Button>

      <Button
        type="button"
        variant={isDestructive ? 'danger' : 'primary'}
        size="sm"
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
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
