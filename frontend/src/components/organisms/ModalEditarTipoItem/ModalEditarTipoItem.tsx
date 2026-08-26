import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { TipoItem, FlujoTipoItem } from '../../../types/item';

export interface ModalEditarTipoItemProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: TipoItem | null;
  onSubmit: (id: string, data: { nombre: string; descripcion: string; flujoPorDefecto: FlujoTipoItem }) => void | Promise<void>;
  onDelete?: (id: string) => void;
}

export const ModalEditarTipoItem: React.FC<ModalEditarTipoItemProps> = ({
  isOpen,
  onClose,
  tipo,
  onSubmit,
  onDelete,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [flujo, setFlujo] = useState<FlujoTipoItem>('Requiere aprobación');
  const [isSaving, setIsSaving] = useState(false);

  // Poblar campos cuando se abre el modal con un tipo
  useEffect(() => {
    if (tipo) {
      setNombre(tipo.nombre);
      setDescripcion(tipo.descripcion === 'Sin descripción' ? '' : tipo.descripcion);
      setFlujo(tipo.requiereAprobacion === 'Sí' ? 'Requiere aprobación' : 'Retiro directo');
    }
  }, [tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !tipo) return;

    setIsSaving(true);
    try {
      await onSubmit(tipo.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        flujoPorDefecto: flujo,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    height: '38px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '0 12px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
  };

  const footer = (
    <>
      {onDelete && tipo && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { onDelete(tipo.id); onClose(); }}
          disabled={isSaving}
          style={{ color: 'rgba(239,68,68,0.7)', marginRight: 'auto' }}
        >
          Eliminar
        </Button>
      )}
      <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={!nombre.trim()}
        isLoading={isSaving}
      >
        Guardar cambios
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar tipo de ítem"
      subtitle={tipo ? `Modificando "${tipo.nombre}"` : ''}
      width={560}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '12px' }}>
        {/* Nombre */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Nombre del tipo</label>
          <input
            type="text"
            placeholder="Ej. Equipo de laboratorio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Descripción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Descripción</label>
          <input
            type="text"
            placeholder="Describe qué recursos agrupa este tipo"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Flujo por defecto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Flujo por defecto</label>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              gap: '4px',
            }}
          >
            <Button
              type="button"
              variant={flujo === 'Requiere aprobación' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFlujo('Requiere aprobación')}
              style={{ flex: 1, height: '32px' }}
            >
              Requiere aprobación
            </Button>
            <Button
              type="button"
              variant={flujo === 'Retiro directo' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFlujo('Retiro directo')}
              style={{ flex: 1, height: '32px' }}
            >
              Retiro directo
            </Button>
          </div>
        </div>

        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Inter, sans-serif' }}>
          El flujo por defecto puede sobrescribirse en la configuración de cada Estación.
        </span>
      </form>
    </Modal>
  );
};
