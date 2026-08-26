import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { Item, TipoItem, EstadoItem } from '../../../types/item';
import { Estacion } from '../../../types/estacion';
import { itemService } from '../../../services/itemService';
import { estacionService } from '../../../services/estacionService';

export interface ModalEditarItemProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  tiposItem?: TipoItem[];
  onSubmit: (id: string, data: Partial<Item>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const ESTADO_OPTIONS: EstadoItem[] = [
  'Disponible',
  'Prestado',
  'Mantenimiento',
  'Perdido',
];

export const ModalEditarItem: React.FC<ModalEditarItemProps> = ({
  isOpen,
  onClose,
  item,
  tiposItem: initialTipos,
  onSubmit,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoItem[]>(initialTipos || []);
  const [estacionesDisponibles, setEstacionesDisponibles] = useState<Estacion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        itemService.getTiposItem(),
        estacionService.getEstaciones(),
      ]).then(([tipos, ests]) => {
        setTiposDisponibles(tipos);
        setEstacionesDisponibles(ests);
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setFormData({
        codigo: item.codigo,
        nombre: item.nombre,
        tipo: item.tipo,
        tipoItemId: item.tipoItemId,
        estacion: item.estacion,
        estacionId: item.estacionId,
        estado: item.estado,
        unidades: item.unidades || 1,
        observaciones: item.observaciones || '',
      });
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) return;

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
          disabled={!formData.nombre?.trim()}
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
      subtitle={`Modificando detalles para ${item.codigo || 'el ítem'}`}
      footer={footer}
      width={560}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '12px' }}>
        {/* Nombre del ítem */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Nombre del ítem
          </label>
          <input
            type="text"
            placeholder="Ej. Multímetro digital UNI-T"
            value={formData.nombre || ''}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
        </div>

        {/* Código / etiqueta QR (No editable) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Código / etiqueta QR
            </label>
            <span
              style={{
                fontSize: '11px',
                color: '#ADADFB',
                backgroundColor: 'rgba(173, 173, 251, 0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🔒 No editable
            </span>
          </div>
          <input
            type="text"
            readOnly={true}
            value={formData.codigo || item.codigo || ''}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(173, 173, 251, 0.25)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#ADADFB',
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              cursor: 'not-allowed',
              userSelect: 'all',
            }}
          />
        </div>

        {/* Grid: Tipo de ítem & Estación asignada */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Tipo de ítem
            </label>
            <select
              value={formData.tipo || ''}
              onChange={(e) => {
                const tipoObj = tiposDisponibles.find((t) => t.nombre === e.target.value);
                setFormData({
                  ...formData,
                  tipo: e.target.value,
                  tipoItemId: tipoObj?.id,
                });
              }}
              style={{
                height: '38px',
                backgroundColor: '#333333',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            >
              {tiposDisponibles.map((t) => (
                <option key={t.id} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Estación asignada
            </label>
            <select
              value={formData.estacionId || formData.estacion || ''}
              onChange={(e) => {
                const estObj = estacionesDisponibles.find((est) => est.id === e.target.value || est.nombre === e.target.value);
                setFormData({
                  ...formData,
                  estacion: estObj?.nombre || 'General',
                  estacionId: estObj?.id,
                });
              }}
              style={{
                height: '38px',
                backgroundColor: '#333333',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            >
              <option value="">Sin asignar / General</option>
              {estacionesDisponibles.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombre} ({est.ubicacion})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid: Unidades & Estado */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Unidades
            </label>
            <input
              type="number"
              min={1}
              value={formData.unidades || 1}
              onChange={(e) => setFormData({ ...formData, unidades: Math.max(1, parseInt(e.target.value) || 1) })}
              style={{
                height: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 12px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Estado
            </label>
            <select
              value={formData.estado || 'Disponible'}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoItem })}
              style={{
                height: '38px',
                backgroundColor: '#333333',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            >
              {ESTADO_OPTIONS.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Observaciones
          </label>
          <textarea
            rows={3}
            placeholder="Accesorios incluidos, número de serie, condición de entrega."
            value={formData.observaciones || ''}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
