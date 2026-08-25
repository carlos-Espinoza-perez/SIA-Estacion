import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { Item, TipoItem } from '../../../types/item';

export interface ModalEditarItemProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  tiposItem: TipoItem[];
  onSubmit: (id: string, data: Partial<Item>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ModalEditarItem: React.FC<ModalEditarItemProps> = ({
  isOpen,
  onClose,
  item,
  tiposItem,
  onSubmit,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        codigo: item.codigo,
        nombre: item.nombre,
        tipo: item.tipo,
        estacion: item.estacion,
        estado: item.estado,
        unidades: item.unidades,
        observaciones: item.observaciones,
      });
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim() || !formData.codigo?.trim()) return;

    setIsSaving(true);
    try {
      await onSubmit(item.id, formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
      {onDelete && (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onDelete(item.id)}
        >
          Eliminar ítem
        </Button>
      )}

      <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          isLoading={isSaving}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar ítem"
      subtitle={`Modificando detalles para ${item.codigo}`}
      footer={footer}
      width={500}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Código
            </label>
            <input
              type="text"
              value={formData.codigo || ''}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Tipo de ítem
            </label>
            <select
              value={formData.tipo || ''}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: '#333333',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
              }}
            >
              {tiposItem.map((t) => (
                <option key={t.id} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Estación asignada
            </label>
            <select
              value={formData.estacion || ''}
              onChange={(e) => setFormData({ ...formData, estacion: e.target.value })}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: '#333333',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
              }}
            >
              <option value="Laboratorio A">Laboratorio A</option>
              <option value="Laboratorio B">Laboratorio B</option>
              <option value="Taller">Taller</option>
              <option value="Biblioteca">Biblioteca</option>
              <option value="Entrada principal">Entrada principal</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Estado
            </label>
            <select
              value={formData.estado || 'Disponible'}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as Item['estado'] })}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: '#333333',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
              }}
            >
              <option value="Disponible">Disponible</option>
              <option value="Prestado">Prestado</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Perdido">Perdido</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Unidades
            </label>
            <input
              type="number"
              min={1}
              value={formData.unidades || 1}
              onChange={(e) => setFormData({ ...formData, unidades: parseInt(e.target.value, 10) || 1 })}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
